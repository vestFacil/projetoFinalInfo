const fs = require("fs");
const path = require("path");

console.log("Iniciando...");

const arquivoEntrada = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "index.json"
);

const arquivoSaida = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "index_novo.json"
);

console.log("Lendo:");
console.log(arquivoEntrada);

if (!fs.existsSync(arquivoEntrada)) {
    console.log("❌ Não encontrei o index.json nesse caminho.");
    process.exit(1);
}

const dados = JSON.parse(
    fs.readFileSync(arquivoEntrada, "utf8")
);

const grupos = {
    linguagens: [
        "portugues",
        "literatura",
        "ingles",
        "espanhol",
        "artes",
        "educacao_fisica"
    ],

    "ciencias-humanas": [
        "historia",
        "geografia",
        "filosofia",
        "sociologia"
    ],

    "ciencias-natureza": [
        "biologia",
        "fisica",
        "quimica"
    ],

    matematica: [
        "matematica"
    ]
};

const nomesGrupos = {
    linguagens: "Linguagens",
    "ciencias-humanas": "Ciências Humanas",
    "ciencias-natureza": "Ciências da Natureza",
    matematica: "Matemática"
};

const nomesMaterias = {
    portugues: "Português",
    literatura: "Literatura",
    ingles: "Inglês",
    espanhol: "Espanhol",
    artes: "Artes",
    educacao_fisica: "Educação Física",
    historia: "História",
    geografia: "Geografia",
    filosofia: "Filosofia",
    sociologia: "Sociologia",
    biologia: "Biologia",
    quimica: "Química",
    fisica: "Física",
    matematica: "Matemática"
};

const novoIndex = {
    areas: [],
    nao_classificadas: {
        id: "nao_classificadas",
        nome: "Questões não classificadas"
    }
};

for (const [idGrupo, materias] of Object.entries(grupos)) {

    const materiasEncontradas = materias
        .filter(materia =>
            dados.some(item => item.materia === materia)
        )
        .map(materia => ({
            id: materia,
            nome: nomesMaterias[materia]
        }));

    novoIndex.areas.push({
        id: idGrupo,
        nome: nomesGrupos[idGrupo],
        materias: materiasEncontradas
    });
}

fs.writeFileSync(
    arquivoSaida,
    JSON.stringify(novoIndex, null, 2),
    "utf8"
);

console.log("");
console.log("✅ DEU CERTO!");
console.log("Novo arquivo criado em:");
console.log(arquivoSaida);