<template>
  <div class="login-page" v-if="!isLoggedIn">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <img src="../assets/smarttech-logo.svg" alt="SmartTech Logo" class="logo">
        </div>
        <h1>SmartTech Manager</h1>
        <p class="subtitle">Sistema de Gestión - Smart Tech Mendoza</p>
      </div>
      
      <div class="alerts-container">
        <transition name="fade">
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </transition>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">
            <i class="fas fa-user"></i>
            Usuario
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required
            placeholder="Ingrese su usuario"
            :class="{ 'input-error': errorMessage }"
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Contraseña
          </label>
          <div class="password-input-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required
              placeholder="Ingrese su contraseña"
              :class="{ 'input-error': errorMessage }"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          <span class="btn-content">
            <i v-if="!loading" class="fas fa-sign-in-alt"></i>
            <span v-if="loading" class="loader"></span>
            {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </span>
        </button>
      </form>

      <div class="footer-info">
        <p>© 2025 SmartTech</p>
      </div>
      
      <div class="footer-info">
        <p>version 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const isLoggedIn = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validCredentials = {
  'admin': 'Recursos2025',
  'dev': 'pruebas12345',
  'MaxiG': 'maxigg545'
}

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    username.value = user
    isLoggedIn.value = true
    // Redirigir inmediatamente a home si hay sesión
    router.push('/home')
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Primero verificar credenciales locales
    if (validCredentials[username.value] === password.value) {
      successMessage.value = '¡Login exitoso!'
      isLoggedIn.value = true
      localStorage.setItem('user', username.value)
      router.push('/home')
      return
    }

    // Si no coincide con credenciales locales, probar con la base de datos
    try {
      const response = await authService.login({
        username: username.value,
        password: password.value
      })
      
      if (response.data.success) {
        successMessage.value = '¡Login exitoso!'
        isLoggedIn.value = true
        localStorage.setItem('user', response.data.user.username)
        localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        router.push('/home')
        return
      }
    } catch (apiError) {
      console.log('API no disponible, usando solo credenciales locales')
    }

    // Si ni las credenciales locales ni la API funcionan
    errorMessage.value = 'Usuario o contraseña incorrectos'

  } catch (error) {
    errorMessage.value = 'Error al intentar iniciar sesión'
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    isLoggedIn.value = false
    username.value = ''
    password.value = ''
    localStorage.removeItem('user')
    router.push('/login')
  }
}

const showPassword = ref(false)
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.login-page {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 60% 40%, #eaf6fb 0%, #26d0ce 100%), linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
  background-blend-mode: lighten;
  padding: 0;
  margin: 0;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.login-container {
  background: rgba(255, 255, 255, 0.97);
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  min-width: 320px;
  margin: 1rem;
  backdrop-filter: blur(10px);
  transition: max-width 0.3s, padding 0.3s;
  max-height: 90vh;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.3rem;
  font-weight: 700;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.2rem;
  position: relative;
}

label {
  display: block;
  margin-bottom: 0.8rem;
  color: #34495e;
  font-weight: 600;
  font-size: 0.95rem;
}

label i {
  margin-right: 0.5rem;
  color: #7f8c8d;
}

input {
  width: 100%;
  padding: 0.7rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.input-error {
  border-color: #e74c3c;
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.5rem;
}

.login-btn {
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.8rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.footer-info {
  margin-top: 2rem;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.version {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.error-message,
.success-message {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  background: #fde8e8;
  color: #c53030;
  border-left: 4px solid #c53030;
}

.success-message {
  background: #e6fffa;
  color: #046c4e;
  border-left: 4px solid #046c4e;
}

@media (max-width: 1024px) {
  .login-container {
    max-width: 90vw;
    padding: 2rem 1.2rem;
    border-radius: 16px;
  }
}

@media (max-width: 768px) {
  .login-container {
    max-width: 80vw;
    padding: 1.5rem 0.5rem;
    border-radius: 12px;
  }
  .login-header h1 {
    font-size: 1.5rem;
  }
  .logo {
    width: 60px;
    height: 60px;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .login-btn {
    font-size: 0.98rem;
    padding: 0.7rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0.7rem 0.2rem;
    max-width: 90vw;
    border-radius: 7px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.06);
  }
  .login-header h1 {
    font-size: 1.1rem;
  }
  .logo {
    width: 38px;
    height: 38px;
  }
  .footer-info {
    font-size: 0.7rem;
  }
  .form-group label {
    font-size: 0.8rem;
  }
  .btn-content {
    font-size: 0.92rem;
  }
}
</style>