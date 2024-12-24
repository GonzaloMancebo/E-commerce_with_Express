import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// Ruta para crear un carrito nuevo
router.post('/', async (req, res) => {
  try {
    const cart = new Cart();
    await cart.save();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para agregar un producto al carrito
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    // Verificar si el producto ya está en el carrito
    const productInCart = cart.products.find(item => item.productId.toString() === productId);
    if (productInCart) {
      // Actualizar la cantidad si el producto ya está en el carrito
      productInCart.quantity += quantity;
    } else {
      // Agregar el producto al carrito si no está presente
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    // Eliminar el producto del carrito
    cart.products = cart.products.filter(item => item.productId.toString() !== pid);
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    const productInCart = cart.products.find(item => item.productId.toString() === pid);
    if (!productInCart) {
      return res.status(404).json({ status: 'error', message: 'Product not found in cart' });
    }

    // Actualizar la cantidad del producto
    productInCart.quantity = quantity;
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    // Limpiar el carrito
    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para obtener los productos de un carrito específico con "populate"
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.productId');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
