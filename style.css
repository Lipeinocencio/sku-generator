// ===== CREDENCIAIS =====
const USUARIOS = [
  { user: "admin", pass: "admin123", nome: "Administrador" },
  { user: "operador", pass: "op2024", nome: "Operador" },
  { user: "mag", pass: "mag123", nome: "Magazine" }
];

// ===== CONFIG =====
const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";
let loggedUser = null;

// ===== BANCO (localStorage) =====
function getDatabase() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("localStorage não disponível, usando memória temporária");
    return window.tempDB || [];
  }
}

function saveDatabase(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Não foi possível salvar no localStorage");
    window.tempDB = db;
  }
  renderSkuList();
}

// ===== UTIL =====
function normalizar(t) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function gerarCodigoVariacao(baseSku, variacao, db) {
  let base = normalizar(variacao).replace(/\s+/g, "").substring(0, 4);
  if (!base) base = "base";
  let cod = base, c = 2;
  while (db.includes(`${baseSku}-${cod}`)) { cod = `${base}${c}`; c++; }
  return cod;
}

// ===== LOGIN =====
function fazerLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  const erro = document.getElementById("loginError");

  if (!user || !pass) {
    erro.textContent = "Preencha usuário e senha";
    return;
  }

  const found = USUARIOS.find(u => u.user === user && u.pass === pass);

  if (!found) {
    erro.textContent = "Usuário ou senha incorretos";
    document.getElementById("loginPass").value = "";
    return;
  }

  loggedUser = found;
  erro.textContent = "";
  document.getElementById("telaLogin").classList.add("hidden");
  document.getElementById("telaApp").classList.remove("hidden");
  document.getElementById("welcomeUser").textContent = `👤 ${found.nome}`;
  adicionarProduto();
  renderSkuList();
}

function fazerLogout() {
  loggedUser = null;
  document.getElementById("telaApp").classList.add("hidden");
  document.getElementById("telaLogin").classList.remove("hidden");
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  document.getElementById("loginError").textContent = "";
  document.getElementById("listaProdutos").innerHTML = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("status").innerHTML = "";
  document.getElementById("loginUser").focus();
}

// ===== PRODUTO =====
function adicionarProduto() {
  const lista = document.getElementById("listaProdutos");
  const block = document.createElement("div");
  block.className = "produto-block";
  block.innerHTML = `
    <div class="produto-label">Produto</div>
    <div class="produto-block-header">
      <input type="text" class="produto-input" placeholder="Ex: Blusa Canelada" />
      <button class="btn-icon btn-icon-red" onclick="this.closest('.produto-block').remove()" title="Remover produto">✕</button>
    </div>
    <div class="variacoes-container"></div>
    <small class="add" onclick="adicionarVariacao(this)">+ adicionar variação</small>
  `;
  lista.appendChild(block);
  block.querySelector(".produto-input").focus();
}

// ===== VARIAÇÃO =====
function adicionarVariacao(el) {
  const container = el.previousElementSibling;
  const wrapper = document.createElement("div");
  wrapper.className = "variacao-item";

  const input = document.createElement("input");
  input.placeholder = "Ex: Verde";
  input.type = "text";

  const btn = document.createElement("button");
  btn.className = "btn-icon btn-icon-red";
  btn.innerHTML = "✕";
  btn.title = "Remover variação";
  btn.addEventListener("click", () => wrapper.remove());

  wrapper.appendChild(input);
  wrapper.appendChild(btn);
  container.appendChild(wrapper);
  input.focus();
}

// ===== LIMPAR =====
function limparCampos() {
  document.getElementById("listaProdutos").innerHTML = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("status").innerHTML = "";
  adicionarProduto();
}

// ===== GERAR SKUs =====
function gerarSKUs() {
  const resultado = document.getElementById("resultado");
  const status = document.getElementById("status");
  resultado.innerHTML = "";
  status.innerHTML = "";

  const blocos = document.querySelectorAll(".produto-block");
  if (blocos.length === 0) {
    status.innerText = "Adicione pelo menos um produto";
    status.style.color = "red";
    return;
  }

  const db = getDatabase();
  let totalNovos = 0, totalExistentes = 0;

  blocos.forEach(bloco => {
    const produto = bloco.querySelector(".produto-input").value.trim();
    if (!produto) return;

    const palavras = normalizar(produto).split(" ");
    const cat = palavras[0].substring(0, 4);
    const nom = palavras[1] ? palavras[1].substring(0, 4) : "item";
    const baseSku = `${PREFIXO}-${cat}-${nom}`;

    const variacoes = Array.from(bloco.querySelectorAll(".variacoes-container input"))
      .map(v => v.value).filter(v => v.trim() !== "");

    resultado.innerHTML += `<p style="margin-top:10px;font-weight:bold;color:#333;">📦 ${produto}</p>`;

    if (variacoes.length === 0) {
      if (db.includes(baseSku)) {
        resultado.innerHTML += `<p class="warn">⚠ ${baseSku} (já existia)</p>`;
        totalExistentes++;
      } else {
        db.push(baseSku);
        resultado.innerHTML += `<p class="ok">✔ ${baseSku}</p>`;
        totalNovos++;
      }
    } else {
      variacoes.forEach(v => {
        const codVar = gerarCodigoVariacao(baseSku, v, db);
        const skuFinal = `${baseSku}-${codVar}`;
        if (db.includes(skuFinal)) {
          resultado.innerHTML += `<p class="warn">⚠ ${skuFinal} (já existia)</p>`;
          totalExistentes++;
        } else {
          db.push(skuFinal);
          resultado.innerHTML += `<p class="ok">✔ ${skuFinal}</p>`;
          totalNovos++;
        }
      });
    }
  });

  saveDatabase(db);
  status.innerText = `${totalNovos} novo(s), ${totalExistentes} já existente(s)`;
  status.style.color = "#333";
}

