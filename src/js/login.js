document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("loginEmail").value,
            senha: document.getElementById("loginSenha").value
        })
    })
    .then(res => {
        if (res.ok) return res.json();
        else throw new Error("Login inválido");
    })
    .then(user => {
        localStorage.setItem("usuarioLogado", JSON.stringify(user));
        window.location.href = "perfil.html";
    })
    .catch(err => alert(err.message));
});
