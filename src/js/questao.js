const url = new URLSearchParams(window.location.search);

const modo = url.get("modo");

const materia =
    url.get("materia") ||
    (modo === "desafio"
        ? "nao_classificadas"
        : null);

const questaoRevisao = url.get("revisar");        

const titulo = document.getElementById("titulo");
const enunciado = document.getElementById("enunciado");
const alternativas = document.getElementById("alternativas");
const botaoResponder = document.getElementById("responder");
const botaoProxima = document.getElementById("proxima");
const resultado = document.getElementById("resultado");
const contador = document.getElementById("contador");
const statusQuestao = document.getElementById("statusQuestao");
const quantidade = document.getElementById("quantidade");
const iniciar = document.getElementById("iniciar");
const popup = document.getElementById("popupConfiguracao");
const areaQuestao = document.getElementById("questao");
const botaoVoltar = document.getElementById("voltar");
const sequencia = document.getElementById("sequencia");


let respostaCorreta;
let questoes = [];
let questoesSelecionadas = [];
let numeroQuestao = 0;
let pontos = 0;
let respondeu = false;
let quantidadeQuestoes = 10;
let respostasFeitas = {};
let xpTotalAtual = 0;
let xpInicialQuiz = null;
let xpGanhoQuiz = 0;
let questoesRespondidas = [];

function formatarNome(texto) {
    return texto
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

function salvarProgresso() {
    const progresso = {
        materia,
        questoes: questoesSelecionadas,
        numeroQuestao,
        pontos,
        quantidade: quantidadeQuestoes,
        respostasFeitas
    };

    localStorage.setItem(
        "progressoQuestao",
        JSON.stringify(progresso)
    );
}

function carregarProgresso() {
    const salvo =
        localStorage.getItem("progressoQuestao");

    if (!salvo) {
        return false;
    }

    const progresso =
        JSON.parse(salvo);

    if (progresso.materia !== materia) {
        return false;
    }

    questoesSelecionadas =
        progresso.questoes;

    numeroQuestao =
        progresso.numeroQuestao;

    pontos =
        progresso.pontos;

    quantidadeQuestoes =
        progresso.quantidade;

    quantidade.value =
        quantidadeQuestoes;

    respostasFeitas =
        progresso.respostasFeitas || {};

    mostrarQuestao();

    return true;
}

async function carregarQuestoesRespondidas() {
    try {
        const usuarioLogado =
            JSON.parse(localStorage.getItem("usuarioLogado"));

        if (!usuarioLogado || !usuarioLogado.id) {
            questoesRespondidas = [];
            return;
        }

        const resposta = await fetch(
            `http://localhost:3000/questoes/respondidas/${usuarioLogado.id}/${materia}`
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar questões respondidas."
            );
        }

        questoesRespondidas =
            await resposta.json();
            
    } catch (erro) {
        console.error(
            "Erro ao carregar questões respondidas:",
            erro
        );

        questoesRespondidas = [];
    }
}

async function carregarQuestoes() {
    try {
        if (!materia && modo !== "desafio") {
            throw new Error(
                "Nenhuma matéria foi informada."
            );
        }

        let pasta = materia;
        let nomeArquivo = materia;

        if (
            materia === "nao-classificadas" ||
            materia === "nao_classificadas"
        ) {
            pasta = "nao-classificadas";
            nomeArquivo = "nao_classificadas";
        }

        const caminho =
            `data/${pasta}/${nomeArquivo}.json`;

        const resposta =
            await fetch(caminho);

        if (!resposta.ok) {
            throw new Error(
                `Arquivo não encontrado: ${caminho}`
            );
        }

        questoes =
            await resposta.json();

        if (!Array.isArray(questoes)) {
            throw new Error(
                "O arquivo JSON não contém uma lista de questões."
            );
        }

        if (questoes.length === 0) {
            throw new Error(
                "Esse arquivo não possui questões."
            );
        }

        configurarQuantidade(
            questoes.length
        );

        return true;

    } catch (erro) {
        console.error(erro);

        popup.style.display = "none";
        areaQuestao.style.display = "block";

        titulo.textContent =
            "Erro ao carregar questões";

        enunciado.textContent =
            "Não foi possível carregar as questões desta matéria.";

        alternativas.innerHTML = "";

        resultado.textContent =
            erro.message;

        return false;
    }
}

