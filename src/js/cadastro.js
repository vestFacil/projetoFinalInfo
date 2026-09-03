 function cadastrar(e) {
      e.preventDefault();
      fetch("http://localhost:3000/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          senha: document.getElementById("senha").value,
          bio: document.getElementById("bio").value
        })
      })
      ..then(res => {
       if (!res.ok) return res.text().then(msg => { throw new Error(msg) });
      return res.json();
      })
      .then(user => {
      localStorage.setItem("usuarioLogado", JSON.stringify(user));
      alert("Cadastro realizado com sucesso!");
      window.location.href = "perfil.html";
      })
      .catch(err => alert(err.message));
    }