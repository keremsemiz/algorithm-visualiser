const toggleButton = document.getElementById('dark-mode-toggle');
const rootElement = document.documentElement;

toggleButton.addEventListener('click', () => {
    if (rootElement.hasAttribute('data-theme')) {
        rootElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
    } else {
        rootElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});


if (localStorage.getItem('theme') === 'dark') {
    rootElement.setAttribute('data-theme', 'dark');
}