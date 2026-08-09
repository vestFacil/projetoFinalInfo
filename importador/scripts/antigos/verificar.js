const fs = require("fs");
const path = require("path");

const arquivo = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil.json"
);

const questoes = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
);

const disciplinas = {};

for (const questao of questoes) {

    const disciplina =
        questao.disciplina || "sem disciplina";

    disciplinas[disciplina] =
        (disciplinas[disciplina] || 0) + 1;
}

console.log("\nDISCIPLINAS ENCONTRADAS:\n");

console.log(disciplinas);

console.log("\nTOTAL DE QUESTÕES:");
console.log(questoes.length);