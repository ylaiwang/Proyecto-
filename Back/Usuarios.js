/**
 * Archivo Usuarios.js
 * Configura la conexión a la base de datos "usuarios" usando mongoose,
 * define el esquema y modelo de usuario, y configura rutas para manejar peticiones HTTP.
 */

const { connUsuarios } = require('./BD.js'); // Importar conexión a DB usuarios
const express = require('express');          // Framework web Express
const bodyParser = require('body-parser');   // Middleware para parsear JSON
const bcrypt = require('bcrypt');             // Para encriptar y comparar contraseñas

const router = express.Router();

// Middleware para loguear peticiones entrantes (método y URL)
router.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Middleware para parsear JSON en las peticiones
router.use(bodyParser.json());

// Usar la conexión connUsuarios para la base de datos "usuarios"
const conn = connUsuarios;

// Evento cuando la conexión a la base de datos se abre exitosamente
conn.once('open', () => {
  console.log('Conexión exitosa a la base de datos usuarios');
});

// Evento para manejar errores en la conexión a la base de datos
conn.on('error', (err) => {
  console.error('Error en la conexión a la base de datos usuarios:', err);
});

// Definición del esquema para usuarios usando connUsuarios.Schema
const usuarioSchema = new connUsuarios.base.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  username: String,
  website: String,
  bio: String
});

// Crear el modelo Usuario usando connUsuarios.model
const Usuario = conn.model('Usuario', usuarioSchema);

// Endpoint para login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    // Login exitoso
    return res.json({ message: 'Login exitoso', usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo } });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ejemplo de ruta: obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Puedes agregar más rutas aquí (registro, login, etc.)

// Exportar el router para usarlo en conector.js
module.exports = router;
