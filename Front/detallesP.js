document.addEventListener('DOMContentLoaded', () => {
  // Obtener los parámetros 'id' y 'tipo' del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const tipo = urlParams.get('tipo');

  console.log('detallesP.js - id:', id, 'tipo:', tipo);

  // Validar que los parámetros existan, si no, redirigir a la tienda
  if (!id || !tipo) {
    alert('Parámetros de producto inválidos.');
    window.location.href = 'modelos.html';
    return;
  }

  // Obtener referencias a los elementos del DOM donde se mostrará la información
  const detalleImg = document.getElementById('detalle-img');
  const detalleTitulo = document.getElementById('detalle-titulo');
  const detallePrecio = document.getElementById('detalle-precio');
  const detalleDescripcion = document.getElementById('detalle-descripcion');
  const detalleCalificaciones = document.getElementById('detalle-calificaciones');
  const btnVolver = document.getElementById('btnVolver');

  // Nuevos elementos para edición y comentarios
  const detallePrecioInput = document.getElementById('detalle-precio-input');
  const detalleDescripcionInput = document.getElementById('detalle-descripcion-input');
  const btnEditar = document.getElementById('btnEditar');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');
  const comentarioSection = document.getElementById('comentario-section');
  const nuevoComentario = document.getElementById('nuevo-comentario');
  const nuevoEstrellas = document.getElementById('calificaion-select');
  const btnAgregarComentario = document.getElementById('btnAgregarComentario');

  // Obtener usuario y rol desde localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario && usuario.rol === 'admin';

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

  // Función asíncrona para cargar los datos del producto y sus calificaciones
  async function cargarDetalle() {
    try {
      // Realizar petición para obtener los datos del producto
      const resProducto = await fetch(`http://localhost:3000/api/productos/${tipo}/${id}`);
      console.log('detallesP.js - fetch status:', resProducto.status);
      if (!resProducto.ok) {
        alert('Error al obtener detalle del producto.');
        window.location.href = 'modelos.html';
        return;
      }
      const producto = await resProducto.json();

      // Actualizar breadcrumb
      const breadcrumb = document.getElementById('breadcrumb');
      const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      breadcrumb.innerHTML = `
        <a href="modelos.html">Inicio</a> / 
        <a href="modelos.html?tipo=${tipo}">${tipoCapitalizado}</a> / 
        <span>${producto.nombre}</span>
      `;

      // Realizar petición para obtener las calificaciones y comentarios del producto
      const resCalificaciones = await fetch(`http://localhost:3000/api/productos/${tipo}/${id}/calificaciones`);
      let calificaciones = [];
      if (resCalificaciones.ok) {
        calificaciones = await resCalificaciones.json();
      }

      // Renderizar la información del producto en la página
      detalleImg.src = producto.imagen || '';
      detalleImg.alt = producto.nombre || '';
      detalleTitulo.textContent = producto.nombre || '';

      if (esAdmin) {
        detallePrecio.style.display = 'none';
        detalleDescripcion.style.display = 'none';
        detallePrecioInput.style.display = 'block';
        detalleDescripcionInput.style.display = 'block';
        detallePrecioInput.value = producto.precio || 0;
        detalleDescripcionInput.value = producto.descripcion || '';
        btnEditar.style.display = 'inline-block';
      } else {
        detallePrecio.textContent = `$${producto.precio.toLocaleString()}`;
        detalleDescripcion.textContent = producto.descripcion || '';
        detallePrecioInput.style.display = 'none';
        detalleDescripcionInput.style.display = 'none';
        btnEditar.style.display = 'none';
      }

      // Renderizar las calificaciones y comentarios
      detalleCalificaciones.innerHTML = '';
      if (calificaciones.length === 0) {
        detalleCalificaciones.textContent = 'No hay calificaciones ni comentarios.';
      } else {
        calificaciones.forEach(c => {
          const calDiv = document.createElement('div');
          calDiv.className = 'calificacion-item';
          calDiv.innerHTML = `
            <div class="calificacion-header">
              <div class="calificacion-avatar">${c.usuario && c.usuario.nombre ? c.usuario.nombre.charAt(0).toUpperCase() : 'U'}</div>
              <div class="calificacion-usuario">${c.usuario && c.usuario.nombre ? c.usuario.nombre : 'Usuario'}</div>
              <div class="calificacion-estrellas">${'★'.repeat(c.estrellas)}${'☆'.repeat(5 - c.estrellas)}</div>
              ${esAdmin ? `<button class="btnEliminarComentario" data-id="${c._id}" title="Eliminar comentario">🗑️</button>` : ''}
            </div>
            <div class="calificacion-comentario">${c.comentario || ''}</div>
            <div class="calificacion-fecha">${new Date(c.fecha).toLocaleDateString()}</div>
          `;
          detalleCalificaciones.appendChild(calDiv);
        });

        // Agregar evento para eliminar comentario (solo admin)
        if (esAdmin) {
          const botonesEliminar = detalleCalificaciones.querySelectorAll('.btnEliminarComentario');
          botonesEliminar.forEach(boton => {
            boton.addEventListener('click', async (e) => {
              const comentarioId = e.target.getAttribute('data-id');
              if (!comentarioId) return;
              if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

              try {
                const token = await getValidToken();
                if (!token) {
                  alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
                  return;
                }
                const res = await fetch(`http://localhost:3000/api/productos/comentarios/${comentarioId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (!res.ok) {
                  alert('Error al eliminar el comentario.');
                  return;
                }
                alert('Comentario eliminado correctamente.');
                await cargarDetalle(); // Esperar a que se recargue el detalle para actualizar la interfaz
              } catch (error) {
                alert('Error al eliminar el comentario.');
              }
            });
          });
        }
      }

      // Mostrar sección de comentarios si es admin o usuario normal
      if (usuario && (usuario.rol === 'admin' || usuario.rol === 'usuario')) {
        comentarioSection.style.display = 'block';
      } else {
        comentarioSection.style.display = 'none';
      }

      // Eventos para botones de edición
      btnEditar.addEventListener('click', () => {
        btnEditar.style.display = 'none';
        btnGuardar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
        detallePrecio.style.display = 'none';
        detalleDescripcion.style.display = 'none';
        detallePrecioInput.style.display = 'block';
        detalleDescripcionInput.style.display = 'block';
      });

      btnCancelar.addEventListener('click', () => {
        btnEditar.style.display = 'inline-block';
        btnGuardar.style.display = 'none';
        btnCancelar.style.display = 'none';
        detallePrecio.style.display = 'block';
        detalleDescripcion.style.display = 'block';
        detallePrecioInput.style.display = 'none';
        detalleDescripcionInput.style.display = 'none';
      });

      btnGuardar.addEventListener('click', async () => {
        const nuevoPrecio = parseFloat(detallePrecioInput.value);
        const nuevaDescripcion = detalleDescripcionInput.value.trim();

        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
          alert('Precio inválido.');
          return;
        }

        try {
          const token = await getValidToken();
          if (!token) {
            alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
            return;
          }
          const res = await fetch(`http://localhost:3000/api/productos/${tipo}/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              precio: nuevoPrecio,
              descripcion: nuevaDescripcion
            })
          });
          if (!res.ok) {
            alert('Error al guardar los cambios.');
            return;
          }
          // Cambiar texto del botón a "Guardar Modificación"
          btnGuardar.textContent = 'Guardar Modificación';
          alert('Producto actualizado correctamente.');
          cargarDetalle();
        } catch (error) {
          alert('Error al guardar los cambios.');
        }
      });

      // Evento para agregar comentario
      btnAgregarComentario.addEventListener('click', async () => {
        const comentario = nuevoComentario.value.trim();
        const estrellas = parseInt(nuevoEstrellas.value);

        if (!comentario) {
          alert('El comentario no puede estar vacío.');
          return;
        }

        try {
          const token = await getValidToken();
          if (!token) {
            alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
            return;
          }
          const res = await fetch(`http://localhost:3000/api/productos/${tipo}/${id}/calificar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              estrellas,
              comentario
            })
          });
          if (!res.ok) {
            alert('Error al agregar el comentario.');
            return;
          }
          alert('Comentario agregado correctamente.');
          nuevoComentario.value = '';
          cargarDetalle();
        } catch (error) {
          alert('Error al agregar el comentario.');
        }
      });

    } catch (error) {
      alert('Error al cargar el detalle del producto.');
      window.location.href = 'modelos.html';
    }
  }

  // Variables y función para manejar el zoom en la imagen del producto
  let scale = 1;
  function aplicarZoom() {
    detalleImg.style.transform = `scale(${scale})`;
  }

  // Evento para aumentar el zoom al hacer clic en el botón "+"
  document.getElementById('zoom-in').addEventListener('click', () => {
    scale += 0.1;
    aplicarZoom();
  });

  // Evento para disminuir el zoom al hacer clic en el botón "-"
  document.getElementById('zoom-out').addEventListener('click', () => {
    scale -= 0.1;
    if (scale < 1) scale = 1; // No permitir zoom menor a 1
    aplicarZoom();
  });

  // Evento para el botón "Volver" que redirige a la página de la tienda
  btnVolver.addEventListener('click', () => {
    window.location.href = 'modelos.html';
  });

  // Cargar el detalle del producto cuando el DOM esté listo
  cargarDetalle();
});
