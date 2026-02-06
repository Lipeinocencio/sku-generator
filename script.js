const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

const CATEGORIAS = {
  "VESTIDO": "vest",
  "BLUSA": "blus",
  "CALCA": "calc",
  "SAIA": "saia"
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

function abreviar(palavra, tamanho) {
  return palavra.substring(0, tamanho).toLowerCase();
}

function adicionarVariacao() {
  const div = document.createElement("div");
  div.className = "variacao";
  div.innerHTML = `<input type="text" placeholder="Ex: Azul" />`;
  document.getElementById("variacoes").appendChild(div);
}

function gerarSKUs() {
  const produtoInput = document.getElementById("produto").value;
  const status = document.getElementById("status");
  const resultado = document.getElementById("resultado");

  resultado.innerHTML = "";
  status.textContent = "";

  if (!produtoInput) {
    status.textContent = "Digite o produto base.";
    status.style.color = "red";
    return;
  }

  const palavrasProduto = normalizar(produtoInput).split(" ");
  const categoria = CATEGORIAS[palavrasProduto[0]] || abreviar(palavrasProduto[0], 4);
  const nomeProduto = abreviar(palavrasProduto[1] || "", 4);

  const db = getDatabase();
  let novos = 0;

  document.querySelectorAll("#variacoes input").forEach(input => {
    if (!input.value) return;

    const cor = abreviar(normalizar(input.value), 3);
    const sku = `${PREFIXO}-${categoria}-${nomeProduto}-${cor}`;

    if (!db.includes(sku)) {
      db.push(sku);
      const p = document.createElement("p");
      p.textContent = sku;
      resultado.appendChild(p);
      novos++;
    }
  });

  saveDatabase(db);

  status.textContent = novos
    ? "SKUs gerados e salvos com sucesso!"
    : "Nenhum SKU novo foi gerado (todos já existiam).";
  status.style.color = novos ? "green" : "orange";
}
