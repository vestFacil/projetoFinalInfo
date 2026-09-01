document.addEventListener("DOMContentLoaded", () => {
    const nomeUsuario = document.getElementById("nomeUsuario");
    const emailUsuario = document.getElementById("emailUsuario");
    const bioUsuario = document.getElementById("bioUsuario");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const fotoInput = document.getElementById("fotoInput");

    const questoesResolvidas = document.getElementById("questoesResolvidas");
    const mediaRedacao = document.getElementById("mediaRedacao");
    const diasEstudando = document.getElementById("diasEstudando");

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");

    const btnAdicionarMeta = document.getElementById("btnAdicionarMeta");
    const inputMeta = document.getElementById("inputMeta");
    const metasLista = document.getElementById("metasLista");

    // Verifica login
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        // Cria aviso visual
        const aviso = document.createElement("div");
        aviso.textContent = "⚠️ Você ainda não fez login ou cadastro.";
        aviso.style.backgroundColor = "#ffeb3b";
        aviso.style.padding = "10px";
        aviso.style.marginBottom = "10px";
        aviso.style.textAlign = "center";
        aviso.style.fontWeight = "bold";

        // Cria botão de cadastro
        const btnCadastro = document.createElement("button");
        btnCadastro.textContent = "Cadastrar-se";
        btnCadastro.style.marginLeft = "15px";
        btnCadastro.style.padding = "5px 10px";
        btnCadastro.style.cursor = "pointer";
        btnCadastro.style.border = "none";
        btnCadastro.style.backgroundColor = "#1976d2";
        btnCadastro.style.color = "white";
        btnCadastro.style.borderRadius = "4px";

        btnCadastro.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });

        aviso.appendChild(btnCadastro);
        document.body.prepend(aviso);

        // Troca o botão principal para "Cadastrar-se"
        btnEditar.textContent = "Cadastrar-se";
        btnEditar.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });

        return; // não tenta carregar perfil do servidor sem login
    }

    // Carregar dados do servidor
    fetch("http://localhost:3000/perfil/" + usuario.id)
        .then(res => res.json())
        .then(data => {
            nomeUsuario.textContent = data.nome;
            emailUsuario.textContent = data.email;
            bioUsuario.textContent = data.bio || "Sem bio";
            fotoPerfil.src = data.foto || "img/user.png";

            questoesResolvidas.textContent = data.questoes_resolvidas || 0;
            mediaRedacao.textContent = data.media_redacao || 0;
            diasEstudando.textContent = data.dias_estudando || 0;

            metasLista.innerHTML = "";
            data.metas.forEach(meta => adicionarMetaNaLista(meta.descricao, meta.concluida));
        })
        .catch(err => console.error("Erro ao carregar perfil:", err));

    // Editar perfil
    btnEditar.addEventListener("click", () => {
        nomeUsuario.innerHTML = `<input type="text" id="inputNome" value="${nomeUsuario.textContent}">`;
        emailUsuario.innerHTML = `<input type="email" id="inputEmail" value="${emailUsuario.textContent}">`;
        bioUsuario.innerHTML = `<input type="text" id="inputBio" value="${bioUsuario.textContent}">`;
        fotoInput.style.display = "block";

        btnEditar.style.display = "none";
        btnSalvar.style.display = "inline-block";
    });

    btnSalvar.addEventListener("click", () => {
        const novoNome = document.getElementById("inputNome").value;
        const novoEmail = document.getElementById("inputEmail").value;
        const novaBio = document.getElementById("inputBio").value;

        fetch("http://localhost:3000/perfil/" + usuario.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: novoNome, email: novoEmail, bio: novaBio })
        })
        .then(res => res.json())
        .then(data => {
            nomeUsuario.textContent = data.nome;
            emailUsuario.textContent = data.email;
            bioUsuario.textContent = data.bio;
            fotoInput.style.display = "none";
            btnSalvar.style.display = "none";
            btnEditar.style.display = "inline-block";
        })
        .catch(err => alert("Erro ao salvar perfil: " + err.message));
    });

    // Alterar foto
    fotoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                fetch("http://localhost:3000/perfil/" + usuario.id + "/foto", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ foto: reader.result })
                })
                .then(res => res.json())
                .then(data => {
                    fotoPerfil.src = data.foto;
                })
                .catch(err => alert("Erro ao salvar foto: " + err.message));
            };
            reader.readAsDataURL(file);
        }
    });

    // Metas
    btnAdicionarMeta.addEventListener("click", () => {
        if (inputMeta.value.trim() !== "") {
            fetch("http://localhost:3000/perfil/" + usuario.id + "/metas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descricao: inputMeta.value })
            })
            .then(res => res.json())
            .then(meta => {
                adicionarMetaNaLista(meta.descricao, meta.concluida);
                inputMeta.value = "";
            })
            .catch(err => alert("Erro ao adicionar meta: " + err.message));
        }
    });

    function adicionarMetaNaLista(descricao, concluida) {
        const li = document.createElement("li");
        li.textContent = descricao + (concluida ? " ✅" : "");
        metasLista.appendChild(li);
    }
});
