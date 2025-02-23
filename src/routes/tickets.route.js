import express from "express";
import Ticket from "../models/Tickets.js";
import { authenticateJWT } from "../middlewares/auth.js";
import Cart from "../models/Cart.js"; // Suponiendo que tienes un modelo de carrito

const router = express.Router();

router.post("/", authenticateJWT, async (req, res) => {
  try {
    const user = req.user; // Usuario autenticado
    const cart = await Cart.findOne({ userId: user.id }); // Obtener carrito del usuario

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío." });
    }

    // Calcular el total de la compra
    const totalAmount = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Crear un nuevo ticket de compra
    const newTicket = new Ticket({
      amount: totalAmount,
      purchaser: user.email,
    });

    // Guardar ticket en la base de datos
    await newTicket.save();

    // Vaciar el carrito después de la compra
    cart.products = [];
    await cart.save();

    res.status(201).json({ message: "Compra realizada con éxito.", ticket: newTicket });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el ticket.", error: error.message });
  }
});

export default router;
