const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "projeto_final"
});

// Testando a conexão
db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
        return;
    }
    console.log("Conectado ao MySQL com sucesso!");
});

// Configuração do Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "seuemail@gmail.com",
        pass: "sua_senha_app" // senha de app do Gmail
    }
});

// Cadastro
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, bio } = req.body;
  db.query(
    "INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)",
    [nome, email, senha, bio],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).send("Esse e-mail já está cadastrado. Faça login.");
        }
        return res.status(500).send(err);
      }
      res.send("Usuário cadastrado!");
    }
  );
});

// Login com envio de e-mail
app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    db.query(
        "SELECT * FROM usuarios WHERE email=? AND senha=?",
        [email, senha],
        (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length > 0) {
                const usuario = results[0];
                // Enviar e-mail de confirmação
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

// Perfil (dados + estatísticas + metas)
app.get("/perfil/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM usuarios WHERE id=?", [id], (err, userResults) => {
        if (err) return res.status(500).send(err);
        if (userResults.length === 0) return res.status(404).send("Usuário não encontrado");

        const usuario = userResults[0];
        db.query("SELECT * FROM estatisticas WHERE usuario_id=?", [id], (err, estResults) => {
            if (err) return res.status(500).send(err);
            const estatisticas = estResults[0] || { questoes_resolvidas:0, media_redacao:0, dias_estudando:0 };

            db.query("SELECT * FROM metas WHERE usuario_id=?", [id], (err, metasResults) => {
                if (err) return res.status(500).send(err);
                res.json({ ...usuario, ...estatisticas, metas: metasResults });
            });
        });
    });
});

// Atualizar estatísticas
app.post("/estatisticas", (req, res) => {
    const { usuarioId, questoes, media, dias } = req.body;
    db.query(
        "UPDATE estatisticas SET questoes_resolvidas=?, media_redacao=?, dias_estudando=?, ultimo_acesso=CURDATE() WHERE usuario_id=?",
        [questoes, media, dias, usuarioId],
        (err, result) => {
            if (err) return res.status(500).send(err);
            if (result.affectedRows === 0) {
                db.query(
                    "INSERT INTO estatisticas (usuario_id, questoes_resolvidas, media_redacao, dias_estudando, ultimo_acesso) VALUES (?, ?, ?, ?, CURDATE())",
                    [usuarioId, questoes, media, dias]
                );
            }
            res.send("Estatísticas atualizadas!");
        }
    );
});

// Metas: adicionar, concluir, excluir
app.post("/metas", (req, res) => {
    const { usuarioId, descricao } = req.body;
    db.query("INSERT INTO metas (usuario_id, descricao) VALUES (?, ?)", [usuarioId, descricao], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Meta adicionada!");
    });
});

app.put("/metas/:id", (req, res) => {
    const { id } = req.params;
    db.query("UPDATE metas SET concluida=TRUE WHERE id=?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Meta concluída!");
    });
});

app.delete("/metas/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM metas WHERE id=?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Meta excluída!");
    });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
