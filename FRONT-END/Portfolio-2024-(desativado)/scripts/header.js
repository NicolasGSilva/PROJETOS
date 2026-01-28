const toggle = document.querySelector('.menuhmb');
const navMenu = document.querySelector('nav ul');
const dropLinks = document.querySelectorAll('.drop > a');

toggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

dropLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
    });
});