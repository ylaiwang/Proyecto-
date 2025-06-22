document.addEventListener('DOMContentLoaded', () => {
  const formProducto = document.getElementById('formProducto');
  const btnAgregarProducto = document.getElementById('btnAgregarProducto');
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
  console.log('Usuario:', usuario);
  let userRole = null;
  if (usuario && usuario.rol) {
    userRole = usuario.rol;
    console.log('User role:', userRole);
  }
  // Mostrar perfil si hay usuario autenticado
  if (usuario) {
    if (profileButton) profileButton.style.display = 'inline-block';
    if (navRegister) navRegister.style.display = 'none';
  } else {
    if (profileButton) profileButton.style.display = 'none';
    if (navRegister) navRegister.style.display = 'inline-block';
  }
  // Mostrar u ocultar botón "Añadir productos" según rol
  if (userRole === 'admin') {
    if (btnAgregarProducto) btnAgregarProducto.style.display = 'inline-block';
  } else {
    if (btnAgregarProducto) btnAgregarProducto.style.display = 'none';
  }

  // Mostrar/ocultar formulario al hacer clic en el botón "Añadir productos"
  if (btnAgregarProducto && formProducto) {
    btnAgregarProducto.addEventListener('click', () => {
      if (formProducto.style.display === 'none' || formProducto.style.display === '') {
        formProducto.style.display = 'block';
        btnAgregarProducto.textContent = 'Cancelar';
      } else {
        formProducto.style.display = 'none';
        btnAgregarProducto.textContent = 'Añadir productos';
      }
    });
  }

  // Cerrar modal de edición al hacer clic en "Cancelar"
  const cancelarEdicionBtn = document.getElementById('cancelarEdicionBtn');
  const editarProductoModal = document.getElementById('editarProductoModal');
  if (cancelarEdicionBtn && editarProductoModal) {
    cancelarEdicionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      editarProductoModal.style.display = 'none';
    });
  }

  // Mostrar panel de perfil al hacer clic en "Perfil"
  if (profileButton && perfilPanel) {
    profileButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Perfil button clicked');
      perfilPanel.classList.toggle('active');
      console.log('Perfil panel active:', perfilPanel.classList.contains('active'));
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

  if (formProducto) {
    formProducto.addEventListener('submit', async (e) => {
      e.preventDefault();

      const precioInput = document.getElementById('precio');
      if (precioInput) {
        const precioValue = precioInput.value.trim();
        if (precioValue.startsWith('0')) {
          alert('El precio no puede comenzar con 0.');
          precioInput.focus();
          return;
        }
      }

      // Preparar los datos del formulario para el nuevo producto
      const formData = new FormData(formProducto);
      let categoria = formProducto.querySelector('#categoria').value;
      categoria = categoria.toLowerCase();

      // Enviar los datos del nuevo producto
      try {
        const resAdd = await fetch(`http://localhost:3000/api/productos/${categoria}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${usuario ? localStorage.getItem('token') : ''}`
          },
          body: formData,
        });
        if (!resAdd.ok) {
          const errorData = await resAdd.json();
          const errorMessage = errorData.error || errorData.details || 'Error al agregar el producto.';
          alert(errorMessage);
          return;
        }
      } catch (error) {
        alert('Error de conexión al agregar el producto.');
        return;
      }

      alert('Producto agregado correctamente.');
    });
  }
});
