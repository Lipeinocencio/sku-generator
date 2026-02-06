const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

// abreviações fixas de categorias
const CATEGORIAS = {
  "VESTIDO": "vest",
  "BLUSA": "blus",
  "CALCA": "calc",
  "SAIA": "saia",
  "SHORT": "shrt"
};

function getDatabase() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function abreviar(palavra, tamanho = 4) {
  return palavra.substring(0, tamanho).toLowerCase();
}

function gerarSKU() {
  const produtoInput = document.getElementById("produto").value;
  const status = document.getElementById("status");

  if (!produtoInput) {
    status.textContent = "Digite o nome do produto.";
    status.style.color = "red";
    return;
  }

  const palavras = normalizar(produtoInput).split(" ");

  const categoria = CATEGORIAS[palavras[0]] || abreviar(palavras[0], 4);
  const nomeProduto = abreviar(palavras[1] || "", 4);
  const cor = abreviar(palavras[2] || "", 3);

  const sku = `${PREFIXO}-${categoria}-${nomeProduto}-${cor}`;

  const db = getDatabase();

  if (db.includes(sku)) {
    status.textContent = "⚠️ SKU já existe.";
    status.style.color = "red";
    document.getElementById("sku").value = "";
    return;
  }

  db.push(sku);
  saveDatabase(db);

  document.getElementById("sku").value = sku;
  status.textContent = "SKU salvo com sucesso!";
  status.style.color = "green";
}

function copiarSKU() {
  const skuField = document.getElementById("sku");
  if (!skuField.value) return;

  skuField.select();
  document.execCommand("copy");
  alert("SKU copiado!");
}
