const titulo = document.getElementById("tituloMateria");
const lista = document.getElementById("listaConteudos");
const botoes = document.querySelectorAll(".btn-materia");

function formatarNome(texto) {
    return texto
        .replaceAll("_", " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

const grupos = {
    "ciencias-humanas": [
        "historia",
        "geografia",
        "filosofia",
        "sociologia",
        "artes"
    ],

    "ciencias-natureza": [
        "biologia",
        "fisica",
        "quimica"
    ],

    "linguagens": [
        "portugues",
        "literatura",
        "ingles",
        "espanhol"
    ],

    "matematica": [
        "matematica"
    ]
};

const nomesGrupos = {
    "ciencias-humanas": "Ciências Humanas",
    "ciencias-natureza": "Ciências da Natureza",
    "linguagens": "Linguagens",
    "matematica": "Matemática"
};

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const grupo = botao.dataset.materia;

        titulo.textContent =
            nomesGrupos[grupo] || formatarNome(grupo);

        lista.innerHTML = "";

        const materias = grupos[grupo];

        if (!materias) {
            return;
        }

        materias.forEach(materia => {

            lista.innerHTML += `
                <li
                    class="item-conteudo"
                    data-materia="${materia}"
                >
                    ${formatarNome(materia)}
                </li>
            `;
        });
    });
});

lista.addEventListener("click", evento => {

    const item = evento.target.closest(".item-conteudo");

    if (!item) {
        return;
    }

    const materia = item.dataset.materia;

    window.location.href =
        `questao.html?materia=${materia}`;
});