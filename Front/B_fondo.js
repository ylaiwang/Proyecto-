//Seleccionar interruptor
const themeToggle = document.getElementById('theme-toggle');

// Al entrar la pagina se podra elegir el tema
function toggleTheme() {
    if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

//En caso que se guarde el fondo
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}
else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.checked = false;
}
themeToggle.addEventListener('change', toggleTheme)

