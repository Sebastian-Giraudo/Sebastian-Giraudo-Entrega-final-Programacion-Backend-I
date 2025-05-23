// routes/views.router.js
import { Router } from 'express';
// --- IMPORTACIONES NECESARIAS ---
import { getCartById } from '../controllers/carts.controller.js'; // Importamos el controlador del carrito
import { Cart } from '../dao/models/Cart.js'; // Importamos el modelo de Carrito
// --------------------------------

const router = Router();

// Ruta para la lista de productos
router.get('/', (req, res) => {
    const dummyProducts = [
        { _id: '682fce15d6c1c949aaaafc62', title: 'Producto A', description: 'Descripción del Producto A', price: 100, category: 'Electrónica', stock: 50 },
        { _id: '682fce4bd6c1c949aaaafc64', title: 'Producto B', description: 'Descripción del Producto B', price: 200, category: 'Ropa', stock: 25 },
        { _id: '682fce5bd6c1c949aaaafc66', title: 'Producto C', description: 'Descripción del Producto C', price: 300, category: 'Hogar', stock: 10 }
    ];
    res.render('products', { products: dummyProducts, title: 'Listado de Productos' });
});

// RUTA PARA DETALLE DEL PRODUCTO (¡AHORA MÁS ESPECÍFICA!)
router.get('/product-detail/:pid', (req, res) => { // ¡CAMBIADO AQUÍ! AÑADIDO '/product-detail'
    const productId = req.params.pid;

    const productDetail = {
        _id: productId,
        title: `Producto ${productId.substring(0, 8)}...`,
        price: (productId.charCodeAt(0) % 100) * 10,
        category: 'Categoría dummy',
        description: `Esta es la descripción detallada del producto con ID: ${productId}. Aquí puedes ver más información.`,
        stock: (productId.charCodeAt(1) % 10) + 1
    };

    res.render('productDetail', { product: productDetail, title: `Detalle: ${productDetail.title}` });
});

// --- RUTA PARA VER EL ÚLTIMO CARRITO CREADO ---
router.get('/ultimo', async (req, res) => { // ¡CAMBIADO AQUÍ! QUITADO '/carts' porque app.js ya lo maneja
    try {
        const lastCart = await Cart.findOne().sort({ _id: -1 });
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

// --- RUTA PARA VER UN CARRITO ESPECÍFICO POR ID ---
router.get('/:cid', getCartById); // ¡CAMBIADO AQUÍ! QUITADO '/carts' porque app.js ya lo maneja

export default router;