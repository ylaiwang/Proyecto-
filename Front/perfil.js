document.addEventListener('DOMContentLoaded', () => {
  const perfilPanel = document.getElementById('perfil-panel');
  const profileButton = document.getElementById('profile-button');
  const closeProfileBtn = document.getElementById('close-profile');
  const navRegister = document.getElementById('nav-register');

  // Función para decodificar el payload del token JWT
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Obtener usuario y rol
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  let userRole = null;
  if (usuario && usuario.rol) {
    userRole = usuario.rol;
  }
  // Mostrar perfil si hay usuario autenticado
  if (usuario) {
    if (profileButton) profileButton.style.display = 'inline-block';
    if (navRegister) navRegister.style.display = 'none';

    // Mostrar nombre y correo en el perfil con animación de presentación
    const userNameDiv = document.getElementById('user-name');
    if (userNameDiv) {
      userNameDiv.textContent = usuario.nombre || 'Usuario';
      userNameDiv.style.opacity = 0;
      userNameDiv.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => {
        userNameDiv.style.opacity = 1;
      }, 100);
    }
    const userEmailDiv = document.getElementById('user-email');
    if (userEmailDiv) {
      userEmailDiv.textContent = usuario.correo || '';
      userEmailDiv.style.opacity = 0;
      userEmailDiv.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => {
        userEmailDiv.style.opacity = 1;
      }, 300);
    }
    // Actualizar imagen de perfil si existe
    const perfilAvatarImg = document.querySelector('.perfil-avatar img');
    if (perfilAvatarImg) {
      perfilAvatarImg.src = usuario.imagen || '/perfil-de-usuario.jpg';
    }
  } else {
    if (profileButton) profileButton.style.display = 'none';
    if (navRegister) navRegister.style.display = 'inline-block';
  }

  // Mostrar/ocultar panel de perfil al hacer clic en "Perfil"
  if (profileButton && perfilPanel) {
    let isPanelActive = false;
    let toggleTimeout = null;
    profileButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (toggleTimeout) return; // Evitar toggles rápidos
      isPanelActive = !isPanelActive;
      if (isPanelActive) {
        perfilPanel.classList.add('active');
      } else {
        perfilPanel.classList.remove('active');
      }
      toggleTimeout = setTimeout(() => {
        toggleTimeout = null;
      }, 300); // Tiempo igual a la transición CSS
    });
  }

  // Cerrar panel de perfil
  if (closeProfileBtn && perfilPanel) {
    closeProfileBtn.addEventListener('click', () => {
      perfilPanel.classList.remove('active');
    });
  }

  // Funcionalidad de cerrar sesión
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // Redirigir a la página de login
      window.location.href = '/login/login.html';
    });
  }

  // Nueva funcionalidad para cambiar imagen de perfil
  const imagenPerfilInput = document.getElementById('imagenPerfil');
  const previewImg = document.getElementById('preview');

  // Cargar imagen guardada en localStorage si existe
  const savedImage = localStorage.getItem('perfilImagen');
  if (savedImage) {
    previewImg.src = savedImage;
  }

  if (imagenPerfilInput && previewImg) {
    imagenPerfilInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg.src = e.target.result;
          localStorage.setItem('perfilImagen', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Mostrar solo imagen preview al abrir panel
  function mostrarImagenPreview() {
    previewImg.style.display = 'block';
  }

  // Mostrar imagen original al mostrar formularios
  function mostrarImagenOriginal() {
    previewImg.style.display = 'block';
  }

  // Mostrar/ocultar formularios de cambio de nombre y contraseña
  const changeNameBtn = document.getElementById('change-name-btn');
  const changePasswordBtn = document.getElementById('change-password-btn');
  const changeNameForm = document.getElementById('change-name-form');
  const changePasswordForm = document.getElementById('change-password-form');

  // Ocultar formularios inicialmente si existen
  if (changeNameForm) changeNameForm.style.display = 'none';
  if (changePasswordForm) changePasswordForm.style.display = 'none';

  // Al abrir panel mostrar solo imagen preview
  if (perfilPanel) {
    perfilPanel.addEventListener('transitionend', () => {
      if (perfilPanel.classList.contains('active')) {
        mostrarImagenPreview();
        if (changeNameForm) changeNameForm.style.display = 'none';
        if (changePasswordForm) changePasswordForm.style.display = 'none';
      }
    });
  }

  if (changeNameBtn && changePasswordBtn && changeNameForm && changePasswordForm) {
    changeNameBtn.addEventListener('click', () => {
      changeNameForm.style.display = 'block';
      changePasswordForm.style.display = 'none';
      mostrarImagenOriginal();
      changeNameBtn.style.display = 'none';
      changePasswordBtn.style.display = 'inline-block';
    });

    changePasswordBtn.addEventListener('click', () => {
      changePasswordForm.style.display = 'block';
      changeNameForm.style.display = 'none';
      mostrarImagenOriginal();
      changePasswordBtn.style.display = 'none';
      changeNameBtn.style.display = 'inline-block';
    });

    // Manejador submit para cambio de nombre
    changeNameForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = document.getElementById('new-name').value.trim();
      if (!newName) {
        alert('Por favor, ingresa un nuevo nombre.');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No autenticado. Por favor, inicia sesión.');
          return;
        }
        const res = await fetch('http://localhost:3000/api/usuarios/cambiar-nombre', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nuevoNombre: newName })
        });
        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.error || 'Error al cambiar el nombre.');
          return;
        }
        alert('Nombre cambiado correctamente.');
        // Actualizar UI
        const userNameDiv = document.getElementById('user-name');
        if (userNameDiv) userNameDiv.textContent = newName;
        changeNameForm.style.display = 'none';
        changeNameBtn.style.display = 'inline-block';
        changePasswordBtn.style.display = 'inline-block';
        // Actualizar localStorage usuario
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
          usuario.nombre = newName;
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
      } catch (error) {
        alert('Error al cambiar el nombre.');
      }
    });

    // Manejador submit para cambio de contraseña
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value.trim();
      if (!newPassword) {
        alert('Por favor, ingresa una nueva contraseña.');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No autenticado. Por favor, inicia sesión.');
          return;
        }
        const res = await fetch('http://localhost:3000/api/usuarios/cambiar-contrasena', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nuevaContrasena: newPassword })
        });
        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.error || 'Error al cambiar la contraseña.');
          return;
        }
        alert('Contraseña cambiada correctamente.');
        changePasswordForm.style.display = 'none';
        changeNameBtn.style.display = 'inline-block';
        changePasswordBtn.style.display = 'inline-block';
      } catch (error) {
        alert('Error al cambiar la contraseña.');
      }
    });
  }

  // Asegurar que el nombre y correo se muestren siempre si hay usuario
  const userNameDiv = document.getElementById('user-name');
  const userEmailDiv = document.getElementById('user-email');
  if (userNameDiv && userEmailDiv && usuario) {
    userNameDiv.style.display = 'block';
    userEmailDiv.style.display = 'block';
  }
});
