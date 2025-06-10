document.addEventListener('DOMContentLoaded', () => {
  // Manejo de cambio de pestañas entre login y registro
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');

  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = trigger.getAttribute('data-tab');

      // Remover clase 'active' de todos los botones y agregarla al seleccionado
      tabTriggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');

      // Mostrar el contenido correspondiente y ocultar los demás
      tabContents.forEach(content => {
        if (content.id === target) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // Manejo del formulario de login
  const loginForm = document.querySelector('#login form');
  const loginMessage = document.createElement('p');
  loginForm.appendChild(loginMessage);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores de correo y contraseña del formulario de login
    const correo = loginForm.querySelector('#email').value;
    const password = loginForm.querySelector('#password').value;

    try {
      // Enviar datos al backend para login
      const response = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito
        loginMessage.style.color = 'green';
        loginMessage.textContent = data.message;
        // Guardar datos del usuario en localStorage para perfil
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        // Redirigir a portada.html después de login exitoso
        setTimeout(() => {
          window.location.href = '/Portada.html';
        }, 1500);
      } else {
        // Mostrar mensaje de error
        loginMessage.style.color = 'red';
        loginMessage.textContent = data.error || 'Error en el login';
      }
    } catch (error) {
      // Mostrar mensaje de error de conexión
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'Error de conexión al servidor';
    }
  });

  // Manejo del formulario de registro
  const registerForm = document.querySelector('#register form');
  const registerMessage = document.createElement('p');
  registerForm.appendChild(registerMessage);

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores de nombre, correo y contraseña del formulario de registro
    const nombre = registerForm.querySelector('#name').value;
    const correo = registerForm.querySelector('#email-register').value;
    const password = registerForm.querySelector('#password-register').value;

    try {
      // Enviar datos al backend para registro
      const response = await fetch('http://127.0.0.1:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito y cambiar a pestaña login
        registerMessage.style.color = 'green';
        registerMessage.textContent = 'Usuario registrado correctamente. Puedes iniciar sesión.';
        tabTriggers.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tabTriggers[0].classList.add('active');
        tabContents[0].classList.add('active');
        // Guardar usuario en localStorage para perfil tras registro exitoso
        if (data.usuario) {
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
        // Redirigir a portada.html después de registro exitoso
        setTimeout(() => {
          window.location.href = '/Portada.html';
        }, 1500);
      } else {
        // Mostrar mensaje de error
        registerMessage.style.color = 'red';
        registerMessage.textContent = data.error || 'Error en el registro';
      }
    } catch (error) {
      // Mostrar mensaje de error de conexión
      registerMessage.style.color = 'red';
      registerMessage.textContent = 'Error de conexión al servidor';
    }
  });
});
