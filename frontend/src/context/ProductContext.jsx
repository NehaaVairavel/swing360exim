import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { socket } from "@/socket";
import productService from "@/services/productService";
import { toast } from "sonner";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getAll({ all: true });
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const handleUpdate = (payload) => {
      console.log("Real-time sync event:", payload);
      const { type, product, id } = payload;

      setProducts((prev) => {
        switch (type) {
          case "create":
            if (prev.find(p => p.id === product.id)) return prev;
            return [product, ...prev];
          
          case "update":
            if (product) {
              return prev.map(p => p.id === product.id ? product : p);
            }
            return prev;

          case "delete":
            return prev.filter(p => p.id !== id);

          default:
            return prev;
        }
      });

      if (type === "create") {
        toast.success("Product Published Successfully", {
          description: `${product.name} is now live in the marketplace.`,
          duration: 4000,
        });
      }
    };

    socket.on("products_updated", handleUpdate);
    return () => socket.off("products_updated", handleUpdate);
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    refresh: fetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
