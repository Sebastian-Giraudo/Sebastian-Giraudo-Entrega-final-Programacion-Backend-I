
import { Router } from 'express';
import { getCartById, addProductToCart } from '../controllers/carts.controller.js'; 
import { Cart } from '../dao/models/Cart.js'; // Importamos el modelo de Carrito
import { Product } from '../dao/models/Product.js';

const router = Router();

// --- RUTA PARA LA LISTA DE PRODUCTOS 

router.get('/products', async (req, res) => { 
    try {
        const products = await Product.find().lean();
        res.render('products', { products: products, title: 'Listado de Productos' });
    } catch (error) {
        console.error("Error al obtener productos para la vista:", error);
        
        res.render('products', { products: [], title: 'Listado de Productos', errorMessage: 'No se pudieron cargar los productos.' });
    }
});

// --- RUTA PARA DETALLE DEL PRODUCTO 
router.get('/product-detail/:pid', async (req, res) => { 
    const productId = req.params.pid;

    try {
        const product = await Product.findById(productId).lean(); // Busca el producto real por ID
        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado.' });
        }
        res.render('productDetail', { product: product, title: `Detalle: ${product.title}` });
    } catch (error) {
        console.error("Error al obtener detalle del producto:", error);
        res.status(500).render('error', { message: 'Error interno al cargar el detalle del producto.' });
    }
});

// --- RUTA POST para AGREGAR AL CARRITO

router.post('/carts/:cid/products/:pid', addProductToCart);


// --- RUTA PARA VER EL ÚLTIMO CARRITO CREADO
router.get('/carts/ultimo', async (req, res) => { 
    try {
        const lastCart = await Cart.findOne().sort({ _id: -1 });
        if (lastCart) {
            res.redirect(`/carts/${lastCart._id}`); // Redirige al ID real del último carrito
        } else {
            res.status(404).render('error', { message: 'No hay carritos creados aún. ¡Agrega un producto primero!' });
        }
    } catch (error) {
        console.error('❌ Error al redirigir al último carrito:', error);
        res.status(500).render('error', { message: 'Error interno al buscar el carrito. Intenta agregar un producto primero.' });
    }
});

// --- RUTA PARA VER UN CARRITO ESPECÍFICO POR ID 

router.get('/carts/:cid', getCartById); 


router.get('/', (req, res) => {
    res.redirect('/products');
});


export default router;