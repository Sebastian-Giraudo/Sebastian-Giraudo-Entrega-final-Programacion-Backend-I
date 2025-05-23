// routes/carts.router.js

import { Router } from 'express';
import {
    getCartById,
    deleteProductFromCart,
    updateCart,
    updateProductQuantity,
    deleteAllProducts,
    addProductToCart, // <-- ¡Añade esta importación!
    createCart // <-- ¡Añade esta importación para crear carritos!
} from '../controllers/carts.controller.js';

const router = Router();

// Rutas existentes
router.get('/:cid', getCartById);
router.delete('/:cid/products/:pid', deleteProductFromCart);
router.put('/:cid', updateCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.delete('/:cid', deleteAllProducts);

// **NUEVAS RUTAS:**

// Ruta para crear un nuevo carrito (útil si el ID '1' no existe o quieres más dinamismo)
router.post('/', createCart);

// Ruta para agregar un producto a un carrito específico
router.post('/:cid/products/:pid', addProductToCart); // <-- ¡Añade esta ruta!


export default router;