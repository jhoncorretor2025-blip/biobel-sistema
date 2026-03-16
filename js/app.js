// =============================
// BANCO DE DADOS LOCAL
// =============================

let produtos = JSON.parse(localStorage.getItem("biobel_produtos_v1")) || [
{ id:1, nome:"Shampoo Truss", marca:"Truss", categoria:"cabelo", preco:99 },
{ id:2, nome:"Creme Facial", marca:"Truss", categoria:"cremes", preco:50 },
{ id:3, nome:"Perfume Lux", marca:"Lux", categoria:"perfume", preco:120 },
{ id:4, nome:"Base Makeup", marca:"Makeup", categoria:"maquiagem", preco:80 }
]

let vendedoras = JSON.parse(localStorage.getItem("biobel_vendedoras_v1")) || [
"Alessandra",
"Letícia"
]

let marcas = JSON.parse(localStorage.getItem("biobel_marcas_v1")) || [
"Truss",
"Lux"
]

let categorias = JSON.parse(localStorage.getItem("biobel_categorias_v1")) || [
"cabelo",
"perfume",
"maquiagem",
"cremes"
]

let vendas = JSON.parse(localStorage.getItem("biobel_vendas_v1")) || []

let carrinho = []

// =============================
// SALVAR DADOS
// =============================

function salvarTudo(){

localStorage.setItem("biobel_produtos_v1",JSON.stringify(produtos))
localStorage.setItem("biobel_vendedoras_v1",JSON.stringify(vendedoras))
localStorage.setItem("biobel_marcas_v1",JSON.stringify(marcas))
localStorage.setItem("biobel_categorias_v1",JSON.stringify(categorias))
localStorage.setItem("biobel_vendas_v1",JSON.stringify(vendas))

}

// =============================
// PRODUTOS (CARDS)
// =============================

function carregarProdutos(){

let lista = document.getElementById("listaProdutos")

if(!lista) return

lista.innerHTML=""

produtos.forEach(p=>{

lista.innerHTML += `

<div class="produto" onclick="addCarrinho(${p.id})">

<div class="produto-tags">

<span class="tag-categoria">${p.categoria}</span>
<span class="tag-marca">${p.marca}</span>

</div>

<h3>${p.nome}</h3>

<strong>R$ ${p.preco.toFixed(2)}</strong>

</div>

`

})

}

// =============================
// CARRINHO
// =============================

function addCarrinho(id){

let p = produtos.find(x=>x.id===id)

carrinho.push(p)

renderCarrinho()

}

function renderCarrinho(){

let div = document.getElementById("carrinhoItens")

if(!div) return

div.innerHTML=""

let total = 0

carrinho.forEach((p,i)=>{

total += Number(p.preco)

div.innerHTML += `

<div class="carrinho-item">

${p.nome} - R$ ${p.preco}

<button onclick="removerItem(${i})">X</button>

</div>

`

})

let totalDiv = document.getElementById("totalCalc")

if(totalDiv) totalDiv.innerText = total.toFixed(2)

}

function removerItem(i){

carrinho.splice(i,1)

renderCarrinho()

}

// =============================
// FINALIZAR VENDA
// =============================

function finalizarVenda(){

let total = 0

carrinho.forEach(p=> total += Number(p.preco))

let vendedora = document.getElementById("vendedoraSelect")?.value || "Não informado"

let turno = document.getElementById("turnoSelect")?.value || "Manhã"

let venda = {

id: Date.now(),
data: new Date().toLocaleString(),
vendedora:vendedora,
turno:turno,
produtos:carrinho,
valor:total

}

vendas.push(venda)

salvarTudo()

carrinho=[]

renderCarrinho()

alert("Venda registrada")

}

// =============================
// CADASTRAR PRODUTO
// =============================

function cadastrarProduto(){

let nome = document.getElementById("prodNome").value
let marca = document.getElementById("prodMarca").value
let categoria = document.getElementById("prodCategoria").value
let preco = document.getElementById("prodPreco").value

let novo = {

id: Date.now(),
nome:nome,
marca:marca,
categoria:categoria,
preco:Number(preco)

}

produtos.push(novo)

salvarTudo()

renderProdutosConfig()

carregarProdutos()

alert("Produto cadastrado")

}

// =============================
// LISTAR PRODUTOS CONFIG
// =============================

function renderProdutosConfig(){

let cont = document.getElementById("listaProdutosConfig")

if(!cont) return

cont.innerHTML=""

produtos.forEach((p,i)=>{

cont.innerHTML += `

<li>

${p.nome} - ${p.marca} - ${p.categoria} - R$ ${p.preco}

<div class="actions">

<button class="btn-edit" onclick="editarProduto(${i})">
Editar
</button>

<button class="btn-delete" onclick="removerProduto(${p.id})">
Excluir
</button>

</div>

</li>

`

})

}

function removerProduto(id){

produtos = produtos.filter(p=>p.id!==id)

salvarTudo()

renderProdutosConfig()

carregarProdutos()

}

function editarProduto(index){

let p = produtos[index]

let novoNome = prompt("Nome do produto",p.nome)
let novaMarca = prompt("Marca",p.marca)
let novaCategoria = prompt("Categoria",p.categoria)
let novoPreco = prompt("Preço",p.preco)

if(novoNome){

produtos[index] = {

...p,
nome:novoNome,
marca:novaMarca,
categoria:novaCategoria,
preco:Number(novoPreco)

}

salvarTudo()

renderProdutosConfig()

carregarProdutos()

}

}

// =============================
// VENDEDORAS
// =============================

function cadastrarVendedora(){

let nome = document.getElementById("inputVendedora").value

vendedoras.push(nome)

salvarTudo()

renderVendedoras()

}

function renderVendedoras(){

let lista = document.getElementById("listaVendedoras")

if(!lista) return

lista.innerHTML=""

vendedoras.forEach((v,i)=>{

lista.innerHTML += `

<li>

${v}

<button onclick="removerVendedora(${i})">
Excluir
</button>

</li>

`

})

}

function removerVendedora(i){

vendedoras.splice(i,1)

salvarTudo()

renderVendedoras()

}

// =============================
// MARCAS
// =============================

function cadastrarMarca(){

let nome = document.getElementById("inputMarca").value

marcas.push(nome)

salvarTudo()

renderMarcas()

}

function renderMarcas(){

let lista = document.getElementById("listaMarcas")

if(!lista) return

lista.innerHTML=""

marcas.forEach((m,i)=>{

lista.innerHTML += `

<li>

${m}

<button onclick="removerMarca(${i})">
Excluir
</button>

</li>

`

})

}

function removerMarca(i){

marcas.splice(i,1)

salvarTudo()

renderMarcas()

}

// =============================
// CATEGORIAS
// =============================

function cadastrarCategoria(){

let nome = document.getElementById("inputCategoria").value

categorias.push(nome)

salvarTudo()

renderCategorias()

}

function renderCategorias(){

let lista = document.getElementById("listaCategorias")

if(!lista) return

lista.innerHTML=""

categorias.forEach((c,i)=>{

lista.innerHTML += `

<li>

${c}

<button onclick="removerCategoria(${i})">
Excluir
</button>

</li>

`

})

}

function removerCategoria(i){

categorias.splice(i,1)

salvarTudo()

renderCategorias()

}

// =============================
// INICIAR SISTEMA
// =============================

window.onload = function(){

carregarProdutos()
renderProdutosConfig()
renderVendedoras()
renderMarcas()
renderCategorias()

}
