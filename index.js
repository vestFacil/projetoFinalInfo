const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// CONEXÃO COM MYSQL
// ========================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "projeto_final"
});

db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
        return;
    }

    console.log("Conectado ao MySQL com sucesso!");
});


// ========================
// NODEMAILER
// ========================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "seuemail@gmail.com",
        pass: "sua_senha_app"
    }
});


// ========================
// CADASTRO
// ========================

app.post("/cadastro", (req, res) => {

    const { nome, email, senha, bio } = req.body;

    db.query(
        "INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)",
        [nome, email, senha, bio],

        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res
                        .status(400)
                        .send("Esse e-mail já está cadastrado. Faça login.");
                }

                return res.status(500).send(err);
            }

            res.json({
                id: result.insertId,
                nome: nome,
                email: email,
                bio: bio
            });
        }
    );
});


// ========================
// LOGIN
// ========================

app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE email=? AND senha=?",
        [email, senha],

        (err, results) => {

            if (err) {
                return res.status(500).send(err);
            }

            if (results.length > 0) {

                const usuario = results[0];

                transporter.sendMail({
                    from: "seuemail@gmail.com",
                    to: usuario.email,
                    subject: "Confirmação de Login",
                    text: `Olá ${usuario.nome}, você acabou de realizar login. Foi você mesmo?`
                });

                res.json(usuario);

            } else {

                res.status(401).send("Credenciais inválidas");

            }
        }
    );
});


// ========================
// PERFIL - BUSCAR
// ========================

app.get("/perfil/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "SELECT * FROM usuarios WHERE id=?",
        [id],

        (err, userResults) => {

            if (err) {
                return res.status(500).send(err);
            }

            if (userResults.length === 0) {
                return res.status(404).send("Usuário não encontrado");
            }

            const usuario = userResults[0];

            db.query(
                "SELECT * FROM estatisticas WHERE usuario_id=?",
                [id],

                (err, estResults) => {

                    if (err) {
                        return res.status(500).send(err);
                    }

                    const estatisticas =
                        estResults[0] || {
                            questoes_resolvidas: 0,
                            media_redacao: 0,
                            dias_estudando: 0
                        };

                    db.query(
                        "SELECT * FROM metas WHERE usuario_id=?",
                        [id],

                        (err, metasResults) => {

                            if (err) {
                                return res.status(500).send(err);
                            }

                            res.json({
                                ...usuario,
                                ...estatisticas,
                                metas: metasResults
                            });
                        }
                    );
                }
            );
        }
    );
});


// ========================
// PERFIL - ATUALIZAR
// ========================

app.put("/perfil/:id", (req, res) => {

    const { id } = req.params;
    const { nome, email, bio } = req.body;

    db.query(
        "UPDATE usuarios SET nome=?, email=?, bio=? WHERE id=?",
        [nome, email, bio, id],

        (err) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res
                        .status(400)
                        .send("Esse e-mail já está cadastrado.");
                }

                console.error(err);
                return res
                    .status(500)
                    .send("Erro ao atualizar perfil.");
            }

            res.json({
                id: id,
                nome: nome,
                email: email,
                bio: bio
            });
        }
    );
});

// ========================
// QUESTÕES - REGISTRAR RESPOSTA
// ========================

