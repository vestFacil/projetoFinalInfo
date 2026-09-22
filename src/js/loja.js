const listaLoja =
    document.getElementById("listaLoja");

const xpAtual =
    document.getElementById("xpAtual");

const desafioExtra =
    document.getElementById("desafioExtra");    

async function carregarLoja() {

    try {

        const usuarioLogado =
            JSON.parse(
                localStorage.getItem("usuarioLogado")
            );

        if (!usuarioLogado || !usuarioLogado.id) {

            xpAtual.textContent = "0";

        } else {

            const respostaXP = await fetch(
                `http://localhost:3000/loja/xp/${usuarioLogado.id}`
            );

            const dadosXP =
                await respostaXP.json();

            xpAtual.textContent =
                dadosXP.xp || 0;

            const respostaDesafio =
                await fetch(
                    `http://localhost:3000/desafios/extras/${usuarioLogado.id}`
                );

            const dadosDesafio =
                await respostaDesafio.json();

            if (dadosDesafio.disponivel) {

                desafioExtra.innerHTML = `
                    <h2>🎯 Desafio Extra disponível!</h2>

                    <p>
                        Você tem um desafio extra para realizar.
                    </p>

                    <button id="btnDesafioExtra">
                        Começar Desafio Extra
                    </button>
                `;

                const btnDesafioExtra =
                    document.getElementById("btnDesafioExtra");

                btnDesafioExtra.addEventListener("click", () => {

                    window.location.href =
                        "questao.html?modo=desafioExtra&materia=nao_classificadas";

                });

            } else {

                desafioExtra.innerHTML = "";

            }
        }

        const resposta = await fetch(
            "http://localhost:3000/loja"
        );

        const itens =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                itens.erro ||
                "Erro ao carregar loja."
            );
        }

        listaLoja.innerHTML = "";

        itens.forEach((item) => {

            const div =
                document.createElement("div");

            div.innerHTML = `
                <h2>${item.nome}</h2>

                <p>
                    ${item.descricao}
                </p>

                <p>
                    ⭐ ${item.custo_xp} XP
                </p>

                <button
                    class="btn-resgatar"
                    data-id="${item.id}"
                >
                    Resgatar
                </button>
            `;

            listaLoja.appendChild(div);
        });

        document
    .querySelectorAll(".btn-resgatar")
    .forEach((botao) => {

        botao.addEventListener("click", async () => {

            const usuarioLogado =
                JSON.parse(
                    localStorage.getItem("usuarioLogado")
                );

            if (!usuarioLogado || !usuarioLogado.id) {
                alert("Usuário não identificado.");
                return;
            }

            const itemId =
                botao.dataset.id;

            try {

                const resposta =
                    await fetch(
                        "http://localhost:3000/loja/resgatar",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                usuarioId:
                                    usuarioLogado.id,
                                itemId:
                                    itemId
                            })
                        }
                    );

                const resultado =
                    await resposta.json();

                if (!resposta.ok) {
                    alert(
                        resultado.erro ||
                        "Não foi possível resgatar o item."
                    );
                    return;
                }

                xpAtual.textContent =
                    resultado.xpRestante;

                alert(
                    "🎉 " +
                    resultado.mensagem
                );

            } catch (erro) {

                console.error(
                    "Erro ao resgatar item:",
                    erro
                );

                alert(
                    "⚠️ Não foi possível realizar o resgate."
                );
            }
        });
    });

    } catch (erro) {

        console.error(
            "Erro ao carregar loja:",
            erro
        );

        listaLoja.innerHTML =
            "<p>⚠️ Não foi possível carregar a loja.</p>";
    }
}

carregarLoja();