function configurarQuantidade(total) {
    quantidade.innerHTML = "";

    const opcoes = [5, 10, 20];

    opcoes.forEach(valor => {

        if (total >= valor) {

            quantidade.innerHTML += `
                <option value="${valor}">
                    ${valor} questões
                </option>
            `;
        }
    });

    if (total > 20) {

        quantidade.innerHTML += `
            <option value="${total}">
                ${total} questões
            </option>
        `;

    } else if (
        total > 0 &&
        total < 20
    ) {

        if (
            total !== 5 &&
            total !== 10
        ) {

            quantidade.innerHTML += `
                <option value="${total}">
                    ${total} questões
                </option>
            `;
        }
    }

    if (total >= 10) {

        quantidade.value = "10";

    } else if (total >= 5) {

        quantidade.value = "5";

    } else {

        quantidade.value =
            String(total);
    }

    quantidadeQuestoes =
        Number(quantidade.value);
}


iniciar.addEventListener(
    "click",
    () => {

        if (
            modo === "desafio" ||
            modo === "desafioExtra"
        ) {
            quantidadeQuestoes = 5;
        } else {
            quantidadeQuestoes =
                Number(quantidade.value);
        }

        questoesSelecionadas =
            [...questoes]
                .sort(
                    () => Math.random() - 0.5
                )
                .slice(
                    0,
                    quantidadeQuestoes
                );

        botaoResponder.style.display = "";
        botaoProxima.style.display = "";
        botaoVoltar.style.display = "";

        numeroQuestao = 0;
        pontos = 0;
        respostasFeitas = {};

        popup.style.display =
            "none";

        mostrarQuestao();
    }
);

function mostrarQuestao() {

    const respostaAnterior =
        respostasFeitas[numeroQuestao];

    respondeu =
        respostaAnterior !== undefined;

    botaoResponder.disabled =
        respondeu;

    botaoProxima.disabled =
        !respondeu;

    botaoVoltar.disabled =
        numeroQuestao === 0;

    const questao =
        questoesSelecionadas[
            numeroQuestao
        ];

    if (!questao) {
        return;
    }

    respostaCorreta =
        questao.resposta;

    let nomeTitulo = materia;

    const questaoId =
    `${materia}-${questoes.indexOf(questao)}`;

    if (questoesRespondidas.includes(questaoId)) {
        statusQuestao.textContent =
            "🟢 Questão já respondida";
    } else {
        statusQuestao.textContent = "";
    }

    contador.textContent =
        `Questão ${numeroQuestao + 1} de ${questoesSelecionadas.length}`;

    let textoEnunciado =
        questao.enunciado || "";

    textoEnunciado =
        textoEnunciado.replace(
            /!\[\]\(\[?([^\s\]\)]+)\]?\)?/g,
            '<img src="$1" class="imagem-questao" alt="Imagem da questão">'
        );

    enunciado.innerHTML =
        textoEnunciado;

    alternativas.innerHTML =
        "";

    resultado.textContent =
        "";

    if (
        !Array.isArray(
            questao.alternativas
        )
    ) {

        alternativas.innerHTML =
            "<p>Esta questão não possui alternativas disponíveis.</p>";

        return;
    }

    questao.alternativas.forEach(
        (alt, index) => {

            const letra =
                String.fromCharCode(
                    65 + index
                );

            if (
                alt === null ||
                alt === undefined
            ) {

                alternativas.innerHTML += `
                    <label
                        class="alternativa"
                        data-index="${index}"
                    >
                        <input
                            type="radio"
                            name="resposta"
                            value="${index}"
                        >
                        Alternativa ${letra}
                    </label>
                `;

                return;
            }

            alternativas.innerHTML += `
                <label
                    class="alternativa"
                    data-index="${index}"
                >
                    <input
                        type="radio"
                        name="resposta"
                        value="${index}"
                    >
                    ${alt}
                </label>
            `;
        }
    );

        // Restaurar resposta anterior, caso exista

    if (respostaAnterior !== undefined) {

        const radio =
            document.querySelector(
                `input[name="resposta"][value="${respostaAnterior.respostaUsuario}"]`
            );

        if (radio) {
            radio.checked = true;
        }

        document
            .querySelectorAll(
                'input[name="resposta"]'
            )
            .forEach(radio => {
                radio.disabled = true;
            });

        document
            .querySelectorAll(
                ".alternativa"
            )
            .forEach(alternativa => {

                const valor =
                    Number(
                        alternativa.dataset.index
                    );

                if (
                    valor ===
                    respostaCorreta
                ) {
                    alternativa.classList.add(
                        "correta"
                    );
                }

                if (
                    valor ===
                    respostaAnterior.respostaUsuario &&
                    valor !== respostaCorreta
                ) {
                    alternativa.classList.add(
                        "errada"
                    );
                }
            });

        resultado.textContent =
            respostaAnterior.acertou
                ? "✅ Você acertou!"
                : "❌ Você errou!";
    }
}

