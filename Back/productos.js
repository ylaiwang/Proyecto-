const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { soloAdmin, autenticarToken } = require('./usuarios'); // Importa los middlewares

// Configuración de multer para almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../Front/Imagenes/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Crear una conexión separada para la base de datos 'productos'
const productosConnection = mongoose.createConnection('mongodb://localhost:27017/productos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Manejar eventos de conexión para debug
productosConnection.on('connected', () => {
  console.log('Conexión a MongoDB productos establecida');
});

productosConnection.on('error', (err) => {
  console.error('Error en la conexión a MongoDB productos:', err);
});

productosConnection.on('disconnected', () => {
  console.warn('Conexión a MongoDB productos desconectada');
});

// Esquema base de producto
const productoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  imagen: String,
  stock: Number
});

// Modelos para cada tipo de producto (colección específica) usando la conexión 'productosConnection'
const Cristal = productosConnection.model('Cristal', productoSchema, 'cristales');
const Figura = productosConnection.model('Figura', productoSchema, 'figuras');
const Reloj = productosConnection.model('Reloj', productoSchema, 'relojes');
const Taza = productosConnection.model('Taza', productoSchema, 'tazas');
const Tecnologia = productosConnection.model('Tecnologia', productoSchema, 'tecnologia');

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
  console.log('getModelo llamado con tipo:', tipo);
  switch (tipo) {
    case 'cristales': return Cristal;
    case 'figuras': return Figura;
    case 'relojes': return Reloj;
    case 'tazas': return Taza;
    case 'tecnologia': return Tecnologia;
    case 'todos': {
      // Para "todos", devolver todos los productos de todas las colecciones concatenados
      return null; // Indicamos que no hay un modelo único para "todos"
    }
    default: throw new Error('Tipo de producto no válido');
  }
}

// Endpoint para obtener el conteo de productos por cada categoría.
router.get('/conteo/categorias', async (req, res) => {
  try {
    console.log('Estado de conexión a MongoDB productos:', productosConnection.readyState);
    if (productosConnection.readyState !== 1) {
      console.error('Conexión a la base de datos no está activa. Estado:', productosConnection.readyState);
      return res.status(500).json({ error: 'Conexión a la base de datos no está activa.' });
    }
    const cristalesCount = await Cristal.countDocuments();
    const figurasCount = await Figura.countDocuments();
    const relojesCount = await Reloj.countDocuments();
    const tazasCount = await Taza.countDocuments();
    const tecnologiaCount = await Tecnologia.countDocuments();

    res.json({
      cristales: cristalesCount,
      figuras: figurasCount,
      relojes: relojesCount,
      tazas: tazasCount,
      tecnologia: tecnologiaCount
    });
  } catch (error) {
    console.error('Error al obtener conteo de categorías:', error.stack || error);
    res.status(500).json({ error: 'Error al obtener conteo de categorías', details: error.message });
  }
});

// --- CRUD por tipo de producto ---

  // Crear producto (solo admin)
  router.post('/:tipo', autenticarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
    try {
      console.log('POST /:tipo body:', req.body);
      console.log('Archivo recibido:', req.file);
      const tipoNormalizado = req.params.tipo.toLowerCase().trim();
      const Modelo = getModelo(tipoNormalizado);
      const productoData = req.body;
      if (req.file) {
        // Cambiar la ruta para que coincida con la carpeta Imagenes
        productoData.imagen = '/Imagenes/' + req.file.filename;
      }
      const producto = new Modelo(productoData);
      await producto.save();
      res.status(201).json(producto);
    } catch (error) {
      console.error('Error al crear producto:', error);
      console.error('Detalles del error:', error.stack);
      res.status(500).json({ error: 'Error al crear producto', details: error.message });
    }
  });

  // Listar productos por tipo (todos)
  router.get('/:tipo', async (req, res) => {
    try {
      const tipoNormalizado = req.params.tipo.toLowerCase().trim();
    if (tipoNormalizado === 'todos') {
      // Obtener productos de todas las colecciones y concatenar
      const cristales = (await Cristal.find()).map(p => ({ ...p.toObject(), tipoReal: 'cristales' }));
      const figuras = (await Figura.find()).map(p => ({ ...p.toObject(), tipoReal: 'figuras' }));
      const relojes = (await Reloj.find()).map(p => ({ ...p.toObject(), tipoReal: 'relojes' }));
      const tazas = (await Taza.find()).map(p => ({ ...p.toObject(), tipoReal: 'tazas' }));
      const tecnologia = (await Tecnologia.find()).map(p => ({ ...p.toObject(), tipoReal: 'tecnologia' }));
      const todos = [...cristales, ...figuras, ...relojes, ...tazas, ...tecnologia];
      res.json(todos);
    } else {
      const Modelo = getModelo(tipoNormalizado);
      const productos = await Modelo.find();
      res.json(productos);
    }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  });

  // Obtener producto por tipo y id
  router.get('/:tipo/:id', async (req, res) => {
    try {
      const tipoNormalizado = req.params.tipo.toLowerCase().trim();
      const Modelo = getModelo(tipoNormalizado);
      if (!Modelo) {
        return res.status(400).json({ error: 'Tipo de producto no válido' });
      }
      const producto = await Modelo.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error.stack || error);
      res.status(500).json({ error: 'Error al obtener producto', details: error.message });
    }
  });

