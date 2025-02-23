import express from "express";
import Product from "../models/Product.js";
import { authenticateJWT } from "../middlewares/auth.js"; 
import { authorize } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// Aplica autenticación a todas las rutas
router.use(authenticateJWT);

router.post("/", authorize(["admin"]), async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ status: "error", message: "Faltan campos requeridos" });
    }

    const newProduct = new Product({ title, description, code, price, stock, category, thumbnails });
    await newProduct.save();

    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Obtener productos con filtros, paginación y ordenamiento (Acceso libre)
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = "asc", query = "" } = req.query;
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);

    const filter = query ? { category: query } : {};
    const sortBy = sort === "desc" ? { price: -1 } : { price: 1 };

    const products = await Product.find(filter)
      .sort(sortBy)
      .limit(limitInt)
      .skip((pageInt - 1) * limitInt);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitInt);

    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: pageInt > 1 ? pageInt - 1 : null,
      nextPage: pageInt < totalPages ? pageInt + 1 : null,
      page: pageInt,
      hasPrevPage: pageInt > 1,
      hasNextPage: pageInt < totalPages,
      prevLink: pageInt > 1 ? `/api/products?page=${pageInt - 1}&limit=${limitInt}&sort=${sort}&query=${query}` : null,
      nextLink: pageInt < totalPages ? `/api/products?page=${pageInt + 1}&limit=${limitInt}&sort=${sort}&query=${query}` : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.json({ status: "success", message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
