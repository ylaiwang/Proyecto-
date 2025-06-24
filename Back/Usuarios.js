 const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' }
});

/* Middleware para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
*/

// Método para comparar contraseña
/* Comentado para comprobar credenciales sin hash
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
*/

// Usar comparación simple sin hash
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
  return candidatePassword === this.password;
};
// usuarioSchema.methods.comparePassword = async function(candidatePassword) {
//   return candidatePassword === this.password;
// };

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Middleware para validar token JWT y extraer usuario
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, 'secreto_super_seguro', (err, user) => {
    if (err) {
      console.log('Token inválido:', err);
      return res.status(403).json({ error: 'Token inválido' });
    }
    console.log('Token válido, usuario:', user);
    req.user = user;
    next();
  });
};

// In-memory store for refresh tokens (use DB or Redis in production)
let refreshTokens = [];

// Ruta POST para login con refresh token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo: email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const isMatch = await usuario.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const payload = { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
    const token = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '12h' });
    const refreshToken = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '12h' });
    refreshTokens.push(refreshToken);
    res.json({ mensaje: 'Login exitoso', token, refreshToken, usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta POST para renovar token JWT usando refresh token
router.post('/token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: 'Refresh token inválido' });

  jwt.verify(refreshToken, 'secreto_super_seguro', (err, user) => {
    if (err) return res.status(403).json({ error: 'Refresh token inválido' });
    const payload = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    const token = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '15m' });
    res.json({ token });
  });
});

// Ruta POST para cerrar sesión e invalidar refresh token
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ mensaje: 'Logout exitoso' });
});

// Ruta POST para crear un usuario
router.post('/', async (req, res) => {
  try {
    console.log('POST /usuarios body:', req.body); // Log para depuración
    const { nombre, correo, password, rol } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }
    const nuevoUsuario = new Usuario({ nombre, correo, password, rol: rol || 'usuario' });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error en POST /usuarios:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Ruta POST para login con refresh token
router.post('/login', async (req, res) => {
  try {
    console.log('POST /login body:', req.body); // Log para depuración
    const { email, password } = req.body;
    if (!email || !password) {
      console.error('Faltan campos obligatorios en login');
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const usuario = await Usuario.findOne({ correo: email });
    if (!usuario) {
      console.error('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    console.log('Usuario encontrado:', usuario);
    const isMatch = await usuario.comparePassword(password);
    console.log('Resultado comparación contraseña:', isMatch);
    if (!isMatch) {
      console.error('Contraseña incorrecta para usuario:', email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    // Generar token JWT y refresh token
    const payload = { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
    const token = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    res.json({ mensaje: 'Login exitoso', token, refreshToken, usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol } });
  } catch (error) {
    console.error('Error en POST /login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta POST para renovar token JWT usando refresh token
router.post('/token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: 'Refresh token inválido' });

  jwt.verify(refreshToken, 'secreto_super_seguro', (err, user) => {
    if (err) return res.status(403).json({ error: 'Refresh token inválido' });
    const payload = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    const token = jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '15m' });
    res.json({ token });
  });
});

// Ruta POST para cerrar sesión e invalidar refresh token
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ mensaje: 'Logout exitoso' });
});

// Middleware para verificar que el usuario es admin
const soloAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    console.log('Acceso concedido a admin:', req.user);
    next();
  } else {
    console.log('Acceso denegado. Usuario no es admin:', req.user);
    res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
};


/* Función para hashear (cifrar) una contraseña usando bcrypt.*/
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}


/* Función para reiniciar los roles y usuarios en la base de datos. */
async function resetRolesAndUsers() {
  try {
    // Conexión a la base de datos 'admin' para manejar administradores
    const adminConnection = await mongoose.createConnection('mongodb://localhost:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Definición del esquema para administradores
    const adminSchema = new mongoose.Schema({
      nombre: String,
      correo: { type: String, unique: true },
      password: String,
      rol: { type: String, default: 'admin' }
    }, { collection: 'administrador' });

    // Modelo para administradores
    const Admin = adminConnection.model('Admin', adminSchema, 'administrador');

    // Eliminar todos los administradores existentes
    await Admin.deleteMany({});

    // Conexión a la base de datos 'usuarios' para manejar usuarios comunes
    const usuarioConnection = await mongoose.createConnection('mongodb://localhost:27017/usuarios', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Definición del esquema para usuarios comunes
    const usuarioSchema = new mongoose.Schema({
      nombre: String,
      correo: { type: String, unique: true },
      password: String,
      rol: { type: String, default: 'usuario' }
    }, { collection: 'usuarios' });

    // Modelo para usuarios comunes
    const UsuarioModel = usuarioConnection.model('Usuario', usuarioSchema, 'usuarios');

    // Eliminar todos los usuarios existentes
    await UsuarioModel.deleteMany({});

    
    // Hashear las contraseñas e insertar administradores
    for (const admin of admins) {
      admin.password = await hashPassword(admin.password);
      await new Admin(admin).save();
    }

    // Hashear las contraseñas e insertar usuarios comunes
    for (const usuario of usuarios) {
      usuario.password = await hashPassword(usuario.password);
      await new UsuarioModel(usuario).save();
    }

    console.log('Roles y usuarios reiniciados correctamente.');
  } catch (error) {
    console.error('Error al reiniciar roles y usuarios:', error);
  }
}

router.delete('/usuarios/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await Usuario.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = { router, Usuario, soloAdmin, autenticarToken, resetRolesAndUsers };