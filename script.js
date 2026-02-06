const STORAGE_KEY = "sku_database";
const PREFIXO = "mag";

const CATEGORIAS = {
  blusa: "blus",
  vestido: "vest",
  calca: "calc"
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

function gerarCodigoVariacao(baseSku, variacao, db) {
  let base = normalizar(variacao).replace(/\s+/g, "").substring(0, 4);
  let codigo = base || "base";
  let contador = 2;

  while (db.includes(`${baseSku}-${codigo}`)) {
    codigo = `${base}${contador}`;
    contador++;
  }

  return codigo;
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
  const categoria = CATEGORIAS[palavras[0]] || palavras[0].substring(0, 4);
  const nome = palavras[1] ? palavras[1].substring(0, 4) : "item";

  const baseSku = `${PREFIXO}-${categoria}-${nome}`;
  const db = getDatabase();

  let novos = 0;
  let existentes = 0;

  const variacoes = Array.from(
    document.querySelectorAll("#variacoes input")
  ).filter(v => v.type !== "hidden" && v.value.trim() !== "");

  // 🔹 SEM VARIAÇÃO
  if (variacoes.length === 0) {
    if (db.includes(baseSku)) {
      resultado.innerHTML = `<p style="color:orange">⚠ ${baseSku} (já existia)</p>`;
      existentes++;
    } else {
      db.push(baseSku);
      resultado.innerHTML = `<p style="color:green">✔ ${baseSku}</p>`;
      novos++;
    }

    saveDatabase(db);
    status.textContent = `${novos} novo(s), ${existentes} já existente(s)`;
    return;
  }

  // 🔹 COM VARIAÇÕES
  variacoes.forEach(v => {
    const codigoVariacao = gerarCodigoVariacao(baseSku, v.value, db);
    const skuFinal = `${baseSku}-${codigoVariacao}`;

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
