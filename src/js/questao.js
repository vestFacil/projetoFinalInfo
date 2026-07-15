const url = new URLSearchParams(window.location.search);

const materia = url.get("materia");
const conteudo = url.get("conteudo");

const titulo = document.getElementById("titulo");
const enunciado = document.getElementById("enunciado");
const alternativas = document.getElementById("alternativas");

const botaoResponder = document.getElementById("responder");
const botaoProxima = document.getElementById("proxima");

const resultado = document.getElementById("resultado");
const contador = document.getElementById("contador");

const quantidade = document.getElementById("quantidade");
const iniciar = document.getElementById("iniciar");

const popup = document.getElementById("popupConfiguracao");
const areaQuestao = document.getElementById("questao");

let respostaCorreta;
let explicacao;

let questoes = [];
let questoesSelecionadas = [];

let numeroQuestao = 0;
let pontos = 0;
let respondeu = false;
let quantidadeQuestoes = 10;

function salvarProgresso() {

    const progresso = {
        materia,
        conteudo,
        questoes: questoesSelecionadas,
        numeroQuestao,
        pontos,
        quantidade: quantidadeQuestoes
    };

    localStorage.setItem(
        "progressoQuestao",
        JSON.stringify(progresso)
    );
}

function carregarProgresso() {

    const salvo = localStorage.getItem("progressoQuestao");

    if (!salvo) {
        return false;
    }

    const progresso = JSON.parse(salvo);

    if (
        progresso.materia !== materia ||
        progresso.conteudo !== conteudo
    ) {
        return false;
    }

    questoesSelecionadas = progresso.questoes;
    numeroQuestao = progresso.numeroQuestao;
    pontos = progresso.pontos;
    quantidadeQuestoes = progresso.quantidade;

    quantidade.value = quantidadeQuestoes;

    mostrarQuestao();

    return true;
}

iniciar.addEventListener("click", async () => {

    quantidadeQuestoes = Number(quantidade.value);

    popup.style.display = "none";

    const continuando = carregarProgresso();

    if (!continuando) {
        await carregarQuestoes();
    }

});

async function carregarQuestoes() {

    const resposta = await fetch(
        `data/${materia}/${conteudo}.json`
    );

    questoes = await resposta.json();

    questoesSelecionadas = questoes
        .sort(() => Math.random() - 0.5)
        .slice(0, quantidadeQuestoes);

    numeroQuestao = 0;
    pontos = 0;

    mostrarQuestao();

}

function mostrarQuestao() {

    respondeu = false;

    botaoResponder.disabled = false;
    botaoProxima.disabled = true;

    const questao = questoesSelecionadas[numeroQuestao];

    respostaCorreta = questao.resposta;
    explicacao = questao.explicacao;

    titulo.textContent = `${materia} - ${conteudo}`;

    contador.textContent =
        `Questão ${numeroQuestao + 1} de ${questoesSelecionadas.length}`;

    enunciado.textContent = questao.enunciado;

    alternativas.innerHTML = "";
    resultado.textContent = "";

    questao.alternativas.forEach((alt, index) => {

        alternativas.innerHTML += `
            <label class="alternativa" data-index="${index}">
                <input type="radio" name="resposta" value="${index}">
                ${alt}
            </label>
        `;

    });

}

botaoResponder.addEventListener("click", () => {

    if (respondeu) return;

    const selecionada = document.querySelector(
        'input[name="resposta"]:checked'
    );

    if (!selecionada) {

        resultado.textContent = "Escolha uma alternativa!";
        return;

    }

    respondeu = true;

    botaoResponder.disabled = true;
    botaoProxima.disabled = false;

    document
        .querySelectorAll('input[name="resposta"]')
        .forEach(radio => {
            radio.disabled = true;
        });

    const valorSelecionado = Number(selecionada.value);

    if (valorSelecionado === respostaCorreta) {

        resultado.textContent =
            "✅ Você acertou!\n\n" + explicacao;

        pontos++;

    } else {

        resultado.textContent =
            "❌ Você errou!\n\n" + explicacao;

    }

    document
        .querySelectorAll(".alternativa")
        .forEach(alternativa => {

            const valor = Number(alternativa.dataset.index);

            if (valor === respostaCorreta) {
                alternativa.classList.add("correta");
            }

            if (
                valor === valorSelecionado &&
                valor !== respostaCorreta
            ) {
                alternativa.classList.add("errada");
            }

        });

    salvarProgresso();

});

botaoProxima.addEventListener("click", () => {

    numeroQuestao++;

    if (numeroQuestao < questoesSelecionadas.length) {

        salvarProgresso();
        mostrarQuestao();

    } else {

        resultado.textContent =
            `Fim! Você acertou ${pontos} de ${questoesSelecionadas.length} questões.`;

        botaoResponder.disabled = true;
        botaoProxima.disabled = true;

        localStorage.removeItem("progressoQuestao");

    }

});

window.addEventListener("beforeunload", (event) => {

    if (questoesSelecionadas.length > 0) {

        event.preventDefault();
        event.returnValue = "";

    }

});