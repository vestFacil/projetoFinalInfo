const fs = require("fs");
const path = require("path");

const origem = path.join(
    __dirname,
    "..",
    "json_vestfacil"
);

const destino = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "data"
);

const mapa = {
    "historia.json": "historia",
    "geografia.json": "geografia",
    "filosofia.json": "filosofia",
    "sociologia.json": "sociologia",

    "biologia.json": "biologia",
    "quimica.json": "quimica",
    "fisica.json": "fisica",

    "portugues.json": "portugues",
    "literatura.json": "literatura",
    "artes.json": "artes",
    "ingles.json": "ingles",
    "espanhol.json": "espanhol",

    "matematica.json": "matematica"
};

const grupos = [
    "ciencias-humanas",
    "ciencias-natureza",
    "linguagens",
    "matematica"
];

let total = 0;

for (const grupo of grupos) {

    const pastaOrigem = path.join(
        origem,
        grupo
    );

    if (!fs.existsSync(pastaOrigem)) {
        continue;
    }

    const arquivos = fs.readdirSync(
        pastaOrigem
    );

    for (const arquivo of arquivos) {

        const pastaDestino = mapa[arquivo];

        if (!pastaDestino) {
            continue;
        }

        const arquivoOrigem = path.join(
            pastaOrigem,
            arquivo
        );

        const pastaFinal = path.join(
            destino,
            pastaDestino
        );

        const arquivoFinal = path.join(
            pastaFinal,
            arquivo
        );

        fs.mkdirSync(
            pastaFinal,
            { recursive: true }
        );

        fs.copyFileSync(
            arquivoOrigem,
            arquivoFinal
        );

        console.log(
            `${arquivo} -> data/${pastaDestino}/${arquivo}`
        );

        total++;
    }
}

console.log("");
console.log("======================================");
console.log("ATUALIZAÇÃO CONCLUÍDA!");
console.log("======================================");
console.log("");
console.log(`Arquivos atualizados: ${total}`);
console.log("");
console.log("O backup continua em:");
console.log("src/data_backup/");
console.log("======================================");