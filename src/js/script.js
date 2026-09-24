document.getElementById("materia").addEventListener("click", () => {

    window.location.href = "materia.html";

});


document.getElementById("red").addEventListener("click", () => {

    window.location.href = "redacao.html";

});


document.getElementById("caderno").addEventListener("click", () => {

    window.location.href = "caderno.html";

});

document.getElementById("loja").addEventListener("click", () => {

    window.location.href = "loja.html";

});


document.getElementById("btnDesafio").addEventListener("click", () => {

    window.location.href =
        "questao.html?modo=desafio&materia=nao_classificadas";

});


document.getElementById("btnRevisao").addEventListener("click", () => {

    window.location.href = "revisao.html";

});


/* =========================
   VERIFICAR DESAFIO DO DIA
   ========================= */

async function verificarDesafioDoDia() {

    const btnDesafio =
        document.getElementById("btnDesafio");

    if (!btnDesafio) {
        return;
    }

    const usuarioLogado =
        JSON.parse(
            localStorage.getItem("usuarioLogado")
        );

    if (!usuarioLogado || !usuarioLogado.id) {
        return;
    }

    try {

        const resposta =
            await fetch(
                `http://localhost:3000/desafios/status/${usuarioLogado.id}`
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                "Erro ao verificar desafio."
            );
        }

        if (dados.concluido) {

            btnDesafio.textContent =
                "✅ Desafio concluído hoje";

            btnDesafio.disabled = true;

        }

    } catch (erro) {

        console.error(
            "Erro ao verificar desafio:",
            erro
        );

    }
}


verificarDesafioDoDia();