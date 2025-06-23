document.addEventListener('DOMContentLoaded', () => {
  // Obtener los parámetros 'id' y 'tipo' del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const tipo = urlParams.get('tipo');

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

  // Función asíncrona para cargar los datos del producto y sus calificaciones
  async function cargarDetalle() {
    try {
      // Realizar petición para obtener los datos del producto
      const resProducto = await fetch(`http://localhost:3000/api/productos/${tipo}/${id}`);
      if (!resProducto.ok) {
        alert('Error al obtener detalle del producto.');
        window.location.href = 'modelos.html';
        return;
      }
      const producto = await resProducto.json();

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
      detallePrecio.textContent = `$${producto.precio.toLocaleString()}`;
      detalleDescripcion.textContent = producto.descripcion || '';

      // Renderizar las calificaciones y comentarios
      detalleCalificaciones.innerHTML = '';
      if (calificaciones.length === 0) {
        detalleCalificaciones.textContent = 'No hay calificaciones ni comentarios.';
      } else {
        calificaciones.forEach(c => {
          const calDiv = document.createElement('div');
          calDiv.className = 'calificacion-item';
          calDiv.innerHTML = `
            <div class="calificacion-estrellas">${'★'.repeat(c.estrellas)}${'☆'.repeat(5 - c.estrellas)}</div>
            <div class="calificacion-comentario">${c.comentario || ''}</div>
            <div class="calificacion-fecha">${new Date(c.fecha).toLocaleDateString()}</div>
          `;
          detalleCalificaciones.appendChild(calDiv);
        });
      }
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
