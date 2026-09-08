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


    // ==========================================
    // VERIFICAR USUÁRIO LOGADO
    // ==========================================

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) {

        const aviso = document.createElement("div");

        aviso.textContent = "⚠️ Você ainda não fez login ou cadastro.";

        aviso.style.backgroundColor = "#ffeb3b";
        aviso.style.padding = "10px";
        aviso.style.marginBottom = "10px";
        aviso.style.textAlign = "center";
        aviso.style.fontWeight = "bold";


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


        btnEditar.textContent = "Cadastrar-se";

        btnEditar.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });

        return;
    }


    // ==========================================
    // CARREGAR DADOS DO BANCO
    // ==========================================

    fetch("http://localhost:3000/perfil/" + usuario.id)

        .then(res => {

            if (!res.ok) {
                throw new Error("Erro ao buscar perfil.");
            }

            return res.json();
        })

        .then(data => {

            console.log("Dados recebidos do banco:", data);


            // Dados do usuário

            nomeUsuario.textContent = data.nome;

            emailUsuario.textContent = data.email;

            bioUsuario.textContent = data.bio || "Sem bio";


            // Foto

            fotoPerfil.src = data.foto || "img/user.png";


            // Estatísticas

            questoesResolvidas.textContent =
                data.questoes_resolvidas || 0;

            mediaRedacao.textContent =
                data.media_redacao || 0;

            diasEstudando.textContent =
                data.dias_estudando || 0;


            // Metas

            metasLista.innerHTML = "";

            if (data.metas) {

                data.metas.forEach(meta => {

                    adicionarMetaNaLista(
                        meta.descricao,
                        meta.concluida
                    );

                });
            }

        })

        .catch(err => {

            console.error("Erro ao carregar perfil:", err);

        });


    // ==========================================
    // EDITAR PERFIL
    // ==========================================

    btnEditar.addEventListener("click", () => {

        nomeUsuario.innerHTML =
            `<input type="text" id="inputNome" value="${nomeUsuario.textContent}">`;

        emailUsuario.innerHTML =
            `<input type="email" id="inputEmail" value="${emailUsuario.textContent}">`;

        bioUsuario.innerHTML =
            `<input type="text" id="inputBio" value="${bioUsuario.textContent}">`;


        fotoInput.style.display = "block";

        btnEditar.style.display = "none";

        btnSalvar.style.display = "inline-block";

    });


    // ==========================================
    // SALVAR PERFIL
    // ==========================================

    btnSalvar.addEventListener("click", () => {

        const novoNome =
            document.getElementById("inputNome").value;

        const novoEmail =
            document.getElementById("inputEmail").value;

        const novaBio =
            document.getElementById("inputBio").value;


        fetch("http://localhost:3000/perfil/" + usuario.id, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome: novoNome,
                email: novoEmail,
                bio: novaBio
            })

        })

        .then(res => {

            if (!res.ok) {
                return res.text().then(msg => {
                    throw new Error(msg);
                });
            }

            return res.json();

        })

        .then(data => {

            console.log("Perfil atualizado:", data);


            // Atualizar os dados na tela

            nomeUsuario.textContent = data.nome;

            emailUsuario.textContent = data.email;

            bioUsuario.textContent = data.bio || "Sem bio";


            // Atualizar localStorage

            usuario.nome = data.nome;

            usuario.email = data.email;

            usuario.bio = data.bio;

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuario)
            );


            // Voltar para o modo normal

            btnEditar.style.display = "inline-block";

            btnSalvar.style.display = "none";

            fotoInput.style.display = "none";


            alert("Perfil atualizado com sucesso!");

        })

        .catch(err => {

            console.error("Erro ao salvar perfil:", err);

            alert("Erro ao salvar o perfil: " + err.message);

        });

    });


    // ==========================================
    // ALTERAR FOTO
    // ==========================================

    fotoInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = () => {

                fotoPerfil.src = reader.result;

            };

            reader.readAsDataURL(file);

        }

    });


    // ==========================================
    // ADICIONAR META
    // ==========================================

    btnAdicionarMeta.addEventListener("click", () => {

        if (inputMeta.value.trim() === "") {
            return;
        }


        const descricao = inputMeta.value.trim();


        adicionarMetaNaLista(descricao, false);

        inputMeta.value = "";

    });


    // ==========================================
    // FUNÇÃO PARA ADICIONAR META NA TELA
    // ==========================================

    function adicionarMetaNaLista(descricao, concluida) {

        const li = document.createElement("li");

        li.textContent =
            descricao + (concluida ? " ✅" : "");

        metasLista.appendChild(li);

    }

});