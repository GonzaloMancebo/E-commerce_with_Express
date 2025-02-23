import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; 

// Definimos el esquema para los productos
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, 
  },
  price: {
    type: Number,
    required: true,
    min: 0,  
  },
  stock: {
    type: Number,
    required: true,
    min: 0,  // Aseguramos que el stock no sea negativo
  },
  status: {
    type: Boolean,
    default: true,  // Si el producto está disponible o no
  },
  category: {
    type: String,
    required: true,
    enum: ['Electrónica', 'Ropa', 'Muebles', 'Deportes'],  
  },
  thumbnails: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);  
      },
      message: props => `${props.value} no es una URL válida`
    }
  }],
}, {
  timestamps: true,  
});

productSchema.index({ category: 1, price: 1 });

// Agregar el plugin de paginación
productSchema.plugin(mongoosePaginate); 

// Creamos el modelo de Producto con el esquema definido
const Product = mongoose.model('Product', productSchema);

export default Product;
