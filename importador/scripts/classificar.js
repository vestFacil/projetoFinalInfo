const fs = require("fs");
const path = require("path");
const { franc } = require("franc-min");

const entrada = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil.json"
);

const saida = path.join(
    __dirname,
    "..",
    "saida",
    "vestfacil_classificado.json"
);

const banco = JSON.parse(
    fs.readFileSync(entrada, "utf8")
);

function detectarIdioma(texto) {

    if (!texto || texto.trim().length < 30) {
        return null;
    }

    const idioma = franc(texto);

    if (idioma === "por") {
        return "Português";
    }

    if (idioma === "eng") {
        return "Inglês";
    }

    if (idioma === "spa") {
        return "Espanhol";
    }

    return null;
}

function classificar(questao) {

    const disciplina = questao.disciplina;

    const texto = (
        (questao.enunciado || "") +
        " " +
        (questao.alternativas || []).join(" ")
    ).trim();

    // MATEMÁTICA

    if (disciplina === "matematica") {
        return "Matemática";
    }

    // CIÊNCIAS HUMANAS

    if (disciplina === "ciencias-humanas") {

        if (
            texto.toLowerCase().includes("sócrates") ||
            texto.toLowerCase().includes("platão") ||
            texto.toLowerCase().includes("aristóteles") ||
            texto.toLowerCase().includes("filósofo") ||
            texto.toLowerCase().includes("filosofia")
        ) {
            return "Filosofia";
        }

        if (
            texto.toLowerCase().includes("sociologia") ||
            texto.toLowerCase().includes("sociedade") ||
            texto.toLowerCase().includes("classe social") ||
            texto.toLowerCase().includes("movimento social")
        ) {
            return "Sociologia";
        }

        if (
            texto.toLowerCase().includes("território") ||
            texto.toLowerCase().includes("territorial") ||
            texto.toLowerCase().includes("urbanização") ||
            texto.toLowerCase().includes("agricultura") ||
            texto.toLowerCase().includes("clima") ||
            texto.toLowerCase().includes("relevo") ||
            texto.toLowerCase().includes("população") ||
            texto.toLowerCase().includes("geografia")
        ) {
            return "Geografia";
        }

        if (
            texto.toLowerCase().includes("revolução") ||
            texto.toLowerCase().includes("império") ||
            texto.toLowerCase().includes("república") ||
            texto.toLowerCase().includes("colonial") ||
            texto.toLowerCase().includes("escravidão") ||
            texto.toLowerCase().includes("ditadura") ||
            texto.toLowerCase().includes("história")
        ) {
            return "História";
        }

        return "Não classificado";
    }

    // CIÊNCIAS DA NATUREZA

    if (disciplina === "ciencias-natureza") {

        const t = texto.toLowerCase();

        if (
            t.includes("célula") ||
            t.includes("células") ||
            t.includes("dna") ||
            t.includes("gene") ||
            t.includes("genética") ||
            t.includes("ecossistema") ||
            t.includes("organismo") ||
            t.includes("evolução") ||
            t.includes("espécie") ||
            t.includes("biologia")
        ) {
            return "Biologia";
        }

        if (
            t.includes("átomo") ||
            t.includes("átomos") ||
            t.includes("mol") ||
            t.includes("reação química") ||
            t.includes("substância") ||
            t.includes("ácido") ||
            t.includes("base") ||
            t.includes("química") ||
            t.includes("quimica")
        ) {
            return "Química";
        }

        if (
            t.includes("velocidade") ||
            t.includes("aceleração") ||
            t.includes("força") ||
            t.includes("energia") ||
            t.includes("potência") ||
            t.includes("corrente elétrica") ||
            t.includes("tensão elétrica") ||
            t.includes("movimento") ||
            t.includes("física") ||
            t.includes("fisica")
        ) {
            return "Física";
        }

        return "Não classificado";
    }

    // LINGUAGENS

    if (disciplina === "linguagens") {

        const idioma = detectarIdioma(texto);

        if (idioma === "Inglês") {
            return "Inglês";
        }

        if (idioma === "Espanhol") {
            return "Espanhol";
        }

        const t = texto.toLowerCase();

        if (
            t.includes("arte") ||
            t.includes("artista") ||
            t.includes("pintura") ||
            t.includes("escultura") ||
            t.includes("obra de arte") ||
            t.includes("música") ||
            t.includes("cinema") ||
            t.includes("teatro")
        ) {
            return "Artes";
        }

        if (
            t.includes("literatura") ||
            t.includes("poema") ||
            t.includes("poesia") ||
            t.includes("romance") ||
            t.includes("conto") ||
            t.includes("crônica") ||
            t.includes("autor") ||
            t.includes("escritor")
        ) {
            return "Literatura";
        }

        return "Português";
    }

    return "Não classificado";
}

const resultado = banco.map(questao => {

    return {
        ...questao,
        conteudo: classificar(questao)
    };

});

const contagem = {};

for (const questao of resultado) {

    const conteudo = questao.conteudo;

    contagem[conteudo] =
        (contagem[conteudo] || 0) + 1;
}

fs.writeFileSync(
    saida,
    JSON.stringify(resultado, null, 4),
    "utf8"
);

console.log("");
console.log("======================================");
console.log("CLASSIFICAÇÃO CONCLUÍDA");
console.log("======================================");
console.log("");

console.log(contagem);

console.log("");
console.log(`Total: ${resultado.length}`);

console.log("");
console.log("Arquivo criado:");
console.log("saida/vestfacil_classificado.json");

console.log("");
console.log("======================================");