let produtos = []
let vendas = []
let saidas = []

function mostrarPagina(pagina){

document.querySelectorAll(".pagina").forEach(p=>{

p.style.display="none"

})

document.getElementById(pagina).style.display="block"

}

mostrarPagina("vendas")

function adicionarProduto(){

let nome = document.getElementById("produto").value
let valor = document.getElementById("valor").value

produtos.push({nome,valor})

renderProdutos()

}

function renderProdutos(){

let lista = document.getElementById("listaProdutos")

lista.innerHTML=""

produtos.forEach(p=>{

lista.innerHTML += `<p>${p.nome} - R$ ${p.valor}</p>`

})

}

function registrarVenda(){

let dinheiro = Number(document.getElementById("dinheiro").value || 0)
let pix = Number(document.getElementById("pix").value || 0)
let debito = Number(document.getElementById("debito").value || 0)
let credito = Number(document.getElementById("credito").value || 0)

let total = dinheiro + pix + debito + credito

vendas.push({

produtos,
total

})

produtos = []

renderProdutos()

atualizarDashboard()

alert("Venda registrada!")

}

function registrarSaida(){

let valor = Number(document.getElementById("valorSaida").value)

saidas.push(valor)

atualizarDashboard()

}

function atualizarDashboard(){

let total = vendas.reduce((acc,v)=>acc+v.total,0)

document.getElementById("totalHoje").innerText = total

document.getElementById("quantidadeVendas").innerText = vendas.length

let saidaTotal = saidas.reduce((a,b)=>a+b,0)

document.getElementById("entradas").innerText = total
document.getElementById("saidas").innerText = saidaTotal
document.getElementById("saldoAtual").innerText = total - saidaTotal

}
