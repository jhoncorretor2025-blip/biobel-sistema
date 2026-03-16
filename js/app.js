// app.js - Biobel (cópia e cola)
// Persistência via localStorage (substituir por Supabase quando quiser)
// Chaves:
const LS = {
  produtos: 'biobel_produtos_v1',
  vendedoras: 'biobel_vendedoras_v1',
  marcas: 'biobel_marcas_v1',
  categorias: 'biobel_categorias_v1',
  vendas: 'biobel_vendas_v1',
  caixa: 'biobel_caixa_v1',
  saidas: 'biobel_saidas_v1',
  lastSaleId: 'biobel_lastSaleId_v1'
};

// utilidades
const $ = id => document.getElementById(id);
const nowISO = ()=> new Date().toISOString();
const todayKey = (d=new Date()) => d.toISOString().slice(0,10);

function load(key, defaultVal){ try{ const v=localStorage.getItem(key); return v? JSON.parse(v): defaultVal }catch(e){return defaultVal} }
function save(key, obj){ localStorage.setItem(key, JSON.stringify(obj)) }

// INIT DEFAULTS
function ensureDefaults(){
  if(!load(LS.vendedoras)) save(LS.vendedoras, ["Alessandra","Letícia"]);
  if(!load(LS.produtos)) save(LS.produtos, [
    {id:1,nome:"Shampoo Truss",marca:"Truss",categoria:"cabelo",preco:99},
    {id:2,nome:"Creme Facial",marca:"Truss",categoria:"cremes",preco:50},
    {id:3,nome:"Perfume Lux",marca:"Lux",categoria:"perfume",preco:120},
    {id:4,nome:"Base Makeup",marca:"Makeup",categoria:"maquiagem",preco:80}
  ]);
  if(!load(LS.marcas)) save(LS.marcas, ["Truss","Lux","Marca X"]);
  if(!load(LS.categorias)) save(LS.categorias, ["cabelo","perfume","maquiagem","cremes"]);
  if(!load(LS.vendas)) save(LS.vendas, []);
  if(!load(LS.caixa)) save(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  if(!load(LS.saidas)) save(LS.saidas, []);
  if(!localStorage.getItem(LS.lastSaleId)) localStorage.setItem(LS.lastSaleId, "0");
}
ensureDefaults();

/* ---------- FUNÇÕES GERAIS ---------- */

function nextSaleId(){
  let id = parseInt(localStorage.getItem(LS.lastSaleId)||"0",10) + 1;
  localStorage.setItem(LS.lastSaleId, String(id));
  return id;
}

function formatMoney(n){ return Number(n||0).toFixed(2) }

function atualizarCarrinhoUI(carrinho){
  const cont = $('carrinhoItens');
  if(!cont) return;
  if(!carrinho) carrinho = load('temp_carrinho') || [];
  let html = '';
  carrinho.forEach((it, idx)=>{
    html += `<div class="carrinho-item">
      <div><strong>${it.nome}</strong><br><small>${it.marca||''} • ${it.categoria||''}</small></div>
      <div>R$ ${formatMoney(it.preco)} x ${it.qtd||1}
        <div style="font-size:12px"><button onclick="removerItem(${idx})">Remover</button></div>
      </div>
    </div>`;
  });
  cont.innerHTML = html || '<small>Toque nos produtos para adicionar</small>';
  atualizaTotal(carrinho);
}

function salvarTempCarrinho(carrinho){
  save('temp_carrinho', carrinho);
}

function carregarTempCarrinho(){ return load('temp_carrinho', []); }

function removerItem(index){
  let c = carregarTempCarrinho();
  c.splice(index,1);
  salvarTempCarrinho(c);
  atualizarCarrinhoUI(c);
}

/* ---------- PRODUTOS / BUSCA / FILTRO ---------- */

function carregarProdutosGrid(lista){
  lista = lista || load(LS.produtos, []);
  const cont = $('listaProdutos');
  if(!cont) return;
  let html = '';
  lista.forEach(p=>{
    html += `<div class="card" onclick='addProdutoAoCarrinho(${p.id})'>
      <div>
        <h3>${p.nome}</h3>
        <small>${p.marca || ''} • ${p.categoria || ''}</small>
      </div>
      <div><p>R$ ${formatMoney(p.preco)}</p></div>
    </div>`;
  });
  cont.innerHTML = html || '<p>Nenhum produto cadastrado</p>';
}

function filtrarBusca(){
  const q = ($('buscarProduto') && $('buscarProduto').value||'').toLowerCase();
  const todos = load(LS.produtos, []);
  if(!q) return carregarProdutosGrid(todos);
  const f = todos.filter(p=> (p.nome||'').toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q) );
  carregarProdutosGrid(f);
}

