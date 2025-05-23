import { Router } from 'express';
import {
    getCartById,
    deleteProductFromCart,
    updateCart,
    updateProductQuantity,
    deleteAllProducts,
    addProductToCart, 
    createCart 
} from '../controllers/carts.controller.js';

const router = Router();

// Rutas existentes
router.get('/:cid', getCartById);
router.delete('/:cid/products/:pid', deleteProductFromCart);
router.put('/:cid', updateCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.delete('/:cid', deleteAllProducts);

// **NUEVAS RUTAS:**

// Ruta para crear un nuevo carrito 
router.post('/', createCart);

// Ruta para agregar un producto a un carrito específico
router.post('/:cid/products/:pid', addProductToCart);

export default router;