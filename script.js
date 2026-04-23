// ===== CREDENCIAIS =====
const USUARIOS = [
  { user: "admin", pass: "admin123", nome: "Administrador" },
  { user: "operador", pass: "op2024", nome: "Operador" },
  { user: "mag", pass: "mag123", nome: "Magazine" }
];

// ===== CONFIG =====
const STORAGE_KEY = "sku_database";
const SESSION_KEY = "sku_session";
const PREFIXO = "mag";
let loggedUser = null;

// ===== BANCO (localStorage) =====
function getDatabase() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    
    // Se o localStorage já tem dados, retorna eles
    if (data && JSON.parse(data).length > 0) {
      return JSON.parse(data);
    }
    
    // Se estiver vazio, verifica se existe o backup inicial e popula o banco
    if (typeof SKUS_INICIAIS !== 'undefined' && SKUS_INICIAIS.length > 0) {
      saveDatabase(SKUS_INICIAIS); // Salva na máquina para não ter que recriar
      return [...SKUS_INICIAIS];
    }
    
    return [];
  } catch (e) {
    return window.tempDB || [];
  }
}

function saveDatabase(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    window.tempDB = db;
  }
  renderSkuList();
}

// ===== UTIL =====
function normalizar(t) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function gerarCodigoVariacao(baseSku, variacao, db) {
  var base = normalizar(variacao).replace(/\s+/g, "").substring(0, 4);
  if (!base) base = "base";
  var cod = base;
  var c = 2;
  while (db.includes(baseSku + "-" + cod)) {
    cod = base + c;
    c++;
  }
  return cod;
}

// ===== LOGIN =====
function fazerLogin() {
  var user = document.getElementById("loginUser").value.trim();
  var pass = document.getElementById("loginPass").value;
  var erro = document.getElementById("loginError");

  if (!user || !pass) {
    erro.textContent = "Preencha usuário e senha";
    return;
  }

  var found = null;
  for (var i = 0; i < USUARIOS.length; i++) {
    if (USUARIOS[i].user === user && USUARIOS[i].pass === pass) {
      found = USUARIOS[i];
      break;
    }
  }

  if (!found) {
    erro.textContent = "Usuário ou senha incorretos";
    document.getElementById("loginPass").value = "";
    return;
  }

  loggedUser = found;
  erro.textContent = "";

  // Salvar sessão no localStorage
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: found.user }));
  } catch (e) {}

  entrarNoApp(found);
}

function entrarNoApp(usuario) {
  document.getElementById("telaLogin").classList.add("hidden");
  document.getElementById("telaApp").classList.remove("hidden");
  document.getElementById("welcomeUser").textContent = "👤 " + usuario.nome;
  adicionarProduto();
  renderSkuList();
}

function fazerLogout() {
  loggedUser = null;

  // Remover sessão
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}

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