function filtrarCategoria(cat){
  if(cat==='todos') carregarProdutosGrid();
  else {
    const todos = load(LS.produtos, []);
    carregarProdutosGrid(todos.filter(p=>p.categoria===cat));
  }
}

/* ---------- CARRINHO / VENDAS ---------- */

function addProdutoAoCarrinho(id){
  const produtos = load(LS.produtos, []);
  const p = produtos.find(x=>x.id===id);
  if(!p) return alert('Produto não encontrado');
  let carrinho = carregarTempCarrinho();
  carrinho.push({...p, qtd:1});
  salvarTempCarrinho(carrinho);
  atualizarCarrinhoUI(carrinho);
}

function adicionarManual(){
  const nome = $('manualNome').value.trim();
  const marca = $('manualMarca').value.trim();
  const preco = parseFloat($('manualPreco').value||0);
  const qtd = parseInt($('manualQtd').value||1,10);
  if(!nome || preco<=0) return alert('Preencha nome e preço do produto manual');
  let carrinho = carregarTempCarrinho();
  carrinho.push({id: Date.now(), nome, marca, categoria:'avulso', preco, qtd});
  salvarTempCarrinho(carrinho);
  atualizarCarrinhoUI(carrinho);
  $('manualNome').value=''; $('manualMarca').value=''; $('manualPreco').value=''; $('manualQtd').value='1';
}

/* quando checkbox somente total mudar */
if(typeof window !== 'undefined'){
  window.addEventListener('load', ()=>{
    const chk = document.getElementById('somenteTotalChk');
    if(chk){
      chk.addEventListener('change', ()=>{
        const vis = chk.checked ? 'block' : 'none';
        const row = document.getElementById('totalManualRow');
        if(row) row.style.display = vis;
      });
    }
  });
}

function atualizaTotal(carrinho){
  if(!carrinho) carrinho = carregarTempCarrinho();
  let sum = 0;
  carrinho.forEach(it=> sum += (Number(it.preco)||0) * (Number(it.qtd)||1));
  // também somar valores de pagamento quando preenchidos
  const din=Number($('pagDinheiro')? $('pagDinheiro').value:0)||0;
  const pix=Number($('pagPix')? $('pagPix').value:0)||0;
  const deb=Number($('pagDebito')? $('pagDebito').value:0)||0;
  const cre=Number($('pagCredito')? $('pagCredito').value:0)||0;
  const link=Number($('pagLink')? $('pagLink').value:0)||0;
  let totalPag = din+pix+deb+cre+link;
  const somenteTotal = $('somenteTotalChk') && $('somenteTotalChk').checked;
  if(somenteTotal && $('totalManual')){
    const tm = Number($('totalManual').value||0);
    sum = tm;
  } else if(totalPag>0){
    // if user filled payment fields, reflect sum of payments (useful when adding products + payment split)
    sum = Math.max(sum, totalPag);
  }
  if($('totalCalc')) $('totalCalc').innerText = formatMoney(sum);
}

/* ligar inputs para atualizar total sempre que mudarem */
function bindPagamentoInputs(){
  ['pagDinheiro','pagPix','pagDebito','pagCredito','pagLink','totalManual'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', ()=>atualizaTotal());
  });
}
window.addEventListener('load', bindPagamentoInputs);

