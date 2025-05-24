import { Router } from 'express';
import { Product } from '../dao/models/Product.js';
import buildPaginationLinks from '../utils/paginateLinks.js'; 

const router = Router();

// Ruta para el listado de productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {        
        filter = {
            $or: [
                { category: { $regex: query, $options: 'i' } }, 
            ]
        };        
    }

    let sortOption = {};
    if (sort === 'asc') {
        sortOption = { price: 1 };
    } else if (sort === 'desc') {
        sortOption = { price: -1 };
    }

    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sortOption,
        lean: true
    };

    try {
        const result = await Product.paginate(filter, options);

        
        const { prevLink, nextLink } = buildPaginationLinks('/products', req.query, result);

        res.render('products', {
            products: result.docs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink,
            page: result.page,
            totalPages: result.totalPages,
            limit: limit, 
            sort: sort,
            query: query
        });
    } catch (error) {
        console.error("Error al obtener productos para la vista:", error);
        res.status(500).render('products', { products: [], title: 'Listado de Productos', error: 'No se pudieron cargar los productos.' });
    }
});

// Ruta para el detalle de un producto específico
router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await Product.findById(productId).lean(); 

        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado.' });
        }


        res.render('productDetail', { product: product });
    } catch (error) {
        console.error("Error al obtener detalle del producto:", error);
        res.status(500).render('error', { message: 'Error interno al cargar el detalle del producto.' });
    }
});

export default router;