app.post("/questoes/responder", (req, res) => {

    const {
        usuarioId,
        questaoId,
        materia,
        respostaUsuario,
        respostaCorreta
    } = req.body;

    // Verificar dados obrigatórios
    if (
        !usuarioId ||
        !questaoId ||
        !materia ||
        respostaUsuario === undefined ||
        respostaCorreta === undefined
    ) {
        return res.status(400).json({
            erro: "Dados da resposta incompletos."
        });
    }

    const acertou =
        Number(respostaUsuario) === Number(respostaCorreta);

    // Verificar se o usuário já respondeu essa questão
    db.query(
        `SELECT id
         FROM respostas_questoes
         WHERE usuario_id = ?
           AND questao_id = ?
           AND materia = ?
         LIMIT 1`,
        [usuarioId, questaoId, materia],
        (err, respostasAnteriores) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    erro: "Erro ao verificar resposta anterior."
                });
            }

            const jaRespondida =
                respostasAnteriores.length > 0;

            console.log("VERIFICAÇÃO XP:", {
                usuarioId,
                questaoId,
                materia,
                respostasAnteriores,
                jaRespondida
            });    

            // Só recebe XP se for a primeira resposta correta
            const xpGanho =
                acertou
                    ? (jaRespondida ? 5 : 10)
                    : 0;

            // Revisão daqui a 10 dias
            const dataRevisao = new Date();

            dataRevisao.setDate(
                dataRevisao.getDate() + 10
            );

            const dataRevisaoFormatada =
                dataRevisao.toISOString().split("T")[0];

            // Buscar estatísticas do usuário
            db.query(
                `SELECT *
                 FROM estatisticas
                 WHERE usuario_id = ?`,
                [usuarioId],
                (err, resultados) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            erro: "Erro ao buscar estatísticas."
                        });
                    }

                    const salvarResposta = (estatisticas) => {

                        let xpAtual =
                            estatisticas?.xp || 0;

                        let sequenciaAtual =
                            estatisticas?.sequencia_atual || 0;

                        let maiorSequencia =
                            estatisticas?.maior_sequencia || 0;

                        // Atualizar sequência
                        if (acertou) {

                            sequenciaAtual++;

                            if (
                                sequenciaAtual >
                                maiorSequencia
                            ) {
                                maiorSequencia =
                                    sequenciaAtual;
                            }

                        } else {

                            sequenciaAtual = 0;

                        }

                        const novoXp =
                            xpAtual + xpGanho;

                        // Se ainda não existir estatística,
                        // cria o registro.
                        if (!estatisticas) {

                            db.query(
                                `INSERT INTO estatisticas
                                (
                                    usuario_id,
                                    questoes_resolvidas,
                                    xp,
                                    sequencia_atual,
                                    maior_sequencia,
                                    ultimo_acesso
                                )
                                VALUES (?, 1, ?, ?, ?, CURDATE())`,
                                [
                                    usuarioId,
                                    novoXp,
                                    sequenciaAtual,
                                    maiorSequencia
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            erro: "Erro ao criar estatísticas."
                                        });
                                    }

                                    salvarHistorico();
                                }
                            );

                        } else {

                            db.query(
                                `UPDATE estatisticas
                                 SET
                                    questoes_resolvidas =
                                        questoes_resolvidas + 1,
                                    xp = ?,
                                    sequencia_atual = ?,
                                    maior_sequencia = ?,
                                    ultimo_acesso = CURDATE()
                                 WHERE usuario_id = ?`,
                                [
                                    novoXp,
                                    sequenciaAtual,
                                    maiorSequencia,
                                    usuarioId
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            erro: "Erro ao atualizar estatísticas."
                                        });
                                    }

                                    salvarHistorico();
                                }
                            );
                        }

                        function salvarHistorico() {

                            if (jaRespondida) {

                                db.query(
                                    `UPDATE respostas_questoes
                                    SET
                                        resposta_usuario = ?,
                                        resposta_correta = ?,
                                        acertou = ?,
                                        data_resposta = CURDATE(),
                                        data_revisao = ?
                                    WHERE id = ?`,
                                    [
                                        respostaUsuario,
                                        respostaCorreta,
                                        acertou ? 1 : 0,
                                        dataRevisaoFormatada,
                                        respostasAnteriores[0].id
                                    ],
                                    (err) => {

                                        if (err) {
                                            console.error(err);

                                            return res.status(500).json({
                                                erro: "Erro ao atualizar histórico da questão."
                                            });
                                        }

                                        res.json({
                                            sucesso: true,
                                            acertou,
                                            jaRespondida,
                                            xpGanho,
                                            xpTotal: novoXp,
                                            sequenciaAtual,
                                            maiorSequencia,
                                            dataRevisao:
                                                dataRevisaoFormatada
                                        });
                                    }
                                );

                            } else {

                                db.query(
                                    `INSERT INTO respostas_questoes
                                    (
                                        usuario_id,
                                        questao_id,
                                        materia,
                                        resposta_usuario,
                                        resposta_correta,
                                        acertou,
                                        data_resposta,
                                        data_revisao
                                    )
                                    VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
                                    [
                                        usuarioId,
                                        questaoId,
                                        materia,
                                        respostaUsuario,
                                        respostaCorreta,
                                        acertou ? 1 : 0,
                                        dataRevisaoFormatada
                                    ],
                                    (err) => {

                                        if (err) {
                                            console.error(err);

                                            return res.status(500).json({
                                                erro: "Erro ao salvar histórico da questão."
                                            });
                                        }

                                        res.json({
                                            sucesso: true,
                                            acertou,
                                            jaRespondida,
                                            xpGanho,
                                            xpTotal: novoXp,
                                            sequenciaAtual,
                                            maiorSequencia,
                                            dataRevisao:
                                                dataRevisaoFormatada
                                        });
                                    }
                                );
                            }
                        }
                    };

                    if (resultados.length === 0) {

                        salvarResposta(null);

                    } else {

                        salvarResposta(
                            resultados[0]
                        );
                    }
                }
            );
        }
    );
});

// ========================
// DESAFIO DO DIA - CONCLUIR
// ========================

app.post("/desafios/concluir", (req, res) => {
    const { usuarioId } = req.body;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    // Verifica se o desafio de hoje já foi concluído
    db.query(
        `SELECT id
         FROM desafios_diarios
         WHERE usuario_id = ?
           AND data_desafio = CURDATE()
         LIMIT 1`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    erro: "Erro ao verificar desafio diário."
                });
            }

            // Se já existe, não entrega XP novamente
            if (resultados.length > 0) {
                return res.json({
                    sucesso: true,
                    jaConcluido: true,
                    xpGanho: 0,
                    mensagem: "Desafio de hoje já foi concluído."
                });
            }

            const recompensaXP = 20;

            // Buscar estatísticas do usuário
            db.query(
                `SELECT *
                 FROM estatisticas
                 WHERE usuario_id = ?`,
                [usuarioId],
                (err, estatisticasResultados) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            erro: "Erro ao buscar estatísticas."
                        });
                    }

                    const estatisticas =
                        estatisticasResultados[0];

                    // Se ainda não existe estatística,
                    // cria com os 20 XP da recompensa.
                    if (!estatisticas) {

                        db.query(
                            `INSERT INTO estatisticas
                            (
                                usuario_id,
                                questoes_resolvidas,
                                xp,
                                sequencia_atual,
                                maior_sequencia,
                                ultimo_acesso
                            )
                            VALUES (?, 0, ?, 0, 0, CURDATE())`,
                            [
                                usuarioId,
                                recompensaXP
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        erro: "Erro ao adicionar recompensa."
                                    });
                                }

                                registrarDesafio();
                            }
                        );

                    } else {

                        const novoXp =
                            (estatisticas.xp || 0) +
                            recompensaXP;

                        db.query(
                            `UPDATE estatisticas
                             SET xp = ?,
                                 ultimo_acesso = CURDATE()
                             WHERE usuario_id = ?`,
                            [
                                novoXp,
                                usuarioId
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        erro: "Erro ao atualizar XP."
                                    });
                                }

                                registrarDesafio();
                            }
                        );
                    }

                    function registrarDesafio() {

                        db.query(
                            `INSERT INTO desafios_diarios
                            (
                                usuario_id,
                                data_desafio,
                                concluido,
                                recompensa_xp
                            )
                            VALUES (?, CURDATE(), TRUE, ?)`,
                            [
                                usuarioId,
                                recompensaXP
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        erro: "Erro ao registrar desafio."
                                    });
                                }

                                // Buscar XP atualizado
                                db.query(
                                    `SELECT xp
                                     FROM estatisticas
                                     WHERE usuario_id = ?`,
                                    [usuarioId],
                                    (err, xpResultados) => {

                                        if (err) {
                                            console.error(err);
                                            return res.status(500).json({
                                                erro: "Erro ao buscar XP atualizado."
                                            });
                                        }

                                        res.json({
                                            sucesso: true,
                                            jaConcluido: false,
                                            xpGanho: recompensaXP,
                                            xpTotal:
                                                xpResultados[0]?.xp || 0,
                                            mensagem:
                                                "Desafio concluído! +20 XP"
                                        });
                                    }
                                );
                            }
                        );
                    }
                }
            );
        }
    );
});

// ========================
// QUESTÕES - JÁ RESPONDIDAS
// ========================

app.get("/questoes/respondidas/:usuarioId/:materia", (req, res) => {

    const { usuarioId, materia } = req.params;

    db.query(
        `SELECT questao_id
         FROM respostas_questoes
         WHERE usuario_id = ?
           AND materia = ?`,
        [usuarioId, materia],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao buscar questões respondidas."
                });
            }

            const questoesRespondidas =
                resultados.map(
                    resposta => resposta.questao_id
                );

            res.json(questoesRespondidas);
        }
    );
});

// ========================
// ÁREA DE REVISÃO
// ========================

app.get("/questoes/revisao/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT
            questao_id,
            materia,
            resposta_usuario,
            resposta_correta,
            acertou,
            data_resposta,
            data_revisao
         FROM respostas_questoes
         WHERE usuario_id = ?
         AND data_revisao <= CURDATE()
         ORDER BY data_revisao ASC
         `,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao buscar questões para revisão."
                });
            }

            res.json(resultados);
        }
    );
});


