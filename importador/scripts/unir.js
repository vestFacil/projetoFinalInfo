const fs = require("fs");
const path = require("path");

const pastaEntrada = path.join(__dirname, "..", "json");
const pastaSaida = path.join(__dirname, "..", "saida");

const banco = [];

const arquivos = fs
    .readdirSync(pastaEntrada)
    .filter(arquivo => arquivo.endsWith(".json"));

for (const arquivo of arquivos) {

    console.log("Lendo:", arquivo);

    const caminho = path.join(pastaEntrada, arquivo);

    const questoes = JSON.parse(
        fs.readFileSync(caminho, "utf8")
    );

    banco.push(...questoes);

}

if (!fs.existsSync(pastaSaida)) {
    fs.mkdirSync(pastaSaida);
}

fs.writeFileSync(

    path.join(pastaSaida, "banco_questoes.json"),

    JSON.stringify(banco, null, 4),

    "utf8"

);

console.log("");
console.log("=================================");
console.log(`Total de questões: ${banco.length}`);
console.log("Arquivo criado com sucesso!");
console.log("saida/banco_questoes.json");
console.log("=================================");