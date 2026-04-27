import os
import certifi
from datetime import timedelta, datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ── CORS — Most permissive for local dev ──────────────────────────────────
CORS(app, supports_credentials=True,
     resources={r"/api/*": {
         "origins": ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:3000", "*"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         "allow_headers": ["Content-Type", "Authorization", "Accept"]
     }})

# ── Manual CORS header injection on EVERY response (failsafe) ────────────
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
    return response

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response

# ── Auth extensions ───────────────────────────────────────────────────────
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "swing360-secret-2026")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

# ── MongoDB Connection ────────────────────────────────────────────────────
MONGO_URI    = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "swing360")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db     = client[MONGO_DB_NAME]

products_col  = db["products"]
enquiries_col = db["enquiries"]
gallery_col   = db["gallery"]
settings_col  = db["settings"]
admins_col    = db["admins"]

# ── Helpers ───────────────────────────────────────────────────────────────
def serialize(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

def serialize_list(docs):
    return [serialize(d) for d in docs]

# ── Auto-create default admin on startup ─────────────────────────────────
def create_default_admin():
    username = os.getenv("ADMIN_USERNAME", "admin")
    email    = os.getenv("ADMIN_EMAIL", "admin@swing360.com")
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    if admins_col.count_documents({"username": username}) == 0:
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        admins_col.insert_one({
            "username": username,
            "email": email,
            "password": hashed,
            "role": "superadmin"
        })
        print(f"[*] Admin '{username}' created.")
    else:
        print(f"[*] Admin '{username}' confirmed.")


# ════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    data     = request.get_json(force=True, silent=True) or {}
    login_id = data.get("username", "")
    password = data.get("password", "")
    print(f"[*] Login attempt: {login_id}")
    user = admins_col.find_one({"$or": [{"username": login_id}, {"email": login_id}]})
    if not user:
        print(f"[!] Not found: {login_id}")
        return jsonify({"message": "Admin account not found"}), 404
    if not bcrypt.check_password_hash(user["password"], password):
        print(f"[!] Wrong password: {login_id}")
        return jsonify({"message": "Incorrect password"}), 401
    print(f"[+] Login OK: {login_id}")
    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "username": user["username"], "role": user.get("role", "admin")}), 200


@app.route("/api/me", methods=["GET"])
@jwt_required()
def me():
    uid  = get_jwt_identity()
    user = admins_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(serialize(user)), 200


# ════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ════════════════════════════════════════════════════════════════════

@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    total     = products_col.count_documents({})
    available = products_col.count_documents({"availability": "in_stock"})
    sold      = products_col.count_documents({"availability": "sold"})
    enqs      = enquiries_col.count_documents({})
    featured  = products_col.count_documents({"featured": True})
    return jsonify({
        "total_products":     total,
        "available_products": available,
        "sold_products":      sold,
        "enquiries_count":    enqs,
        "featured_count":     featured
    }), 200


# ════════════════════════════════════════════════════════════════════
#  PRODUCTS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category")
    featured = request.args.get("featured")
    show_all = request.args.get("all") == "true"
    query = {} if show_all else {}
    if category and category.lower() not in ("all", ""):
        query["category"] = category
    if featured == "true":
        query["featured"] = True
    products = serialize_list(products_col.find(query).sort("_id", -1))
    return jsonify(products), 200