// ========================
// ESTATÍSTICAS
// ========================

app.post("/estatisticas", (req, res) => {

    const {
        usuarioId,
        questoes,
        media,
        dias
    } = req.body;

    db.query(
        "UPDATE estatisticas SET questoes_resolvidas=?, media_redacao=?, dias_estudando=?, ultimo_acesso=CURDATE() WHERE usuario_id=?",
        [questoes, media, dias, usuarioId],

        (err, result) => {

            if (err) {
                return res.status(500).send(err);
            }

            if (result.affectedRows === 0) {

                db.query(
                    "INSERT INTO estatisticas (usuario_id, questoes_resolvidas, media_redacao, dias_estudando, ultimo_acesso) VALUES (?, ?, ?, ?, CURDATE())",
                    [usuarioId, questoes, media, dias],

                    (err) => {

                        if (err) {
                            return res.status(500).send(err);
                        }

                    }
                );
            }

            res.send("Estatísticas atualizadas!");
        }
    );
});


// ========================
// METAS - ADICIONAR
// ========================

app.post("/metas", (req, res) => {

    const {
        usuarioId,
        descricao
    } = req.body;

    db.query(
        "INSERT INTO metas (usuario_id, descricao) VALUES (?, ?)",
        [usuarioId, descricao],

        (err, result) => {

            if (err) {
                return res.status(500).send(err);
            }

            res.json({
                id: result.insertId,
                usuario_id: usuarioId,
                descricao: descricao,
                concluida: false
            });
        }
    );
});


