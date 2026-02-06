// ===== CONFIG =====
const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

// ===== BANCO =====
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
}

// ===== UTIL =====
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function gerarCodigoVariacao(baseSku, variacao, db) {
  let base = normalizar(variacao).replace(/\s+/g, "").substring(0, 4);
  if (!base) base = "base";

  let codigo = base;
  let contador = 2;

  while (db.includes(`${baseSku}-${codigo}`)) {
    codigo = `${base}${contador}`;
    contador++;
  }

  return codigo;
}

// ===== UI =====
function adicionarVariacao() {
  const div = document.getElementById("variacoes");
  const input = document.createElement("input");
  input.placeholder = "Ex: Verde";
  input.type = "text";
  div.appendChild(input);
}

// ===== GERA SKU =====
function gerarSKUs() {
  const produto = document.getElementById("produto").value;
  const resultado = document.getElementById("resultado");
  const status = document.getElementById("status");

  resultado.innerHTML = "";
  status.innerHTML = "";

  if (!produto) {
    status.innerText = "Digite o produto base";
    status.style.color = "red";
    return;
  }

  const palavras = normalizar(produto).split(" ");
  const categoria = palavras[0].substring(0, 4);
  const nome = palavras[1] ? palavras[1].substring(0, 4) : "item";
  const baseSku = `${PREFIXO}-${categoria}-${nome}`;

  const db = getDatabase();

  const variacoes = Array.from(document.querySelectorAll("#variacoes input"))
    .map(v => v.value)
    .filter(v => v.trim() !== "");

  let novos = 0;
  let existentes = 0;

  if (variacoes.length === 0) {
    if (db.includes(baseSku)) {
      resultado.innerHTML = `<p class="warn">⚠ ${baseSku} (já existia)</p>`;
      existentes++;
    } else {
      db.push(baseSku);
      resultado.innerHTML = `<p class="ok">✓ ${baseSku}</p>`;
      novos++;
    }
  } else {
    variacoes.forEach(v => {
      const codVar = gerarCodigoVariacao(baseSku, v, db);
      const skuFinal = `${baseSku}-${codVar}`;

      if (db.includes(skuFinal)) {
        resultado.innerHTML += `<p class="warn">⚠ ${skuFinal} (já existia)</p>`;
        existentes++;
      } else {
        db.push(skuFinal);
        resultado.innerHTML += `<p class="ok">✓ ${skuFinal}</p>`;
        novos++;
      }
    });
  }

  saveDatabase(db);
  status.innerText = `${novos} novo(s), ${existentes} já existente(s)`;
}

// ===== EVENTOS =====
document.addEventListener("DOMContentLoaded", () => {
  const btnVariacao = document.getElementById("btnVariacao");
  const btnGerar = document.getElementById("btnGerar");
  
  if (btnVariacao) {
    btnVariacao.addEventListener("click", adicionarVariacao);
  }
  
  if (btnGerar) {
    btnGerar.addEventListener("click", gerarSKUs);
  }
});
