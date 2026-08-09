const fs = require("fs");
const path = require("path");

const entrada = path.join(__dirname, "..", "saida", "banco_questoes.json");
const saida = path.join(__dirname, "..", "saida", "vestfacil.json");

const questoes = JSON.parse(fs.readFileSync(entrada, "utf8"));

const novoBanco = questoes.map((q, indice) => {

    const alternativas = q.alternatives.map(a => a.text);

    const resposta = q.alternatives.findIndex(a => a.isCorrect);

    return {

        id: indice + 1,

        banca: "ENEM",

        ano: q.year,

        numero: q.index,

        disciplina: q.discipline,

        idioma: q.language,

        conteudo: "",

        subconteudo: "",

        dificuldade: "",

        habilidade: "",

        enunciado:
            q.context +
            "\n\n" +
            q.alternativesIntroduction,

        alternativas,

        resposta,

        explicacao: "",

        imagem:
            q.files.length > 0
                ? q.files[0].url
                : null

    };

});

fs.writeFileSync(
    saida,
    JSON.stringify(novoBanco, null, 4),
    "utf8"
);

console.log("=================================");
console.log("Conversão concluída!");
console.log(`Questões convertidas: ${novoBanco.length}`);
console.log("Arquivo criado:");
console.log("saida/vestfacil.json");
console.log("=================================");