async function registrarRespostaNoServidor(valorSelecionado) {
    try {
       const usuarioLogado =
    JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !usuarioLogado.id) {
        console.warn("Usuário não identificado.");
        return null;
    }

    const usuarioId = usuarioLogado.id;

        const questao = questoesSelecionadas[numeroQuestao];

        const resposta = await fetch("http://localhost:3000/questoes/responder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuarioId: Number(usuarioId),
                questaoId: `${materia}-${questoes.indexOf(questao)}`,
                materia: materia,
                respostaUsuario: valorSelecionado,
                respostaCorreta: respostaCorreta
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao registrar resposta no servidor.");
        }

        return await resposta.json();

    } catch (erro) {
        console.error("Erro ao registrar resposta:", erro);
        return null;
    }
}

botaoResponder.addEventListener(
    "click",
    async () => {

        if (respondeu) {
            return;
        }

        const selecionada =
            document.querySelector(
                'input[name="resposta"]:checked'
            );

        if (!selecionada) {

            resultado.textContent =
                "Escolha uma alternativa!";

            return;
        }

        respondeu = true;

        botaoResponder.disabled =
            true;

        botaoProxima.disabled =
            false;

        document
            .querySelectorAll(
                'input[name="resposta"]'
            )
            .forEach(
                radio => {
                    radio.disabled = true;
                }
            );

        const valorSelecionado =
            Number(
                selecionada.value
            );

        const acertou =
    valorSelecionado === respostaCorreta;

    respostasFeitas[numeroQuestao] = {
        respostaUsuario: valorSelecionado,
        respostaCorreta: respostaCorreta,
        acertou: acertou
    };

    if (acertou) {

        resultado.textContent =
            "✅ Você acertou!";

        pontos++;

    } else {

        resultado.textContent =
            "❌ Você errou!";
    }

    // Registrar resposta no banco
    const dadosServidor =
        await registrarRespostaNoServidor(
            valorSelecionado
        );

    if (dadosServidor) {
        const questaoAtual =
        questoesSelecionadas[numeroQuestao];

        const questaoIdAtual =
            `${materia}-${questoes.indexOf(questaoAtual)}`;

        const xpGanho = dadosServidor.xpGanho || 0;

        if (xpInicialQuiz === null) {
            xpInicialQuiz = dadosServidor.xpTotal - xpGanho;
        }

        xpGanhoQuiz += xpGanho;
        xpTotalAtual = dadosServidor.xpTotal;

        sequencia.textContent =
            `🔥 Sequência atual: ${dadosServidor.sequenciaAtual} acertos`;

        if (xpGanho > 0) {
            resultado.textContent +=
                ` +${xpGanho} XP!`;
        }  

}

        document
            .querySelectorAll(
                ".alternativa"
            )
            .forEach(
                alternativa => {

                    const valor =
                        Number(
                            alternativa.dataset.index
                        );

                    if (
                        valor ===
                        respostaCorreta
                    ) {

                        alternativa.classList.add(
                            "correta"
                        );
                    }

                    if (
                        valor === valorSelecionado &&
                        valor !== respostaCorreta
                    ) {

                        alternativa.classList.add(
                            "errada"
                        );
                    }
                }
            );

        salvarProgresso();
    }
);

