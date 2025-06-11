// server.js - Servidor Express consolidado para usuarios y productos

const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { connUsuarios, connProductos } = require('./BD.js');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y permitir CORS
app.use(express.json());
app.use(cors());

// Esquemas y modelos para usuarios y productos
const usuarioSchema = new connUsuarios.base.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  username: String,
  website: String,
  bio: String
});
const Usuario = connUsuarios.model('Usuario', usuarioSchema);

const productoSchema = new connProductos.base.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  comentarios: [{
    usuario: String,
    mensaje: String,
    fecha: { type: Date, default: Date.now }
  }]
});
const Producto = connProductos.model('Producto', productoSchema);

// Rutas API para usuarios

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario con password hasheada
app.post('/api/usuarios', async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ ...rest, password: hashedPassword });
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
});

// Endpoint login con bcrypt
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    res.json({ message: 'Login exitoso', usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Endpoint para cambiar contraseña
app.put('/api/usuarios/:id/password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: 'Nueva contraseña es requerida' });
  }
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

// Rutas API para productos

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear un nuevo producto
app.post('/api/productos', async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear producto' });
  }
});

// Servir archivos estáticos del frontend desde carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir carpeta login para archivos de login
app.use('/login', express.static(path.join(__dirname, 'login')));

// Ruta para servir Portada.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Portada.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
