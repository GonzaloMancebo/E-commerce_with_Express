import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Para generar códigos únicos

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    default: uuidv4, // Genera un código único automáticamente
  },
  purchase_datetime: {
    type: Date,
    default: Date.now, // Se guarda automáticamente la fecha de compra
  },
  amount: {
    type: Number,
    required: true,
  },
  purchaser: {
    type: String,
    required: true,
  },
});

// Crear el modelo
const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