botaoProxima.addEventListener(
    "click",
    async () => {

        // Marcar a questão atual como respondida
        if (respondeu) {
            const questaoAtual =
                questoesSelecionadas[numeroQuestao];

            const questaoIdAtual =
                `${materia}-${questoes.indexOf(questaoAtual)}`;

            if (
                !questoesRespondidas.includes(
                    questaoIdAtual
                )
            ) {
                questoesRespondidas.push(
                    questaoIdAtual
                );
            }
        }

        // Ir para a próxima questão
        numeroQuestao++;

        if (
            numeroQuestao <
            questoesSelecionadas.length
        ) {
            salvarProgresso();
            mostrarQuestao();

        } else {

            // =========================
            // FINAL DO DESAFIO
            // =========================

            let xpDesafio = 0;
            let mensagemDesafio = "";

            if (modo === "desafio") {

                try {

                    const usuarioLogado =
                        JSON.parse(
                            localStorage.getItem(
                                "usuarioLogado"
                            )
                        );

                    if (
                        usuarioLogado &&
                        usuarioLogado.id
                    ) {

                        const respostaDesafio =
                            await fetch(
                                "http://localhost:3000/desafios/concluir",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },
                                    body: JSON.stringify({
                                        usuarioId:
                                            Number(
                                                usuarioLogado.id
                                            )
                                    })
                                }
                            );

                        const dadosDesafio =
                            await respostaDesafio.json();

                        if (!respostaDesafio.ok) {
                            throw new Error(
                                dadosDesafio.erro ||
                                "Erro ao concluir desafio."
                            );
                        }

                        xpDesafio =
                            Number(
                                dadosDesafio.xpGanho
                            ) || 0;

                        if (
                            dadosDesafio.jaConcluido
                        ) {
                            mensagemDesafio =
                                "🎯 Desafio de hoje já havia sido concluído.";
                        } else {
                            mensagemDesafio =
                                "🎯 Desafio concluído! +20 XP";
                        }

                        // O XP retornado pelo servidor
                        // é o valor mais atualizado.
                        if (
                            dadosDesafio.xpTotal !==
                            undefined
                        ) {
                            xpTotalAtual =
                                Number(
                                    dadosDesafio.xpTotal
                                );
                        }

                    } else {

                        mensagemDesafio =
                            "⚠️ Não foi possível identificar o usuário.";

                    }

                } catch (erro) {

                    console.error(
                        "Erro ao concluir desafio:",
                        erro
                    );

                    mensagemDesafio =
                        "⚠️ Não foi possível registrar a recompensa do desafio.";
                }
            }

            // =========================
            // RESULTADO FINAL
            // =========================

            resultado.innerHTML =
                `🎉 Você terminou!<br>
                Você acertou ${pontos} de ${questoesSelecionadas.length} questões.<br><br>
                ⭐ XP que você já tinha: ${xpInicialQuiz || 0}<br>
                ✨ XP ganho nas questões: +${xpGanhoQuiz}<br>
                ${modo === "desafio"
                    ? `🎯 XP do Desafio do Dia: +${xpDesafio}<br>
                       ${mensagemDesafio}<br>`
                    : ""
                }
                🏆 XP total: ${xpTotalAtual}`;

            botaoResponder.style.display =
                "none";

            botaoProxima.style.display =
                "none";

            botaoVoltar.style.display =
                "none";

            alternativas.innerHTML =
                "";

            enunciado.innerHTML =
                `<strong>Você terminou todas as questões!</strong>`;

            contador.textContent =
                "Fim!";

            statusQuestao.textContent =
                "";

            localStorage.removeItem(
                "progressoQuestao"
            );
        }
    }
);

