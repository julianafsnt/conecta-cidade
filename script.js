// Exemplos iniciais para o site não abrir vazio
const dadosIniciais = [
  {
    id: 1,
    categoria: "Buraco na Via",
    localizacao: "Rua Tavares de Melo, Centro",
    descricao: "Buraco extenso perto do ponto de ônibus atrapalhando o trânsito.",
    solicitante: "Juliana Santos",
    data: "15/09/2026",
    status: "Em andamento"
  },
  {
    id: 2,
    categoria: "Iluminação Pública",
    localizacao: "Praça do Cristo, Santa Efigênia",
    descricao: "Poste com lâmpada queimada há dias, gerando insegurança no local.",
    solicitante: "Associação de Moradores",
    data: "14/09/2026",
    status: "Recebido"
  }
];

function carregarDados() {
  const salvos = localStorage.getItem('conecta_demandas');
  if (!salvos) {
    localStorage.setItem('conecta_demandas', JSON.stringify(dadosIniciais));
    return dadosIniciais;
  }
  return JSON.parse(salvos);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (tab === 'registro') {
    document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    document.getElementById('tab-registro').style.display = 'block';
    document.getElementById('tab-mural').style.display = 'none';
  } else {
    document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
    document.getElementById('tab-registro').style.display = 'none';
    document.getElementById('tab-mural').style.display = 'block';
    renderizarMural();
  }
}

function selectCategory(cat, el) {
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('categoriaSelecionada').value = cat;
}

function obterLocalizacao() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        document.getElementById('localizacao').value = `GPS: ${lat}, ${lng} (Conselheiro Lafaiete)`;
      },
      () => {
        alert('Não foi possível obter o GPS. Digite o endereço manualmente.');
      }
    );
  } else {
    alert('Seu navegador não suporta geolocalização.');
  }
}

function salvarOcorrencia(e) {
  e.preventDefault();
  const categoria = document.getElementById('categoriaSelecionada').value;
  const localizacao = document.getElementById('localizacao').value;
  const descricao = document.getElementById('descricao').value;
  const solicitante = document.getElementById('nomeCidadao').value || 'Morador Anônimo';

  const novaDemanda = {
    id: Date.now(),
    categoria,
    localizacao,
    descricao,
    solicitante,
    data: new Date().toLocaleDateString('pt-BR'),
    status: 'Recebido'
  };

  const dados = carregarDados();
  dados.unshift(novaDemanda);
  localStorage.setItem('conecta_demandas', JSON.stringify(dados));

  alert('Demanda enviada com sucesso para a triagem!');
  document.getElementById('formDemanda').reset();
  switchTab('mural');
}

function alternarStatus(id) {
  const dados = carregarDados();
  const index = dados.findIndex(d => d.id === id);
  if (index !== -1) {
    const statusMap = {
      'Recebido': 'Em andamento',
      'Em andamento': 'Concluído',
      'Concluído': 'Recebido'
    };
    dados[index].status = statusMap[dados[index].status];
    localStorage.setItem('conecta_demandas', JSON.stringify(dados));
    renderizarMural();
  }
}

function renderizarMural() {
  const dados = carregarDados();
  const container = document.getElementById('listaOcorrencias');
  container.innerHTML = '';

  let andamento = 0;
  let concluido = 0;

  dados.forEach(item => {
    if (item.status === 'Em andamento') andamento++;
    if (item.status === 'Concluído') concluido++;

    const statusClass = item.status === 'Recebido' ? 'status-recebido' :
                        item.status === 'Em andamento' ? 'status-andamento' : 'status-concluido';

    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <div class="report-header">
        <div class="report-title">
          <i class="ph ph-warning-circle" style="color: var(--primary);"></i>
          ${item.categoria}
        </div>
        <span class="status-badge ${statusClass}" title="Clique para simular alteração de status pela prefeitura" onclick="alternarStatus(${item.id})">
          ${item.status} ↻
        </span>
      </div>
      <p style="font-size: 0.95rem; color: #334155;">${item.descricao}</p>
      <div class="report-meta">
        <span><i class="ph ph-map-pin"></i> ${item.localizacao}</span>
        <span><i class="ph ph-calendar"></i> ${item.data}</span>
        <span><i class="ph ph-user"></i> ${item.solicitante}</span>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('stat-total').innerText = dados.length;
  document.getElementById('stat-andamento').innerText = andamento;
  document.getElementById('stat-concluido').innerText = concluido;
}

// Inicia os dados no carregamento
carregarDados();