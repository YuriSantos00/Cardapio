import { supabase } from '../supabase/supabase.js'

const form = document.getElementById('form-produto')
const produtosContainer = document.getElementById('produtos-container')
const logoutBtn = document.getElementById('logout')

// Proteção de rota
const session = await supabase.auth.getSession()
if (!session.data.session) {
  window.location.href = './login.html'
}

// Logout
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = './login.html'
})

// Upload de imagem no bucket 'imagens'
async function uploadImagem(arquivo) {
  const nomeArquivo = `${Date.now()}_${arquivo.name}`
  const { error } = await supabase.storage.from('imagens').upload(nomeArquivo, arquivo)
  if (error) throw new Error('Erro ao subir imagem')
  const { data } = supabase.storage.from('imagens').getPublicUrl(nomeArquivo)
  return data.publicUrl
}

// Cadastrar ou atualizar produto
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(form)
  const imagem = formData.get('imagem')
  const editandoId = form.dataset.editando

  let imagem_url = null
  if (imagem && imagem.size > 0) {
    imagem_url = await uploadImagem(imagem)
  }

  const payload = {
    nome: formData.get('nome'),
    descricao: formData.get('descricao'),
    preco: parseFloat(formData.get('preco')),
    categoria: formData.get('categoria')
  }

  if (imagem_url) payload.imagem_url = imagem_url

  if (editandoId) {
    await supabase.from('produtos').update(payload).eq('id', editandoId)
    form.dataset.editando = ''
    form.querySelector('button[type="submit"]').textContent = 'Salvar Produto'
    form.classList.remove('modo-edicao')
  } else {
    await supabase.from('produtos').insert([{ ...payload, imagem_url }])
  }

  form.reset()
  form.classList.remove('modo-edicao')
  carregarProdutos()

  const feedback = document.createElement('div')
  feedback.textContent = editandoId ? 'Produto atualizado!' : 'Produto cadastrado!'
  feedback.style = 'margin-top: 1rem; color: green; text-align: center; font-weight: bold;'
  form.appendChild(feedback)
  setTimeout(() => feedback.remove(), 3000)
})

// Carregar produtos existentes
async function carregarProdutos() {
  const { data } = await supabase.from('produtos').select('*').order('id', { ascending: false })
  produtosContainer.innerHTML = ''
  data.forEach(prod => {
    const card = document.createElement('div')
    card.className = 'admin-card'
    card.innerHTML = `
      <img src="${prod.imagem_url}" alt="${prod.nome}" />
      <h3>${prod.nome}</h3>
      <p>${prod.descricao}</p>
      <span>R$ ${prod.preco.toFixed(2)}</span>
      <small>${prod.categoria}</small>
      <div class="actions">
        <button onclick="excluirProduto(${prod.id})">Excluir</button>
        <button onclick='editarProduto(${JSON.stringify(prod)})'>Editar</button>
      </div>
    `
    produtosContainer.appendChild(card)
  })
}

// Exclusão de produto
window.excluirProduto = async function (id) {
  if (!confirm('Deseja realmente excluir este produto?')) return
  await supabase.from('produtos').delete().eq('id', id)
  carregarProdutos()
}

// Edição de produto
window.editarProduto = function (produto) {
  form.querySelector('button[type="submit"]').textContent = 'Atualizar Produto'
  form.dataset.editando = produto.id
  form.classList.add('modo-edicao')

  form.nome.value = produto.nome
  form.descricao.value = produto.descricao
  form.preco.value = produto.preco
  form.categoria.value = produto.categoria
}

// Filtro de busca
const filtroInput = document.getElementById('filtro-produto')
if (filtroInput) {
  filtroInput.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase()
    const cards = produtosContainer.querySelectorAll('.admin-card')
    cards.forEach(card => {
      const nome = card.querySelector('h3').textContent.toLowerCase()
      card.style.display = nome.includes(termo) ? 'grid' : 'none'
    })
  })
}

// Inicializa
carregarProdutos()
