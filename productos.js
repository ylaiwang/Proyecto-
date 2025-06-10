const { connProductos } = require('./BD.js'); // usa la conexión de BD.js

// Definir esquema del producto con atributo comentarios
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

// Crear el modelo Producto usando la conexión connProductos
const Producto = connProductos.model('Producto', productoSchema);

module.exports = Producto;
