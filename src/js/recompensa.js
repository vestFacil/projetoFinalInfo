const btnRecompensas =
    document.getElementById("btnRecompensas");

const painelRecompensas =
    document.getElementById("painelRecompensas");

const btnMensagem =
    document.getElementById("btnMensagem");

const btnDica =
    document.getElementById("btnDica");

const resultadoRecompensa =
    document.getElementById("resultadoRecompensa");


if (
    btnRecompensas &&
    painelRecompensas
) {

    btnRecompensas.addEventListener(
        "click",
        () => {

            painelRecompensas.style.display =
                painelRecompensas.style.display === "none"
                    ? "block"
                    : "none";

        }
    );

}


async function pegarMensagem() {

    const usuarioLogado =
        JSON.parse(
            localStorage.getItem("usuarioLogado")
        );

    if (
        !usuarioLogado ||
        !usuarioLogado.id
    ) {

        resultadoRecompensa.textContent =
            "⚠️ Usuário não identificado.";

        return;
    }

    try {

        const resposta =
            await fetch(
                `http://localhost:3000/recompensas/mensagem/${usuarioLogado.id}`
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro
            );
        }

        resultadoRecompensa.textContent =
            `💬 ${dados.mensagem}`;

    } catch (erro) {

        resultadoRecompensa.textContent =
            `⚠️ ${erro.message}`;

    }

}


async function pegarDica() {

    const usuarioLogado =
        JSON.parse(
            localStorage.getItem("usuarioLogado")
        );

    if (
        !usuarioLogado ||
        !usuarioLogado.id
    ) {

        resultadoRecompensa.textContent =
            "⚠️ Usuário não identificado.";

        return;
    }

    try {

        const resposta =
            await fetch(
                `http://localhost:3000/recompensas/dica/${usuarioLogado.id}`
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro
            );
        }

        resultadoRecompensa.textContent =
            `📚 ${dados.dica}`;

    } catch (erro) {

        resultadoRecompensa.textContent =
            `⚠️ ${erro.message}`;

    }

}


if (btnMensagem) {

    btnMensagem.addEventListener(
        "click",
        pegarMensagem
    );

}


if (btnDica) {

    btnDica.addEventListener(
        "click",
        pegarDica
    );

}