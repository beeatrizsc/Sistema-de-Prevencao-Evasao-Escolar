// Dados iniciais de fallback (caso abra o HTML localmente sem servidor PHP)
const dadosExemploEstudantes = [
  { matricula: "20260104", nome: "Lucas Ferreira da Silva", bairro: "Fonseca", turma: "2º Ano B (Manhã)", responsavel: "Ana Ferreira (Mãe)", telefone: "(21) 99123-4567", renda: "R$ 1.412,00", ocupacao: "Trabalho Informal", temFilho: false, risco: "Alto", pontos: 86 },
  { matricula: "20260189", nome: "Mariana Oliveira Santos", bairro: "Centro", turma: "1º Ano A (Manhã)", responsavel: "Cláudia Santos (Mãe)", telefone: "(21) 98765-4321", renda: "R$ 950,00", ocupacao: "Apenas estuda", temFilho: true, risco: "Alto", pontos: 82 },
  { matricula: "20260302", nome: "Sofia Almeida Rocha", bairro: "Santa Rosa", turma: "2º Ano B (Manhã)", responsavel: "Marcos Rocha (Pai)", telefone: "(21) 99988-7766", renda: "R$ 3.800,00", ocupacao: "Apenas estuda", temFilho: false, risco: "Baixo", pontos: 12 }
];

const dadosExemploAcoes = [
  { id: 1, data: "2026-11-18", matricula: "20260104", aluno: "Lucas Ferreira da Silva", tipo: "Contato com Responsável", descricao: "Reunião agendada com a mãe para flexibilizar horário de entrada devido ao trabalho.", status: "Em Andamento" },
  { id: 2, data: "2026-11-20", matricula: "20260189", aluno: "Mariana Oliveira Santos", tipo: "Encaminhamento Assistência Social", descricao: "Encaminhamento ao CRAS para auxílio creche e acompanhamento familiar.", status: "Aberta" }
];

let estudantes = [...dadosExemploEstudantes];
let acoes = [...dadosExemploAcoes];
let modoVazio = false;

// Inicialização ao carregar o Dashboard
document.addEventListener("DOMContentLoaded", function () {
  const seletorPerfil = document.getElementById("seletorPerfilRapido");
  if (seletorPerfil) {
    const perfilSalvo = localStorage.getItem("perfilUsuario") || "gestor";
    seletorPerfil.value = perfilSalvo;
    alterarPerfil(perfilSalvo);
    renderizarTabelas();
    configurarEventosFormulario();
    carregarDadosDoBanco();
  }
});

/* --------------------------------------------------------------------------
   1. COMUNICAÇÃO COM O BACKEND PHP / MYSQL (READ)
   -------------------------------------------------------------------------- */
async function carregarDadosDoBanco() {
  try {
    const resp = await fetch("api_crud.php?acao=listar");
    const dados = await resp.json();
    if (dados.sucesso) {
      estudantes = dados.estudantes;
      acoes = dados.acoes;
      renderizarTabelas();
    }
  } catch (err) {
    console.warn("Rodando em modo local sem servidor PHP ativo:", err);
  }
}

/* --------------------------------------------------------------------------
   2. INTEGRAÇÃO COM API EXTERNA (ViaCEP -> Tabela Endereco 3FN)
   -------------------------------------------------------------------------- */
async function buscarCEP(cepDigitado) {
  const cepLimpo = cepDigitado.replace(/\D/g, "");
  const statusCep = document.getElementById("statusCep");
  const inputBairro = document.getElementById("alunoBairro");
  const inputLogradouro = document.getElementById("alunoLogradouro");

  if (cepLimpo.length !== 8) {
    statusCep.innerText = "";
    return;
  }

  statusCep.innerText = "Buscando endereço...";
  statusCep.className = "small text-primary d-block mt-1";

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      statusCep.innerText = "CEP não encontrado. Preencha manualmente.";
      statusCep.className = "small text-danger d-block mt-1";
      inputBairro.value = "";
      inputLogradouro.value = "";
    } else {
      inputBairro.value = dados.bairro || "";
      inputLogradouro.value = dados.logradouro || "";
      statusCep.innerText = `Localizado: ${dados.localidade}/${dados.uf}`;
      statusCep.className = "small text-success d-block mt-1";
    }
  } catch (erro) {
    statusCep.innerText = "Falha na consulta automática. Preencha manualmente.";
    statusCep.className = "small text-warning d-block mt-1";
  }
}

/* --------------------------------------------------------------------------
   3. MÁSCARAS E VALIDAÇÕES (CPF & Telefone_Responsavel 1FN)
   -------------------------------------------------------------------------- */
