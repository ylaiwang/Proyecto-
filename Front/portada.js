9// portada.js - Maneja la lógica para el botón de registro y perfil en Portada.html

document.addEventListener('DOMContentLoaded', () => {
  console.log('portada.js cargado y DOM listo');

  // Obtener referencias a elementos del DOM
  const navRegister = document.getElementById('nav-register'); // Enlace de registro
  const navProfile = document.getElementById('nav-profile');   // Botón de perfil
  const profileButton = document.getElementById('profile-button'); // Botón para abrir modal
  const profileModal = document.getElementById('perfil-modal');    // Modal de perfil
  const profileName = document.getElementById('profile-name');     // Mostrar nombre usuario
  const profileEmail = document.getElementById('profile-email');   // Mostrar correo usuario
  const changePasswordForm = document.getElementById('change-password-form'); // Formulario cambio contraseña
  const closeProfile = document.getElementById('close-profile');   // Botón cerrar modal
  const passwordChangeMessage = document.getElementById('password-change-message'); // Mensajes de estado
  const logoutButton = document.getElementById('logout-button');   // Botón cerrar sesión

  console.log({navRegister, navProfile, profileButton, profileModal});

  // Obtener datos del usuario almacenados en localStorage o sessionStorage
  const usuario = JSON.parse(localStorage.getItem('usuario')) || JSON.parse(sessionStorage.getItem('usuario'));
  console.log('Usuario en almacenamiento:', usuario);

  if (usuario) {
    // Usuario logueado: ocultar registro y mostrar perfil
    navRegister.style.display = 'none';
    navProfile.style.display = 'inline-block';

    // Remover event listener previo para evitar múltiples escuchas
    profileButton.replaceWith(profileButton.cloneNode(true));
    const newProfileButton = document.getElementById('profile-button');

    // Al hacer clic en el botón perfil, mostrar modal con datos del usuario
    newProfileButton.addEventListener('click', () => {
      console.log('Botón perfil clickeado');
      profileName.textContent = usuario.nombre || '';
      profileEmail.textContent = usuario.correo || '';
      // Agregar campos adicionales del perfil si existen
      document.getElementById('profile-username').textContent = usuario.username || '';
      document.getElementById('profile-website').textContent = usuario.website || '';
      document.getElementById('profile-bio').textContent = usuario.bio || '';
      passwordChangeMessage.textContent = '';
      // Mostrar panel deslizable
      profileModal.classList.add('active');
      console.log('Clase active añadida al modal:', profileModal.className);
      console.log('Estilo actual del modal:', window.getComputedStyle(profileModal).left);
    });

    // Cerrar modal y limpiar formulario y mensajes
    // closeProfile.addEventListener('click', () => {
    //   console.log('Cerrar modal perfil');
    //   profileModal.classList.remove('active');
    //   changePasswordForm.reset();
    //   passwordChangeMessage.textContent = '';
    // });

    // Manejar envío del formulario para cambiar contraseña
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value;

      if (newPassword === usuario.password) {
        passwordChangeMessage.style.color = 'red';
        passwordChangeMessage.textContent = 'No es posible cambiar a la misma contraseña.';
        return;
      }

      try {
      console.log('URL para cambiar contraseña:', 'http://localhost:3000/api/usuarios/' + usuario._id + '/password');
      if (!usuario._id) {
        passwordChangeMessage.style.color = 'red';
        passwordChangeMessage.textContent = 'ID de usuario no definido. No se puede cambiar la contraseña.';
        return;
      }
      // Llamada al backend para actualizar la contraseña
      const response = await fetch('http://localhost:3000/api/usuarios/' + usuario._id + '/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        passwordChangeMessage.style.color = 'green';
        passwordChangeMessage.textContent = 'Contraseña cambiada correctamente.';
        // Actualizar contraseña en almacenamiento
        usuario.password = newPassword;
        if (localStorage.getItem('usuario')) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
        } else {
          sessionStorage.setItem('usuario', JSON.stringify(usuario));
        }
        changePasswordForm.reset();
      } else {
        const data = await response.json();
        passwordChangeMessage.style.color = 'red';
        passwordChangeMessage.textContent = data.error || 'Error al cambiar la contraseña.';
      }
      } catch (error) {
        passwordChangeMessage.style.color = 'red';
        passwordChangeMessage.textContent = 'Error de conexión al servidor.';
      }
    });

    // Funcionalidad para cerrar sesión
    logoutButton.addEventListener('click', () => {
      // Eliminar usuario de localStorage y sessionStorage
      localStorage.removeItem('usuario');
      sessionStorage.removeItem('usuario');

      // Ocultar panel deslizable
      profileModal.classList.remove('active');

      // Mostrar mensaje de cierre de sesión
      alert('Se cerró la sesión exitosamente.');

      // Actualizar interfaz: mostrar registro y ocultar perfil
      navRegister.style.display = 'inline-block';
      navProfile.style.display = 'none';
    });

    // Botón cerrar sesión alternativo (eliminar si no es necesario)
    const closeProfileButton = document.getElementById('close-profile');
    if (closeProfileButton) {
      closeProfileButton.removeEventListener('click', () => {});
      closeProfileButton.style.display = 'none';
    }
  } else {
    // Usuario no logueado: mostrar registro y ocultar perfil
    navRegister.style.display = 'inline-block';
    navProfile.style.display = 'none';
  }
});
