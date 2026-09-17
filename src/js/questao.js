const url = new URLSearchParams(window.location.search);

const materia = url.get("materia");

const titulo = document.getElementById("titulo");
const enunciado = document.getElementById("enunciado");
const alternativas = document.getElementById("alternativas");

const botaoResponder = document.getElementById("responder");
const botaoProxima = document.getElementById("proxima");

const resultado = document.getElementById("resultado");
const contador = document.getElementById("contador");

const quantidade = document.getElementById("quantidade");
const iniciar = document.getElementById("iniciar");

const botaoContinuar = document.getElementById("continuar");
botaoContinuar.style.display = "none";

const popup = document.getElementById("popupConfiguracao");
const areaQuestao = document.getElementById("questao");

const botaoVoltar = document.getElementById("voltar");

let respostaCorreta;
let questoes = [];
let questoesSelecionadas = [];
let numeroQuestao = 0;
let pontos = 0;
let respondeu = false;
let quantidadeQuestoes = 10;
let respostasFeitas = {};
let xpTotalAtual = 0;

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

async function carregarQuestoes() {
    try {
        if (!materia) {
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

        console.log(
            "Carregando:",
            caminho
        );

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

        console.log(
            `${questoes.length} questões carregadas.`
        );

        configurarQuantidade(
            questoes.length
        );

        const salvo =
            localStorage.getItem("progressoQuestao");

        if (salvo) {

            const progresso =
                JSON.parse(salvo);

            if (
                progresso.materia === materia &&
                Array.isArray(progresso.questoes) &&
                progresso.questoes.length > 0
            ) {
                botaoContinuar.style.display = "block";
            }

        }

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

        quantidadeQuestoes =
            Number(quantidade.value);

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

        botaoContinuar.style.display = "none";

        popup.style.display =
            "none";

        mostrarQuestao();
    }
);

botaoContinuar.addEventListener(
    "click",
    () => {

        const continuando =
            carregarProgresso();

        if (!continuando) {
            return;
        }

        botaoResponder.style.display = "";
        botaoProxima.style.display = "";
        botaoVoltar.style.display = "";

        popup.style.display = "none";

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

    let nomeTitulo =
    materia;

    if (
        materia === "nao-classificadas" ||
        materia === "nao_classificadas"
    ) {
        nomeTitulo =
            "Não classificadas";
    }

    if (materia === "portugues") {
        titulo.textContent = "Línguas";
    } else {
        titulo.textContent =
            formatarNome(nomeTitulo);
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
                questaoId: `${materia}-${numeroQuestao}`,
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

        console.log(
            "Resposta registrada:",
            dadosServidor
        );

        xpTotalAtual = dadosServidor.xpTotal;

        if (dadosServidor.xpGanho > 0) {
            resultado.textContent +=
                ` +${dadosServidor.xpGanho} XP!`;
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
    () => {

        numeroQuestao++;

        if (
            numeroQuestao <
            questoesSelecionadas.length
        ) {

            salvarProgresso();

            mostrarQuestao();

        } else {

            resultado.innerHTML =
                `🎉 Você terminou!<br>
                Você acertou ${pontos} de ${questoesSelecionadas.length} questões.<br>
                ⭐ XP total: ${xpTotalAtual}`;

            botaoResponder.style.display = "none";
            botaoProxima.style.display = "none";
            botaoVoltar.style.display = "none";

            alternativas.innerHTML = "";

            enunciado.innerHTML =
                `<strong>Você terminou todas as questões!</strong>`;

            contador.textContent = "Fim!";

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

carregarQuestoes();