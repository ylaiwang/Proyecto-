document.addEventListener('DOMContentLoaded', () => {
  const formProducto = document.getElementById('formProducto');
  const btnAgregarProducto = document.getElementById('btnAgregarProducto');
  const perfilPanel = document.getElementById('perfil-panel');
  const profileButton = document.getElementById('profile-button');
  const closeProfileBtn = document.getElementById('close-profile');

  // Mostrar/ocultar formulario al hacer clic en el botón "Añadir productos"
  if (btnAgregarProducto && formProducto) {
    btnAgregarProducto.style.display = 'inline-block'; // Mostrar el botón
    btnAgregarProducto.addEventListener('click', () => {
      if (formProducto.style.display === 'none' || formProducto.style.display === '') {
        formProducto.style.display = 'block';
      } else {
        formProducto.style.display = 'none';
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
      perfilPanel.style.display = 'block';
    });
  }

  // Cerrar panel de perfil
  if (closeProfileBtn && perfilPanel) {
    closeProfileBtn.addEventListener('click', () => {
      perfilPanel.style.display = 'none';
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

      // Eliminar todos los productos existentes
      try {
        const token = localStorage.getItem('token');
        const resDelete = await fetch('/api/productos', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!resDelete.ok) {
          alert('Error al eliminar productos existentes.');
          return;
        }
      } catch (error) {
        alert('Error de conexión al eliminar productos.');
        return;
      }

      // Preparar los datos del formulario para el nuevo producto
      const formData = new FormData(formProducto);
      const categoria = formProducto.querySelector('#categoria').value;

      // Enviar los datos del nuevo producto
      try {
        const resAdd = await fetch(`/api/productos/${categoria}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        if (!resAdd.ok) {
          alert('Error al agregar el producto.');
          return;
        }
      } catch (error) {
        alert('Error de conexión al agregar el producto.');
        return;
      }

      alert('Producto agregado correctamente.');

      // Actualizar contadores de categorías a 0 tras eliminar productos
      const categoryItems = document.querySelectorAll('.menusidebar .productos');
      categoryItems.forEach(item => {
        const countSpan = item.querySelector('.cantidad');
        if (countSpan) {
          countSpan.textContent = '(0)';
        }
      });

      // Recargar la página para mostrar el nuevo producto y actualizar contadores
      window.location.reload();
    });
  }
});
