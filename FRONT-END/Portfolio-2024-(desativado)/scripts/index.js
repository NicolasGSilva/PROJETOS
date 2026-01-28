const slides = document.querySelector('.slidesindex');
const imagens = document.querySelectorAll('.slidecarrossel');
const prev = document.querySelector('.ante');
const next = document.querySelector('.prox');
const indicadores = document.querySelectorAll('.indicador-inner');
const botoesProxInterna = document.querySelectorAll('.prox-interna');
const botoesAnteInterna = document.querySelectorAll('.ante-interna');


let index = 0;
let timer;

function showSlide(i) {
    slides.style.transform = `translateX(-${i * 100}%)`;
    indicadores.forEach((ind, idx) => {
        ind.style.animation = 'none';
        if (idx === i) {
            void ind.offsetWidth;
            ind.style.animation = 'loading 5s linear forwards';
        }
    });
    index = i;
}
function nextSlide() {
    index = (index + 1) % imagens.length;
    showSlide(index);
}
function prevSlide() {
    index = (index - 1 + imagens.length) % imagens.length;
    showSlide(index);
}
next.addEventListener('click', () => {
    clearInterval(timer);
    nextSlide();
    startTimer();
});
prev.addEventListener('click', () => {
    clearInterval(timer);
    prevSlide();
    startTimer();
});
botoesProxInterna.forEach(btn => {
    btn.addEventListener('click', () => {
        clearInterval(timer);
        nextSlide();
        startTimer();
    });
});
botoesAnteInterna.forEach(btn => {
    btn.addEventListener('click', () => {
        clearInterval(timer);
        prevSlide();
        startTimer();
    });
});
function startTimer() {
    timer = setInterval(nextSlide, 5000);
}
showSlide(0);
startTimer();