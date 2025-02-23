import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Ticket from '../models/Tickets.js';  

const router = express.Router();

// Ruta para finalizar la compra de un carrito
router.post('/:cid/purchase', async (req, res) => {
  try {
    const { cid } = req.params;

    // Buscar el carrito
    const cart = await Cart.findById(cid).populate('products.productId');
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ status: 'error', message: 'El carrito está vacío.' });
    }

    let totalAmount = 0;
    const productsToPurchase = [];
    const productsWithoutStock = [];

    // Verificar el stock de los productos y procesar la compra
    for (let item of cart.products) {
      const product = item.productId;

      // Verificar si hay suficiente stock
      if (product.stock >= item.quantity) {
        // Si hay suficiente stock, restamos la cantidad
        product.stock -= item.quantity;
        await product.save();

        // Agregar el producto a la lista de productos comprados
        totalAmount += product.price * item.quantity;
        productsToPurchase.push(item);
      } else {
        // Si no hay suficiente stock, agregamos a la lista de productos sin stock
        productsWithoutStock.push({ productId: product._id, title: product.title });
      }
    }

    // Si no hay productos en stock, no procesar la compra
    if (productsToPurchase.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No hay suficiente stock para los productos en el carrito.' });
    }

    // Crear un ticket para la compra
    const ticket = new Ticket({
      code: generateTicketCode(),  // Función para generar un código único
      amount: totalAmount,
      purchaser: req.user.email,  // Asumiendo que el usuario está autenticado
    });

    await ticket.save();

    // Filtrar los productos que no fueron comprados y actualizar el carrito
    const productsRemaining = cart.products.filter(item => 
      !productsToPurchase.some(p => p.productId.toString() === item.productId.toString())
    );

    // Actualizar el carrito, dejando solo los productos sin stock
    cart.products = productsRemaining;
    await cart.save();

    // Devolver respuesta con el ticket y los productos sin stock
    res.status(201).json({
      status: 'success',
      message: 'Compra finalizada con éxito.',
      ticket: ticket,
      productsWithoutStock: productsWithoutStock,  // Devolvemos los productos sin stock
    });

  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ status: 'error', message: 'Hubo un error al procesar la compra.' });
  }
});

// Función para generar un código único para el ticket
function generateTicketCode() {
  return 'TICKET-' + Math.random().toString(36).substr(2, 9);  // Generar un código único aleatorio
}

export default router;
