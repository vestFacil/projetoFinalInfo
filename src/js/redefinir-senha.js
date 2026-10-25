
const formulario = document.getElementById("redefinirSenhaForm");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const mensagem = document.getElementById("mensagem");

const API_URL = "https://vestfacil-api.onrender.com";

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (novaSenha.value !== confirmarSenha.value) {
        mensagem.textContent = "As senhas não coincidem.";
        mensagem.style.color = "#9B3030";
        return;
    }

    if (novaSenha.value.length < 8) {
        mensagem.textContent = "A senha deve ter pelo menos 8 caracteres.";
        mensagem.style.color = "#9B3030";
        return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const token = parametros.get("token");

    if (!token) {
        mensagem.textContent =
            "Link de recuperação inválido. Solicite um novo e-mail.";
        mensagem.style.color = "#9B3030";
        return;
    }

    const botao = formulario.querySelector("button");
    botao.disabled = true;
    mensagem.textContent = "Atualizando sua senha...";
    mensagem.style.color = "#403746";

    try {
        const resposta = await fetch(`${API_URL}/redefinir-senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token,
                novaSenha: novaSenha.value
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem || "Não foi possível redefinir a senha."
            );
        }

        mensagem.textContent =
            "Senha alterada com sucesso! Você já pode entrar na sua conta.";
        mensagem.style.color = "#287A45";

        formulario.reset();

    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);

        mensagem.textContent =
            erro.message || "Não foi possível alterar a senha. Tente novamente.";
        mensagem.style.color = "#9B3030";

    } finally {
        botao.disabled = false;
    }
});
