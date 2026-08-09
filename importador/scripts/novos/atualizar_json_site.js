const fs = require("fs");
const path = require("path");

const pastaEntrada = path.join(
    __dirname,
    "..",
    "..",
    "json_novos"
);

const pastaSaida = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "src",
    "data"
);

const arquivos = [
    ["ciencias-humanas", "historia.json"],
    ["ciencias-humanas", "geografia.json"],
    ["ciencias-humanas", "filosofia.json"],
    ["ciencias-humanas", "sociologia.json"],

    ["ciencias-natureza", "biologia.json"],
    ["ciencias-natureza", "quimica.json"],
    ["ciencias-natureza", "fisica.json"],

    ["linguagens", "portugues.json"],
    ["linguagens", "literatura.json"],
    ["linguagens", "artes.json"],
    ["linguagens", "ingles.json"],
    ["linguagens", "espanhol.json"],

    ["matematica", "matematica.json"],

    ["nao-classificadas", "nao_classificadas.json"]
];

let total = 0;

for (const [pasta, arquivo] of arquivos) {

    const entrada = path.join(
        pastaEntrada,
        pasta,
        arquivo
    );

    if (!fs.existsSync(entrada)) {
        console.log(`Arquivo não encontrado: ${entrada}`);
        continue;
    }

    let questoes;

    try {
        questoes = JSON.parse(
            fs.readFileSync(entrada, "utf8")
        );
    } catch (erro) {
        console.log(
            `Erro ao ler ${arquivo}: ${erro.message}`
        );
        continue;
    }

    if (!Array.isArray(questoes)) {
        console.log(
            `Formato inválido: ${arquivo}`
        );
        continue;
    }

    const questoesVestFacil = questoes.map(questao => ({
        enunciado: questao.enunciado,
        alternativas: questao.alternativas,
        resposta: questao.resposta,
        explicacao: questao.explicacao || ""
    }));

    const pastaDestino = path.join(
        pastaSaida,
        pasta
    );

    fs.mkdirSync(
        pastaDestino,
        { recursive: true }
    );

    const destino = path.join(
        pastaDestino,
        arquivo
    );

    fs.writeFileSync(
        destino,
        JSON.stringify(
            questoesVestFacil,
            null,
            4
        ),
        "utf8"
    );

    total += questoesVestFacil.length;

    console.log(
        `${arquivo}: ${questoesVestFacil.length} questões atualizadas`
    );
}

console.log("");
console.log("======================================");
console.log("JSONs DO VESTFACIL ATUALIZADOS!");
console.log("======================================");
console.log(`Total de questões: ${total}`);
console.log("");
console.log("Pasta atualizada:");
console.log(pastaSaida);
console.log("======================================");