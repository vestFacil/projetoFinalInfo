const fs = require("fs");
const path = require("path");

const arquivo = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil_classificado.json"
);

const banco = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
);

const naoClassificadas = banco.filter(
    q =>
        q.disciplina === "matematica" &&
        q.conteudo === "Não classificado"
);

console.log("Total não classificadas:", naoClassificadas.length);
console.log("\n==============================\n");

naoClassificadas.slice(0, 30).forEach((q, i) => {

    console.log(`QUESTÃO ${i + 1}`);
    console.log(`Ano: ${q.ano}`);
    console.log(`Número: ${q.numero}`);
    console.log(`Enunciado:`);
    console.log(q.enunciado);
    console.log("\n------------------------------\n");

});