
const formulario = document.getElementById("esqueciSenhaForm");
const campoEmail = document.getElementById("emailRecuperacao");
const mensagem = document.getElementById("mensagem");

const API_URL = "https://vestfacil-api.onrender.com";

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensagem.textContent = "Enviando solicitação...";
    mensagem.style.color = "#403746";

    try {
        const resposta = await fetch(`${API_URL}/esqueci-senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: campoEmail.value.trim()
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem || "Não foi possível enviar a solicitação."
            );
        }

        mensagem.textContent = dados.mensagem;
        mensagem.style.color = "#403746";
        formulario.reset();

    } catch (erro) {
        console.error("Erro na recuperação de senha:", erro);

        mensagem.textContent =
            "Não foi possível concluir a solicitação. Tente novamente em instantes.";
        mensagem.style.color = "#9B3030";
    }
});
