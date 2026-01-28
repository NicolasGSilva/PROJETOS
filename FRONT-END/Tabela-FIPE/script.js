const API = 'https://parallelum.com.br/fipe/api/v1';
let tipoAtual = 'carros';

const aliquotas = { 
    'AC':0.02, 'AL':0.03, 'AP':0.03, 'AM':0.03, 'BA':0.025, 'CE':0.03, 'DF':0.035, 'ES':0.02, 
    'GO':0.0345, 'MA':0.025, 'MT':0.03, 'MS':0.03, 'MG':0.04, 'PA':0.025, 'PB':0.025, 
    'PR':0.035, 'PE':0.024, 'PI':0.03, 'RJ':0.04, 'RN':0.03, 'RS':0.03, 'RO':0.03, 
    'RR':0.03, 'SC':0.02, 'SP':0.04, 'SE':0.025, 'TO':0.025 
};

const regrasIsencao = {
    'AP': 10, 'RN': 10, 'RO': 10,
    'AM': 15, 'BA': 15, 'CE': 15, 'DF': 15, 'ES': 15, 'MA': 15, 'MS': 15, 
    'PA': 15, 'PB': 15, 'PI': 15, 'RJ': 15, 'SE': 15, 'TO': 15,
    'MT': 18,
    'AC': 20, 'AL': 20, 'PR': 20, 'RS': 20, 'SP': 20, 'MG': 20, 'PE': 20,
    'SC': 30
};

const els = {
    marca: { inp: document.getElementById('inpMarca'), id: document.getElementById('idMarca'), list: document.getElementById('listaMarca') },
    modelo: { inp: document.getElementById('inpModelo'), id: document.getElementById('idModelo'), list: document.getElementById('listaModelo') },
    ano: { inp: document.getElementById('inpAno'), id: document.getElementById('idAno'), list: document.getElementById('listaAno') },
    estadoSelect: document.getElementById('selecionar-stado'),
    btn: document.getElementById('btn-verificar'),
    res: document.getElementById('resultado'),
    load: document.getElementById('carregando')
};

window.onload = () => {
    Object.keys(aliquotas).sort().forEach(uf => {
        let opt = document.createElement('option');
        opt.value = uf; 
        opt.innerText = uf;
        els.estadoSelect.appendChild(opt);
    });
    setupSearch(els.marca);
    setupSearch(els.modelo);
    setupSearch(els.ano);
    carregarMarcas();
    document.addEventListener('click', e => {
        if(!e.target.closest('.relative')) {
            document.querySelectorAll('.dropdown-list').forEach(l => l.classList.remove('active'));
        }
    });
};

function setType(t, btn) {
    tipoAtual = t;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    els.marca.inp.value = ''; els.marca.id.value = '';
    resetDown(els.modelo);
    resetDown(els.ano);
    els.res.classList.add('invisivel');
    carregarMarcas();
}

function resetDown(obj) {
    obj.inp.value = ''; 
    obj.id.value = ''; 
    obj.inp.disabled = true; 
    obj.list.innerHTML = '';
}

function checkBtn() {
    const temAno = els.ano.id.value !== '';
    const temEstado = els.estadoSelect.value !== '';
    els.btn.disabled = !(temAno && temEstado);
}

function setupSearch(obj) {
    obj.inp.addEventListener('input', function() {
        const termo = this.value.toLowerCase();
        const itens = obj.list.querySelectorAll('li');
        let visivel = false;
        obj.list.classList.add('active');
        itens.forEach(li => {
            if(li.innerText.toLowerCase().includes(termo)) {
                li.style.display = 'block';
                visivel = true;
            } else {
                li.style.display = 'none';
            }
        });
        if(!visivel) obj.list.classList.remove('active');
    });
    obj.inp.addEventListener('focus', function() {
        const itens = obj.list.querySelectorAll('li');
        if(itens.length > 0) {
            itens.forEach(li => li.style.display = 'block');
            obj.list.classList.add('active');
        }
    });
}

function criarItem(texto, valor, callback) {
    const li = document.createElement('li');
    li.innerText = texto;
    li.addEventListener('mousedown', () => callback(texto, valor));
    return li;
}

