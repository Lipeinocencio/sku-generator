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
    .toLowerCase()
    .trim();
}

function abreviarSeguro(baseSku, sufixo, db) {
  let codigo = sufixo.substring(0, 4);
  let tentativa = codigo;
  let contador = 2;

  while (db.some(sku => sku.startsWith(`${baseSku}-${tentativa}`))) {
    tentativa = `${codigo}${contador}`;
    contador++;
  }

  return tentativa;
}

function adicionarVariacao() {
  const div = document.getElementById("variacoes");
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
    status.textContent = "Digite o produto base.";
    status.style.color = "red";
    return;
  }

  const palavras = normalizar(produto).split(" ");
  const categoria = CATEGORIAS[palavras[0].toUpperCase()] || palavras[0].substring(0, 4);
  const nome = palavras[1] ? palavras[1].substring(0, 4) : "item";

  const baseSku = `${PREFIXO}-${categoria}-${nome}`;
  const db = getDatabase();

  let novos = 0;
  let existentes = 0;

  const variacoes = document.querySelectorAll("#variacoes input");

  if (variacoes.length === 0) {
    if (db.includes(baseSku)) {
      resultado.innerHTML = `<p style="color:orange">⚠ ${baseSku} (já existia)</p>`;
      existentes++;
    } else {
      db.push(baseSku);
      resultado.innerHTML = `<p style="color:green">✔ ${baseSku}</p>`;
      novos++;
    }
  }

  variacoes.forEach(v => {
    if (!v.value) return;

    const sufixo = normalizar(v.value);
    const codigoSeguro = abreviarSeguro(baseSku, sufixo, db);
    const skuFinal = `${baseSku}-${codigoSeguro}`;

    if (db.includes(skuFinal)) {
      resultado.innerHTML += `<p style="color:orange">⚠ ${skuFinal} (já existia)</p>`;
      existentes++;
    } else {
      db.push(skuFinal);
      resultado.innerHTML += `<p style="color:green">✔ ${skuFinal}</p>`;
      novos++;
    }
  });

  saveDatabase(db);
  status.textContent = `${novos} novo(s), ${existentes} já existente(s)`;
}
