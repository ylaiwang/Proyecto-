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

  // Función para cargar el conteo de productos por categoría y renderizar el catálogo
  async function cargarCategorias() {
    try {
      const res = await fetch('http://localhost:3000/api/productos/conteo/categorias');
      if (!res.ok) {
        alert('Error al cargar conteo de categorías.');
        return;
      }
      const conteos = await res.json();
      const catalogo = document.querySelector('.menusidebar');
      if (!catalogo) return;

      // Limpiar catálogo actual
      catalogo.innerHTML = '';

      // Mapeo de nombres para mostrar en el catálogo
      const nombresCategorias = {
        tecnologia: 'Tecnología',
        cristales: 'Cristales',
        figuras: 'Figuras',
        relojes: 'Relojes',
        tazas: 'Tazas',
        todos: 'Todos'
      };

      // Crear elementos para cada categoría con su conteo
      let first = true;
      // Añadir la categoría "Todos" manualmente con el conteo total al inicio
      const totalCount = Object.values(conteos).reduce((a, b) => a + b, 0);
      const todosDiv = document.createElement('div');
      todosDiv.className = 'productos productos-active';
      todosDiv.dataset.categoria = 'todos';
      todosDiv.textContent = `Todos (${totalCount})`;
      catalogo.appendChild(todosDiv);
      cargarProductos('todos');
      first = false;

      for (const [key, count] of Object.entries(conteos)) {
        const div = document.createElement('div');
        div.className = 'productos';
        div.dataset.categoria = key;
        div.textContent = `${nombresCategorias[key]} (${count})`;
        catalogo.appendChild(div);
      }

      // Agregar evento click para filtrar productos por categoría
      const items = catalogo.querySelectorAll('.productos');
      items.forEach(item => {
        item.addEventListener('click', () => {
          const categoria = item.dataset.categoria;
          cargarProductos(categoria);
          // Marcar la categoría seleccionada visualmente
          items.forEach(i => i.classList.remove('productos-active'));
          item.classList.add('productos-active');
        });
      });
    } catch (error) {
      alert('Error al cargar categorías.');
    }
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

      // Función para obtener token válido con refresh automático
      async function getValidToken() {
        let token = localStorage.getItem('token');
        if (!token) return null;

        // Decodificar token para verificar expiración
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        if (exp > now) {
          // Token válido
          return token;
        } else {
          // Token expirado, intentar refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return null;

          try {
            const res = await fetch('http://localhost:3000/api/usuarios/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            if (!res.ok) {
              // Refresh token inválido o expirado
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('usuario');
              window.location.href = '/login/login.html';
              return null;
            }
            const data = await res.json();
            localStorage.setItem('token', data.token);
            return data.token;
          } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('usuario');
            window.location.href = '/login/login.html';
            return null;
          }
        }
      }

      const validToken = await getValidToken();
      if (!validToken) {
        alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
        return;
      }

      const resAdd = await fetch(`http://localhost:3000/api/productos/${categoria}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`
        },
        body: formData,
      });
      if (!resAdd.ok) {
        const errorData = await resAdd.json();
        const errorMessage = errorData.error || errorData.details || 'Error al agregar el producto.';
        alert(errorMessage);
        return;
      }
      // Refrescar la lista de productos después de agregar uno nuevo
      await cargarProductos(categoria);

      alert('Producto agregado correctamente.');
    });
  }

  // Función para cargar productos y mostrarlos en la interfaz
  async function cargarProductos(categoria) {
    try {
      const res = await fetch(`http://localhost:3000/api/productos/${categoria}`);
      if (!res.ok) {
        alert('Error al cargar productos.');
        return;
      }
      const productos = await res.json();
      const grid = document.querySelector('.productoos-grid');
      grid.innerHTML = ''; // Limpiar productos anteriores

      productos.forEach(producto => {
        // Asignar explícitamente el tipo según la categoría actual
        // Si la categoría es "todos", usar el tipo real del producto
        if (categoria === 'todos' && producto.tipoReal) {
          producto.tipo = producto.tipoReal;
        } else {
          producto.tipo = categoria;
        }

        // Si el producto no tiene _id, intentar asignar id alternativo
        if (!producto._id && producto.id) {
          producto._id = producto.id;
        }

        const card = document.createElement('div');
        card.className = 'productoo-card';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'producto-image';

        if (producto.imagen) {
          const img = document.createElement('img');
          img.src = producto.imagen;
          img.alt = producto.nombre;
          img.className = 'producto-img';
          imageDiv.appendChild(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'placeholder-image';
          placeholder.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1"></path>
            </svg>
          `;
          imageDiv.appendChild(placeholder);
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'producto-info';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'producto-title';
        titleDiv.textContent = producto.nombre;

        const priceDiv = document.createElement('div');
        priceDiv.className = 'producto-price';
        priceDiv.textContent = `$${producto.precio.toLocaleString()}`;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(priceDiv);

        card.appendChild(imageDiv);
        card.appendChild(infoDiv);

        // Redirigir a detallesP.html con id y tipo real en query params
        card.addEventListener('click', () => {
          window.location.href = `detallesP.html?id=${producto._id}&tipo=${producto.tipo}`;
        });

        grid.appendChild(card);
      });
    } catch (error) {
      alert('Error al cargar productos.');
    }
  }

  // Cargar productos inicialmente para la categoría "todos"
  cargarProductos('todos');

  // Cargar categorías dinámicamente en el catálogo
  cargarCategorias();

  // Limpiar productos estáticos en la interfaz para evitar duplicados
  const grid = document.querySelector('.productoos-grid');
  if (grid) {
    grid.innerHTML = '';
  }
});
