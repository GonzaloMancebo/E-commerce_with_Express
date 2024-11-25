import express from 'express';
import productRouter from './routes/product.route.js';

const app = express();
const PORT = 8080;

app.use(express.static('./public'));  
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('./public/index.html'); 
});

// Usar las rutas de productos
app.use('/api/products', productRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