@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = products_col.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(serialize(product)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/categories", methods=["GET"])
def get_categories():
    cats = [c for c in products_col.distinct("category") if c]
    if not cats:
        cats = ["Excavators", "Backhoe Loaders", "Dozers", "Wheel Loaders",
                "Graders", "Rollers", "Skid Steer", "Buckets", "Material Handlers", "Others"]
    return jsonify(cats), 200


@app.route("/api/products", methods=["POST"])
@jwt_required()
def create_product():
    data = request.get_json(force=True, silent=True) or {}
    if not data:
        return jsonify({"error": "No data provided"}), 400
    data["created_at"] = datetime.utcnow().isoformat()
    result = products_col.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return jsonify(data), 201


@app.route("/api/products/<product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    data = request.get_json(force=True, silent=True) or {}
    data.pop("id", None)
    data.pop("_id", None)
    result = products_col.update_one({"_id": ObjectId(product_id)}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product updated"}), 200


@app.route("/api/products/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    result = products_col.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product deleted"}), 200


# ════════════════════════════════════════════════════════════════════
#  ENQUIRIES
# ════════════════════════════════════════════════════════════════════

@app.route("/api/enquiries", methods=["GET"])
@jwt_required()
def get_enquiries():
    enqs = serialize_list(enquiries_col.find().sort("_id", -1))
    return jsonify(enqs), 200


@app.route("/api/enquiries", methods=["POST"])
def create_enquiry():
    data = request.get_json(force=True, silent=True) or {}
    if not data:
        return jsonify({"error": "No data provided"}), 400
    data["created_at"] = datetime.utcnow().isoformat()
    data["status"]     = data.get("status", "new")
    result = enquiries_col.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return jsonify(data), 201


@app.route("/api/enquiries/<enquiry_id>", methods=["PUT"])
@jwt_required()
def update_enquiry(enquiry_id):
    data = request.get_json(force=True, silent=True) or {}
    data.pop("id", None)
    data.pop("_id", None)
    result = enquiries_col.update_one({"_id": ObjectId(enquiry_id)}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Enquiry not found"}), 404
    return jsonify({"message": "Enquiry updated"}), 200


@app.route("/api/enquiries/<enquiry_id>/status", methods=["PUT"])
@jwt_required()
def update_enquiry_status(enquiry_id):
    data   = request.get_json(force=True, silent=True) or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "status field required"}), 400
    result = enquiries_col.update_one({"_id": ObjectId(enquiry_id)}, {"$set": {"status": status}})
    if result.matched_count == 0:
        return jsonify({"error": "Enquiry not found"}), 404
    return jsonify({"message": "Status updated"}), 200


@app.route("/api/enquiries/<enquiry_id>", methods=["DELETE"])
@jwt_required()
def delete_enquiry(enquiry_id):
    result = enquiries_col.delete_one({"_id": ObjectId(enquiry_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Enquiry not found"}), 404
    return jsonify({"message": "Enquiry deleted"}), 200


# ════════════════════════════════════════════════════════════════════
#  GALLERY
# ════════════════════════════════════════════════════════════════════

@app.route("/api/gallery", methods=["GET"])
def get_gallery():
    items = serialize_list(gallery_col.find().sort("_id", -1))
    return jsonify(items), 200


@app.route("/api/gallery", methods=["POST"])
@jwt_required()
def create_gallery_item():
    data = request.get_json(force=True, silent=True) or {}
    if not data:
        return jsonify({"error": "No data provided"}), 400
    data["created_at"] = datetime.utcnow().isoformat()
    result = gallery_col.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return jsonify(data), 201


@app.route("/api/gallery/<item_id>", methods=["DELETE"])
@jwt_required()
def delete_gallery_item(item_id):
    result = gallery_col.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"message": "Gallery item deleted"}), 200


# ════════════════════════════════════════════════════════════════════
#  SETTINGS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/settings", methods=["GET"])
def get_settings():
    s = settings_col.find_one({})
    return jsonify(serialize(s) if s else {}), 200


@app.route("/api/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    data = request.get_json(force=True, silent=True) or {}
    data.pop("id", None)
    data.pop("_id", None)
    settings_col.update_one({}, {"$set": data}, upsert=True)
    return jsonify({"message": "Settings updated"}), 200


# ════════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ════════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "db": MONGO_DB_NAME}), 200
@app.route("/")
def home():
    return {"status": "ok"}


# ════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    create_default_admin()
    port = int(os.getenv("PORT", 5000))
    print(f"Swing360 Backend running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
