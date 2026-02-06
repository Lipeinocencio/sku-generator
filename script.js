const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

const CATEGORIAS = {
  "BLUSA": "blus",
  "VESTIDO": "vest",
  "CALCA": "calc"
};

function getDatabase() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function normalizar(txt) {
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function abreviar(txt, n) {
  return txt.substring(0, n).toLowerCase();
}

function adicionarVariacao() {
  const div = document.getElementById("variacoes");
  div.style.display = "block";

  const input = document.createElement("input");
  input.placeholder = "Ex: Verde";
  div.appendChild(input);
}

function gerarSKUs() {
  const produto = document.getElementById("produto").value;
  const status = document.getElementById("status");
  const resultado = document.getElementById("resultado");

  resultado.innerHTML = "";
  status.textContent = "";

  if (!produto) {
    status.textContent = "Digite o produto.";
    status.style.color = "red";
    return;
  }

  const palavras = normalizar(produto).split(" ");
  const categoria = CATEGORIAS[palavras[0]] || abreviar(palavras[0], 4);
  const nome = abreviar(palavras[1] || "", 4);

  const db = getDatabase();
  let novos = 0;
  let existentes = 0;

  const variacoes = document.querySelectorAll("#variacoes input");

  // 👉 SEM VARIAÇÃO
  if (variacoes.length === 0) {
    const sku = `${PREFIXO}-${categoria}-${nome}`;

    if (db.includes(sku)) {
      resultado.innerHTML = `<p style="color:orange">⚠ ${sku} (já existia)</p>`;
      existentes++;
    } else {
      db.push(sku);
      resultado.innerHTML = `<p style="color:green">✔ ${sku}</p>`;
      novos++;
    }
  }

  // 👉 COM VARIAÇÕES
  variacoes.forEach(v => {
    if (!v.value) return;

    const cor = abreviar(normalizar(v.value), 3);
    const sku = `${PREFIXO}-${categoria}-${nome}-${cor}`;

    if (db.includes(sku)) {
      resultado.innerHTML += `<p style="color:orange">⚠ ${sku} (já existia)</p>`;
      existentes++;
    } else {
      db.push(sku);
      resultado.innerHTML += `<p style="color:green">✔ ${sku}</p>`;
      novos++;
    }
  });

  saveDatabase(db);

  if (novos || existentes) {
    status.textContent = `${novos} novo(s), ${existentes} já existente(s)`;
    status.style.color = "black";
  }
}
