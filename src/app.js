import express from 'express';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';

const app = express();
const PORT = 8080;

app.use(express.static('./public'));  
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('./public/index.html'); 
});

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
