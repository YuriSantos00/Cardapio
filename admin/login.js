import { supabase } from '../supabase/supabase.js'

const form = document.getElementById('login-form')
const errorMessage = document.getElementById('error-message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = form.email.value.trim()
  const senha = form.senha.value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  })

  if (error) {
    errorMessage.textContent = 'Credenciais inválidas.'
    return
  }

  // Redireciona para o painel
  window.location.href = './painel.html'
})
