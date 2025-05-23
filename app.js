import express from 'express';
import mongoose from 'mongoose';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


import dotenv from 'dotenv';
dotenv.config();
// ----------------------------------------------------

// Define __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importación de routers
import productRouter from './routes/products.router.js'; // Para la API REST de productos
import cartRouter from './routes/carts.router.js';     // Para la API REST de carritos
import viewsRouter from './routes/views.router.js';   // Para las VISTAS de Handlebars

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

// Configuración de Handlebars
const hbs = exphbs.create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
    helpers: {
        multiply: function(a, b) {
            return a * b;
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '/public')));

// Rutas API (para interactuar con la DB a través de REST)
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Rutas de VISTAS (Handlebars)

app.use('/', viewsRouter);

// Servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});