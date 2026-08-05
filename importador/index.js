const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ANO_INICIAL = 2009;
const ANO_FINAL = 2023;

const pastaSaida = path.join(__dirname, "saida");

if (!fs.existsSync(pastaSaida)) {
    fs.mkdirSync(pastaSaida);
}

async function baixarAno(ano) {

    console.log(`\n========== ${ano} ==========`);

    let offset = 0;
    let todasQuestoes = [];
    let hasMore = true;

    while (hasMore) {

        try {

            const resposta = await axios.get(
                `https://api.enem.dev/v1/exams/${ano}/questions`,
                {
                    params: {
                        limit: 50,
                        offset: offset
                    }
                }
            );

            const dados = resposta.data;

            console.log(
                `Offset ${offset} -> ${dados.questions.length} questões`
            );

            todasQuestoes.push(...dados.questions);

            hasMore = dados.metadata.hasMore;

            offset += 50;

                } catch (erro) {

            if (
                erro.response &&
                erro.response.data &&
                erro.response.data.error &&
                erro.response.data.error.code === "rate_limit_exceeded"
            ) {

                const mensagem = erro.response.data.error.message;

                const tempo = parseInt(
                    mensagem.match(/\d+/)[0]
                );

                console.log(`Limite atingido. Esperando ${tempo} ms...`);

                await new Promise(resolve =>
                    setTimeout(resolve, tempo + 1000)
                );

                continue;

            }

            console.log(erro.response?.data || erro.message);

            break;

        }

    }

    console.log(
        `Total em ${ano}: ${todasQuestoes.length}`
    );

    return todasQuestoes;

}

async function iniciar() {

    let banco = [];

    for (let ano = ANO_INICIAL; ano <= ANO_FINAL; ano++) {

        const questoes = await baixarAno(ano);

        banco.push(...questoes);

    }

    fs.writeFileSync(

        path.join(
            pastaSaida,
            "banco_questoes.json"
        ),

        JSON.stringify(
            banco,
            null,
            4
        ),

        "utf8"

    );

    console.log("\n==============================");
    console.log("IMPORTAÇÃO FINALIZADA!");
    console.log(`Total de questões: ${banco.length}`);
    console.log("Arquivo salvo em:");
    console.log("saida/banco_questoes.json");
    console.log("==============================");

}

iniciar();