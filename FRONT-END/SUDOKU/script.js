/* SUDOKU ROYAL - COM BARRA DE TEMPO */

const TOTAL_FASES = 50;
const CHAVE_MEMORIA = 'sudoku_royal_bar_v1';

const CONFIG_FASES = {
    facil:  { 
        min: 1, max: 10, grid: 3, maxNum: 9, qtdTabuleiros: 1, remover: 4, nome: "FÁCIL",
        vidas: 7, tempo: 90 
    },
    medio:  { 
        min: 11, max: 25, grid: 6, maxNum: 6, boxH: 2, boxW: 3, qtdTabuleiros: 4, remover: 18, nome: "MÉDIO",
        vidas: 5, tempo: 180 
    },
    dificil:{ 
        min: 26, max: 50, grid: 9, maxNum: 9, boxH: 3, boxW: 3, qtdTabuleiros: 9, remover: 45, nome: "DIFÍCIL",
        vidas: 3, tempo: 300 
    }
};

let estado = {
    faseAtual: 1,
    maxDesbloqueado: 1,
    indiceTabuleiroAtual: 0, 
    totalTabuleirosFase: 1,
    configAtual: null,
    tabuleiro: [],
    solucao: [],
    celulaSelecionada: null,
    
    // Controle
    vidasAtuais: 0,
    tempoTotal: 0,     // Guardamos o total para calcular %
    tempoRestante: 0,
    intervaloCronometro: null,
    jogoAtivo: false
};

let semente = 1;

// --- GERADORES E AUXILIARES (IGUAIS AO ANTERIOR) ---
function getConfigFase(nivel) {
    if (nivel <= 10) return CONFIG_FASES.facil;
    if (nivel <= 25) return CONFIG_FASES.medio;
    return CONFIG_FASES.dificil;
}

function randomico() {
    const x = Math.sin(semente++) * 10000;
    return x - Math.floor(x);
}

function gerarFase(nivel, indiceSub) {
    semente = (nivel * 1000) + (indiceSub * 50) + 123;
    const cfg = getConfigFase(nivel);
    estado.configAtual = cfg;
    let grid = Array(cfg.grid).fill().map(() => Array(cfg.grid).fill(0));
    
    if (cfg.grid === 3) {
        let nums = [1,2,3,4,5,6,7,8,9];
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(randomico() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        let k = 0;
        for(let r=0; r<3; r++) for(let c=0; c<3; c++) grid[r][c] = nums[k++];
        estado.solucao = grid.map(row => [...row]);
    } else {
        preencherDiagonal(grid, cfg);
        resolverSudokuGen(grid, cfg);
        estado.solucao = grid.map(row => [...row]);
    }
    let qtdRemover = cfg.remover + (nivel - cfg.min); 
    estado.tabuleiro = grid.map(row => [...row]);
    removerDigitos(estado.tabuleiro, qtdRemover, cfg);
}

function preencherDiagonal(grid, cfg) {} 
function resolverSudokuGen(grid, cfg) {
    let vazia = encontrarVazia(grid, cfg);
    if (!vazia) return true;
    let [lin, col] = vazia;
    let nums = [];
    for(let n=1; n<=cfg.maxNum; n++) nums.push(n);
    nums.sort(() => randomico() - 0.5);
    for (let num of nums) {
        if (eSeguroGen(grid, lin, col, num, cfg)) {
            grid[lin][col] = num;
            if (resolverSudokuGen(grid, cfg)) return true;
            grid[lin][col] = 0;
        }
    }
    return false;
}
function encontrarVazia(grid, cfg) {
    for (let r = 0; r < cfg.grid; r++) for (let c = 0; c < cfg.grid; c++) if (grid[r][c] === 0) return [r, c];
    return null;
}
function eSeguroGen(grid, lin, col, num, cfg) {
    for (let x = 0; x < cfg.grid; x++) { if (grid[lin][x] === num) return false; if (grid[x][col] === num) return false; }
    let startRow = lin - lin % cfg.boxH; let startCol = col - col % cfg.boxW;
    for (let i = 0; i < cfg.boxH; i++) for (let j = 0; j < cfg.boxW; j++) if (grid[i + startRow][j + startCol] === num) return false;
    return true;
}
function removerDigitos(grid, count, cfg) {
    let totalCells = cfg.grid * cfg.grid;
    while (count > 0) {
        let id = Math.floor(randomico() * totalCells);
        let i = Math.floor(id / cfg.grid);
        let j = id % cfg.grid;
        if (grid[i][j] !== 0) { grid[i][j] = 0; count--; }
    }
}
function verificarDuplicidade3x3(grid, num) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[i][j] === num) return true;
    return false;
}

