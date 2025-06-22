const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { soloAdmin, autenticarToken } = require('./usuarios'); // Importa los middlewares

// Crear una conexión separada para la base de datos 'productos'
const productosConnection = mongoose.createConnection('mongodb://localhost:27017/productos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Esquema base de producto
const productoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  imagen: String
});

// Modelos para cada tipo de producto (colección específica) usando la conexión 'productosConnection'
const Cristal = productosConnection.model('Cristal', productoSchema, 'cristales');
const Figura = productosConnection.model('Figura', productoSchema, 'figuras');
const Reloj = productosConnection.model('Reloj', productoSchema, 'relojes');
const Taza = productosConnection.model('Taza', productoSchema, 'tazas');

// Esquema para calificaciones y comentarios
const calificacionSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

const Calificacion = productosConnection.model('Calificacion', calificacionSchema, 'calificaciones');

// Función para obtener el modelo según tipo
function getModelo(tipo) {
  switch (tipo) {
    case 'cristales': return Cristal;
    case 'figuras': return Figura;
    case 'relojes': return Reloj;
    case 'tazas': return Taza;
    default: throw new Error('Tipo de producto no válido');
  }
}

// --- CRUD por tipo de producto ---

// Crear producto (solo admin)
router.post('/productos/:tipo', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const Modelo = getModelo(req.params.tipo);
    const producto = new Modelo(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Listar productos por tipo (todos)
router.get('/productos/:tipo', async (req, res) => {
  try {
    const Modelo = getModelo(req.params.tipo);
    const productos = await Modelo.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Editar producto por tipo y ID (solo admin)
router.put('/productos/:tipo/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const Modelo = getModelo(req.params.tipo);
    const producto = await Modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar producto' });
  }
});

// Eliminar producto por tipo y ID (solo admin)
router.delete('/productos/:tipo/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const Modelo = getModelo(req.params.tipo);
    await Modelo.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Agregar calificación y comentario (solo usuarios autenticados)
router.post('/productos/:tipo/:id/calificar', autenticarToken, async (req, res) => {
  try {
    const { estrellas, comentario } = req.body;
    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: 'Número de estrellas inválido' });
    }
    const calificacion = new Calificacion({
      productoId: req.params.id,
      usuarioId: req.user.id,
      estrellas,
      comentario
    });
    await calificacion.save();
    res.status(201).json(calificacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar calificación' });
  }
});

// Obtener calificaciones y comentarios de un producto
router.get('/productos/:tipo/:id/calificaciones', async (req, res) => {
  try {
    const calificaciones = await Calificacion.find({ productoId: req.params.id });
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

module.exports = router;
