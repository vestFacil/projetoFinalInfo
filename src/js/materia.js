const titulo = document.getElementById("tituloMateria");
const lista = document.getElementById("listaConteudos");
const botoes = document.querySelectorAll(".btn-materia");

function formatarNome(texto) {
    return texto
        .replaceAll("_", " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

let materias = [];

async function carregarMaterias() {
    const resposta = await fetch("data/index.json");
    materias = await resposta.json();

    console.log(materias);
}

carregarMaterias();

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const nomeMateria = botao.dataset.materia;

        titulo.textContent = botao.textContent;

        const materia = materias.find(m => m.materia === nomeMateria);

        lista.innerHTML = "";

        materia.conteudos.forEach(conteudo => {

            lista.innerHTML += `
            <li class="item-conteudo"
                data-materia="${nomeMateria}"
                data-conteudo="${conteudo}">
                ${formatarNome(conteudo)}
            </li>
`;

        });

    });

});

lista.addEventListener("click", (evento) => {

    if(evento.target.classList.contains("item-conteudo")){

        console.log("clicou");

        const materia = evento.target.dataset.materia;
        const conteudo = evento.target.dataset.conteudo;

        window.location.href =
        `questao.html?materia=${materia}&conteudo=${conteudo}`;

    }

});