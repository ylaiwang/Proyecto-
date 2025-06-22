document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = [document.getElementById('tab-login'), document.getElementById('tab-register')];
  const sections = [document.getElementById('login-section'), document.getElementById('register-section')];
  tabs.forEach((tab, idx) => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      sections.forEach((sec, i) => sec.style.display = i === idx ? 'flex' : 'none');
    };
  });

  // Ocultar perfil y mostrar registro si no hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navRegister = document.getElementById('nav-register');
  const navProfile = document.getElementById('nav-profile');
  if (!usuario) {
    if (navRegister) navRegister.style.display = 'inline-block';
    if (navProfile) navProfile.style.display = 'none';
  }

  // Login usuario
  document.getElementById('login-section').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = ''; // Limpia el error anterior
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log('Respuesta login:', data); // Log para depuración
      if (res.ok) {
        // Login exitoso
        const successDiv = document.getElementById('login-success');
        if (successDiv) {
          successDiv.textContent = 'Sesión iniciada correctamente.';
        }
        // Guardar datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('rol', data.usuario.rol); // Guardar el rol en localStorage
        localStorage.setItem('token', data.token); // Guardar el token JWT en localStorage
        // Actualizar menú para mostrar perfil y ocultar registro
        const navRegister = document.getElementById('nav-register');
        const navProfile = document.getElementById('nav-profile');
        if (navRegister && navProfile) {
          navRegister.style.display = 'none';
          navProfile.style.display = 'inline-block';
        }
        // Redirigir a modelos.html después de un breve retraso para mostrar la notificación
        setTimeout(() => {
          window.location.href = '/modelos.html';
        }, 1500);
      } else {
        // Muestra el mensaje de error
        errorDiv.textContent = data.error || 'Credenciales incorrectas';
      }
    } catch (err) {
      console.error('Error en fetch login:', err);
      errorDiv.textContent = 'Error de conexión con el servidor';
    }
  });

  // Registro usuario/admin
  document.getElementById('register-section').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('register-nombre').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const esAdmin = document.getElementById('register-admin-checkbox').checked;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    errorDiv.textContent = '';
    successDiv.textContent = '';

    let url = '';
    let body = {};

    if (esAdmin) {
      url = 'http://localhost:3000/api/admin/registrar';
      body = { nombre, correo: email, password };
    } else {
      url = 'http://localhost:3000/api/usuarios';
      body = { nombre, correo: email, password };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        successDiv.textContent = esAdmin
          ? 'Administrador registrado correctamente.'
          : 'Usuario registrado correctamente.';
        document.getElementById('register-section').reset();
        // Guardar datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        // Actualizar menú para mostrar perfil y ocultar registro
        const navRegister = document.getElementById('nav-register');
        const navProfile = document.getElementById('nav-profile');
        if (navRegister && navProfile) {
          navRegister.style.display = 'none';
          navProfile.style.display = 'inline-block';
        }
        // Redirigir a modelos.html después de un breve retraso para mostrar la notificación
        setTimeout(() => {
          window.location.href = '/modelos.html';
        }, 1500);
      } else {
        errorDiv.textContent = data.error || 'Error al registrar.';
      }
    } catch (err) {
      errorDiv.textContent = 'Error de conexión con el servidor.';
    }
  });

  // Ojito para login
  const loginPassword = document.getElementById('login-password');
  const toggleLoginPassword = document.getElementById('toggle-login-password');
  toggleLoginPassword.addEventListener('mousedown', () => {
    loginPassword.type = 'text';
  });
  toggleLoginPassword.addEventListener('mouseup', () => {
    loginPassword.type = 'password';
  });
  toggleLoginPassword.addEventListener('mouseleave', () => {
    loginPassword.type = 'password';
  });

  // Ojito para registro
  const registerPassword = document.getElementById('register-password');
  const toggleRegisterPassword = document.getElementById('toggle-register-password');
  toggleRegisterPassword.addEventListener('mousedown', () => {
    registerPassword.type = 'text';
  });
  toggleRegisterPassword.addEventListener('mouseup', () => {
    registerPassword.type = 'password';
  });
  toggleRegisterPassword.addEventListener('mouseleave', () => {
    registerPassword.type = 'password';
  });
});
