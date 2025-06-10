//Fondo de interfaz en general
// Selecciona el botón de cambio de tema
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Verifica si el usuario ya tiene una preferencia de tema guardada
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    updateThemeIcon(savedTheme);
}

// Función para cambiar el tema
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : '';
    localStorage.setItem('theme', currentTheme); // Guarda la preferencia del usuario
    updateThemeIcon(currentTheme);
});

// Función para actualizar el ícono del botón
function updateThemeIcon(theme) {
    if (theme === 'dark-mode') {
        themeToggle.textContent = '☀️'; // Cambia a sol para modo claro
    } else {
        themeToggle.textContent = '🌙'; // Cambia a luna para modo oscuro
    }
}

//Categorías
// Seleccionamos el botón y el menú
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

// Evento para abrir/cerrar el menú
menuBtn.addEventListener("click", () => {
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
});

// Cerrar el menú si hacemos clic fuera de él
document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== menuBtn) {
        menu.style.display = "none";
    }
});