// ========================
// METAS - CONCLUIR
// ========================

app.put("/metas/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "UPDATE metas SET concluida=TRUE WHERE id=?",
        [id],

        (err) => {

            if (err) {
                return res.status(500).send(err);
            }

            res.send("Meta concluída!");
        }
    );
});


// ========================
// METAS - EXCLUIR
// ========================

app.delete("/metas/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "DELETE FROM metas WHERE id=?",
        [id],

        (err) => {

            if (err) {
                return res.status(500).send(err);
            }

            res.send("Meta excluída!");
        }
    );
});

app.get("/loja", (req, res) => {

    db.query(
        `SELECT
            id,
            nome,
            descricao,
            custo_xp,
            recompensa
         FROM loja_xp
         WHERE ativo = TRUE
         ORDER BY custo_xp ASC`,
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao carregar itens da loja."
                });
            }

            res.json(resultados);
        }
    );

});

app.get("/loja/xp/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT xp
         FROM estatisticas
         WHERE usuario_id = ?`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao buscar XP."
                });
            }

            if (resultados.length === 0) {
                return res.json({
                    xp: 0
                });
            }

            res.json({
                xp: resultados[0].xp || 0
            });
        }
    );

});

app.post("/loja/resgatar", (req, res) => {

    const {
        usuarioId,
        itemId
    } = req.body;

    if (!usuarioId || !itemId) {
        return res.status(400).json({
            erro: "Usuário ou item não informado."
        });
    }

    // Buscar o item da loja
    db.query(
        `SELECT
            id,
            nome,
            custo_xp
         FROM loja_xp
         WHERE id = ?
           AND ativo = TRUE`,
        [itemId],
        (err, itens) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao buscar item."
                });
            }

            if (itens.length === 0) {
                return res.status(404).json({
                    erro: "Item não encontrado."
                });
            }

            const item = itens[0];

            const custoXP =
                item.custo_xp;

            // Buscar XP atual do usuário
            db.query(
                `SELECT xp
                 FROM estatisticas
                 WHERE usuario_id = ?`,
                [usuarioId],
                (err, resultados) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            erro: "Erro ao buscar XP."
                        });
                    }

                    const xpAtual =
                        resultados.length > 0
                            ? resultados[0].xp || 0
                            : 0;

                    // Verificar se possui XP suficiente
                    if (xpAtual < custoXP) {

                        return res.status(400).json({
                            erro:
                                "Você não tem XP suficiente."
                        });
                    }

                    const novoXP =
                        xpAtual - custoXP;

                    // Se for Desafio Extra,
                    // registrar o desafio antes de descontar o XP
                    if (item.nome === "Desafio extra") {

                        db.query(
                            `INSERT INTO desafios_extras
                            (
                                usuario_id,
                                item_loja_id,
                                data_resgate,
                                concluido
                            )
                            VALUES (?, ?, CURDATE(), FALSE)`,
                            [
                                usuarioId,
                                item.id
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);

                                    return res.status(500).json({
                                        erro:
                                            "Erro ao liberar o desafio extra."
                                    });
                                }

                                descontarXP();
                            }
                        );

                        } else if (
                            item.nome === "Dica de estudo" ||
                            item.nome === "Mensagem motivacional"
                        ) {

                            db.query(
                                `INSERT INTO recompensas_usuario
                                (
                                    usuario_id,
                                    item_loja_id,
                                    data_compra,
                                    data_expiracao
                                )
                                VALUES (
                                    ?,
                                    ?,
                                    NOW(),
                                    DATE_ADD(NOW(), INTERVAL 3 DAY)
                                )`,
                                [
                                    usuarioId,
                                    item.id
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            erro:
                                                "Erro ao liberar a recompensa."
                                        });
                                    }

                                    descontarXP();
                                }
                            );

                        } else {

                            descontarXP();

                        }

                    function descontarXP() {

                        db.query(
                            `UPDATE estatisticas
                             SET xp = ?
                             WHERE usuario_id = ?`,
                            [
                                novoXP,
                                usuarioId
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);

                                    return res.status(500).json({
                                        erro:
                                            "Erro ao descontar XP."
                                    });
                                }

                                res.json({
                                    sucesso: true,

                                    mensagem:
                                        item.nome === "Desafio extra"
                                            ? "Desafio extra desbloqueado!"
                                            : "Item resgatado com sucesso!",

                                    xpRestante: novoXP,

                                    desafioExtra:
                                        item.nome === "Desafio extra"
                                });
                            }
                        );
                    }
                }
            );
        }
    );

});

app.get("/desafios/extras/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT
            id,
            item_loja_id,
            data_resgate,
            concluido
         FROM desafios_extras
         WHERE usuario_id = ?
           AND concluido = FALSE
         ORDER BY id DESC
         LIMIT 1`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao buscar desafio extra."
                });
            }

            if (resultados.length === 0) {
                return res.json({
                    disponivel: false
                });
            }

            res.json({
                disponivel: true,
                desafio: resultados[0]
            });
        }
    );

});

