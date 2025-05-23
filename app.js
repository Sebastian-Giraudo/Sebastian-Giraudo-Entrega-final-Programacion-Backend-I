// app.js

import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
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
import productRouter from './routes/products.router.js'; // ¡Asegúrate de que este import sea correcto!
import cartRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, // Estas opciones son recomendadas
    useUnifiedTopology: true // para evitar warnings de Mongoose
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(error => console.error('❌ Error conectando a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON en las peticiones
app.use(express.urlencoded({ extended: true })); // Middleware para parsear URL-encoded bodies

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '/public')));

// Rutas API
app.use('/api/products', productRouter); // ¡ESTA LÍNEA ES CRÍTICA PARA EL ERROR 404 POST!
app.use('/api/carts', cartRouter);

// Rutas de VISTAS (Handlebars)
app.use('/products', viewsRouter); // Para /products y /products/product-detail/:pid
app.use('/carts', viewsRouter);   // Para /carts/ultimo y /carts/:cid

// Servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});