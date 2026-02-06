const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

const CATEGORIAS = {
  "BLUSA": "blus",
  "VESTIDO": "vest"
};

function getDatabase() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function normalizar(txt) {
  return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function abreviar(txt, n) {
  return txt.substring(0, n).toLowerCase();
}

function adicionarVariacao() {
  const input = document.createElement("input");
  input.placeholder = "Ex: Azul";
  document.getElementById("variacoes").appendChild(input);
}

function gerarSKUs() {
  const produto = document.getElementById("produto").value;
  const status = document.getElementById("status");
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  if (!produto) {
    status.textContent = "Digite o produto base";
    return;
  }

  const palavras = normalizar(produto).split(" ");
  const categoria = CATEGORIAS[palavras[0]] || abreviar(palavras[0], 4);
  const nome = abreviar(palavras[1] || "", 4);

  const db = getDatabase();
  let novos = 0;

  document.querySelectorAll("#variacoes input").forEach(v => {
    if (!v.value) return;

    const cor = abreviar(normalizar(v.value), 3);
    const sku = `${PREFIXO}-${categoria}-${nome}-${cor}`;

    if (!db.includes(sku)) {
      db.push(sku);
      resultado.innerHTML += `<p>${sku}</p>`;
      novos++;
    }
  });

  saveDatabase(db);
  status.textContent = novos ? "SKUs gerados com sucesso" : "Todos já existiam";
}
