import { Cart } from '../dao/models/Cart.js';
import { Product } from '../dao/models/Product.js';

// Lógica para agregar un producto al carrito
export const addProductToCart = async (req, res) => {
    console.log('¡Petición POST recibida en addProductToCart!');
    const { cid, pid } = req.params; // cartId y productId
    const quantity = 1; // Por ahora, asumimos que la cantidad siempre es 1 desde el formulario

    try {
        // *** ESTO ES CRÍTICO: VERIFICAR QUE EL PRODUCTO REALMENTE EXISTA ***
        const productExists = await Product.findById(pid); 
        if (!productExists) {
            console.log(`Producto con ID ${pid} no encontrado en la base de datos.`);
            return res.status(404).send('<h1>Producto no encontrado</h1><a href="/products">Volver</a>');
        }
        // *******************************************************************

        let cart;
        if (cid === '1') {
            // Lógica para manejar el ID '1' (buscar el último o crear)
            cart = await Cart.findOne().sort({ _id: -1 }); // Busca el carrito más reciente
            if (!cart) {
                cart = new Cart({ products: [] });
                await cart.save();
                console.log('✅ Nuevo carrito creado automáticamente al agregar el primer producto (ID "1" de formulario). ID:', cart._id);
            }
        } else {
            // Intenta buscar el carrito por el ID proporcionado
            cart = await Cart.findById(cid);
        }

        if (!cart) {
            return res.status(404).send('<h1>Carrito no encontrado o no se pudo crear.</h1><a href="/products">Volver</a>');
        }

        // 3. Verificar si el producto ya está en el carrito
        const productInCartIndex = cart.products.findIndex(
            (item) => item.product && item.product.toString() === pid
        );

        if (productInCartIndex !== -1) {
            // Si el producto ya está, incrementa la cantidad
            cart.products[productInCartIndex].quantity += quantity;
        } else {
            // Si no está, agrégalo al carrito
            cart.products.push({ product: pid, quantity: quantity });
        }

        // 4. Guardar el carrito actualizado
        await cart.save();

        console.log(`✅ Producto ${pid} agregado al carrito ${cart._id}.`);
        res.redirect('/products?message=Producto agregado al carrito'); // Redirige a la página de productos con un mensaje
    } catch (error) {
        console.error('❌ Error al agregar producto al carrito:', error);
        // Depuración adicional:
        if (error.name === 'CastError' && error.path === '_id') {
            res.status(400).send(`<h1>Error: ID de producto o carrito inválido. (${error.value})</h1><a href="/products">Volver</a>`);
        } else {
            res.status(500).send('<h1>Error interno del servidor al agregar producto al carrito.</h1><a href="/products">Volver</a>');
        }
    }
};

// Función para crear un carrito 
export const createCart = async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json({ status: 'success', message: 'Carrito creado con éxito', cartId: newCart._id });
    } catch (error) {
        console.error('Error al crear carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al crear carrito.' });
    }
};


// Funciones de controlador de carrito existentes (mantener como están)
export const getCartById = async (req, res) => {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) {
        return res.status(404).render('error', { message: 'Carrito no encontrado.' });
    }
    const products = cart.products.map(p => ({
        
        product: p.product ? {
            _id: p.product._id,
            title: p.product.title,
            price: p.product.price,
            
        } : null, 
        quantity: p.quantity
    }));

    // Filtra productos que podrían ser null si el populate falló para alguno
    const validProducts = products.filter(p => p.product !== null);

    const total = validProducts.reduce((acc, p) => acc + p.product.price * p.quantity, 0);
    res.render('cart', { products: validProducts, cartId: cart._id, total });
};


export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('<h1>Carrito no encontrado</h1>');
        }
        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();
        res.redirect(`/carts/${cid}`);
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).send('<h1>Error al eliminar producto del carrito.</h1>');
    }
};

export const updateCart = async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: 'El formato de productos es inválido.' });
        }
        
        const updatedCart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }
        res.status(200).json({ status: 'success', message: 'Carrito actualizado con éxito', cart: updatedCart });
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar carrito.' });
    }
};

export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo.' });
    }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito.' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({ status: 'success', message: 'Cantidad de producto actualizada.', cart: cart });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export const deleteAllProducts = async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }
        
        res.redirect(`/carts/${cid}`); // Redirige de vuelta al carrito vacío
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al vaciar el carrito.' });
    }
};