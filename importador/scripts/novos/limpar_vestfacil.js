const fs = require("fs");
const path = require("path");

const entrada = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "src",
    "data",
    "vestfacil.json"
);

const saida = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "src",
    "data",
    "vestfacil_limpo.json"
);

const removidas = [];

const banco = JSON.parse(
    fs.readFileSync(entrada, "utf8")
);

function vazio(valor) {
    return (
        valor === null ||
        valor === undefined ||
        valor === "" ||
        (typeof valor === "string" && valor.trim() === "")
    );
}

function temNullOuVazio(obj) {
    if (vazio(obj)) {
        return true;
    }

    if (Array.isArray(obj)) {
        return obj.some(item => temNullOuVazio(item));
    }

    if (typeof obj === "object") {
        return Object.values(obj).some(valor => temNullOuVazio(valor));
    }

    return false;
}

const questoes = Array.isArray(banco)
    ? banco
    : banco.questoes;

if (!Array.isArray(questoes)) {
    console.error("ERRO: não encontrei a lista de questões.");
    process.exit(1);
}

const validas = questoes.filter((questao, indice) => {

    if (temNullOuVazio(questao)) {
        removidas.push({
            indice,
            questao,
            motivo: "Possui campo null ou vazio"
        });

        return false;
    }

    return true;
});

const resultado = Array.isArray(banco)
    ? validas
    : {
        ...banco,
        questoes: validas
    };

fs.writeFileSync(
    saida,
    JSON.stringify(resultado, null, 4),
    "utf8"
);

console.log("");
console.log("================================");
console.log(" LIMPEZA DO VESTFACIL");
console.log("================================");
console.log("");

console.log(`Total original: ${questoes.length}`);
console.log(`Questões mantidas: ${validas.length}`);
console.log(`Questões removidas: ${removidas.length}`);

console.log("");
console.log(`Arquivo criado: ${saida}`);
console.log("");