// Verificar se já tem sessão salva
function verificarSessao() {
  try {
    var session = localStorage.getItem(SESSION_KEY);
    if (session) {
      var data = JSON.parse(session);
      for (var i = 0; i < USUARIOS.length; i++) {
        if (USUARIOS[i].user === data.user) {
          loggedUser = USUARIOS[i];
          entrarNoApp(USUARIOS[i]);
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
}

// ===== PRODUTO =====
function adicionarProduto() {
  var lista = document.getElementById("listaProdutos");
  var block = document.createElement("div");
  block.className = "produto-block";

  var label = document.createElement("div");
  label.className = "produto-label";
  label.textContent = "Produto";

  var header = document.createElement("div");
  header.className = "produto-block-header";

  var input = document.createElement("input");
  input.type = "text";
  input.className = "campo produto-input";
  input.placeholder = "Ex: Blusa Canelada";

  var btnRemove = document.createElement("button");
  btnRemove.className = "btn-icon btn-icon-red";
  btnRemove.textContent = "✕";
  btnRemove.title = "Remover produto";
  btnRemove.addEventListener("click", function () {
    block.remove();
  });

  header.appendChild(input);
  header.appendChild(btnRemove);

  var varContainer = document.createElement("div");
  varContainer.className = "variacoes-container";

  var addVar = document.createElement("small");
  addVar.className = "add";
  addVar.textContent = "+ adicionar variação";
  addVar.addEventListener("click", function () {
    adicionarVariacao(varContainer);
  });

  block.appendChild(label);
  block.appendChild(header);
  block.appendChild(varContainer);
  block.appendChild(addVar);
  lista.appendChild(block);
  input.focus();
}

// ===== VARIAÇÃO =====
function adicionarVariacao(container) {
  var wrapper = document.createElement("div");
  wrapper.className = "variacao-item";

  var input = document.createElement("input");
  input.type = "text";
  input.className = "campo";
  input.placeholder = "Ex: Verde";

  var btn = document.createElement("button");
  btn.className = "btn-icon btn-icon-red";
  btn.textContent = "✕";
  btn.title = "Remover variação";
  btn.addEventListener("click", function () {
    wrapper.remove();
  });

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
  var resultado = document.getElementById("resultado");
  var status = document.getElementById("status");
  resultado.innerHTML = "";
  status.innerHTML = "";

  var blocos = document.querySelectorAll(".produto-block");
  if (blocos.length === 0) {
    status.innerText = "Adicione pelo menos um produto";
    status.style.color = "red";
    return;
  }

  var db = getDatabase();
  var totalNovos = 0;
  var totalExistentes = 0;

  for (var b = 0; b < blocos.length; b++) {
    var bloco = blocos[b];
    var produto = bloco.querySelector(".produto-input").value.trim();
    if (!produto) continue;

    var palavras = normalizar(produto).split(" ");
    var cat = palavras[0].substring(0, 4);
    var nom = palavras[1] ? palavras[1].substring(0, 4) : "item";
    var baseSku = PREFIXO + "-" + cat + "-" + nom;

    var varInputs = bloco.querySelectorAll(".variacoes-container input.campo");
    var variacoes = [];
    for (var v = 0; v < varInputs.length; v++) {
      var val = varInputs[v].value.trim();
      if (val !== "") variacoes.push(val);
    }

    var p = document.createElement("p");
    p.style.marginTop = "10px";
    p.style.fontWeight = "bold";
    p.style.color = "#333";
    p.textContent = "📦 " + produto;
    resultado.appendChild(p);

    if (variacoes.length === 0) {
      var el = document.createElement("p");
      if (db.includes(baseSku)) {
        el.className = "warn";
        el.textContent = "⚠ " + baseSku + " (já existia)";
        totalExistentes++;
      } else {
        db.push(baseSku);
        el.className = "ok";
        el.textContent = "✔ " + baseSku;
        totalNovos++;
      }
      resultado.appendChild(el);
    } else {
      for (var i = 0; i < variacoes.length; i++) {
        var codVar = gerarCodigoVariacao(baseSku, variacoes[i], db);
        var skuFinal = baseSku + "-" + codVar;
        var el2 = document.createElement("p");
        if (db.includes(skuFinal)) {
          el2.className = "warn";
          el2.textContent = "⚠ " + skuFinal + " (já existia)";
          totalExistentes++;
        } else {
          db.push(skuFinal);
          el2.className = "ok";
          el2.textContent = "✔ " + skuFinal;
          totalNovos++;
        }
        resultado.appendChild(el2);
      }
    }
  }

  saveDatabase(db);
  status.innerText = totalNovos + " novo(s), " + totalExistentes + " já existente(s)";
  status.style.color = "#333";
}

// ===== LISTA SKUs =====
function renderSkuList(filtro) {
  filtro = filtro || "";
  var container = document.getElementById("skuList");
  var counter = document.getElementById("skuCounter");
  var db = getDatabase();
  var filtrados = [];

  for (var i = 0; i < db.length; i++) {
    if (!filtro || db[i].toLowerCase().indexOf(filtro.toLowerCase()) !== -1) {
      filtrados.push({ sku: db[i], index: i });
    }
  }

  counter.textContent = "(" + db.length + ")";
  container.innerHTML = "";

  if (filtrados.length === 0) {
    var msg = document.createElement("div");
    msg.className = "empty-msg";
    msg.textContent = db.length === 0 ? "Nenhum SKU salvo ainda" : "Nenhum resultado";
    container.appendChild(msg);
    return;
  }

  for (var j = 0; j < filtrados.length; j++) {
    var item = document.createElement("div");
    item.className = "sku-item";
    item.setAttribute("data-index", filtrados[j].index);

    var span = document.createElement("span");
    span.className = "sku-text";
    span.textContent = filtrados[j].sku;

    var actions = document.createElement("div");
    actions.className = "sku-actions";

    var btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "✏️";
    btnEdit.setAttribute("data-idx", filtrados[j].index);
    btnEdit.addEventListener("click", function () {
      editarSku(parseInt(this.getAttribute("data-idx")));
    });

    var btnDel = document.createElement("button");
    btnDel.className = "btn-del";
    btnDel.textContent = "🗑";
    btnDel.setAttribute("data-idx", filtrados[j].index);
    btnDel.addEventListener("click", function () {
      excluirSku(parseInt(this.getAttribute("data-idx")));
    });

    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);
    item.appendChild(span);
    item.appendChild(actions);
    container.appendChild(item);
  }
}

function editarSku(index) {
  var db = getDatabase();
  var items = document.querySelectorAll("#skuList .sku-item");
  for (var i = 0; i < items.length; i++) {
    if (parseInt(items[i].getAttribute("data-index")) === index) {
      items[i].className = "sku-item editing";
      items[i].innerHTML = "";

      var input = document.createElement("input");
      input.type = "text";
      input.className = "campo";
      input.value = db[index];
      input.id = "editInput_" + index;

      var actions = document.createElement("div");
      actions.className = "sku-actions";

      var btnSave = document.createElement("button");
      btnSave.className = "btn-save";
      btnSave.textContent = "✔";
      btnSave.setAttribute("data-idx", index);
      btnSave.addEventListener("click", function () {
        salvarEdicao(parseInt(this.getAttribute("data-idx")));
      });

      var btnCancel = document.createElement("button");
      btnCancel.className = "btn-cancel";
      btnCancel.textContent = "✕";
      btnCancel.addEventListener("click", cancelarEdicao);

      actions.appendChild(btnSave);
      actions.appendChild(btnCancel);
      items[i].appendChild(input);
      items[i].appendChild(actions);
      input.focus();
    }
  }
}

function salvarEdicao(index) {
  var db = getDatabase();
  var val = document.getElementById("editInput_" + index).value.trim();
  if (!val) { alert("O SKU não pode ficar vazio"); return; }
  if (db.includes(val) && db[index] !== val) { alert("Esse SKU já existe!"); return; }
  db[index] = val;
  saveDatabase(db);
}

function cancelarEdicao() {
  var busca = document.getElementById("buscaSku");
  renderSkuList(busca ? busca.value : "");
}

function excluirSku(index) {
  if (!confirm("Deseja excluir este SKU?")) return;
  var db = getDatabase();
  db.splice(index, 1);
  saveDatabase(db);
}

function exportarCSV() {
  var db = getDatabase();
  if (db.length === 0) { alert("Nenhum SKU para exportar"); return; }
  var csv = "SKU\n" + db.join("\n") + "\n";
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
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
document.addEventListener("DOMContentLoaded", function () {

  // Verificar se já está logado
  if (!verificarSessao()) {
    document.getElementById("loginUser").focus();
  }

  // Login
  document.getElementById("btnLogin").addEventListener("click", fazerLogin);
  document.getElementById("loginPass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") fazerLogin();
  });
  document.getElementById("loginUser").addEventListener("keydown", function (e) {
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

  document.getElementById("toggleSalvos").addEventListener("click", function () {
    var secao = document.getElementById("secaoSalvos");
    var icon = document.getElementById("toggleIcon");
    var aberto = secao.style.display !== "none";
    secao.style.display = aberto ? "none" : "block";
    if (aberto) {
      icon.classList.remove("open");
    } else {
      icon.classList.add("open");
    }
  });
});