app.post("/desafios/extras/concluir", (req, res) => {

    const { usuarioId } = req.body;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `UPDATE desafios_extras
         SET concluido = TRUE
         WHERE usuario_id = ?
           AND item_loja_id = 2
           AND concluido = FALSE
         ORDER BY id DESC
         LIMIT 1`,
        [usuarioId],
        (err, resultado) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao concluir Desafio Extra."
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: "Nenhum Desafio Extra disponível."
                });
            }

            res.json({
                sucesso: true,
                mensagem: "Desafio Extra concluído!"
            });
        }
    );

});

app.get("/recompensas/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT
            r.id,
            r.item_loja_id,
            r.data_compra,
            r.data_expiracao,
            l.nome
         FROM recompensas_usuario r
         INNER JOIN loja_xp l
             ON l.id = r.item_loja_id
         WHERE r.usuario_id = ?
           AND r.data_expiracao > NOW()
         ORDER BY r.data_expiracao DESC`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro:
                        "Erro ao buscar recompensas."
                });
            }

            res.json(resultados);
        }
    );

});

app.get("/recompensas/dica/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT id
         FROM recompensas_usuario
         WHERE usuario_id = ?
           AND item_loja_id = 1
           AND data_expiracao > NOW()
         ORDER BY data_expiracao DESC
         LIMIT 1`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao verificar a dica."
                });
            }

            if (resultados.length === 0) {
                return res.status(403).json({
                    erro: "Você não possui uma Dica de Estudo ativa."
                });
            }

            const dicas = [
                "Quando errar uma questão, tente entender o motivo do erro antes de passar para a próxima.",
                "Depois de estudar um assunto, resolva algumas questões sobre ele para testar seu conhecimento.",
                "Tente explicar o conteúdo com suas próprias palavras. Isso ajuda a perceber o que você realmente entendeu.",
                "Faça pequenas pausas durante os estudos para manter a concentração.",
                "Revise conteúdos que você já estudou depois de alguns dias para ajudar na memorização.",
                "Alterne entre teoria e exercícios para tornar seus estudos mais ativos."
            ];

            const indice =
                Math.floor(
                    Math.random() * dicas.length
                );

            res.json({
                dica: dicas[indice]
            });

        }
    );

});