// Editar producto por tipo y ID (solo admin)
router.put('/:tipo/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const tipoNormalizado = req.params.tipo.toLowerCase().trim();
    const Modelo = getModelo(tipoNormalizado);
    const producto = await Modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar producto' });
  }
});

// Eliminar producto por tipo y ID (solo admin)
router.delete('/:tipo/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const tipoNormalizado = req.params.tipo.toLowerCase().trim();
    const Modelo = getModelo(tipoNormalizado);
    await Modelo.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

  // Agregar calificación y comentario (solo usuarios autenticados)
  router.post('/:tipo/:id/calificar', autenticarToken, async (req, res) => {
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
  router.get('/:tipo/:id/calificaciones', async (req, res) => {
    try {
      const calificaciones = await Calificacion.find({ productoId: req.params.id });
      res.json(calificaciones);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
  });

/**
 * Endpoint para obtener el conteo de productos por cada categoría.*/
router.get('/conteo/categorias', async (req, res) => {
  try {
    console.log('Estado de conexión a MongoDB productos:', productosConnection.readyState);
    if (productosConnection.readyState !== 1) {
      console.error('Conexión a la base de datos no está activa. Estado:', productosConnection.readyState);
      return res.status(500).json({ error: 'Conexión a la base de datos no está activa.' });
    }
    const cristalesCount = await Cristal.countDocuments();
    const figurasCount = await Figura.countDocuments();
    const relojesCount = await Reloj.countDocuments();
    const tazasCount = await Taza.countDocuments();
    const tecnologiaCount = await Tecnologia.countDocuments();

    res.json({
      cristales: cristalesCount,
      figuras: figurasCount,
      relojes: relojesCount,
      tazas: tazasCount,
      tecnologia: tecnologiaCount
    });
  } catch (error) {
    console.error('Error al obtener conteo de categorías:', error.stack || error);
    res.status(500).json({ error: 'Error al obtener conteo de categorías', details: error.message });
  }
});

/**
 * Eliminar comentario por id (autor o admin)
 */
router.delete('/comentarios/:id', autenticarToken, async (req, res) => {
  try {
    const comentarioId = req.params.id;
    const usuarioId = req.user.id;
    const esAdmin = req.user.rol === 'admin';

    const comentario = await Calificacion.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Permitir eliminar si es admin o autor del comentario
    if (!esAdmin && comentario.usuarioId.toString() !== usuarioId) {
      return res.status(403).json({ error: 'No autorizado para eliminar este comentario' });
    }

    // Intentar eliminar el comentario
    const resultado = await Calificacion.deleteOne({ _id: comentarioId });
    if (resultado.deletedCount === 0) {
      console.error('No se eliminó ningún comentario, ID:', comentarioId);
      return res.status(500).json({ error: 'No se pudo eliminar el comentario' });
    }

    res.json({ mensaje: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error al eliminar comentario', details: error.message });
  }
});

/**
 * Modificar comentario por id (autor)
 */
router.put('/comentarios/:id', autenticarToken, async (req, res) => {
  try {
    const comentarioId = req.params.id;
    const usuarioId = req.user.id;
    const { estrellas, comentario } = req.body;

    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: 'Número de estrellas inválido' });
    }

    const calificacion = await Calificacion.findById(comentarioId);
    if (!calificacion) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Validar que el usuario sea el autor
    if (calificacion.usuarioId.toString() !== usuarioId) {
      return res.status(403).json({ error: 'No autorizado para modificar este comentario' });
    }

    calificacion.estrellas = estrellas;
    calificacion.comentario = comentario;
    await calificacion.save();

    res.json(calificacion);
  } catch (error) {
    console.error('Error al modificar comentario:', error);
    res.status(500).json({ error: 'Error al modificar comentario', details: error.message });
  }
});

module.exports = router;
