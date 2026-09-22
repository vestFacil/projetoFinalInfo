const listaRevisao =
    document.getElementById("listaRevisao");

async function carregarRevisao() {

    const usuarioLogado =
        JSON.parse(
            localStorage.getItem("usuarioLogado")
        );

    if (!usuarioLogado || !usuarioLogado.id) {

        listaRevisao.innerHTML =
            "<p>⚠️ Usuário não identificado.</p>";

        return;
    }

    try {

        const resposta = await fetch(
            `http://localhost:3000/questoes/revisao/${usuarioLogado.id}`
        );

        const questoes =
            await resposta.json();

        console.log("QUESTÕES RECEBIDAS DA API:", questoes);

        const contagem = {};

        questoes.forEach((questao) => {
            const chave =
                `${questao.materia}-${questao.questao_id}`;

            contagem[chave] =
                (contagem[chave] || 0) + 1;
        });

        const duplicadas =
            Object.entries(contagem)
                .filter(([chave, quantidade]) => quantidade > 1);

        console.log("QUESTÕES DUPLICADAS:", duplicadas);

        duplicadas.forEach(([chave, quantidade]) => {
            console.log(
                "🔴 DUPLICADA:",
                chave,
                "→",
                quantidade,
                "vezes"
            );
        });

        if (!resposta.ok) {
            throw new Error(
                questoes.erro ||
                "Erro ao carregar questões."
            );
        }

        if (questoes.length === 0) {

            listaRevisao.innerHTML =
                "<p>📚 Você ainda não respondeu nenhuma questão.</p>";

            return;
        }

        listaRevisao.innerHTML = "";

        questoes.forEach((questao) => {

            const item =
                document.createElement("div");

            item.classList.add(
                "questao-revisao"
            );

            item.innerHTML = `
                <h3>
                    📝 Questão ${questao.questao_id}
                </h3>

                <p>
                    <strong>Matéria:</strong>
                    ${questao.materia}
                </p>

                <p>
                    <strong>Resultado:</strong>
                    ${
                        questao.acertou
                            ? "✅ Acertou"
                            : "❌ Errou"
                    }
                </p>

                <p>
                    <strong>Data:</strong>
                    ${new Date(
                        questao.data_resposta
                    ).toLocaleDateString("pt-BR")}
                </p>

                <button
                    class="btn-revisar"
                    data-questao="${questao.questao_id}"
                    data-materia="${questao.materia}"
                >
                    🔄 Revisar questão
                </button>
            `;

            listaRevisao.appendChild(item);
        });

        document
            .querySelectorAll(".btn-revisar")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        const questaoId =
                            botao.dataset.questao;

                        const materia =
                            botao.dataset.materia;

                        window.location.href =
                            `questao.html?materia=${materia}&modo=revisao&revisar=${questaoId}`;
                    }
                );
            });

    } catch (erro) {

        console.error(
            "Erro ao carregar revisão:",
            erro
        );

        listaRevisao.innerHTML =
            "<p>⚠️ Não foi possível carregar suas questões.</p>";
    }
}

carregarRevisao();