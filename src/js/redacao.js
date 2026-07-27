document.getElementById("analisar").addEventListener("click", () => {
    const file = document.getElementById("fotoRedacao").files[0];
    if (!file) {
        alert("Por favor, envie uma foto da redação.");
        return;
    }

    // Usando Tesseract.js para extrair texto da imagem
    Tesseract.recognize(file, 'por')
        .then(({ data: { text } }) => {
            document.getElementById("textoExtraido").textContent = text;

            // Critérios do ENEM (cada eixo até 200 pontos)
            let notaFinal = 0;
            let detalhes = {};

            // 1. Domínio da norma culta
            const errosComuns = ["vc", "pq", "tb", "naum"];
            let erros = errosComuns.filter(e => text.includes(e)).length;
            detalhes.normaCulta = (erros === 0 ? 200 : 150);
            notaFinal += detalhes.normaCulta;

            // 2. Compreensão da proposta
            const temas = ["sociedade", "educação", "direitos", "cidadania", "violência"];
            let temasEncontrados = temas.filter(t => text.includes(t)).length;
            detalhes.compreensao = (temasEncontrados > 2 ? 200 : 150);
            notaFinal += detalhes.compreensao;

            // 3. Organização do texto
            if (text.toLowerCase().includes("introdução") && text.toLowerCase().includes("conclusão")) {
                detalhes.organizacao = 200;
            } else {
                detalhes.organizacao = 150;
            }
            notaFinal += detalhes.organizacao;

            // 4. Argumentação
            const conectores = ["portanto", "porque", "assim", "logo", "dessa forma"];
            let conectoresUsados = conectores.filter(c => text.includes(c)).length;
            detalhes.argumentacao = (conectoresUsados >= 2 ? 200 : 150);
            notaFinal += detalhes.argumentacao;

            // 5. Proposta de intervenção
            const intervencao = ["deve-se", "é necessário", "precisa", "proposta"];
            let intervencaoUsada = intervencao.filter(i => text.includes(i)).length;
            detalhes.intervencao = (intervencaoUsada > 0 ? 200 : 100);
            notaFinal += detalhes.intervencao;

            // Limitar a nota a 1000
            if (notaFinal > 1000) notaFinal = 1000;

            document.getElementById("resultadoNota").textContent = `Sua nota simulada é: ${notaFinal}`;

            // Mostrar detalhamento
            document.getElementById("detalhesNota").innerHTML = `
                <p>Norma Culta: ${detalhes.normaCulta}/200</p>
                <p>Compreensão da Proposta: ${detalhes.compreensao}/200</p>
                <p>Organização: ${detalhes.organizacao}/200</p>
                <p>Argumentação: ${detalhes.argumentacao}/200</p>
                <p>Proposta de Intervenção: ${detalhes.intervencao}/200</p>
            `;

            // Salvar no perfil
            localStorage.setItem("mediaRedacao", notaFinal);
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao analisar a imagem. Tente novamente.");
        });
});

