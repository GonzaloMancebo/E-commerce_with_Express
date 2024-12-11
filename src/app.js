import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 8080;

// Usamos path para calcular la ruta a las vistas
const viewsPath = path.join(process.cwd(), 'src', 'views');  

// Crear servidor HTTP y socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
app.engine('handlebars', engine({
  defaultLayout: false  
}));app.set('view engine', 'handlebars');
app.set('views', viewsPath); 

// Middleware
app.use(express.json());

// Productos iniciales
let products = [
  { name: 'Laptop', price: 1200 },
  { name: 'Smartphone', price: 800 },
  { name: 'Headphones', price: 150 }
];

// Rutas
app.get('/', (req, res) => {
  res.render('home', { products });  
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products }); 
});

// Configurar eventos de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Enviar datos iniciales al cliente
  socket.emit('updateProducts', products);

  // Escuchar eventos para agregar productos
  socket.on('addProduct', (newProduct) => {
    products.push(newProduct);
    io.emit('updateProducts', products); 
  });

  // Escuchar eventos para eliminar productos
  socket.on('deleteProduct', (productIndex) => {
    products.splice(productIndex, 1);
    io.emit('updateProducts', products); 
  });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
