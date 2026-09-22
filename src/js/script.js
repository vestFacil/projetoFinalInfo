document.getElementById("materia").addEventListener("click", () => {
    window.location.href = "materia.html";
});

document.getElementById("red").addEventListener("click", () => {
    window.location.href = "redacao.html";
});

document.getElementById("caderno").addEventListener("click", () => {
    window.location.href = "caderno.html";
});

document.getElementById("btnDesafio").addEventListener("click", () => {
    window.location.href =
    "questao.html?modo=desafio&materia=nao_classificadas";
});

document.getElementById("btnRevisao").addEventListener("click", () => {
    window.location.href = "revisao.html";
});