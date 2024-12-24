import mongoose from 'mongoose';

// Definimos el esquema para los carritos
const cartSchema = new mongoose.Schema({
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',  // Referencia al modelo de productos
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,  
    },
  }],
}, {
  timestamps: true,  // Para agregar createdAt y updatedAt automáticamente
});

// Creamos el modelo de Carrito con el esquema definido
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
