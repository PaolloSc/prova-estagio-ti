// Controle de chamados — protótipo funcional.
// Persiste em localStorage para o protótipo funcionar sem back-end.

const STORAGE_KEY = "chamados";
const STATUS = ["Aberto", "Em atendimento", "Aguardando solicitante", "Encaminhado", "Resolvido", "Encerrado"];

const form = document.getElementById("form-chamado");
const lista = document.getElementById("lista");
const filtroStatus = document.getElementById("filtro-status");
const indicadores = document.getElementById("indicadores");
const avisoEl = document.getElementById("aviso");

let chamados = carregar();
let seq = chamados.reduce((max, c) => Math.max(max, c.id), 0);
let aviso = ""; // mensagem de bloqueio exibida no topo da lista

function carregar() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
}

// Abertura de chamado
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  // Suporte => já entra "Em atendimento"; outro setor => "Encaminhado".
  const status = d.setor === "Suporte" ? "Em atendimento" : "Encaminhado";
  chamados.push({
    id: ++seq,
    ...d,
    status,
    primeiroRetorno: false,
    devolutivaFinal: false,
    criadoEm: new Date().toISOString(),
  });
  salvar();
  form.reset();
  render();
});

filtroStatus.addEventListener("change", render);

// Regra central: não encerrar sem devolutiva final ao solicitante.
function mudarStatus(id, novo) {
  const c = chamados.find((x) => x.id === id);
  if (!c) return;
  if (novo === "Encerrado" && !c.devolutivaFinal) {
    aviso = `Não é possível encerrar o chamado #${id}: marque a "devolutiva final" ao solicitante antes.`;
    render(); // mantém o status atual e mostra o aviso
    return;
  }
  aviso = "";
  c.status = novo;
  salvar();
  render();
}

function toggle(id, campo) {
  const c = chamados.find((x) => x.id === id);
  if (!c) return;
  c[campo] = !c[campo];
  if (campo === "devolutivaFinal" && c[campo]) aviso = ""; // resolveu a pendência
  salvar();
  render();
}

function render() {
  avisoEl.textContent = aviso;
  avisoEl.hidden = !aviso;

  const filtro = filtroStatus.value;
  const visiveis = chamados.filter((c) => !filtro || c.status === filtro);

  lista.innerHTML = visiveis.length
    ? visiveis.map(linha).join("")
    : `<tr><td class="vazio" colspan="9">Nenhum chamado.</td></tr>`;

  // Indicadores rápidos para a gestão.
  const cont = (f) => chamados.filter(f).length;
  indicadores.innerHTML = `
    <span>Total: ${chamados.length}</span>
    <span>Pendentes: ${cont((c) => c.status !== "Resolvido" && c.status !== "Encerrado")}</span>
    <span>No desenvolvimento: ${cont((c) => c.setor === "Desenvolvimento")}</span>
    <span>Sem 1º retorno: ${cont((c) => !c.primeiroRetorno)}</span>
  `;
}

function linha(c) {
  // "Fora do prazo": urgente/alta ainda em aberto sem primeiro retorno.
  const foraPrazo = !c.primeiroRetorno && (c.prioridade === "Urgente" || c.prioridade === "Alta")
    && c.status !== "Resolvido" && c.status !== "Encerrado";
  const opts = STATUS.map((s) => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("");
  return `
    <tr class="${foraPrazo ? "prazo-estourado" : ""}">
      <td>${c.id}</td>
      <td>${esc(c.solicitante)}<br><small>${esc(c.contato)}</small></td>
      <td>${esc(c.tipo)}</td>
      <td><span class="badge p-${c.prioridade}">${c.prioridade}</span></td>
      <td>${esc(c.setor)}</td>
      <td class="status-cell">
        <select onchange="mudarStatus(${c.id}, this.value)">${opts}</select>
      </td>
      <td><input type="checkbox" ${c.primeiroRetorno ? "checked" : ""} onchange="toggle(${c.id}, 'primeiroRetorno')"></td>
      <td><input type="checkbox" ${c.devolutivaFinal ? "checked" : ""} onchange="toggle(${c.id}, 'devolutivaFinal')"></td>
      <td><button class="acao-btn" onclick="remover(${c.id})">Excluir</button></td>
    </tr>`;
}

function remover(id) {
  chamados = chamados.filter((c) => c.id !== id);
  salvar();
  render();
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

// Expõe as funções usadas nos atributos onclick/onchange do HTML.
window.mudarStatus = mudarStatus;
window.toggle = toggle;
window.remover = remover;

render();
