/**
 * Archivo BD.js
 * Configura y exporta conexiones separadas a las bases de datos MongoDB
 * para "usuarios" y "productos" usando mongoose.
 */

const mongoose = require('mongoose');

// Crear una conexión separada para la base de datos "usuarios"
const connUsuarios = mongoose.createConnection('mongodb://127.0.0.1:27017/usuarios', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
connUsuarios.on('connected', () => {
  console.log('Conectado a la base de datos "usuarios"');
});
connUsuarios.on('error', (err) => {
  console.error('Error en la conexión a "usuarios":', err);
});

// Crear una conexión separada para la base de datos "productos"
const connProductos = mongoose.createConnection('mongodb://127.0.0.1:27017/productos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
connProductos.on('connected', () => {
  console.log('Conectado a la base de datos "productos"');
});
connProductos.on('error', (err) => {
  console.error('Error en la conexión a "productos":', err);
});

// Exportar las conexiones para que puedan ser usadas en otros archivos
module.exports = { connUsuarios, connProductos };
