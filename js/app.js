let produtos=[
{nome:"Shampoo Truss",preco:99},
{nome:"Creme Facial",preco:50}
]

let carrinho=[]
let vendas=[]
let vendedoras=["Alessandra","Letícia"]

function carregarVendedoras(){

let select=document.getElementById("vendedoraSelect")

if(!select) return

let html=""

vendedoras.forEach(v=>{

html+=`<option>${v}</option>`

})

select.innerHTML=html

}

carregarVendedoras()

function cadastrarVendedora(){

let nome=document.getElementById("novaVendedora").value

vendedoras.push(nome)

alert("Vendedora cadastrada")

}

function cadastrarProduto(){

let nome=document.getElementById("novoProduto").value
let preco=parseFloat(document.getElementById("novoPreco").value)

produtos.push({nome,preco})

alert("Produto cadastrado")

}

function finalizarVenda(){

let total=0

carrinho.forEach(p=>total+=p.preco)

let vendedora=document.getElementById("vendedoraSelect").value
let pagamento=document.getElementById("pagamento").value
let turno=document.getElementById("turno").value

vendas.push({

valor:total,
vendedora:vendedora,
pagamento:pagamento,
turno:turno

})

alert("Venda registrada")

}
