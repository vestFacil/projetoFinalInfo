document.getElementById("analisar").addEventListener("click", () => {
    const file = document.getElementById("fotoRedacao").files[0];
    if (!file) {
        alert("Por favor, envie uma foto da redação.");
        return;
    }

    Tesseract.recognize(file, 'por')
        .then(({ data: { text } }) => {
            document.getElementById("textoExtraido").textContent = text;

            let notaFinal = 0;
            let detalhes = {};

            // Critérios ENEM
            const errosComuns = ["vc", "pq", "tb", "naum"];
            let erros = errosComuns.filter(e => text.includes(e)).length;
            detalhes.normaCulta = erros === 0 ? 200 : erros <= 2 ? 150 : 100;
            notaFinal += detalhes.normaCulta;

            const temas = ["sociedade", "educação", "direitos", "cidadania", "violência"];
            let temasEncontrados = temas.filter(t => text.includes(t)).length;
            detalhes.compreensao = temasEncontrados >= 3 ? 200 : temasEncontrados === 2 ? 150 : 50;
            notaFinal += detalhes.compreensao;

            if (text.toLowerCase().includes("introdução") && text.toLowerCase().includes("conclusão")) {
                detalhes.organizacao = 200;
            } else if (text.toLowerCase().includes("introdução") || text.toLowerCase().includes("conclusão")) {
                detalhes.organizacao = 150;
            } else {
                detalhes.organizacao = 100;
            }
            notaFinal += detalhes.organizacao;

            const conectores = ["portanto", "porque", "assim", "logo", "dessa forma", "além disso", "contudo"];
            let conectoresUsados = conectores.filter(c => text.includes(c)).length;
            detalhes.coesao = conectoresUsados >= 3 ? 200 : conectoresUsados === 2 ? 150 : 100;
            notaFinal += detalhes.coesao;

            const intervencao = ["governo", "sociedade", "escola", "campanha", "política pública"];
            let intervencaoUsada = intervencao.filter(i => text.includes(i)).length;
            detalhes.intervencao = intervencaoUsada >= 2 && (text.includes("deve") || text.includes("precisa")) ? 200 : intervencaoUsada === 1 ? 150 : 50;
            notaFinal += detalhes.intervencao;

            if (notaFinal > 1000) notaFinal = 1000;

            document.getElementById("resultadoNota").textContent = `Sua nota simulada é: ${notaFinal}`;

            document.getElementById("detalhesNota").innerHTML = `
                <p>Norma Culta: ${detalhes.normaCulta}/200</p>
                <p>Compreensão do Tema: ${detalhes.compreensao}/200</p>
                <p>Organização das Ideias: ${detalhes.organizacao}/200</p>
                <p>Coesão e Conectividade: ${detalhes.coesao}/200</p>
                <p>Proposta de Intervenção: ${detalhes.intervencao}/200</p>
            `;

            // Gráfico de barras
            const ctx = document.getElementById("graficoNota").getContext("2d");
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["Norma Culta", "Compreensão", "Organização", "Coesão", "Intervenção"],
                    datasets: [{
                        label: 'Pontuação (0-200)',
                        data: [
                            detalhes.normaCulta,
                            detalhes.compreensao,
                            detalhes.organizacao,
                            detalhes.coesao,
                            detalhes.intervencao
                        ],
                        backgroundColor: [
                            '#4a00e0',
                            '#8e2de2',
                            '#5c9ead',
                            '#7fb069',
                            '#f2a65a'
                        ]
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 200
                        }
                    }
                }
            });

            localStorage.setItem("mediaRedacao", notaFinal);
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao analisar a imagem. Tente novamente.");
        });
});

