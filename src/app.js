import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js'; // Asegúrate de importar el modelo de Cart
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser'; // Para manejar las cookies
import passport from 'passport'; // Para autenticación con Passport
import sessionRouter from './routes/sessions/sessions.router.js'; // Rutas de autenticación
import ticketsRouter from './routes/tickets.route.js';

const app = express();
const PORT = process.env.PORT || 8080; 

// Conectar a MongoDB Atlas
connectDB();  

// Usamos path para calcular la ruta a las vistas
const viewsPath = path.join(process.cwd(), 'src', 'views');

// Crear servidor HTTP y socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
app.engine('handlebars', engine({
  defaultLayout: false,
  helpers: {
    ifEquals: function (arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    }
  }
}));

app.set('view engine', 'handlebars');
app.set('views', viewsPath);

// Middleware
app.use(express.json());
app.use(cookieParser()); // Para leer las cookies en las solicitudes
app.use(passport.initialize()); // Inicializar Passport para la autenticación

// Rutas
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionRouter); 
app.use("/api/tickets", ticketsRouter);


// Ruta principal
app.get('/', async (req, res) => {
  const products = await Product.find().lean().limit(10);  
  res.render('home', { products });
});

app.get('/products', async (req, res) => {
  const { query = '', limit = 10, page = 1, sort = 'asc' } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  // Filtro dinámico por categoría (si está definido el query)
  const filter = query ? { category: query } : {};

  try {
    // Productos según filtro, paginación y orden
    const products = await Product.find(filter)
      .lean()
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort({ price: sort === 'asc' ? 1 : -1 });

    // Contar el total de productos según filtro
    const totalProducts = await Product.countDocuments(filter);

    // Calcular total de páginas
    const totalPages = Math.ceil(totalProducts / limitNumber);

    // Generar un array con los números de páginas
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Renderizar la vista con datos
    res.render('home', {
      products,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      sort,
      query,
      prevPage: pageNumber > 1 ? pageNumber - 1 : null,
      nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
      hasPrevPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
      pages,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para agregar un producto al carrito
app.put('/api/carts', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Encuentra o crea un carrito
    let cart = await Cart.findOne({});
    if (!cart) {
      cart = new Cart({ products: [] });
    }

    // Verifica si el producto ya está en el carrito
    const existingProduct = cart.products.find(item => item.productId.toString() === productId);

    if (existingProduct) {
      // Si el producto ya está en el carrito, actualiza la cantidad
      existingProduct.quantity += quantity;
    } else {
      // Si no está en el carrito, agrega el nuevo producto
      cart.products.push({ productId, quantity });
    }

    // Guarda el carrito
    await cart.save();

    // Enviar respuesta exitosa
    res.status(200).json({ message: 'Producto agregado al carrito', cart });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
});

// Ruta para eliminar un producto del carrito
app.delete('/api/carts', async (req, res) => {
  const { productId } = req.body;

  try {
    // Encuentra el carrito
    let cart = await Cart.findOne({});
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Filtra el producto que se quiere eliminar
    cart.products = cart.products.filter(item => item.productId.toString() !== productId);

    // Guarda los cambios en el carrito
    await cart.save();

    res.status(200).json({ message: 'Producto eliminado del carrito', cart });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar del carrito' });
  }
});

// Ruta para ver un producto específico
app.get('/products/:pid', async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).lean();  
  res.render('productDetails', { product });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
