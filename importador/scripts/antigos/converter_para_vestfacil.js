const fs = require("fs");
const path = require("path");

const entrada = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil_classificado.json"
);

const pastaSaida = path.join(
    __dirname,
    "..",
    "json_vestfacil"
);

if (!fs.existsSync(entrada)) {
    console.error("ERRO: arquivo vestfacil_classificado.json não encontrado.");
    process.exit(1);
}

const banco = JSON.parse(
    fs.readFileSync(entrada, "utf8")
);

const pastas = {
    "História": ["ciencias-humanas", "historia"],
    "Geografia": ["ciencias-humanas", "geografia"],
    "Filosofia": ["ciencias-humanas", "filosofia"],
    "Sociologia": ["ciencias-humanas", "sociologia"],

    "Biologia": ["ciencias-natureza", "biologia"],
    "Química": ["ciencias-natureza", "quimica"],
    "Física": ["ciencias-natureza", "fisica"],

    "Português": ["linguagens", "portugues"],
    "Literatura": ["linguagens", "literatura"],
    "Artes": ["linguagens", "artes"],
    "Inglês": ["linguagens", "ingles"],
    "Espanhol": ["linguagens", "espanhol"],

    "Matemática": ["matematica", "matematica"],

    "Não classificado": ["nao-classificado", "nao-classificado"]
};

const grupos = {};
let totalConvertidas = 0;
let totalComImagem = 0;
let totalSemAlternativas = 0;

for (const questao of banco) {

    const categoria = questao.conteudo || "Não classificado";

    if (!grupos[categoria]) {
        grupos[categoria] = [];
    }

    const alternativas = Array.isArray(questao.alternativas)
        ? questao.alternativas
        : [];

    const temAlternativasValidas =
        alternativas.length === 5 &&
        alternativas.every(alternativa =>
            alternativa !== null &&
            alternativa !== undefined
        );

    if (!temAlternativasValidas) {
        totalSemAlternativas++;
    }

    if (
        questao.imagem ||
        alternativas.some(alternativa =>
            typeof alternativa === "string" &&
            alternativa.includes("enem.dev")
        )
    ) {
        totalComImagem++;
    }

    const novaQuestao = {
        enunciado: questao.enunciado || "",
        alternativas: alternativas,
        resposta:
            typeof questao.resposta === "number"
                ? questao.resposta
                : null,
        explicacao: questao.explicacao || ""
    };

    grupos[categoria].push(novaQuestao);

    totalConvertidas++;
}

fs.mkdirSync(pastaSaida, {
    recursive: true
});

for (const categoria of Object.keys(grupos)) {

    const configuracao = pastas[categoria];

    if (!configuracao) {
        console.log(
            `Categoria sem configuração: ${categoria}`
        );
        continue;
    }

    const pasta = path.join(
        pastaSaida,
        configuracao[0]
    );

    fs.mkdirSync(pasta, {
        recursive: true
    });

    const arquivo = path.join(
        pasta,
        `${configuracao[1]}.json`
    );

    fs.writeFileSync(
        arquivo,
        JSON.stringify(grupos[categoria], null, 4),
        "utf8"
    );

    console.log(
        `${categoria}: ${grupos[categoria].length} questões`
    );
}

console.log("");
console.log("======================================");
console.log("CONVERSÃO CONCLUÍDA!");
console.log("======================================");
console.log("");
console.log(`Total convertido: ${totalConvertidas}`);
console.log(`Questões com possíveis imagens: ${totalComImagem}`);
console.log(`Questões com alternativas incompletas: ${totalSemAlternativas}`);
console.log("");
console.log("Arquivos criados em:");
console.log("json_vestfacil/");
console.log("");
console.log("O banco original NÃO foi alterado.");
console.log("======================================");