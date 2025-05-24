import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// --- ÚNICA IMPORTACIÓN Y CONFIGURACIÓN DE DOTENV ---
import dotenv from 'dotenv';
dotenv.config();
// ----------------------------------------------------

// Define __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importación de routers
import productRouter from './routes/products.router.js'; // Este es para la API REST de productos
import cartRouter from './routes/carts.router.js';     // Este es para la API REST de carritos

// NUEVAS IMPORTACIONES DE ROUTERS DE VISTAS SEPARADOS
import productsViewsRouter from './routes/views.router.js'; 
import cartsViewsRouter from './routes/carts.views.router.js'; 

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(error => console.error('❌ Error conectando a MongoDB:', error));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Configuración de Handlebars
const hbs = exphbs.create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
    helpers: {
        multiply: function(a, b) {
            return a * b;
        },
        subtract: function(a, b) { 
            return a - b;
        },
        // ¡CAMBIO AQUÍ! Nueva definición para el helper 'eq'
        eq: function(arg1, arg2) { 
            return arg1 == arg2;
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '/public')));

// Rutas API 
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Rutas de VISTAS (Handlebars)
app.use('/products', productsViewsRouter);
// Montamos el router de vistas de carritos en /carts
app.use('/carts', cartsViewsRouter); 

// Ruta raíz que redirige a /products
app.get('/', (req, res) => {
    res.redirect('/products');
});

// Servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});