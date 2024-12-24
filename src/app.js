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
import connectDB from './config/db.js';

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
  defaultLayout: false
}));
app.set('view engine', 'handlebars');
app.set('views', viewsPath);

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

// Rutas
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Ruta principal
app.get('/', async (req, res) => {
  const products = await Product.find().lean().limit(10);  
  res.render('home', { products });
});

app.get('/products', async (req, res) => {
  const { query = '', limit = 10, page = 1, sort = 'asc' } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const filter = query ? { category: query } : {};

  const products = await Product.find(filter)
    .lean()
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .sort({ price: sort === 'asc' ? 1 : -1 });

  const totalProducts = await Product.countDocuments(filter);

  // Calcular el total de páginas
  const totalPages = Math.ceil(totalProducts / limitNumber);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Renderizar la vista con los datos de productos y paginación
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
    pages, // Pasamos las páginas para mostrar los enlaces a las distintas páginas
  });
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
