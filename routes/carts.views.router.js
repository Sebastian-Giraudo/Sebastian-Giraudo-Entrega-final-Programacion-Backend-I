import { Router } from 'express';
import { getCartById } from '../controllers/carts.controller.js';
import { Cart } from '../dao/models/Cart.js';

const router = Router();

// Ruta para ver el último carrito creado (cuando la URL es /carts/ultimo)
router.get('/ultimo', async (req, res) => {
    try {
        const lastCart = await Cart.findOne().sort({ _id: -1 });
        console.log('lastCart found in /carts/ultimo:', lastCart);

        if (lastCart) {
            res.redirect(`/carts/${lastCart._id}`);
        } else {
            res.status(404).render('error', { message: 'No hay carritos creados aún. ¡Agrega un producto primero!' });
        }
    } catch (error) {
        console.error('❌ Error al redirigir al último carrito:', error);
        res.status(500).render('error', { message: 'Error interno al buscar el carrito. Intenta agregar un producto primero.' });
    }
});

// Ruta para ver un carrito específico por ID (cuando la URL es /carts/:cid)
router.get('/:cid', getCartById);

export default router;