// ===== LISTA SKUs =====
function renderSkuList(filtro = "") {
  const container = document.getElementById("skuList");
  const counter = document.getElementById("skuCounter");
  const db = getDatabase();
  const filtrados = filtro ? db.filter(s => s.toLowerCase().includes(filtro.toLowerCase())) : db;

  counter.textContent = `(${db.length})`;
  container.innerHTML = "";

  if (filtrados.length === 0) {
    container.innerHTML = `<div class="empty-msg">${db.length === 0 ? "Nenhum SKU salvo ainda" : "Nenhum resultado"}</div>`;
    return;
  }

  filtrados.forEach(sku => {
    const ri = db.indexOf(sku);
    const item = document.createElement("div");
    item.className = "sku-item";
    item.dataset.index = ri;
    item.innerHTML = `
      <span class="sku-text">${sku}</span>
      <div class="sku-actions">
        <button class="btn-edit" onclick="editarSku(${ri})">✏️</button>
        <button class="btn-del" onclick="excluirSku(${ri})">🗑</button>
      </div>`;
    container.appendChild(item);
  });
}

function editarSku(index) {
  const db = getDatabase();
  document.querySelectorAll("#skuList .sku-item").forEach(item => {
    if (parseInt(item.dataset.index) === index) {
      item.className = "sku-item editing";
      item.innerHTML = `
        <input type="text" value="${db[index]}" id="editInput_${index}" />
        <div class="sku-actions">
          <button class="btn-save" onclick="salvarEdicao(${index})">✔</button>
          <button class="btn-cancel" onclick="cancelarEdicao()">✕</button>
        </div>`;
      document.getElementById(`editInput_${index}`).focus();
    }
  });
}

function salvarEdicao(index) {
  const db = getDatabase();
  const val = document.getElementById(`editInput_${index}`).value.trim();
  if (!val) { alert("O SKU não pode ficar vazio"); return; }
  if (db.includes(val) && db[index] !== val) { alert("Esse SKU já existe!"); return; }
  db[index] = val;
  saveDatabase(db);
}

function cancelarEdicao() {
  renderSkuList(document.getElementById("buscaSku").value);
}

function excluirSku(index) {
  if (!confirm("Deseja excluir este SKU?")) return;
  const db = getDatabase();
  db.splice(index, 1);
  saveDatabase(db);
}

function exportarCSV() {
  const db = getDatabase();
  if (db.length === 0) { alert("Nenhum SKU para exportar"); return; }
  const csv = "SKU\n" + db.join("\n") + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skus_exportados.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function limparTudo() {
  if (!confirm("Tem certeza que deseja excluir TODOS os SKUs?")) return;
  saveDatabase([]);
  document.getElementById("buscaSku").value = "";
}

function buscarSku() {
  renderSkuList(document.getElementById("buscaSku").value);
}

// ===== EVENTOS =====
document.addEventListener("DOMContentLoaded", () => {
  // Login
  document.getElementById("btnLogin").addEventListener("click", fazerLogin);
  document.getElementById("loginPass").addEventListener("keydown", e => {
    if (e.key === "Enter") fazerLogin();
  });
  document.getElementById("loginUser").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("loginPass").focus();
  });

  // App
  document.getElementById("btnLogout").addEventListener("click", fazerLogout);
  document.getElementById("btnAddProduto").addEventListener("click", adicionarProduto);
  document.getElementById("btnGerar").addEventListener("click", gerarSKUs);
  document.getElementById("btnLimpar").addEventListener("click", limparCampos);
  document.getElementById("btnExportar").addEventListener("click", exportarCSV);
  document.getElementById("btnLimparTudo").addEventListener("click", limparTudo);
  document.getElementById("btnBuscar").addEventListener("click", buscarSku);
  document.getElementById("buscaSku").addEventListener("input", buscarSku);

  document.getElementById("toggleSalvos").addEventListener("click", () => {
    const secao = document.getElementById("secaoSalvos");
    const icon = document.getElementById("toggleIcon");
    const aberto = secao.style.display !== "none";
    secao.style.display = aberto ? "none" : "block";
    icon.classList.toggle("open", !aberto);
  });

  document.getElementById("loginUser").focus();
});
