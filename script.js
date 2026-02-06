const STORAGE_KEY = "sku_database";

function getDatabase() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function formatarSKU(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "-");
}

function gerarSKU() {
  const produto = document.getElementById("produto").value;
  const status = document.getElementById("status");

  if (!produto) {
    status.textContent = "Digite o nome do produto.";
    status.style.color = "red";
    return;
  }

  const sku = formatarSKU(produto);
  const db = getDatabase();

  if (db.includes(sku)) {
    status.textContent = "⚠️ SKU já existe! Produto duplicado.";
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