// --- INTERFACE ---
const app = {
    init() {
        this.carregarProgresso();
        this.mapearElementos();
        this.adicionarEventos();
        this.renderizarMenu();
    },

    mapearElementos() {
        this.telas = { menu: document.getElementById('menu'), jogo: document.getElementById('tela-jogo') };
        this.tabuleiroEl = document.getElementById('tela-tabuleiro');
        this.gradeFases = document.getElementById('grade-fases');
        
        // Elementos da NOVA HUD
        this.faseDisplay = document.getElementById('mostrar-fase');
        this.dificuldadeDisplay = document.getElementById('texto-dificuldade');
        this.vidasEl = document.getElementById('texto-vidas');
        this.barraTempo = document.getElementById('barra-tempo'); // A barra em si
        
        this.modalVitoria = document.getElementById('vitorioso');
        this.numFaseConcluida = document.getElementById('num-fase-concluida');
        this.botoesNumericos = document.querySelectorAll('.botao-numero');
        
        this.modalDerrota = document.getElementById('game-over');
        this.motivoDerrota = document.getElementById('motivo-derrota');
    },

    adicionarEventos() {
        this.botoesNumericos.forEach(btn => {
            btn.addEventListener('click', (e) => this.inserirNumero(parseInt(e.target.dataset.num)));
        });
        document.getElementById('apagar-botao').addEventListener('click', () => this.inserirNumero(0));
        
        document.addEventListener('keydown', (e) => {
            if (!estado.celulaSelecionada || !estado.jogoAtivo) return;
            let max = estado.configAtual ? estado.configAtual.maxNum : 9;
            if (e.key >= '1' && e.key <= max.toString()) this.inserirNumero(parseInt(e.key));
            if (e.key === 'Backspace' || e.key === 'Delete') this.inserirNumero(0);
        });

        document.getElementById('botao-voltar').addEventListener('click', () => {
            this.pararCronometro();
            this.mostrarTela('menu');
        });
        document.getElementById('menu-botao').addEventListener('click', () => {
            this.toggleModal(this.modalVitoria, false);
            this.mostrarTela('menu');
        });
        document.getElementById('proxima-fase-botao').addEventListener('click', () => {
            this.toggleModal(this.modalVitoria, false);
            if (estado.faseAtual < TOTAL_FASES) this.iniciarFase(estado.faseAtual + 1);
            else { alert("ZEROU TUDO!"); this.mostrarTela('menu'); }
        });
        document.getElementById('btn-resetar').addEventListener('click', () => {
            if(confirm('Apagar progresso?')) { localStorage.removeItem(CHAVE_MEMORIA); location.reload(); }
        });
        document.getElementById('tentar-novamente-btn').addEventListener('click', () => {
            this.toggleModal(this.modalDerrota, false);
            this.iniciarFase(estado.faseAtual);
        });
        document.getElementById('menu-derrota-btn').addEventListener('click', () => {
            this.toggleModal(this.modalDerrota, false);
            this.mostrarTela('menu');
        });
    },

    // --- CRONÔMETRO DE BARRA ---
    iniciarCronometro(segundosIniciais) {
        this.pararCronometro();
        estado.tempoTotal = segundosIniciais;
        estado.tempoRestante = segundosIniciais;
        this.atualizarBarraTempo();
        
        estado.intervaloCronometro = setInterval(() => {
            if (!estado.jogoAtivo) return;
            
            estado.tempoRestante--;
            this.atualizarBarraTempo();

            if (estado.tempoRestante <= 0) {
                this.gameOver("O tempo acabou!");
            }
        }, 1000);
    },

    pararCronometro() {
        if (estado.intervaloCronometro) clearInterval(estado.intervaloCronometro);
    },

    atualizarBarraTempo() {
        // Calcula porcentagem
        let porcentagem = (estado.tempoRestante / estado.tempoTotal) * 100;
        this.barraTempo.style.width = `${porcentagem}%`;

        // Cores baseadas na porcentagem
        this.barraTempo.className = 'barra-fill'; // Reset
        if (porcentagem <= 20) this.barraTempo.classList.add('critica'); // Vermelho
        else if (porcentagem <= 50) this.barraTempo.classList.add('media'); // Amarelo
    },

    atualizarVidas() {
        let coracoes = "";
        for(let i=0; i < estado.vidasAtuais; i++) coracoes += "❤️";
        this.vidasEl.textContent = coracoes;
    },

    gameOver(motivo) {
        estado.jogoAtivo = false;
        this.pararCronometro();
        this.motivoDerrota.textContent = motivo;
        this.toggleModal(this.modalDerrota, true);
    },

    carregarProgresso() {
        const salvo = localStorage.getItem(CHAVE_MEMORIA);
        estado.maxDesbloqueado = salvo ? parseInt(salvo) : 1;
        document.getElementById('texto-progresso').innerText = `${estado.maxDesbloqueado - 1}/${TOTAL_FASES}`;
    },
    salvarProgresso() {
        if (estado.faseAtual === estado.maxDesbloqueado && estado.maxDesbloqueado < TOTAL_FASES) {
            estado.maxDesbloqueado++;
            localStorage.setItem(CHAVE_MEMORIA, estado.maxDesbloqueado);
        }
        this.carregarProgresso();
    },
    mostrarTela(nomeTela) {
        Object.values(this.telas).forEach(t => t.classList.remove('ativa'));
        this.telas[nomeTela].classList.add('ativa');
        if (nomeTela === 'menu') {
            this.renderizarMenu();
        }
    },
    renderizarMenu() {
        this.gradeFases.innerHTML = '';
        for (let i = 1; i <= TOTAL_FASES; i++) {
            const btn = document.createElement('button');
            btn.className = 'botao-fase';
            btn.textContent = i;
            if (i < estado.maxDesbloqueado) { btn.classList.add('completo'); btn.onclick = () => this.iniciarFase(i); }
            else if (i === estado.maxDesbloqueado) { btn.classList.add('liberado'); btn.onclick = () => this.iniciarFase(i); }
            else { btn.classList.add('trancado'); btn.disabled = true; btn.innerHTML = `🔒 ${i}`; }
            this.gradeFases.appendChild(btn);
        }
    },

    iniciarFase(nivel) {
        estado.faseAtual = nivel;
        estado.indiceTabuleiroAtual = 0; 
        
        const cfg = getConfigFase(nivel);
        estado.totalTabuleirosFase = cfg.qtdTabuleiros;
        estado.configAtual = cfg;
        estado.jogoAtivo = true;

        estado.vidasAtuais = cfg.vidas;
        this.atualizarVidas();
        this.iniciarCronometro(cfg.tempo); 

        this.dificuldadeDisplay.textContent = cfg.nome;
        this.tabuleiroEl.className = `tabuleiro grid-${cfg.grid}`;
        if (nivel >= 26) this.tabuleiroEl.classList.add('hard-mode');
        else this.tabuleiroEl.classList.remove('hard-mode');

        this.botoesNumericos.forEach(btn => {
            const num = parseInt(btn.dataset.num);
            btn.style.display = (num > cfg.maxNum) ? 'none' : 'block';
        });

        this.carregarTabuleiroDaVez();
        this.mostrarTela('jogo');
    },

    carregarTabuleiroDaVez() {
        const cfg = estado.configAtual;
        this.iniciarCronometro(cfg.tempo); // Reseta o tempo por tabuleiro
        gerarFase(estado.faseAtual, estado.indiceTabuleiroAtual);
        estado.celulaSelecionada = null;
        
        let texto = `Fase ${estado.faseAtual}`;
        if (estado.totalTabuleirosFase > 1) {
            texto += ` (${estado.indiceTabuleiroAtual + 1}/${estado.totalTabuleirosFase})`;
        }
        this.faseDisplay.textContent = texto;
        this.renderizarTabuleiro();
    },

    renderizarTabuleiro() {
        this.tabuleiroEl.innerHTML = '';
        estado.tabuleiro.forEach((linha, lIndex) => {
            linha.forEach((val, cIndex) => {
                const celula = document.createElement('div');
                celula.className = 'celula';
                celula.dataset.lin = lIndex;
                celula.dataset.col = cIndex;
                if (val !== 0) { celula.textContent = val; celula.classList.add('fixo'); }
                else { celula.addEventListener('click', () => this.selecionarCelula(lIndex, cIndex)); }
                this.tabuleiroEl.appendChild(celula);
            });
        });
    },

    selecionarCelula(lin, col) {
        if (!estado.jogoAtivo) return;
        document.querySelectorAll('.celula.selecionada').forEach(c => c.classList.remove('selecionada'));
        estado.celulaSelecionada = { lin, col };
        const celula = document.querySelector(`.celula[data-lin='${lin}'][data-col='${col}']`);
        celula.classList.add('selecionada');
    },

    inserirNumero(num) {
        if (!estado.celulaSelecionada || !estado.jogoAtivo) return;
        const { lin, col } = estado.celulaSelecionada;
        const celula = document.querySelector(`.celula[data-lin='${lin}'][data-col='${col}']`);
        
        if (num === 0) {
            celula.textContent = ''; celula.classList.remove('usuario', 'erro', 'acerto');
            estado.tabuleiro[lin][col] = 0; return;
        }

        celula.textContent = num; celula.classList.add('usuario'); celula.classList.remove('erro', 'acerto');
        
        let estaCorreto = false;
        if (estado.configAtual.grid === 3) {
            if (verificarDuplicidade3x3(estado.tabuleiro, num)) estaCorreto = false; else estaCorreto = true; 
        } else {
            if (num === estado.solucao[lin][col]) estaCorreto = true; else estaCorreto = false;
        }

        estado.tabuleiro[lin][col] = num;

        if (!estaCorreto) {
            estado.vidasAtuais--;
            this.atualizarVidas();
            if (!this.tabuleiroEl.classList.contains('hard-mode')) celula.classList.add('erro');
            if (estado.vidasAtuais <= 0) this.gameOver("Suas vidas acabaram!");
        } else {
            if (!this.tabuleiroEl.classList.contains('hard-mode')) celula.classList.add('acerto');
            this.verificarVitoria();
        }
    },

    verificarVitoria() {
        if (!estado.jogoAtivo) return;
        const cfg = estado.configAtual;
        let venceuTabuleiro = false;

        if (cfg.grid === 3) {
            let numerosUnicos = new Set(); let temZero = false;
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) { let val = estado.tabuleiro[i][j]; if (val === 0) temZero = true; numerosUnicos.add(val); }
            if (!temZero && numerosUnicos.size === 9) venceuTabuleiro = true;
        } else {
            let tudoCerto = true;
            for(let i=0; i<cfg.grid; i++) for(let j=0; j<cfg.grid; j++) { if(estado.tabuleiro[i][j] !== estado.solucao[i][j]) { tudoCerto = false; break; } }
            if (tudoCerto) venceuTabuleiro = true;
        }

        if (venceuTabuleiro) {
            if (estado.indiceTabuleiroAtual < estado.totalTabuleirosFase - 1) {
                setTimeout(() => {
                    alert(`Tabuleiro ${estado.indiceTabuleiroAtual + 1} completo!`);
                    estado.indiceTabuleiroAtual++;
                    this.carregarTabuleiroDaVez();
                }, 200);
            } else {
                this.pararCronometro(); estado.jogoAtivo = false;
                this.salvarProgresso();
                setTimeout(() => this.toggleModal(this.modalVitoria, true), 300);
            }
        }
    },
    toggleModal(modal, mostrar) {
        if (mostrar) modal.classList.remove('invisivel'); else modal.classList.add('invisivel');
    }
};

app.init();