/* finalizar venda */
function finalizarVenda(){
  const somenteTotal = $('somenteTotalChk') && $('somenteTotalChk').checked;
  const carrinho = carregarTempCarrinho();
  let subtotal = 0;
  if(!somenteTotal){
    if(carrinho.length===0) return alert('Adicione produtos ou marque "Registrar só o total"');
    carrinho.forEach(it=> subtotal += (Number(it.preco)||0)*(Number(it.qtd)||1));
  } else {
    subtotal = Number($('totalManual') && $('totalManual').value || 0);
    if(subtotal<=0) return alert('Informe o valor total da venda');
  }

  // pagamentos
  const dinheiro = Number($('pagDinheiro') && $('pagDinheiro').value||0);
  const pix = Number($('pagPix') && $('pagPix').value||0);
  const debito = Number($('pagDebito') && $('pagDebito').value||0);
  const credito = Number($('pagCredito') && $('pagCredito').value||0);
  const link = Number($('pagLink') && $('pagLink').value||0);
  const somaPag = dinheiro+pix+debito+credito+link;
  if(somaPag>0 && Math.abs(somaPag - subtotal) > 0.009){
    if(!confirm('A soma das formas de pagamento difere do total. Deseja continuar?')) return;
  }

  const vendedora = $('vendedoraSelect') ? $('vendedoraSelect').value : 'Sem nome';
  const turno = $('turnoSelect') ? $('turnoSelect').value : 'Manhã';
  const id = nextSaleId();
  const dataHora = nowISO();

  const venda = {
    id,
    created_at: dataHora,
    numero: id,
    vendedora,
    turno,
    itens: somenteTotal ? [] : carrinho,
    valor_total: subtotal,
    pagamentos: {dinheiro, pix, debito, credito, link}
  };

  // salvar vendas
  const vendas = load(LS.vendas, []);
  vendas.push(venda);
  save(LS.vendas, vendas);

  // adicionar entrada ao caixa automaticamente (registra cada forma de pagamento)
  const caixa = load(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  caixa.entradas.push({vendaId:id, data: dataHora, total: subtotal, pagamentos: venda.pagamentos, vendedora, turno});
  save(LS.caixa, caixa);

  // limpar carrinho e inputs
  save('temp_carrinho', []);
  if($('pagDinheiro')) $('pagDinheiro').value=''; if($('pagPix')) $('pagPix').value=''; if($('pagDebito')) $('pagDebito').value=''; if($('pagCredito')) $('pagCredito').value=''; if($('pagLink')) $('pagLink').value='';
  if($('totalManual')) $('totalManual').value='';
  atualizarCarrinhoUI([]);
  atualizarPainelAtendimentos();
  atualizarCaixaUI();
  atualizarDashboardUI();

  alert('Venda registrada com sucesso! (ID: '+id+')');
}

/* ---------- ATENDIMENTOS DO DIA (painel) ---------- */
function atualizarPainelAtendimentos(){
  const vendas = load(LS.vendas, []);
  const hoje = todayKey();
  const vendasHoje = vendas.filter(v=> v.created_at && v.created_at.slice(0,10)===hoje);
  const qtd = vendasHoje.length;
  const total = vendasHoje.reduce((s,v)=>s + Number(v.valor_total||0),0);
  // vendas por vendedora
  const porVend = {};
  const porTurno = {};
  const porPagamento = {};
  const produtosVendidos = {};
  vendasHoje.forEach(v=>{
    porVend[v.vendedora] = (porVend[v.vendedora]||0) + Number(v.valor_total||0);
    porTurno[v.turno] = (porTurno[v.turno]||0) + Number(v.valor_total||0);
    // pagamentos
    const p = v.pagamentos || {};
    Object.keys(p).forEach(k=>{ if(Number(p[k])) porPagamento[k] = (porPagamento[k]||0) + Number(p[k]) });
    // produtos
    (v.itens||[]).forEach(it=>{
      produtosVendidos[it.nome] = (produtosVendidos[it.nome]||0) + (Number(it.qtd)||1);
    });
  });

  const cont = $('painelAtendimentos');
  if(!cont) return;
  let html = `<p><strong>Atendimentos:</strong> ${qtd}</p>`;
  html += `<p><strong>Total:</strong> R$ ${formatMoney(total)}</p>`;
  html += `<p><strong>Vendas por vendedora:</strong></p><ul>`;
  Object.keys(porVend).forEach(k=> html += `<li>${k}: R$ ${formatMoney(porVend[k])}</li>`);
  html += `</ul><p><strong>Vendas por turno:</strong></p><ul>`;
  Object.keys(porTurno).forEach(k=> html += `<li>${k}: R$ ${formatMoney(porTurno[k])}</li>`);
  html += `</ul><p><strong>Formas de pagamento:</strong></p><ul>`;
  Object.keys(porPagamento).forEach(k=> html += `<li>${k}: R$ ${formatMoney(porPagamento[k])}</li>`);
  html += `</ul><p><strong>Produtos vendidos:</strong></p><ul>`;
  Object.keys(produtosVendidos).forEach(k=> html += `<li>${k}: qtd ${produtosVendidos[k]}</li>`);
  html += `</ul>`;
  cont.innerHTML = html;
}

/* ---------- CONFIGURAÇÕES (produtos, vendedoras, marcas, categorias) ---------- */

function initConfig(){
  renderVendedorasConfig();
  renderMarcasConfig();
  renderCategoriasConfig();
  renderProdutosConfig();
}

function renderVendedorasConfig(){
  const list = $('listaVendedoras');
  if(!list) return;
  const v = load(LS.vendedoras, []);
  list.innerHTML = v.map((name, i)=>`<li>${name} <button onclick="removerVendedora(${i})">Excluir</button></li>`).join('');
  carregarVendedorasSelect();
}

function cadastrarVendedora(){
  const nome = $('inputVendedora').value.trim();
  if(!nome) return alert('Digite o nome');
  const arr = load(LS.vendedoras, []);
  arr.push(nome);
  save(LS.vendedoras, arr);
  $('inputVendedora').value='';
  renderVendedorasConfig();
}

function removerVendedora(i){
  const arr = load(LS.vendedoras, []);
  arr.splice(i,1); save(LS.vendedoras, arr); renderVendedorasConfig();
}

function renderMarcasConfig(){
  const list = $('listaMarcas'); if(!list) return;
  const arr = load(LS.marcas, []);
  list.innerHTML = arr.map((m,i)=>`<li>${m} <button onclick="removerMarca(${i})">Excluir</button></li>`).join('');
  carregarMarcasSelect();
}
function cadastrarMarca(){
  const nome = $('inputMarca').value.trim(); if(!nome) return alert('Digite a marca');
  const arr = load(LS.marcas, []); arr.push(nome); save(LS.marcas, arr); $('inputMarca').value=''; renderMarcasConfig();
}
function removerMarca(i){ const arr = load(LS.marcas, []); arr.splice(i,1); save(LS.marcas, arr); renderMarcasConfig(); }

function renderCategoriasConfig(){
  const list = $('listaCategorias'); if(!list) return;
  const arr = load(LS.categorias, []);
  list.innerHTML = arr.map((m,i)=>`<li>${m} <button onclick="removerCategoria(${i})">Excluir</button></li>`).join('');
  carregarCategoriasSelect();
}
function cadastrarCategoria(){ const nome = $('inputCategoria').value.trim(); if(!nome) return alert('Digite a categoria'); const arr = load(LS.categorias, []); arr.push(nome); save(LS.categorias, arr); $('inputCategoria').value=''; renderCategoriasConfig(); }
function removerCategoria(i){ const arr = load(LS.categorias, []); arr.splice(i,1); save(LS.categorias, arr); renderCategoriasConfig(); }

function renderProdutosConfig(){
  const cont = $('listaProdutosConfig'); if(!cont) return;
  const arr = load(LS.produtos, []);
  cont.innerHTML = arr.map(p=>`<li>${p.nome} - ${p.marca||''} - ${p.categoria||''} - R$ ${formatMoney(p.preco)} <button onclick="removerProduto(${p.id})">Excluir</button></li>`).join('');
  carregarProdutosGrid(arr);
}
function cadastrarProdutoConfig(){
  const nome = $('prodNome').value.trim(); const marca = $('prodMarca').value.trim() || 'N/A'; const categoria = $('prodCategoria').value.trim() || 'outros'; const preco = Number($('prodPreco').value||0);
  if(!nome || preco<=0) return alert('Nome e preço válido são necessários');
  const arr = load(LS.produtos, []);
  const id = Date.now();
  arr.push({id, nome, marca, categoria, preco});
  save(LS.produtos, arr);
  $('prodNome').value=''; $('prodMarca').value=''; $('prodCategoria').value=''; $('prodPreco').value='';
  renderProdutosConfig();
}
function removerProduto(id){
  let arr = load(LS.produtos, []); arr = arr.filter(p=>p.id!==id); save(LS.produtos, arr); renderProdutosConfig();
}

/* carregar selects de vendedoras / marcas / categorias para VENDAS */
function carregarVendedorasSelect(){
  const sel = $('vendedoraSelect'); if(!sel) return;
  const arr = load(LS.vendedoras, []);
  sel.innerHTML = arr.map(n=>`<option>${n}</option>`).join('');
}
function carregarMarcasSelect(){
  // opcional: para usar em formulários
}
function carregarCategoriasSelect(){
  // opcional
}

/* ---------- CAIXA e SAÍDAS ---------- */
function initCaixa(){
  atualizarCaixaUI();
  renderHistoricoMov();
}

function setSaldoInicial(){
  const val = Number($('saldoInicialInput').value||0);
  const caixa = load(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  caixa.saldoInicial = val;
  save(LS.caixa, caixa);
  atualizarCaixaUI();
}

function atualizarCaixaUI(){
  const caixa = load(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  const entradasTot = caixa.entradas.reduce((s,e)=>s+Number(e.total||0),0);
  const saidasTot = (load(LS.saidas, [])).reduce((s,e)=>s+Number(e.valor||0),0);
  const saldoAtual = Number(caixa.saldoInicial||0)+entradasTot - saidasTot;
  if($('caixaEntradas')) $('caixaEntradas').innerText = formatMoney(entradasTot);
  if($('caixaSaidas')) $('caixaSaidas').innerText = formatMoney(saidasTot);
  if($('caixaSaldoAtual')) $('caixaSaldoAtual').innerText = formatMoney(saldoAtual);
  if($('historicoMov')) renderHistoricoMov();
}

function renderHistoricoMov(){
  const ul = $('historicoMov'); if(!ul) return;
  const caixa = load(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  const vendas = caixa.entradas || [];
  const saidas = load(LS.saidas, []);
  let html = '';
  vendas.slice().reverse().forEach(v=>{
    html += `<li>Venda #${v.vendaId} ${v.data.slice(0,19).replace('T',' ')} - R$ ${formatMoney(v.total)} - ${v.vendedora}</li>`;
  });
  saidas.slice().reverse().forEach(s=>{
    html += `<li>Saída ${s.data} - R$ ${formatMoney(s.valor)} - ${s.descricao}</li>`;
  });
  ul.innerHTML = html || '<li>Sem movimentos</li>';
}

/* registrar saída (saída-caixa.html) */
function initSaida(){
  atualizarListaSaidas();
}
function registrarSaida(){
  const data = $('saidaData').value || todayKey();
  const valor = Number($('saidaValor').value||0);
  const forma = $('saidaForma').value || 'Dinheiro';
  const desc = $('saidaDescricao').value || '';
  if(valor<=0) return alert('Valor inválido');
  const saidas = load(LS.saidas, []);
  saidas.push({data, valor, forma, descricao:desc});
  save(LS.saidas, saidas);
  // descontar do caixa (salva em caixa.saidas)
  const caixa = load(LS.caixa, {saldoInicial:0,entradas:[],saidas:[]});
  caixa.saidas = caixa.saidas || [];
  caixa.saidas.push({data, valor, forma, descricao:desc});
  save(LS.caixa, caixa);
  $('saidaValor').value=''; $('saidaDescricao').value='';
  atualizarCaixaUI();
  atualizarListaSaidas();
  alert('Saída registrada');
}
function atualizarListaSaidas(){
  const lista = $('listaSaidas'); if(!lista) return;
  const saidas = load(LS.saidas, []);
  const hoje = todayKey();
  const totaisHoje = saidas.filter(s=> s.data===hoje ).reduce((s,x)=> s + Number(x.valor||0),0);
  if($('totalSaidasHoje')) $('totalSaidasHoje').innerText = formatMoney(totaisHoje);
  lista.innerHTML = saidas.slice().reverse().map(s=>`<li>${s.data} - R$ ${formatMoney(s.valor)} - ${s.forma} - ${s.descricao}</li>`).join('');
}

/* ---------- DASHBOARD ---------- */

function initDashboard(){
  atualizarDashboardUI();
}

function atualizarDashboardUI(){
  const vendas = load(LS.vendas, []);
  const hoje = todayKey();
  const vendasHoje = vendas.filter(v=> v.created_at && v.created_at.slice(0,10)===hoje);
  const totalHoje = vendasHoje.reduce((s,v)=> s + Number(v.valor_total||0),0);
  if($('dashTotalHoje')) $('dashTotalHoje').innerText = 'R$ ' + formatMoney(totalHoje);

  // total mês
  const mesAtual = (new Date()).toISOString().slice(0,7);
  const vendasMes = vendas.filter(v=> v.created_at && v.created_at.slice(0,7)===mesAtual);
  const totalMes = vendasMes.reduce((s,v)=> s + Number(v.valor_total||0),0);
  if($('dashTotalMes')) $('dashTotalMes').innerText = 'R$ ' + formatMoney(totalMes);

  // melhor vendedora (acumulado)
  const porVend = {};
  vendas.forEach(v=> porVend[v.vendedora] = (porVend[v.vendedora]||0) + Number(v.valor_total||0));
  const melhor = Object.keys(porVend).reduce((a,b)=> porVend[a]>porVend[b]?a:b, Object.keys(porVend)[0]|| '-');
  if($('dashMelhorVendedora')) $('dashMelhorVendedora').innerText = melhor || '-';

  // dia com maior venda (por soma diária)
  const porDia = {};
  vendas.forEach(v=> {
    const d = (v.created_at||'').slice(0,10);
    if(!d) return;
    porDia[d] = (porDia[d]||0) + Number(v.valor_total||0);
  });
  const melhorDia = Object.keys(porDia).reduce((a,b)=> porDayVal(a,porDia) > porDayVal(b,porDia) ? a : b, Object.keys(porDia)[0]|| '-');
  function porDayVal(k,map){ return map[k]||0 }
  if($('dashMelhorDia')) $('dashMelhorDia').innerText = melhorDia || '-';

  // charts de resumo
  buildCharts(vendas);
}

function buildCharts(vendas){
  // Vendas por vendedora
  const mapVend = {};
  vendas.forEach(v=> mapVend[v.vendedora] = (mapVend[v.vendedora]||0) + Number(v.valor_total||0));
  const labelsVend = Object.keys(mapVend); const dataVend = labelsVend.map(l=>mapVend[l]);

  // vendas por categoria
  const mapCat = {};
  vendas.forEach(v=> (v.itens||[]).forEach(i=> mapCat[i.categoria] = (mapCat[i.categoria]||0) + (Number(i.preco)||0) * (Number(i.qtd)||1)));
  const labelsCat = Object.keys(mapCat); const dataCat = labelsCat.map(l=>mapCat[l]);

  // vendas por forma
  const mapPag = {};
  vendas.forEach(v=> { const p=v.pagamentos||{}; Object.keys(p).forEach(k=> mapPag[k] = (mapPag[k]||0) + Number(p[k]||0)); });
  const labelsPag = Object.keys(mapPag); const dataPag = labelsPag.map(l=>mapPag[l]);

  // top produtos
  const mapProd = {};
  vendas.forEach(v=> (v.itens||[]).forEach(i=> mapProd[i.nome] = (mapProd[i.nome]||0) + (Number(i.preco)||0) * (Number(i.qtd)||1)));
  const labelsProd = Object.keys(mapProd).slice(0,10); const dataProd = labelsProd.map(l=>mapProd[l]);

  // desenhar os charts (simples)
  try {
    if(window.Chart){
      drawChart('chartVendedora', labelsVend, dataVend);
      drawChart('chartCategoria', labelsCat, dataCat);
      drawChart('chartPagamento', labelsPag, dataPag);
      drawChart('chartProdutos', labelsProd, dataProd);
    }
  } catch(e){}
}
function drawChart(id, labels, data){
  const ctx = document.getElementById(id);
  if(!ctx) return;
  if(ctx._chartInstance) ctx._chartInstance.destroy();
  ctx._chartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label:'R$', data, backgroundColor:'rgba(34,197,94,0.7)'}] },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
}

/* ---------- INICIALIZAÇÃO (carregar UI ao abrir páginas) ---------- */

window.addEventListener('load', ()=>{
  // inicializar comuns
  carregarProdutosGrid();
  carregarVendedorasSelect();
  atualizarCarrinhoUI();
  atualizarPainelAtendimentos();
  atualizarCaixaUI();

  // inicializar páginas específicas
  if(location.pathname.endsWith('configuracao.html') && window.initConfig) initConfig();
  if(location.pathname.endsWith('caixa.html') && window.initCaixa) initCaixa();
  if(location.pathname.endsWith('saida-caixa.html') && window.initSaida) initSaida();
  if(location.pathname.endsWith('dashboard.html') && window.initDashboard) initDashboard();
});

// expor funções para uso nos onclicks a partir do HTML
window.filtrarBusca = filtrarBusca;
window.filtrarCategoria = filtrarCategoria;
window.addProdutoAoCarrinho = addProdutoAoCarrinho;
window.adicionarManual = adicionarManual;
window.removerItem = removerItem;
window.finalizarVenda = finalizarVenda;
window.atualizarPainelAtendimentos = atualizarPainelAtendimentos;
window.cadastrarVendedora = cadastrarVendedora;
window.cadastrarMarca = cadastrarMarca;
window.cadastrarCategoria = cadastrarCategoria;
window.cadastrarProdutoConfig = cadastrarProdutoConfig;
window.initConfig = initConfig;
window.initCaixa = initCaixa;
window.setSaldoInicial = setSaldoInicial;
window.initSaida = initSaida;
window.registrarSaida = registrarSaida;
window.initDashboard = initDashboard;
