import { supabase } from './supabase/supabase.js'

let produtos = []
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || []

const produtosContainer = document.getElementById('products-container')
const categoriaMenu = document.getElementById('category-menu')
const inputBusca = document.getElementById('search')
const cartCount = document.getElementById('cart-count')

// 🛒 Atualiza contador e salva carrinho
function atualizarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho))
  cartCount.innerText = carrinho.length
}

// 🍔 Renderiza os produtos com filtros
function renderizarProdutos(lista) {
  produtosContainer.innerHTML = ''
  lista.forEach(produto => {
    const card = document.createElement('div')
    card.className = 'product-card'
    card.innerHTML = `
      <img src="${produto.imagem_url}" alt="${produto.nome}" />
      <div class="info">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <span class="price">R$ ${produto.preco.toFixed(2)}</span>
        <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button>
      </div>
    `
    produtosContainer.appendChild(card)
  })
}

// 🗂️ Renderiza categorias dinamicamente
function renderizarCategorias() {
  const categorias = [...new Set(produtos.map(p => p.categoria))]
  categoriaMenu.innerHTML = '<button class="active" onclick="filtrarPorCategoria(\'Todas\')">Todas</button>'
  categorias.forEach(cat => {
    const btn = document.createElement('button')
    btn.innerText = cat
    btn.onclick = () => filtrarPorCategoria(cat)
    categoriaMenu.appendChild(btn)
  })
}

window.filtrarPorCategoria = function (categoria) {
  document.querySelectorAll('#category-menu button').forEach(btn => btn.classList.remove('active'))
  [categoriaMenu.children].find(b => b.innerText === categoria).classList.add('active')

  if (categoria === 'Todas') {
    renderizarProdutos(produtos)
  } else {
    renderizarProdutos(produtos.filter(p => p.categoria === categoria))
  }
}

// 🔍 Filtro por texto
inputBusca.addEventListener('input', () => {
  const termo = inputBusca.value.toLowerCase()
  const filtrado = produtos.filter(p =>
    p.nome.toLowerCase().includes(termo) ||
    p.descricao.toLowerCase().includes(termo)
  )
  renderizarProdutos(filtrado)
})

// 🔔 Adiciona produto ao carrinho
window.adicionarAoCarrinho = function (idProduto) {
    const produto = produtos.find(p => p.id === idProduto)
    carrinho.push(produto)
    atualizarCarrinho()
    alert(`${produto.nome} adicionado ao carrinho!`)
  }
  
  // 🔄 Renderiza carrinho no modal
  function renderizarCarrinhoModal() {
    const container = document.getElementById('cart-items')
    const total = document.getElementById('cart-total')
    container.innerHTML = ''
    let soma = 0
  
    carrinho.forEach((item, index) => {
      soma += item.preco
      const p = document.createElement('p')
      p.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)}`
      container.appendChild(p)
    })
  
    total.innerText = `Total: R$ ${soma.toFixed(2)}`
  }
  
  // 🎯 Gera mensagem para WhatsApp
  function gerarMensagemWhatsApp(dados, carrinho) {
    let texto = `*Novo pedido via Cardápio Online*%0A`
    texto += `🧑 Nome: ${dados.nome}%0A📍 Endereço: ${dados.endereco}%0A💳 Pagamento: ${dados.pagamento}%0A`
    texto += `%0A*Itens:*%0A`
    let total = 0
  
    carrinho.forEach(p => {
      texto += `- ${p.nome} (R$ ${p.preco.toFixed(2)})%0A`
      total += p.preco
    })
  
    texto += `%0A*Total:* R$ ${total.toFixed(2)}`
    return texto
  }
  
  // 📤 Envia o pedido
  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const dados = Object.fromEntries(new FormData(e.target))
    const total = carrinho.reduce((sum, p) => sum + p.preco, 0)
  
    // Salva pedido no Supabase
    await supabase.from('vendas').insert([{
      nome_cliente: dados.nome,
      endereco: dados.endereco,
      pagamento: dados.pagamento,
      carrinho: JSON.stringify(carrinho),
      total
    }])
  
    // Redireciona para WhatsApp
    const mensagem = gerarMensagemWhatsApp(dados, carrinho)
    const telefoneLoja = '5511999999999' // coloque o número da loja com DDD
    window.open(`https://wa.me/${telefoneLoja}?text=${mensagem}`, '_blank')
  
    // Limpa carrinho
    carrinho = []
    atualizarCarrinho()
    document.getElementById('cart-modal').classList.add('hidden')
  })
  
  // 🎯 Controles do modal
  document.getElementById('open-cart').onclick = () => {
    renderizarCarrinhoModal()
    document.getElementById('cart-modal').classList.remove('hidden')
  }
  
  document.getElementById('close-cart').onclick = () => {
    document.getElementById('cart-modal').classList.add('hidden')
  }
  