function configurarEventosFormulario() {
  ["alunoCpf", "respCpf", "alunoCep"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
      });
    }
  });

  ["respTel1", "respTel2"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener("input", function () {
        let v = this.value.replace(/\D/g, "").slice(0, 11);
        if (v.length > 6) {
          this.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
          this.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        } else if (v.length > 0) {
          this.value = `(${v}`;
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   4. SIMULADOR DE SCORE DE RISCO EM TEMPO REAL
   -------------------------------------------------------------------------- */
function calcularScorePreview() {
  const ocupacao = document.getElementById("alunoOcupacao").value;
  const temFilho = document.getElementById("checkFilho").checked;
  const acessibilidade = document.getElementById("checkAcess").checked;
  const acompanhamento = document.getElementById("checkAcomp").checked;
  const renda = parseFloat(document.getElementById("respRenda").value) || 0;

  let pontos = 10;
  if (ocupacao === "Trabalho Informal") pontos += 35;
  if (ocupacao === "Trabalho Formal" || ocupacao === "Jovem Aprendiz") pontos += 20;
  if (temFilho) pontos += 40;
  if (acessibilidade) pontos += 10;
  if (acompanhamento) pontos += 15;
  if (renda > 0 && renda <= 1500) pontos += 15;

  if (pontos > 100) pontos = 100;

  const barra = document.getElementById("barraScorePreview");
  const texto = document.getElementById("textoScorePreview");

  barra.style.width = `${pontos}%`;
  barra.className = "progress-bar";

  if (pontos >= 70) {
    barra.classList.add("bg-danger");
    texto.innerText = `Risco Alto (${pontos} pts) — Recomenda-se Ação Preventiva imediata`;
    texto.className = "small font-weight-bold text-danger";
  } else if (pontos >= 40) {
    barra.classList.add("bg-warning");
    texto.innerText = `Risco Médio (${pontos} pts) — Monitoramento preventivo`;
    texto.className = "small font-weight-bold text-warning";
  } else {
    barra.classList.add("bg-success");
    texto.innerText = `Risco Baixo (${pontos} pts) — Situação regular`;
    texto.className = "small font-weight-bold text-success";
  }

  return pontos;
}

/* --------------------------------------------------------------------------
   5. CONTROLE DE PERFIS (LGPD) E NAVEGAÇÃO DE ABAS
   -------------------------------------------------------------------------- */
function alterarPerfil(perfil) {
  localStorage.setItem("perfilUsuario", perfil);
  const badge = document.getElementById("badgeRoleAtiva");
  const desc = document.getElementById("descricaoPermissao");

  const elemsGestor = document.querySelectorAll(".perm-gestor");
  const elemsIntervencao = document.querySelectorAll(".perm-intervencao");
  const colsSensiveis = document.querySelectorAll(".col-sensivel");

  if (perfil === "gestor") {
    badge.innerText = "role_gestor";
    desc.innerText = "Acesso administrativo completo: estrutura escolar, cadastros de alunos/responsáveis e intervenções.";
    elemsGestor.forEach(el => el.style.display = "");
    elemsIntervencao.forEach(el => el.style.display = "");
    colsSensiveis.forEach(el => el.style.display = "");
  } else if (perfil === "assistente") {
    badge.innerText = "role_assistente_social";
    desc.innerText = "Foco em vulnerabilidade social e gestão de Ações Preventivas (sem edição de cadastro escolar).";
    elemsGestor.forEach(el => el.style.display = "none");
    elemsIntervencao.forEach(el => el.style.display = "");
    colsSensiveis.forEach(el => el.style.display = "");
  } else if (perfil === "professor") {
    badge.innerText = "role_professor";
    desc.innerText = "Acesso restrito (LGPD): dados sensíveis como Renda e Raça/Etnia estão ocultos. Foco em Diário e Chamada.";
    elemsGestor.forEach(el => el.style.display = "none");
    elemsIntervencao.forEach(el => el.style.display = "none");
    colsSensiveis.forEach(el => el.style.display = "none");
  }
  renderizarTabelas();
}

function trocarAba(aba, linkEl) {
  document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("active"));
  linkEl.classList.add("active");

  document.getElementById("aba-estudantes").style.display = aba === "estudantes" ? "block" : "none";
  document.getElementById("aba-acoes").style.display = aba === "acoes" ? "block" : "none";
  document.getElementById("aba-diario").style.display = aba === "diario" ? "block" : "none";

  const titulos = {
    estudantes: "Monitoramento de Estudantes",
    acoes: "Gestão de Ações Preventivas",
    diario: "Diário de Classe (Frequência & Notas)"
  };
  document.getElementById("tituloPagina").innerText = titulos[aba];
}

function alternarEstadoDados() {
  modoVazio = !modoVazio;
  const btn = document.getElementById("btnToggleDados");
  if (modoVazio) {
    estudantes = [];
    acoes = [];
    btn.innerText = "Recarregar Dados";
    renderizarTabelas();
  } else {
    btn.innerText = "Simular Banco Vazio";
    carregarDadosDoBanco();
  }
}

/* --------------------------------------------------------------------------
   6. RENDERIZAÇÃO DAS TABELAS NA INTERFACE
   -------------------------------------------------------------------------- */
function renderizarTabelas() {
  const perfil = localStorage.getItem("perfilUsuario") || "gestor";
  const filtro = (document.getElementById("filtroAluno").value || "").toLowerCase();
  const tbodyEst = document.getElementById("tbodyEstudantes");
  const tbodyAc = document.getElementById("tbodyAcoes");
  const tbodyDiario = document.getElementById("tbodyDiario");

  // 1. Tabela de Estudantes
  const filtrados = estudantes.filter(e => e.nome.toLowerCase().includes(filtro) || e.matricula.includes(filtro));
  if (filtrados.length === 0) {
    tbodyEst.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">Nenhum estudante encontrado.</td></tr>`;
  } else {
    tbodyEst.innerHTML = filtrados.map(e => {
      const badgeClass = e.risco === "Alto" ? "badge-risco-alto" : (e.risco === "Médio" ? "badge-risco-medio" : "badge-risco-baixo");
      const ocultoLgpd = perfil === "professor" ? 'style="display:none;"' : "";
      const btnIntervir = perfil !== "professor" ? `<button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="abrirModalIntervencao('${e.matricula}')">Intervir</button>` : "";
      const btnExcluir = perfil === "gestor" ? `<button class="btn btn-sm btn-outline-danger rounded-pill ml-1" onclick="removerEstudante('${e.matricula}')">&times;</button>` : "";

      return `
        <tr>
          <td class="font-weight-bold text-secondary">${e.matricula}</td>
          <td>
            <div class="font-weight-bold text-dark">${e.nome}</div>
            <small class="text-muted">Bairro: ${e.bairro}</small>
          </td>
          <td>${e.turma}</td>
          <td>
            <div class="small font-weight-bold">${e.responsavel}</div>
            <small class="text-muted">${e.telefone}</small>
          </td>
          <td class="col-sensivel" ${ocultoLgpd}>
            <div class="small font-weight-bold">${e.renda}</div>
            <span class="badge badge-light border">${e.ocupacao}</span>
            ${e.temFilho ? '<span class="badge badge-light border">Tem filho(s)</span>' : ""}
          </td>
          <td><span class="${badgeClass}">${e.risco} (${e.pontos} pts)</span></td>
          <td class="text-right text-nowrap">
            <div class="d-inline-flex align-items-center">
              ${btnIntervir}
              ${btnExcluir}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // 2. Tabela de Ações Preventivas
  document.getElementById("contadorAcoesBadge").innerText = acoes.length;
  if (acoes.length === 0) {
    tbodyAc.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">Nenhuma ação preventiva registrada até o momento.</td></tr>`;
  } else {
    tbodyAc.innerHTML = acoes.map(a => {
      const badgeStatus = a.status === "Concluída" ? "badge-success" : (a.status === "Em Andamento" ? "badge-warning" : "badge-danger");
      const btnGerenciar = perfil !== "professor" ? `
        <td class="text-right text-nowrap">
          <div class="d-inline-flex align-items-center">
            <button class="btn btn-sm btn-outline-success rounded-pill mr-1" onclick="concluirAcao(${a.id})">Concluir</button>
            <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="removerAcao(${a.id})">&times;</button>
          </div>
        </td>` : "";
      return `
        <tr>
          <td class="font-weight-bold">#${a.id}</td>
          <td>${a.data}</td>
          <td><strong>${a.aluno}</strong><br><small class="text-muted">Mat: ${a.matricula}</small></td>
          <td>${a.tipo}</td>
          <td class="small" style="max-width: 280px;">${a.descricao}</td>
          <td><span class="badge ${badgeStatus} px-2 py-1">${a.status}</span></td>
          ${btnGerenciar}
        </tr>
      `;
    }).join("");
  }

  // 3. Tabela do Diário
  if (estudantes.length === 0) {
    tbodyDiario.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Sem alunos vinculados à turma.</td></tr>`;
  } else {
    tbodyDiario.innerHTML = estudantes.map(e => `
      <tr>
        <td class="pl-3 align-middle"><strong>${e.nome}</strong> <small class="text-muted">(${e.matricula})</small></td>
        <td class="align-middle">
          <select class="form-control form-control-sm" style="width: 110px;">
            <option value="1">Presente</option>
            <option value="0">Falta</option>
          </select>
        </td>
        <td class="align-middle"><input type="text" class="form-control form-control-sm" placeholder="Opcional..."></td>
        <td class="align-middle"><input type="number" step="0.1" min="0" max="10" class="form-control form-control-sm" placeholder="0.0 - 10.0"></td>
      </tr>
    `).join("");
  }
}

/* --------------------------------------------------------------------------
   7. OPERAÇÕES CRUD COM O MYSQL VIA PHP (CREATE, UPDATE, DELETE)
   -------------------------------------------------------------------------- */
async function salvarNovoAluno(e) {
  e.preventDefault();
  const cpfAluno = document.getElementById("alunoCpf").value;
  const cpfResp = document.getElementById("respCpf").value;

  if (cpfAluno.length !== 11 || cpfResp.length !== 11) {
    alert("Os CPFs do estudante e do responsável devem conter exatamente 11 dígitos.");
    return;
  }

  const payload = {
    alunoCpf: cpfAluno,
    alunoNome: document.getElementById("alunoNome").value,
    alunoNasc: document.getElementById("alunoNasc").value,
    alunoGenero: document.getElementById("alunoGenero").value,
    alunoRaca: document.getElementById("alunoRaca").value,
    cep: document.getElementById("alunoCep").value,
    bairro: document.getElementById("alunoBairro").value,
    logradouro: document.getElementById("alunoLogradouro").value,
    matricula: document.getElementById("alunoMatricula").value,
    idTurma: document.getElementById("alunoTurma").value,
    ocupacao: document.getElementById("alunoOcupacao").value,
    temFilho: document.getElementById("checkFilho").checked,
    acessibilidade: document.getElementById("checkAcess").checked,
    acompanhamento: document.getElementById("checkAcomp").checked,
    respCpf: cpfResp,
    respNome: document.getElementById("respNome").value,
    respParentesco: document.getElementById("respParentesco").value,
    respRenda: document.getElementById("respRenda").value,
    respEscolaridade: document.getElementById("respEscolaridade").value,
    respTel1: document.getElementById("respTel1").value,
    respTel2: document.getElementById("respTel2").value
  };

  try {
    const resp = await fetch("api_crud.php?acao=cadastrar_aluno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const res = await resp.json();

    if (res.sucesso) {
      $("#modalNovoAluno").modal("hide");
      e.target.reset();
      document.getElementById("statusCep").innerText = "";
      calcularScorePreview();
      carregarDadosDoBanco();
    } else {
      alert("Erro ao salvar no banco: " + res.erro);
    }
  } catch (err) {
    alert("Erro de comunicação com o servidor PHP.");
  }
}

function abrirModalIntervencao(matricula) {
  document.getElementById("acaoMatricula").value = matricula;
  $("#modalNovaAcao").modal("show");
}

async function salvarNovaAcao(e) {
  e.preventDefault();
  const payload = {
    matricula: document.getElementById("acaoMatricula").value,
    tipo: document.getElementById("acaoTipo").value,
    descricao: document.getElementById("acaoDescricao").value,
    status: document.getElementById("acaoStatus").value
  };

  try {
    const resp = await fetch("api_crud.php?acao=cadastrar_acao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const res = await resp.json();

    if (res.sucesso) {
      $("#modalNovaAcao").modal("hide");
      e.target.reset();
      carregarDadosDoBanco();
    } else {
      alert("Erro ao registrar ação (verifique se a matrícula existe): " + res.erro);
    }
  } catch (err) {
    alert("Erro de comunicação com o servidor PHP.");
  }
}

async function concluirAcao(id) {
  await fetch("api_crud.php?acao=concluir_acao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  carregarDadosDoBanco();
}

async function removerAcao(id) {
  if (!confirm("Excluir esta ação preventiva do banco de dados?")) return;
  await fetch("api_crud.php?acao=excluir_acao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  carregarDadosDoBanco();
}

async function removerEstudante(matricula) {
  if (!confirm("Excluir permanentemente este estudante do banco de dados?")) return;
  await fetch("api_crud.php?acao=excluir_aluno", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricula })
  });
  carregarDadosDoBanco();
}