async function fetchAPI(endpoint) {
    els.load.classList.remove('invisivel');
    try {
        const res = await fetch(API + endpoint);
        return await res.json();
    }
    catch(e) {
        alert("Erro de conexão com a API.");
        return [];
    }
    finally {
        els.load.classList.add('invisivel');
    }
}

async function carregarMarcas() {
    els.marca.inp.placeholder = "Carregando...";
    const dados = await fetchAPI(`/${tipoAtual}/marcas`);
    els.marca.list.innerHTML = '';
    dados.forEach(d => {
        els.marca.list.appendChild(criarItem(d.nome, d.codigo, (txt, cod) => {
            els.marca.inp.value = txt; 
            els.marca.id.value = cod;
            els.marca.list.classList.remove('active');
            carregarModelos(cod);
        }));
    });
    els.marca.inp.placeholder = "Digite ou selecione...";
}

async function carregarModelos(idMarca) {
    resetDown(els.modelo); 
    resetDown(els.ano);
    els.modelo.inp.placeholder = "Carregando...";
    const dados = await fetchAPI(`/${tipoAtual}/marcas/${idMarca}/modelos`);
    els.modelo.inp.disabled = false; 
    els.modelo.list.innerHTML = '';
    dados.modelos.forEach(d => {
        els.modelo.list.appendChild(criarItem(d.nome, d.codigo, (txt, cod) => {
            els.modelo.inp.value = txt; 
            els.modelo.id.value = cod;
            els.modelo.list.classList.remove('active');
            carregarAnos(idMarca, cod);
        }));
    });
    els.modelo.inp.placeholder = "Digite ou selecione...";
    els.modelo.inp.focus();
}

async function carregarAnos(idMarca, idModelo) {
    resetDown(els.ano);
    els.ano.inp.placeholder = "Carregando...";
    const dados = await fetchAPI(`/${tipoAtual}/marcas/${idMarca}/modelos/${idModelo}/anos`);
    els.ano.inp.disabled = false; 
    els.ano.list.innerHTML = '';
    dados.forEach(d => {
        els.ano.list.appendChild(criarItem(d.nome, d.codigo, (txt, cod) => {
            els.ano.inp.value = txt; 
            els.ano.id.value = cod;
            els.ano.list.classList.remove('active');
            checkBtn();
        }));
    });
    els.ano.inp.placeholder = "Selecione o ano...";
    els.ano.inp.focus();
}

async function consultar() {
    const url = `/${tipoAtual}/marcas/${els.marca.id.value}/modelos/${els.modelo.id.value}/anos/${els.ano.id.value}`;
    const dados = await fetchAPI(url);

    if(!dados || !dados.Valor) {
        alert("Erro ao buscar dados. Tente novamente.");
        return;
    }

    document.getElementById('resultado-titulo').innerText = `${dados.Modelo} (${dados.AnoModelo})`;
    document.getElementById('resultado-codigo').innerText = `Fipe: ${dados.CodigoFipe} | Ref: ${dados.MesReferencia}`;
    document.getElementById('valor-fipe').innerText = dados.Valor;

    const anoAtual = new Date().getFullYear();
    const anoCarroTexto = dados.AnoModelo.toString();
    const anoCarroNumero = parseInt(anoCarroTexto.split(' ')[0]);
    const anoBaseCalculo = (anoCarroNumero === 32000) ? anoAtual : anoCarroNumero;
    const idadeVeiculo = anoAtual - anoBaseCalculo;
    const uf = els.estadoSelect.value;
    const anosParaIsencao = regrasIsencao[uf] || 20;
    const isento = idadeVeiculo >= anosParaIsencao;
    const divIpvaValor = document.getElementById('valor-ipva');
    const valorVenal = parseFloat(dados.Valor.replace('R$ ','').replace('.','').replace(',','.'));

    if (isento) {
        divIpvaValor.innerText = "ISENTO";
        divIpvaValor.style.color = "green";
    }
    else {
        const aliquota = aliquotas[uf] || 0.03;
        const valorImposto = valorVenal * aliquota;
        divIpvaValor.innerText = valorImposto.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
        divIpvaValor.style.color = "";
    }
    els.res.classList.remove('invisivel');
    els.res.scrollIntoView({ behavior: 'smooth' });
}