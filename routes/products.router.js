import { Router } from 'express';
import { Product } from '../dao/models/Product.js'; 

const router = Router();

// Ruta POST para crear un nuevo producto
router.post('/', async (req, res) => { 
    try {
        const newProduct = new Product(req.body); // Crea una instancia del modelo con los datos
        const savedProduct = await newProduct.save(); // Guarda el producto en MongoDB
        console.log('✅ Producto guardado en DB con ID:', savedProduct._id); // <-- ¡MUESTRA EL ID REAL EN LA TERMINAL!
        res.status(201).json({ message: 'Producto creado con éxito', product: savedProduct });
    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        res.status(500).json({ status: "error", message: "Error interno del servidor al crear producto." });
    }
});



export default router;