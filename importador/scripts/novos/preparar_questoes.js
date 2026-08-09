const fs = require("fs");
const path = require("path");

const entrada = path.join(
    __dirname,
    "..",
    "..",
    "saida",
    "vestfacil_classificado.json"
);

const pastaSaida = path.join(
    __dirname,
    "..",
    "..",
    "json_novos"
);

const arquivoRemovidas = path.join(
    pastaSaida,
    "questoes_removidas.json"
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

    "Não classificado": ["nao-classificadas", "nao_classificadas"]
};

const grupos = {};
const removidas = [];

let totalOriginal = banco.length;
let totalValidas = 0;
let totalRemovidas = 0;

function verificarQuestao(questao) {

    if (!questao.enunciado) {
        return "Sem enunciado";
    }

    if (
        typeof questao.enunciado !== "string" ||
        questao.enunciado.trim().length < 30
    ) {
        return "Enunciado incompleto ou muito curto";
    }

    if (!Array.isArray(questao.alternativas)) {
        return "Sem alternativas";
    }

    if (questao.alternativas.length !== 5) {
        return "Quantidade de alternativas diferente de 5";
    }

    for (const alternativa of questao.alternativas) {

        if (
            alternativa === null ||
            alternativa === undefined ||
            typeof alternativa !== "string" ||
            alternativa.trim() === ""
        ) {
            return "Alternativa vazia ou incompleta";
        }
    }

    if (
        typeof questao.resposta !== "number" ||
        questao.resposta < 0 ||
        questao.resposta > 4
    ) {
        return "Resposta correta inválida";
    }

    return null;
}

for (const questao of banco) {

    const problema = verificarQuestao(questao);

    if (problema) {

        removidas.push({
            id: questao.id,
            banca: questao.banca,
            ano: questao.ano,
            numero: questao.numero,
            disciplina: questao.disciplina,
            conteudo: questao.conteudo,
            motivo: problema,
            enunciado: questao.enunciado || ""
        });

        totalRemovidas++;

        continue;
    }

    const categoria =
        questao.conteudo || "Não classificado";

    if (!grupos[categoria]) {
        grupos[categoria] = [];
    }

    grupos[categoria].push({
        id: questao.id,
        banca: questao.banca,
        ano: questao.ano,
        numero: questao.numero,
        disciplina: questao.disciplina,
        idioma: questao.idioma,
        conteudo: questao.conteudo,
        subconteudo: questao.subconteudo,
        dificuldade: questao.dificuldade,
        habilidade: questao.habilidade,
        enunciado: questao.enunciado,
        alternativas: questao.alternativas,
        resposta: questao.resposta,
        explicacao: questao.explicacao || "",
        imagem: questao.imagem || null
    });

    totalValidas++;
}

fs.mkdirSync(
    pastaSaida,
    { recursive: true }
);

fs.writeFileSync(
    arquivoRemovidas,
    JSON.stringify(removidas, null, 4),
    "utf8"
);

for (const categoria of Object.keys(grupos)) {

    const configuracao = pastas[categoria];

    if (!configuracao) {

        console.log(
            `Categoria não configurada: ${categoria}`
        );

        continue;
    }

    const pasta = path.join(
        pastaSaida,
        configuracao[0]
    );

    fs.mkdirSync(
        pasta,
        { recursive: true }
    );

    const arquivo = path.join(
        pasta,
        `${configuracao[1]}.json`
    );

    fs.writeFileSync(
        arquivo,
        JSON.stringify(
            grupos[categoria],
            null,
            4
        ),
        "utf8"
    );

    console.log(
        `${categoria}: ${grupos[categoria].length} questões válidas`
    );
}

console.log("");
console.log("======================================");
console.log("PREPARAÇÃO CONCLUÍDA!");
console.log("======================================");
console.log("");
console.log(`Total original: ${totalOriginal}`);
console.log(`Questões válidas: ${totalValidas}`);
console.log(`Questões removidas: ${totalRemovidas}`);
console.log("");
console.log("Questões removidas:");
console.log(arquivoRemovidas);
console.log("");
console.log("Novos JSON:");
console.log(pastaSaida);
console.log("");
console.log("O banco original NÃO foi alterado.");
console.log("======================================");