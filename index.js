const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();


// ===============================
// CONFIGURAÇÕES
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// CONEXÃO COM O BANCO DE DADOS
// ===============================

const banco = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "projeto_final"
});

banco.connect((erro) => {
    if (erro) {
        console.error("❌ Erro ao conectar ao banco:");
        console.error(erro.message);
        return;
    }

    console.log("✅ Banco de dados conectado!");
});


// ===============================
// CADASTRO
// ===============================

app.post("/cadastro", (req, res) => {

    const { nome, email, senha, bio } = req.body;

    // Verifica se os campos obrigatórios foram enviados
    if (!nome || !email || !senha) {
        return res.status(400).send(
            "Nome, email e senha são obrigatórios."
        );
    }

    const sql = `
        INSERT INTO usuarios
        (nome, email, senha, bio)
        VALUES (?, ?, ?, ?)
    `;

    banco.query(
        sql,
        [nome, email, senha, bio || null],
        (erro, resultado) => {

            if (erro) {

                console.error("Erro ao cadastrar:", erro);

                // Email já cadastrado
                if (erro.code === "ER_DUP_ENTRY") {
                    return res.status(400).send(
                        "Este email já está cadastrado."
                    );
                }

                return res.status(500).send(
                    "Erro ao cadastrar usuário."
                );
            }

            console.log(
                `✅ Usuário cadastrado! ID: ${resultado.insertId}`
            );

            // Retornamos os dados que o frontend precisa
            // Não retornamos a senha
            const usuario = {
                id: resultado.insertId,
                nome: nome,
                email: email,
                bio: bio || null
            };

            res.status(201).json(usuario);
        }
    );
});


// ===============================
// LOGIN
// ===============================

app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).send(
            "Email e senha são obrigatórios."
        );
    }

    const sql = `
        SELECT
            id,
            nome,
            email,
            bio,
            foto,
            data_cadastro
        FROM usuarios
        WHERE email = ? AND senha = ?
    `;

    banco.query(
        sql,
        [email, senha],
        (erro, resultados) => {

            if (erro) {

                console.error("Erro ao fazer login:", erro);

                return res.status(500).send(
                    "Erro ao realizar login."
                );
            }

            // Nenhum usuário encontrado
            if (resultados.length === 0) {

                return res.status(401).send(
                    "Email ou senha incorretos."
                );
            }

            const usuario = resultados[0];

            console.log(
                `✅ Login realizado: ${usuario.email}`
            );

            res.json(usuario);
        }
    );
});


// ===============================
// TESTE DO SERVIDOR
// ===============================

app.get("/", (req, res) => {
    res.send("Servidor do VestFacil funcionando!");
});


// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(3000, () => {
    console.log("================================");
    console.log("🚀 Servidor VestFacil iniciado!");
    console.log("📡 http://localhost:3000");
    console.log("================================");
});