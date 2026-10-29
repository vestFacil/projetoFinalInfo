document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // ELEMENTOS DA PÁGINA
    // ==========================================

    const nomeUsuario = document.getElementById("nomeUsuario");
    const emailUsuario = document.getElementById("emailUsuario");
    const bioUsuario = document.getElementById("bioUsuario");

    const questoesResolvidas = document.getElementById("questoesResolvidas");
    const diasEstudando = document.getElementById("diasEstudando");
    const maiorSequencia = document.getElementById("maiorSequencia");

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnSair = document.getElementById("btnSair");

    const btnAdicionarMeta = document.getElementById("btnAdicionarMeta");
    const inputMeta = document.getElementById("inputMeta");
    const metasLista = document.getElementById("metasLista");

    // ==========================================
    // CONFIGURAÇÃO DA API
    // ==========================================

    const API_URL = "https://vestfacil-api.onrender.com";

    // ==========================================
    // LER USUÁRIO SALVO
    // ==========================================

    let usuario = null;

    try {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (usuarioSalvo) {
            usuario = JSON.parse(usuarioSalvo);
        }
    } catch (erro) {
        console.error("Erro ao ler o usuário salvo:", erro);
    }

    // Aceitar os nomes de identificador mais comuns.
    if (usuario && usuario.id == null) {
        usuario.id = usuario.usuario_id ?? usuario.usuarioId;
    }

    // ==========================================
    // SAIR DA CONTA
    // ==========================================

    if (btnSair) {
        btnSair.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            window.location.href = "login.html";
        });
    }

    // ==========================================
    // VERIFICAR LOGIN
    // ==========================================

    if (!usuario || usuario.id == null || usuario.id === "") {
        console.error(
            "Não foi possível identificar o usuário salvo:",
            usuario
        );

        alert(
            "Não foi possível identificar sua conta. " +
            "Entre novamente para acessar seu perfil."
        );

        window.location.replace("login.html");
        return;
    }

    // Guardar o identificador normalizado.
    usuario.id = Number(usuario.id);

    if (!Number.isInteger(usuario.id) || usuario.id <= 0) {
        console.error("Identificador de usuário inválido:", usuario.id);

        alert("Sua sessão não foi identificada. Entre novamente.");
        localStorage.removeItem("usuarioLogado");
        window.location.replace("login.html");
        return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    console.log("Usuário identificado no perfil:", usuario.id);

    // ==========================================
    // REQUISIÇÕES À API
    // ==========================================

    async function requisicao(url, opcoes = {}) {
        const resposta = await fetch(url, opcoes);

        if (!resposta.ok) {
            const mensagem = await resposta.text();

            throw new Error(
                mensagem || `Erro na requisição (${resposta.status}).`
            );
        }

        if (resposta.status === 204) {
            return null;
        }

        const tipo = resposta.headers.get("content-type");

        if (tipo && tipo.includes("application/json")) {
            return resposta.json();
        }

        return null;
    }

    function opcoesJSON(method, dados) {
        return {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        };
    }

    // ==========================================
    // CARREGAR PERFIL E METAS
    // ==========================================

    async function carregarPerfil() {
        try {
            const dados = await requisicao(
                `${API_URL}/perfil/${usuario.id}`
            );

            if (!dados) {
                throw new Error("A API não retornou os dados do perfil.");
            }

            if (nomeUsuario) {
                nomeUsuario.textContent = dados.nome || usuario.nome || "";
            }

            if (emailUsuario) {
                emailUsuario.textContent = dados.email || usuario.email || "";
            }

            if (bioUsuario) {
                bioUsuario.textContent = dados.bio || "Sem bio";
            }

            if (questoesResolvidas) {
                questoesResolvidas.textContent =
                    dados.questoes_resolvidas ?? 0;
            }

// Atualiza os dias desde o cadastro, usando os dados da API
if (diasEstudando) {
    diasEstudando.textContent = dados.dias_estudando ?? 0;
}

            if (maiorSequencia) {
                maiorSequencia.textContent =
                    dados.maior_sequencia ?? 0;
            }

            if (metasLista) {
                metasLista.innerHTML = "";

                if (Array.isArray(dados.metas)) {
                    dados.metas.forEach(meta => {
                        adicionarMetaNaLista(meta);
                    });
                }
            }

            // Atualizar os dados básicos guardados no navegador.
            usuario.nome = dados.nome ?? usuario.nome;
            usuario.email = dados.email ?? usuario.email;
            usuario.bio = dados.bio ?? usuario.bio;

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuario)
            );

        } catch (erro) {
            console.error("Erro ao carregar perfil:", erro);

            // Mesmo se a API falhar em algum outro campo, garante que os dias estudados apareçam na tela
if (diasEstudando) {
    diasEstudando.textContent = "—";
}

            alert(
                "Não foi possível carregar o perfil completo. " +
                "Verifique sua conexão com o servidor e tente novamente."
            );
        }
    }

    // ==========================================
    // EDITAR PERFIL
    // ==========================================

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            if (
                document.getElementById("inputNome") ||
                !nomeUsuario ||
                !emailUsuario ||
                !bioUsuario
            ) {
                return;
            }

            const nomeAtual = nomeUsuario.textContent;
            const emailAtual = emailUsuario.textContent;

            const bioAtual =
                bioUsuario.textContent === "Sem bio"
                    ? ""
                    : bioUsuario.textContent;

            nomeUsuario.replaceChildren();
            emailUsuario.replaceChildren();
            bioUsuario.replaceChildren();

            const inputNome = document.createElement("input");
            inputNome.type = "text";
            inputNome.id = "inputNome";
            inputNome.value = nomeAtual;

            const inputEmail = document.createElement("input");
            inputEmail.type = "email";
            inputEmail.id = "inputEmail";
            inputEmail.value = emailAtual;

            const inputBio = document.createElement("input");
            inputBio.type = "text";
            inputBio.id = "inputBio";
            inputBio.value = bioAtual;

            nomeUsuario.appendChild(inputNome);
            emailUsuario.appendChild(inputEmail);
            bioUsuario.appendChild(inputBio);

            btnEditar.style.display = "none";

            if (btnSalvar) {
                btnSalvar.style.display = "inline-block";
            }
        });
    }

    // ==========================================
    // SALVAR PERFIL
    // ==========================================

    if (btnSalvar) {
        btnSalvar.addEventListener("click", async () => {
            const inputNome = document.getElementById("inputNome");
            const inputEmail = document.getElementById("inputEmail");
            const inputBio = document.getElementById("inputBio");

            if (!inputNome || !inputEmail || !inputBio) {
                return;
            }

            const dadosAtualizados = {
                nome: inputNome.value.trim(),
                email: inputEmail.value.trim(),
                bio: inputBio.value.trim()
            };

            if (!dadosAtualizados.nome || !dadosAtualizados.email) {
                alert("Preencha o nome e o e-mail.");
                return;
            }

            btnSalvar.disabled = true;

            try {
                const dados = await requisicao(
                    `${API_URL}/perfil/${usuario.id}`,
                    opcoesJSON("PUT", dadosAtualizados)
                );

                const perfil = dados || dadosAtualizados;

                if (nomeUsuario) {
                    nomeUsuario.textContent = perfil.nome;
                }

                if (emailUsuario) {
                    emailUsuario.textContent = perfil.email;
                }

                if (bioUsuario) {
                    bioUsuario.textContent = perfil.bio || "Sem bio";
                }

                usuario.nome = perfil.nome;
                usuario.email = perfil.email;
                usuario.bio = perfil.bio;

                localStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify(usuario)
                );

                if (btnEditar) {
                    btnEditar.style.display = "inline-block";
                }

                btnSalvar.style.display = "none";

                alert("Perfil atualizado com sucesso!");

            } catch (erro) {
                console.error("Erro ao salvar perfil:", erro);

                alert(
                    "Não foi possível salvar o perfil. " +
                    "Verifique se a API possui a rota PUT /perfil/:id."
                );
            } finally {
                btnSalvar.disabled = false;
            }
        });
    }

    // ==========================================
    // ADICIONAR META
    // ==========================================

    async function adicionarMeta() {
        if (!inputMeta || !btnAdicionarMeta) {
            return;
        }

        const descricao = inputMeta.value.trim();

        if (!descricao) {
            alert("Digite uma meta antes de adicionar!");
            inputMeta.focus();
            return;
        }

        btnAdicionarMeta.disabled = true;

        try {
            const dados = await requisicao(
                `${API_URL}/metas`,
                opcoesJSON("POST", {
                    usuarioId: usuario.id,
                    descricao
                })
            );

            if (!dados || dados.id == null) {
                throw new Error(
                    "A API não retornou o ID da meta criada."
                );
            }

            adicionarMetaNaLista({
                ...dados,
                descricao: dados.descricao || descricao,
                concluida: dados.concluida ?? false
            });

            inputMeta.value = "";
            inputMeta.focus();

        } catch (erro) {
            console.error("Erro ao adicionar meta:", erro);

            alert(
                "Não foi possível salvar a meta. " +
                "Verifique a rota POST /metas na API."
            );
        } finally {
            btnAdicionarMeta.disabled = false;
        }
    }

    if (btnAdicionarMeta) {
        btnAdicionarMeta.addEventListener("click", adicionarMeta);
    }

    if (inputMeta) {
        inputMeta.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                adicionarMeta();
            }
        });
    }

    // ==========================================
    // CRIAR META NA LISTA
    // ==========================================

    function adicionarMetaNaLista(meta) {
        if (!metasLista) {
            return;
        }

        const li = document.createElement("li");
        li.className = "meta-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "meta-checkbox";
        checkbox.checked = Boolean(meta.concluida);

        checkbox.setAttribute(
            "aria-label",
            "Marcar meta como concluída"
        );

        const texto = document.createElement("span");
        texto.className = "meta-texto";
        texto.textContent = meta.descricao || "";

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "meta-excluir";
        btnExcluir.textContent = "Excluir";

        btnExcluir.setAttribute(
            "aria-label",
            `Excluir meta: ${meta.descricao || ""}`
        );

        function atualizarAparencia() {
            texto.classList.toggle(
                "meta-concluida",
                checkbox.checked
            );

            li.classList.toggle(
                "meta-item-concluida",
                checkbox.checked
            );
        }

        // ==========================================
        // MARCAR META COMO CONCLUÍDA
        // ==========================================

        checkbox.addEventListener("change", async () => {
            const estadoNovo = checkbox.checked;
            const estadoAnterior = !estadoNovo;

            checkbox.disabled = true;

            try {
                await requisicao(
                    `${API_URL}/metas/${meta.id}`,
                    opcoesJSON("PUT", {
                        concluida: estadoNovo,
                        usuarioId: usuario.id
                    })
                );

                meta.concluida = estadoNovo;
                atualizarAparencia();

            } catch (erro) {
                console.error("Erro ao atualizar meta:", erro);

                checkbox.checked = estadoAnterior;
                atualizarAparencia();

                alert(
                    "Não foi possível atualizar a meta. " +
                    "Verifique a rota PUT /metas/:id na API."
                );
            } finally {
                checkbox.disabled = false;
            }
        });

        // ==========================================
        // EXCLUIR META
        // ==========================================

        btnExcluir.addEventListener("click", async () => {
            const confirmar = window.confirm(
                `Deseja excluir a meta "${meta.descricao}"?`
            );

            if (!confirmar) {
                return;
            }

            btnExcluir.disabled = true;

            try {
                await requisicao(
                    `${API_URL}/metas/${meta.id}?usuarioId=${encodeURIComponent(usuario.id)}`,
                    {
                        method: "DELETE"
                    }
                );

                li.remove();

            } catch (erro) {
                console.error("Erro ao excluir meta:", erro);

                alert(
                    "Não foi possível excluir a meta. " +
                    "Verifique a rota DELETE /metas/:id na API."
                );
            } finally {
                btnExcluir.disabled = false;
            }
        });

        li.appendChild(checkbox);
        li.appendChild(texto);
        li.appendChild(btnExcluir);

        atualizarAparencia();
        metasLista.appendChild(li);
    }

    // ==========================================
    // INICIAR PÁGINA
    // ==========================================

    carregarPerfil();
});