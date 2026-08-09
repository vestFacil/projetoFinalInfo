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
    "json"
);

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

for (const questao of banco) {

    const categoria = questao.conteudo;

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
        explicacao: questao.explicacao,
        imagem: questao.imagem
    });
}

for (const categoria of Object.keys(grupos)) {

    const dados = pastas[categoria];

    if (!dados) {
        console.log(`Categoria ignorada: ${categoria}`);
        continue;
    }

    const pasta = path.join(
        pastaSaida,
        dados[0]
    );

    fs.mkdirSync(pasta, {
        recursive: true
    });

    const arquivo = path.join(
        pasta,
        `${dados[1]}.json`
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
console.log("ORGANIZAÇÃO CONCLUÍDA!");
console.log("======================================");
console.log("");
console.log("As questões foram separadas em:");
console.log("importador/json/");
console.log("");