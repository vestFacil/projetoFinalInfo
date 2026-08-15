const materia = document.getElementById("materia");
const titulo = document.getElementById("titulo");
const anotacao = document.getElementById("anotacao");
const botaoSalvar = document.getElementById("salvar");
const listaAnotacoes = document.getElementById("lista-anotacoes");
const pesquisa = document.getElementById("pesquisa");
const filtroMateria = document.getElementById("filtro-materia");

let anotacoes = JSON.parse(localStorage.getItem("vestfacil_anotacoes")) || [];

let indiceEditando = null;

function salvarAnotacoes() {
    localStorage.setItem(
        "vestfacil_anotacoes",
        JSON.stringify(anotacoes)
    );
}

function formatarMateria(valor) {
    const materias = {
        portugues: "Português",
        literatura: "Literatura",
        artes: "Artes",
        historia: "História",
        geografia: "Geografia",
        filosofia: "Filosofia",
        sociologia: "Sociologia",
        biologia: "Biologia",
        quimica: "Química",
        fisica: "Física",
        matematica: "Matemática",
        ingles: "Inglês",
        espanhol: "Espanhol"
    };

    return materias[valor] || valor;
}

function mostrarAnotacoes() {

    listaAnotacoes.innerHTML = "";

    const textoPesquisa = pesquisa.value
        .toLowerCase()
        .trim();

    const materiaSelecionada = filtroMateria.value;

    const anotacoesFiltradas = anotacoes.filter(item => {

        const tituloTexto = item.titulo.toLowerCase();
        const texto = item.texto.toLowerCase();
        const nomeMateria = formatarMateria(item.materia).toLowerCase();

        const correspondePesquisa =
            tituloTexto.includes(textoPesquisa) ||
            texto.includes(textoPesquisa) ||
            nomeMateria.includes(textoPesquisa);

        const correspondeMateria =
            materiaSelecionada === "" ||
            item.materia === materiaSelecionada;

        return correspondePesquisa && correspondeMateria;
    });

    if (anotacoesFiltradas.length === 0) {

        if (anotacoes.length === 0) {
            listaAnotacoes.innerHTML = `
                <p class="sem-anotacoes">
                    Você ainda não possui nenhuma anotação.
                </p>
            `;
        } else {
            listaAnotacoes.innerHTML = `
                <p class="sem-anotacoes">
                    Nenhuma anotação encontrada.
                </p>
            `;
        }

        return;
    }

    anotacoesFiltradas.forEach(item => {

        const index = anotacoes.indexOf(item);

        const div = document.createElement("div");

        div.classList.add("anotacao");

        div.innerHTML = `
            <small>${formatarMateria(item.materia)}</small>

            <h3>${item.titulo}</h3>

            <p>${item.texto}</p>

            <div class="botoes-anotacao">

                <button class="editar" data-index="${index}">
                    Editar
                </button>

                <button class="excluir" data-index="${index}">
                    Excluir
                </button>

            </div>
        `;

        listaAnotacoes.appendChild(div);
    });

    adicionarEventosExcluir();
    adicionarEventosEditar();
}

function adicionarEventosExcluir() {

    const botoesExcluir = document.querySelectorAll(".excluir");

    botoesExcluir.forEach(botao => {

        botao.addEventListener("click", function () {

            const index = Number(this.dataset.index);

            const confirmar = confirm(
                "Tem certeza que deseja excluir esta anotação?"
            );

            if (!confirmar) {
                return;
            }

            anotacoes.splice(index, 1);

            salvarAnotacoes();

            mostrarAnotacoes();
        });
    });
}

function adicionarEventosEditar() {

    const botoesEditar = document.querySelectorAll(".editar");

    botoesEditar.forEach(botao => {

        botao.addEventListener("click", function () {

            const index = Number(this.dataset.index);

            const item = anotacoes[index];

            materia.value = item.materia;
            titulo.value = item.titulo;
            anotacao.value = item.texto;

            indiceEditando = index;

            botaoSalvar.textContent = "Salvar edição";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });
}

botaoSalvar.addEventListener("click", function () {

    const materiaSelecionada = materia.value;
    const tituloDigitado = titulo.value.trim();
    const textoDigitado = anotacao.value.trim();

    if (!materiaSelecionada) {
        alert("Selecione uma matéria.");
        return;
    }

    if (!tituloDigitado) {
        alert("Digite um título para a anotação.");
        return;
    }

    if (!textoDigitado) {
        alert("Digite alguma anotação.");
        return;
    }

    if (indiceEditando !== null) {

        anotacoes[indiceEditando] = {
            materia: materiaSelecionada,
            titulo: tituloDigitado,
            texto: textoDigitado
        };

        indiceEditando = null;

        botaoSalvar.textContent = "Salvar anotação";

    } else {

        const novaAnotacao = {
            materia: materiaSelecionada,
            titulo: tituloDigitado,
            texto: textoDigitado
        };

        anotacoes.push(novaAnotacao);
    }

    salvarAnotacoes();

    mostrarAnotacoes();

    materia.value = "";
    titulo.value = "";
    anotacao.value = "";
});

pesquisa.addEventListener("input", mostrarAnotacoes);

filtroMateria.addEventListener("change", mostrarAnotacoes);

mostrarAnotacoes();