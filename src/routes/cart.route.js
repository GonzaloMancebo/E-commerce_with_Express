import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.resolve('src/data/cart.json'); // Ruta del archivo donde se guardan los carritos

// Ruta POST para crear un nuevo carrito
router.post('/', (req, res) => {
    const newCart = {
        id: uuidv4(), // Generar un id único para el carrito
        products: [] // El carrito empieza vacío
    };

    // Leemos los carritos existentes
    let carts = [];
    try {
        carts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
        // Si no hay carritos o el archivo no existe, inicializamos un array vacío
        carts = [];
    }

    // Agregamos el nuevo carrito al array de carritos
    carts.push(newCart);

    // Guardamos el archivo actualizado con el nuevo carrito
    try {
        fs.writeFileSync(dataPath, JSON.stringify(carts, null, 2));
        res.status(201).json(newCart); // Enviamos el carrito creado como respuesta
    } catch (error) {
        console.error("Error al guardar los carritos:", error);
        return res.status(500).send('Error saving cart data');
    }
});

// Ruta GET para obtener los productos del carrito por su id
router.get('/:cid', (req, res) => {
    const { cid } = req.params;

    // Leemos los carritos existentes
    let carts = [];
    try {
        carts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
        return res.status(500).send('Error reading cart data');
    }

    // Buscamos el carrito por el id
    const cart = carts.find(c => c.id === cid);

    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    // Enviamos el carrito con los productos
    res.status(200).json(cart);
});

// Ruta POST para agregar un producto al carrito especificado
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    // Leemos los carritos existentes
    let carts = [];
    try {
        carts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
        return res.status(500).send('Error reading cart data');
    }

    // Buscamos el carrito por el id
    const cart = carts.find(c => c.id === cid);

    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    // Verificar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(p => p.productId === pid);

    if (productIndex !== -1) {
        // Si el producto ya existe, incrementamos la cantidad
        cart.products[productIndex].quantity += 1;
    } else {
        // Si el producto no existe, lo agregamos con una cantidad de 1
        cart.products.push({ productId: pid, quantity: 1 });
    }

    // Guardamos el carrito actualizado
    try {
        fs.writeFileSync(dataPath, JSON.stringify(carts, null, 2));
        res.status(200).json(cart); // Enviamos el carrito actualizado
    } catch (error) {
        console.error("Error al guardar el carrito:", error);
        return res.status(500).send('Error saving cart data');
    }
});

export default router;
