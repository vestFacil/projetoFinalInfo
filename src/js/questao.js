const url = new URLSearchParams(window.location.search);

const materia = url.get("materia");
const conteudo = url.get("conteudo");


const titulo = document.getElementById("titulo");
const enunciado = document.getElementById("enunciado");
const alternativas = document.getElementById("alternativas");


async function carregarQuestao(){

    const resposta = await fetch(
        `data/${materia}/${conteudo}.json`
    );

    const questoes = await resposta.json();

    const questao = questoes[0];


    titulo.textContent =
        `${materia} - ${conteudo}`;


    enunciado.textContent =
        questao.enunciado;


    questao.alternativas.forEach((alt, index)=>{

        alternativas.innerHTML += `
            <label>
                <input type="radio" name="resposta" value="${index}">
                ${alt}
            </label>
            <br>
        `;

    });

}


carregarQuestao();