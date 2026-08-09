const fs = require("fs");
const path = require("path");

const pastaEntrada = path.join(
    __dirname,
    "..",
    "..",
    "json_novos"
);

const arquivoSaida = path.join(
    __dirname,
    "..",
    "..",
    "saida",
    "vestfacil.json"
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

const bancoFinal = [];

let totalLidas = 0;
let totalAdicionadas = 0;
let totalIgnoradas = 0;

function prepararQuestao(questao) {
    if (!questao || typeof questao !== "object") {
        return null;
    }

    if (
        typeof questao.enunciado !== "string" ||
        questao.enunciado.trim() === ""
    ) {
        return null;
    }

    if (!Array.isArray(questao.alternativas)) {
        return null;
    }

    if (questao.alternativas.length !== 5) {
        return null;
    }

    if (
        typeof questao.resposta !== "number" ||
        questao.resposta < 0 ||
        questao.resposta > 4
    ) {
        return null;
    }

    return {
        enunciado: questao.enunciado.trim(),
        alternativas: questao.alternativas.map(
            alternativa => alternativa.trim()
        ),
        resposta: questao.resposta,
        explicacao: questao.explicacao || ""
    };
}

for (const [pasta, arquivo] of arquivos) {
    const caminho = path.join(
        pastaEntrada,
        pasta,
        arquivo
    );

    if (!fs.existsSync(caminho)) {
        console.log(`Arquivo não encontrado: ${caminho}`);
        continue;
    }

    let questoes;

    try {
        questoes = JSON.parse(
            fs.readFileSync(caminho, "utf8")
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

    let adicionadasMateria = 0;

    for (const questao of questoes) {
        totalLidas++;

        const preparada = prepararQuestao(questao);

        if (!preparada) {
            totalIgnoradas++;
            continue;
        }

        bancoFinal.push(preparada);
        totalAdicionadas++;
        adicionadasMateria++;
    }

    console.log(
        `${arquivo}: ${adicionadasMateria} questões adicionadas`
    );
}

fs.mkdirSync(
    path.dirname(arquivoSaida),
    { recursive: true }
);

fs.writeFileSync(
    arquivoSaida,
    JSON.stringify(bancoFinal, null, 4),
    "utf8"
);

console.log("");
console.log("======================================");
console.log("VESTFACIL.JSON GERADO!");
console.log("======================================");
console.log("");
console.log(`Questões lidas: ${totalLidas}`);
console.log(`Questões adicionadas: ${totalAdicionadas}`);
console.log(`Questões ignoradas: ${totalIgnoradas}`);
console.log("");
console.log("Arquivo gerado:");
console.log(arquivoSaida);
console.log("");
console.log("Os arquivos originais NÃO foram alterados.");
console.log("======================================");