<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const username = ref('')

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    username.value = user
  }
})

const navigateTo = (route) => {
  router.push(route)
}

const handleLogout = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas salir del sistema?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#7f8c8d',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    localStorage.removeItem('user')
    router.push('/login')
    
    await Swal.fire({
      title: '¡Hasta pronto!',
      text: 'Has cerrado sesión correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
</script>

<template>
  <div class="home-container">
    <div class="header">
      <div class="welcome-section">
        <h1>🏠 Dashboard - SmartTech Manager</h1>
        <p>Bienvenido, <strong>{{ username }}</strong></p>
        <p class="subtitle">Sistema de Gestión - Smart Tech Mendoza</p>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
      Cerrar Sesión
    </button>
    
    </div>

    <div class="dashboard-content">
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">🔧</div>
          <div class="stat-info">
            <h3>12</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>45</h3>
            <p>Clientes Activos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-info">
            <h3>3</h3>
            <p>Entregas Hoy</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-info">
            <h3>8</h3>
            <p>Clientes Institucionales</p>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <button class="action-btn primary" @click="navigateTo('/administracion')">
            <i class="fas fa-plus-circle"></i>
            <span>Nueva Orden</span>
          </button>
          
          <button class="action-btn secondary" @click="navigateTo('/administracion')">
            <i class="fas fa-users"></i>
            <span>Gestionar Clientes</span>
          </button>
          
          <button class="action-btn tertiary" @click="navigateTo('/administracion')">
            <i class="fas fa-calendar-alt"></i>
            <span>Ver Agenda</span>
          </button>
          
          <button class="action-btn quaternary" @click="navigateTo('/administracion')">
            <i class="fas fa-chart-line"></i>
            <span>Reportes</span>
          </button>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">📝</div>
            <div class="activity-content">
              <p><strong>Nueva orden</strong> creada para Hospital Central</p>
              <span class="activity-time">Hace 2 horas</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">✅</div>
            <div class="activity-content">
              <p><strong>Reparación completada</strong> para Juan Pérez</p>
              <span class="activity-time">Hace 4 horas</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">👤</div>
            <div class="activity-content">
              <p><strong>Nuevo cliente</strong> registrado: Seguros Rivadavia</p>
              <span class="activity-time">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.welcome-section h1 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.8rem;
}

.welcome-section p {
  margin: 4px 0;
  color: #7f8c8d;
}

.subtitle {
  font-size: 0.9rem;
  color: #95a5a6;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-info h3 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 700;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.actions-section {
  margin-bottom: 40px;
}

.actions-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-btn {
  background: white;
  border: none;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.action-btn i {
  font-size: 2rem;
}

.action-btn.primary { border-left: 4px solid #3498db; }
.action-btn.primary i { color: #3498db; }

.action-btn.secondary { border-left: 4px solid #2ecc71; }
.action-btn.secondary i { color: #2ecc71; }

.action-btn.tertiary { border-left: 4px solid #f39c12; }
.action-btn.tertiary i { color: #f39c12; }

.action-btn.quaternary { border-left: 4px solid #9b59b6; }
.action-btn.quaternary i { color: #9b59b6; }

.recent-activity {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.recent-activity h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.activity-content p {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.activity-time {
  font-size: 0.8rem;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card p {
  color: #7f8c8d;
}
</style>
