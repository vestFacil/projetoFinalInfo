function atribuirNivel(valor) {
    if (valor <= 0) return 0;            // Desclassificado
    else if (valor <= 40) return 40;     // Precário
    else if (valor <= 80) return 80;     // Insuficiente
    else if (valor <= 120) return 120;   // Mediano
    else if (valor <= 160) return 160;   // Bom
    else return 200;                     // Ótimo
}

document.getElementById("analisar").addEventListener("click", () => {
    const file = document.getElementById("fotoRedacao").files[0];
    if (!file) {
        alert("Por favor, envie um arquivo DOCX da redação.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const { value: text } = await mammoth.extractRawText({ arrayBuffer });

        document.getElementById("textoExtraido").textContent = text;

        let notaFinal = 0;
        let detalhes = {};

        // COMPETÊNCIA I - Norma Padrão
        const errosComuns = ["vc", "pq", "tb", "naum"];
        let erros = errosComuns.filter(e => text.toLowerCase().includes(e)).length;
        let valorNorma = erros === 0 ? 200 : erros <= 2 ? 160 : erros <= 4 ? 120 : 80;
        detalhes.competencia1 = atribuirNivel(valorNorma);
        notaFinal += detalhes.competencia1;

        // COMPETÊNCIA II - Compreensão do Tema e Argumentação
        const temas = ["sociedade", "educação", "direitos", "cidadania", "violência"];
        let temasEncontrados = temas.filter(t => text.toLowerCase().includes(t)).length;
        let valorTema = temasEncontrados >= 3 ? 200 : temasEncontrados === 2 ? 160 : temasEncontrados === 1 ? 80 : 40;
        detalhes.competencia2 = atribuirNivel(valorTema);
        notaFinal += detalhes.competencia2;

        // COMPETÊNCIA III - Seleção, Organização e Interpretação
        let valorOrg;
        if (text.toLowerCase().includes("introdução") && text.toLowerCase().includes("conclusão")) {
            valorOrg = 200;
        } else if (text.toLowerCase().includes("introdução") || text.toLowerCase().includes("conclusão")) {
            valorOrg = 160;
        } else {
            valorOrg = 80;
        }
        detalhes.competencia3 = atribuirNivel(valorOrg);
        notaFinal += detalhes.competencia3;

        // COMPETÊNCIA IV - Mecanismos Linguísticos
        const conectores = ["portanto", "porque", "assim", "logo", "dessa forma", "além disso", "contudo"];
        let conectoresUsados = conectores.filter(c => text.toLowerCase().includes(c)).length;
        let valorCoesao = conectoresUsados >= 3 ? 200 : conectoresUsados === 2 ? 160 : conectoresUsados === 1 ? 80 : 40;
        detalhes.competencia4 = atribuirNivel(valorCoesao);
        notaFinal += detalhes.competencia4;

        // COMPETÊNCIA V - Proposta de Intervenção
        const intervencao = ["governo", "sociedade", "escola", "campanha", "política pública"];
        let intervencaoUsada = intervencao.filter(i => text.toLowerCase().includes(i)).length;
        let valorIntervencao = intervencaoUsada >= 2 && (text.includes("deve") || text.includes("precisa")) ? 200 : intervencaoUsada === 1 ? 160 : 40;
        detalhes.competencia5 = atribuirNivel(valorIntervencao);
        notaFinal += detalhes.competencia5;

        if (notaFinal > 1000) notaFinal = 1000;

        // Resultado final
        document.getElementById("resultadoNota").textContent = `Sua nota simulada é: ${notaFinal}`;

        document.getElementById("detalhesNota").innerHTML = `
            <p>Competência I (Norma Padrão): ${detalhes.competencia1}/200</p>
            <p>Competência II (Tema e Argumentação): ${detalhes.competencia2}/200</p>
            <p>Competência III (Organização e Interpretação): ${detalhes.competencia3}/200</p>
            <p>Competência IV (Mecanismos Linguísticos): ${detalhes.competencia4}/200</p>
            <p>Competência V (Intervenção): ${detalhes.competencia5}/200</p>
        `;

        // Gráfico
        const ctx = document.getElementById("graficoNota").getContext("2d");
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Competência I", "Competência II", "Competência III", "Competência IV", "Competência V"],
                datasets: [{
                    label: 'Pontuação (0-200)',
                    data: [
                        detalhes.competencia1,
                        detalhes.competencia2,
                        detalhes.competencia3,
                        detalhes.competencia4,
                        detalhes.competencia5
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
    };

    reader.readAsArrayBuffer(file);
});
