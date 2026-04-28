import os
import certifi
from datetime import timedelta, datetime
from flask import Flask, jsonify, request, send_from_directory
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
from flask_socketio import SocketIO, emit

load_dotenv(override=True)

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

# ── Real-Time Sync (Socket.IO) ───────────────────────────────────────────
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# ── MongoDB Connection ────────────────────────────────────────────────────
MONGO_URI    = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "swing360")

client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
db     = client[MONGO_DB_NAME]

products_col  = db["products"]
enquiries_col = db["enquiries"]
gallery_col   = db["gallery"]
settings_col  = db["settings"]
admins_col    = db["admins"]

# ── Database Indexes (Performance Optimization) ───────────────────────────
try:
    products_col.create_index("category")
    products_col.create_index("featured")
    products_col.create_index("availability")
    admins_col.create_index("username")
    admins_col.create_index("email")
    enquiries_col.create_index("status")
    print("[✓] Database indexes ensured.", flush=True)
except Exception as e:
    print(f"[!] Failed to create indexes: {e}", flush=True)

# ── Helpers ───────────────────────────────────────────────────────────────
def serialize(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    
    # Format image URLs correctly as per Exact Fix Requirement
    R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "https://pub-bacc7aff08774085bc1991eba26158b8.r2.dev")
    
    # Get updatedAt for versioning
    updated_at = doc.get("updated_at") or doc.get("updatedAt")
    v_param = ""
    if updated_at:
        if isinstance(updated_at, datetime):
            v_param = f"?v={int(updated_at.timestamp())}"
        else:
            v_param = f"?v={updated_at}"
            
    # Try to get API_BASE from request, fallback if out of context
    try:
        from flask import request
        API_BASE = request.host_url.rstrip("/")
    except:
        API_BASE = ""

    def process_url(img):
        if not img: return img
        if img.startswith("blob:"):
            return img
            
        final_url = img
        if not (img.startswith("http://") or img.startswith("https://")):
            if img.startswith("uploads/"):
                final_url = f"{API_BASE}/{img}"
            elif img.startswith("/uploads/"):
                final_url = f"{API_BASE}{img}"
            else:
                # Assume R2 object key
                final_url = f"{R2_PUBLIC_URL}/{img}"
        
        # Append version param if not already present
        if v_param and "?" not in final_url:
            final_url = f"{final_url}{v_param}"
        return final_url

    if "images" in doc and isinstance(doc["images"], list):
        doc["images"] = [process_url(img) for img in doc["images"] if img]
        
    if "image" in doc and isinstance(doc["image"], str):
        doc["image"] = process_url(doc["image"])
    
    # Ensure updatedAt is in the response for frontend cache busting
    if updated_at:
        doc["updatedAt"] = str(updated_at)
    else:
        # Fallback to a fixed version if missing to at least provide something
        doc["updatedAt"] = "1.0"
        
    return doc

def serialize_list(docs):
    return [serialize(d) for d in docs]

# ── Auto-sync admin from Easypanel Runtime Environment ─────────────────
def sync_admin_from_runtime_env():
    # Read values directly from runtime environment variables
    username = os.getenv("ADMIN_USERNAME")
    email    = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    
    if not username or not email or not password:
        print("[!] Critical: Admin credentials missing in Easypanel/Runtime Env. Skipping sync.", flush=True)
        return
    
    try:
        # 1. Force remove all existing admin accounts
        admins_col.delete_many({})
        print("[✓] Removed old admins", flush=True)
        
        # 2. Insert fresh admin account from runtime variables
        admins_col.insert_one({
            "username": username,
            "email": email,
            "password": password, # Exact plain-text value
            "role": "superadmin",
            "created_at": datetime.utcnow().isoformat()
        })
        print("[✓] Loaded latest Easypanel env variables", flush=True)
        print("[✓] New admin inserted successfully", flush=True)
    except Exception as e:
        print(f"[✗] Failed to sync admin: {e}", flush=True)

# ── Execute Sync on Module Load (for WSGI / Production) ─────────
try:
    with app.app_context():
        sync_admin_from_runtime_env()
except Exception as e:
    print(f"[!] Failed to auto-sync admin on startup: {e}", flush=True)


# ════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/admin/login", methods=["POST", "OPTIONS"])
@app.route("/api/login", methods=["POST", "OPTIONS"])
@app.route("/admin/login", methods=["POST", "OPTIONS"])
@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    data     = request.get_json(force=True, silent=True) or {}
    # Use 'identifier' as primary, but fallback to 'username' or 'email'
    login_id = data.get("identifier") or data.get("username") or data.get("email") or ""
    password = data.get("password", "")
    
    if not login_id or not password:
        return jsonify({"message": "Identifier and password required"}), 400

    # Find user by username OR email
    user = admins_col.find_one({"$or": [
        {"username": login_id},
        {"email": login_id}
    ]})
    
    if not user:
        print(f"[✗] Admin not found: {login_id}")
        return jsonify({"message": "Invalid credentials"}), 401
        
    if user["password"] != password:
        print(f"[✗] Wrong password for: {login_id}")
        return jsonify({"message": "Invalid credentials"}), 401
        
    print(f"[✓] Login success: {login_id}")
    token = create_access_token(identity=str(user["_id"]))
    return jsonify({
        "token": token,
        "username": user["username"],
        "email": user.get("email", ""),
        "role": user.get("role", "superadmin")
    }), 200


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
    
    # Broadcast real-time update
    socketio.emit("products_updated", {"type": "create", "product": data})
    
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
    
    # Broadcast real-time update
    socketio.emit("products_updated", {"type": "update", "id": product_id})
    
    return jsonify({"message": "Product updated"}), 200


@app.route("/api/products/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    result = products_col.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Product not found"}), 404
    
    # Broadcast real-time update
    socketio.emit("products_updated", {"type": "delete", "id": product_id})
    
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
#  STATIC FILES (UPLOADS)
# ════════════════════════════════════════════════════════════════════

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    uploads_dir = os.path.join(app.root_path, "uploads")
    return send_from_directory(uploads_dir, filename)

# ════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Swing360 Backend (Real-Time) running on http://0.0.0.0:{port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=False)