app.get("/recompensas/mensagem/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT id
         FROM recompensas_usuario
         WHERE usuario_id = ?
           AND item_loja_id = 3
           AND data_expiracao > NOW()
         ORDER BY data_expiracao DESC
         LIMIT 1`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao verificar a mensagem."
                });
            }

            if (resultados.length === 0) {
                return res.status(403).json({
                    erro:
                        "Você não possui uma Mensagem Motivacional ativa."
                });
            }

            const mensagens = [
                "Você não precisa estudar tudo de uma vez. Um pouco todos os dias já faz diferença!",
                "Cada questão respondida é um passo a mais na sua preparação. Continue!",
                "Não desista por causa de uma questão difícil. Errar também faz parte do aprendizado!",
                "Seu esforço de hoje pode fazer toda a diferença amanhã.",
                "Você já chegou até aqui. Continue avançando!",
                "A constância é mais importante do que estudar muito em um único dia."
            ];

            const indice =
                Math.floor(
                    Math.random() * mensagens.length
                );

            res.json({
                mensagem: mensagens[indice]
            });

        }
    );

});

app.get("/desafios/status/:usuarioId", (req, res) => {

    const { usuarioId } = req.params;

    if (!usuarioId) {
        return res.status(400).json({
            erro: "Usuário não informado."
        });
    }

    db.query(
        `SELECT concluido
         FROM desafios_diarios
         WHERE usuario_id = ?
           AND data_desafio = CURDATE()
         LIMIT 1`,
        [usuarioId],
        (err, resultados) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao verificar desafio."
                });
            }

            res.json({
                concluido:
                    resultados.length > 0 &&
                    resultados[0].concluido === 1
            });
        }
    );
});

// ========================
// SERVIDOR
// ========================

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});