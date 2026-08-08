const fs = require("fs");
const path = require("path");

const arquivo = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil.json"
);

const banco = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
);

const questoes = banco.filter(
    q => q.disciplina === "linguagens"
);

const palavrasEspanhol = [
    " el ",
    " la ",
    " los ",
    " las ",
    " que ",
    " una ",
    " por ",
    " para ",
    " con ",
    " del "
];

const palavrasIngles = [
    " the ",
    " and ",
    " of ",
    " to ",
    " in ",
    " is ",
    " are ",
    " with ",
    " from ",
    " for "
];

function contarPalavras(texto, palavras) {

    texto = ` ${texto.toLowerCase()} `;

    return palavras.filter(
        palavra => texto.includes(palavra)
    ).length;
}

let espanhol = [];
let ingles = [];

for (const q of questoes) {

    const texto = q.enunciado || "";

    const qtdEspanhol =
        contarPalavras(texto, palavrasEspanhol);

    const qtdIngles =
        contarPalavras(texto, palavrasIngles);

    if (qtdEspanhol >= 4 && qtdEspanhol > qtdIngles) {
        espanhol.push(q);
    }

    if (qtdIngles >= 4 && qtdIngles > qtdEspanhol) {
        ingles.push(q);
    }
}

console.log("================================");
console.log("POSSÍVEIS QUESTÕES EM ESPANHOL");
console.log("================================");

console.log("Total:", espanhol.length);

espanhol.slice(0, 10).forEach(q => {

    console.log(`\nAno: ${q.ano}`);
    console.log(`Número: ${q.numero}`);
    console.log(q.enunciado?.substring(0, 500));
});

console.log("\n================================");
console.log("POSSÍVEIS QUESTÕES EM INGLÊS");
console.log("================================");

console.log("Total:", ingles.length);

ingles.slice(0, 10).forEach(q => {

    console.log(`\nAno: ${q.ano}`);
    console.log(`Número: ${q.numero}`);
    console.log(q.enunciado?.substring(0, 500));
});