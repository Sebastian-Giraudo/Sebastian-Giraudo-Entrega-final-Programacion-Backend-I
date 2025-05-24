import { Cart } from '../dao/models/Cart.js';
import { Product } from '../dao/models/Product.js';

// Lógica para agregar un producto al carrito
export const addProductToCart = async (req, res) => {
    console.log('¡Petición POST recibida en addProductToCart!');
    const { cid, pid } = req.params; // cartId y productId
    const quantityToAdd = 1;

    try {
        const productExists = await Product.findById(pid);
        if (!productExists) {
            console.log(`Producto con ID ${pid} no encontrado en la base de datos.`);
            return res.status(404).send('<h1>Producto no encontrado</h1><a href="/products">Volver</a>');
        }

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

        // Verificar si el producto ya está en el carrito
        const productInCartIndex = cart.products.findIndex(
            (item) => item.product && item.product.toString() === pid
        );

        if (productInCartIndex !== -1) {
            // Si el producto ya está, incrementa la cantidad
            cart.products[productInCartIndex].quantity += quantityToAdd;
        } else {
            // Si no está, agrégalo al carrito
            cart.products.push({ product: pid, quantity: quantityToAdd });
        }

        // Guardar el carrito actualizado
        await cart.save();

        console.log(`✅ Producto ${pid} agregado al carrito ${cart._id}.`);
        res.redirect('/products?message=Producto agregado al carrito'); // Redirige a la página de productos con un mensaje
    } catch (error) {
        console.error('❌ Error al agregar producto al carrito:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            res.status(400).send(`<h1>Error: ID de producto o carrito inválido. (${error.value})</h1><a href="/products">Volver</a>`);
        } else {
            res.status(500).send('<h1>Error interno del servidor al agregar producto al carrito.</h1><a href="/products">Volver</a>');
        }
    }
};

// Función para crear un carrito (API)
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


// Lógica para obtener un carrito por ID y renderizarlo en la vista
export const getCartById = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado.' });
        }

        // Asegura que los productos estén populados y sean válidos
        // Filtra productos que podrían ser null si el populate falló para alguno 
        const validProducts = cart.products.filter(item => item.product !== null);

        // Calcula el total del carrito
        let total = 0;
        if (validProducts.length > 0) {
            total = validProducts.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        }

        // Pasa el objeto cart completo y los productos válidos a la vista
        
        res.render('cart', { cart: { _id: cart._id, total: total }, products: validProducts });
    } catch (error) {
        console.error('❌ Error al obtener carrito por ID:', error);
        // Si hay un CastError, significa que el ID no es válido
        if (error.name === 'CastError') {
            return res.status(400).render('error', { message: 'ID de carrito inválido.' });
        }
        res.status(500).render('error', { message: 'Error interno al buscar el carrito.' });
    }
};


// Lógica para eliminar un producto del carrito
export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' }); // Usar json para API
        }
        // Filtrar el producto a eliminar
        const initialLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        if (cart.products.length === initialLength) {
            // Si la longitud no cambió, el producto no estaba en el carrito
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito.' });
        }

        await cart.save();
        res.redirect(`/carts/${cid}`); // Redirige de vuelta al carrito para ver el cambio
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito.' });
    }
};

// Lógica para actualizar todo el carrito con un nuevo arreglo de productos
export const updateCart = async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body; 

    try {
        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: 'El formato de productos es inválido. Se espera un arreglo.' });
        }
        //Valida que los IDs de los productos existan
        for (const item of products) {
            if (!item.product || !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({ status: 'error', message: 'Cada producto debe tener un ID de producto válido y una cantidad positiva.' });
            }
            const productExists = await Product.findById(item.product);
            if (!productExists) {
                return res.status(404).json({ status: 'error', message: `Producto con ID ${item.product} no encontrado.` });
            }
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

// Lógica para actualizar SÓLO la cantidad de ejemplares de un producto en el carrito
export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body; 

    // Convertir a número y validar
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 0) { // Permitimos 0 para eliminar
        return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número entero positivo o cero.' });
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

        if (newQuantity === 0) {
            // Si la cantidad es 0, elimina el producto del carrito
            cart.products.splice(productIndex, 1);
        } else {
            // Actualiza la cantidad
            cart.products[productIndex].quantity = newQuantity;
        }

        await cart.save();
        // Redirige de vuelta a la vista del carrito para que el usuario vea el cambio
        res.redirect(`/carts/${cid}`);
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

// Lógica para eliminar todos los productos del carrito (vaciar)
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