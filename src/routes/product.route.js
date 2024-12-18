import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Ruta donde se encuentran los productos (el archivo JSON)
const dataPath = path.resolve('src/data/products.json');

// Obtener todos los productos con la opción de limitar la cantidad
router.get('/', (req, res) => {
    const { limit } = req.query; 

    try {
        let products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log("Productos obtenidos:", products);

        if (limit) {
            products = products.slice(0, parseInt(limit)); // Limitar la cantidad de productos
        }

        res.json(products);
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).send("Error reading products data");
    }
});

// Obtener un producto por su id
router.get('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.json(product);
    } catch (error) {
        console.error("Error al leer productos:", error);
        res.status(500).send("Error reading product data");
    }
});

router.post('/', (req, res) => {
    const productData = Array.isArray(req.body) ? req.body : [req.body];  

    productData.forEach(product => {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = product;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send('All fields are required');
        }

        const id = uuidv4();
        const newProduct = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        console.log("Nuevo producto creado:", newProduct);

        // Leemos los productos existentes
        let products = [];
        try {
            products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        } catch (error) {
            // Si no hay productos o el archivo no existe, inicializamos un array vacío
            products = [];
        }

        // Agregamos el nuevo producto al array
        products.push(newProduct);

        // Guardamos los productos actualizados en el archivo JSON
        try {
            fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error("Error al guardar los productos:", error);
            return res.status(500).send('Error saving product data');
        }
    });

    res.status(201).json({ message: 'Productos creados correctamente' });
});


// Actualizar un producto por su id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    
    // Leemos los productos existentes
    let products = [];
    try {
        products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
        console.error("Error al leer los productos para actualización:", error);
        return res.status(500).send("Error reading products data");
    }

    // Buscar el producto que queremos actualizar
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).send('Product not found');
    }

    // Actualizamos los campos del producto, sin modificar el id
    products[productIndex] = { ...products[productIndex], title, description, code, price, status, stock, category, thumbnails };

    // Guardamos los productos actualizados en el archivo JSON
    try {
        fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
        console.log("Producto actualizado:", products[productIndex]);
    } catch (error) {
        console.error("Error al guardar los productos actualizados:", error);
        return res.status(500).send('Error saving updated product data');
    }

    res.json(products[productIndex]);
});

// Eliminar un producto por su id
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    let products = [];
    try {
        products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
        console.error("Error al leer los productos para eliminación:", error);
        return res.status(500).send("Error reading products data");
    }

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).send('Product not found');
    }

    // Eliminamos el producto
    products.splice(productIndex, 1);

    // Guardamos los productos actualizados en el archivo JSON
    try {
        fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error("Error al guardar los productos después de eliminación:", error);
        return res.status(500).send('Error saving product data after deletion');
    }

    res.send('Product deleted successfully');
});

export default router;
