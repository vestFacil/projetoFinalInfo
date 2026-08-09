const titulo = document.getElementById("tituloMateria");
const lista = document.getElementById("listaConteudos");
const botoes = document.querySelectorAll(".btn-materia");

let dados = null;

function formatarNome(texto) {
    return texto
        .replaceAll("_", " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

fetch("data/index_novo.json")
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o index.json");
        }

        return resposta.json();
    })
    .then(json => {
        dados = json;
    })
    .catch(erro => {
        console.error(erro);
        titulo.textContent = "Erro ao carregar as matérias.";
    });

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const grupo = botao.dataset.materia;

        lista.innerHTML = "";

        if (grupo === "nao_classificadas") {

            titulo.textContent = "Questões não classificadas";

            lista.innerHTML = `
                <li
                    class="item-conteudo"
                    data-materia="nao_classificadas"
                >
                    Questões não classificadas
                </li>
            `;

            return;
        }

        if (!dados) {
            return;
        }

        const area = dados.areas.find(
            item => item.id === grupo
        );

        if (!area) {
            return;
        }

        titulo.textContent = area.nome;

        area.materias.forEach(materia => {

            lista.innerHTML += `
                <li
                    class="item-conteudo"
                    data-materia="${materia.id}"
                >
                    ${materia.nome}
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