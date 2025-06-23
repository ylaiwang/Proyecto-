const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { router: usuariosRouter, Usuario } = require('./usuarios'); // <-- Importa así
const productosRouter = require('./productos');

const app = express();
const PORT = 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/usuarios', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('Conectado a la base de datos usuarios');
});

// Conexión a la base de datos productos
const productosConnection = require('mongoose').createConnection('mongodb://localhost:27017/productos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

productosConnection.once('open', () => {
  console.log('Conectado a la base de datos productos');
});

app.use(cors());
app.use(express.json());

// Middleware para logging de todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../Front')));

// Servir carpeta Imagenes estáticamente para imágenes
app.use('/Imagenes', express.static(path.join(__dirname, '../Front/Imagenes')));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/portada.html'));
});

// Ruta para perfil.html
app.get('/perfil.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/perfil.html'));
});

// Rutas de productos
console.log('Montando router de productos:', productosRouter);
app.use('/api/productos', productosRouter);

// Rutas de usuarios
app.use('/api/usuarios', usuariosRouter);

// Registrar administrador
app.post('/api/admin/registrar', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    const adminExistente = await Usuario.findOne({ correo });
    if (adminExistente) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }
    const nuevoAdmin = new Usuario({ nombre, correo, password, rol: 'admin' });
    await nuevoAdmin.save();
    res.status(201).json({ mensaje: 'Administrador creado', usuario: nuevoAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear administrador' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
