import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { socket } from "@/socket";
import productService from "@/services/productService";
import { toast } from "sonner";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const upsertProduct = useCallback((incoming) => {
    if (!incoming?.id) return;
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === incoming.id);
      if (idx === -1) return [incoming, ...prev];
      const next = prev.slice();
      next[idx] = incoming;
      return next;
    });
  }, []);

  const removeProduct = useCallback((id) => {
    if (!id) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

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

      if (type === "create" && product) upsertProduct(product);
      else if (type === "update" && product) upsertProduct(product);
      else if (type === "delete") removeProduct(id);

      if (type === "create") {
        toast.success("Product Published Successfully", {
          description: `${product.name} is now live in the marketplace.`,
          duration: 4000,
        });
      }
    };

    socket.on("products_updated", handleUpdate);
    return () => socket.off("products_updated", handleUpdate);
  }, [fetchProducts, removeProduct, upsertProduct]);

  const actions = useMemo(() => {
    return {
      refresh: fetchProducts,
      optimisticCreate: (product) => upsertProduct(product),
      optimisticUpdate: (product) => upsertProduct(product),
      optimisticDelete: (id) => removeProduct(id),
    };
  }, [fetchProducts, removeProduct, upsertProduct]);

  const value = {
    products,
    loading,
    error,
    ...actions,
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
