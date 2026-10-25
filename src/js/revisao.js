
const listaRevisao = document.getElementById("listaRevisao");

async function carregarRevisao() {
    if (!listaRevisao) {
        console.error('Elemento "listaRevisao" não encontrado no HTML.');
        return;
    }

    const usuarioLogado = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    if (!usuarioLogado || !usuarioLogado.id) {
        listaRevisao.innerHTML = "<p>⚠️ Usuário não identificado.</p>";
        return;
    }

    try {
        const resposta = await fetch(
            `https://vestfacil-api.onrender.com/questoes/revisao/${usuarioLogado.id}`
        );

        const questoes = await resposta.json();

        console.log("QUESTÕES RECEBIDAS DA API:", questoes);

        // Verifica o erro antes de tentar percorrer a resposta.
        if (!resposta.ok) {
            throw new Error(
                questoes.erro || "Erro ao carregar questões."
            );
        }

        // Confirma que a API realmente retornou uma lista.
        if (!Array.isArray(questoes)) {
            throw new Error("A API não retornou uma lista de questões.");
        }

        if (questoes.length === 0) {
            listaRevisao.innerHTML =
                "<p>Nenhuma questão está disponível para revisão agora.</p>";
            return;
        }

        listaRevisao.innerHTML = "";

        questoes.forEach((questao) => {
            const item = document.createElement("div");
            item.classList.add("questao-revisao");

            const dataResposta = questao.data_resposta
                ? new Date(questao.data_resposta).toLocaleDateString("pt-BR")
                : "Data não disponível";

            item.innerHTML = `
                <h3>📝 Questão ${questao.questao_id}</h3>

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
                    ${dataResposta}
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

        document.querySelectorAll(".btn-revisar").forEach((botao) => {
            botao.addEventListener("click", () => {
                const questaoId = botao.dataset.questao;
                const materia = botao.dataset.materia;

                window.location.href =
                    `questao.html?materia=${encodeURIComponent(materia)}&modo=revisao&revisar=${encodeURIComponent(questaoId)}`;
            });
        });

    } catch (erro) {
        console.error("Erro ao carregar revisão:", erro);

        listaRevisao.innerHTML =
            "<p>⚠️ Não foi possível carregar suas questões.</p>";
    }
}

carregarRevisao();
