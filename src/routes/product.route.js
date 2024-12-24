import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    // Desestructuramos el body de la solicitud
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    // Validamos que los campos requeridos estén presentes
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos requeridos' });
    }

    // Creamos un nuevo producto con los datos recibidos
    const newProduct = new Product({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });

    // Guardamos el nuevo producto en la base de datos
    await newProduct.save();

    // Respondemos con el producto creado
    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Ruta para obtener productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
  try {
    // Obtener parámetros de query
    const { limit = 10, page = 1, sort = 'asc', query = '' } = req.query;

    // Convertimos los valores de `limit` y `page` a enteros
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);

    // Definir el filtro de búsqueda
    const filter = query ? { category: query } : {};

    // Definir el ordenamiento
    const sortBy = sort === 'desc' ? { price: -1 } : { price: 1 };

    // Obtener productos con paginación, filtrado y ordenamiento
    const products = await Product.find(filter)
      .sort(sortBy)
      .limit(limitInt)
      .skip((pageInt - 1) * limitInt);

    // Contar el total de productos para calcular las páginas
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitInt);

    // Enviar respuesta
    res.json({
      status: 'success',
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
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para obtener un producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