botaoVoltar.addEventListener(
    "click",
    () => {

        if (numeroQuestao === 0) {
            return;
        }

        numeroQuestao--;

        salvarProgresso();

        mostrarQuestao();
    }
);

window.addEventListener(
    "beforeunload",
    event => {

        if (
            questoesSelecionadas.length > 0
        ) {

            event.preventDefault();
            event.returnValue = "";
        }
    }
);

async function iniciarPagina() {

    await carregarQuestoes();
    await carregarQuestoesRespondidas();

    // =========================
    // DESAFIO DO DIA
    // =========================
    if (modo === "desafio") {

        quantidadeQuestoes = 5;

        iniciar.click();

        popup.style.display = "none";
        areaQuestao.style.display = "block";

    // =========================
    // DESAFIO EXTRA
    // =========================
    } else if (modo === "desafioExtra") {

        const usuarioLogado =
            JSON.parse(
                localStorage.getItem("usuarioLogado")
            );

        if (!usuarioLogado || !usuarioLogado.id) {

            popup.style.display = "none";
            areaQuestao.style.display = "block";

            titulo.textContent =
                "Desafio Extra indisponível";

            enunciado.textContent =
                "Não foi possível identificar o usuário.";

            alternativas.innerHTML = "";

            return;
        }

        try {

            const resposta =
                await fetch(
                    `http://localhost:3000/desafios/extras/${usuarioLogado.id}`
                );

            const dados =
                await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                    "Erro ao verificar Desafio Extra."
                );
            }

            // Não possui Desafio Extra desbloqueado
            if (!dados.disponivel) {

                popup.style.display = "none";
                areaQuestao.style.display = "block";

                titulo.textContent =
                    "Desafio Extra indisponível";

                enunciado.textContent =
                    "Você precisa resgatar o Desafio Extra na loja para poder realizá-lo.";

                alternativas.innerHTML = "";

                return;
            }

            // Possui Desafio Extra desbloqueado
            quantidadeQuestoes = 5;

            iniciar.click();

            popup.style.display = "none";
            areaQuestao.style.display = "block";

        } catch (erro) {

            console.error(
                "Erro ao verificar Desafio Extra:",
                erro
            );

            popup.style.display = "none";
            areaQuestao.style.display = "block";

            titulo.textContent =
                "Erro ao carregar Desafio Extra";

            enunciado.textContent =
                "Não foi possível verificar se o Desafio Extra está disponível.";

            alternativas.innerHTML = "";

        }

    // =========================
    // REVISÃO
    // =========================
    } else if (modo === "revisao") {

        const indiceRevisao =
            Number(
                questaoRevisao
                    .split("-")
                    .pop()
            );

        const questaoEncontrada =
            questoes[indiceRevisao];

        if (!questaoEncontrada) {

            popup.style.display = "none";
            areaQuestao.style.display = "block";

            titulo.textContent =
                "Questão não encontrada";

            enunciado.textContent =
                "Não foi possível encontrar essa questão.";

            alternativas.innerHTML = "";

            return;
        }

        questoesSelecionadas = [
            questaoEncontrada
        ];

        numeroQuestao = 0;
        pontos = 0;
        respostasFeitas = {};

        popup.style.display = "none";
        areaQuestao.style.display = "block";

        mostrarQuestao();
    }
}

iniciarPagina();