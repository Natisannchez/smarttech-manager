<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { ordenesService, clientesService, dashboardService } from '@/services/api'

const router = useRouter()
const username = ref('')

const ordenesPendientes = ref(0)
const clientesActivos = ref(0)
const entregasHoy = ref(0)
const clientesInstitucionales = ref(0)
const actividadReciente = ref([])

onMounted(async () => {
  const user = localStorage.getItem('user')
  if (user) username.value = user

  // Dashboard stats desde backend (si existe endpoint)
  try {
    const dashboardResp = await dashboardService.getStats()
    const stats = dashboardResp.data.data
    ordenesPendientes.value = stats.ordenesPendientes ?? 0
    clientesActivos.value = stats.clientesActivos ?? 0
    entregasHoy.value = stats.entregasHoy ?? 0
    clientesInstitucionales.value = stats.clientesInstitucionales ?? 0
    actividadReciente.value = stats.actividadReciente ?? []
  } catch (e) {
    // Fallback si el endpoint no existe
    const ordenesResp = await ordenesService.getAll()
    ordenesPendientes.value = ordenesResp.data.data.filter(o => o.estado === 'Ingresado').length
    const clientesResp = await clientesService.getAll()
    clientesActivos.value = clientesResp.data.data.length
    clientesInstitucionales.value = clientesResp.data.data.filter(c => c.tipo_cliente === 'institucional').length
    const hoy = new Date().toISOString().slice(0,10)
    entregasHoy.value = ordenesResp.data.data.filter(o => o.estado === 'Cerrada' && o.fecha_cierre?.startsWith(hoy)).length
    actividadReciente.value = ordenesResp.data.data.slice(-3).map(o => ({
      icon: o.estado === 'Cerrada' ? '✅' : '📝',
      titulo: o.estado === 'Cerrada'
        ? `Reparación completada para ${o.cliente?.nombre_apellido || o.cliente?.nombre}`
        : `Nueva orden creada para ${o.cliente?.nombre_apellido || o.cliente?.nombre}`,
      descripcion: o.producto ? `Producto: ${o.producto}` : '',
      hora: o.fecha_cierre || o.fecha_ingreso || 'Reciente'
    }))
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
            <h3>{{ ordenesPendientes }}</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ clientesActivos }}</h3>
            <p>Clientes Activos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-info">
            <h3>{{ entregasHoy }}</h3>
            <p>Entregas Hoy</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-info">
            <h3>{{ clientesInstitucionales }}</h3>
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
          <div class="activity-item" v-for="(actividad, index) in actividadReciente" :key="index">
            <div class="activity-icon">{{ actividad.icon }}</div>
            <div class="activity-content">
              <p><strong>{{ actividad.titulo }}</strong> {{ actividad.descripcion }}</p>
              <span class="activity-time">{{ actividad.hora }}</span>
            </div>
          </div>
          <div v-if="!actividadReciente.length" class="activity-item">
            <div class="activity-icon">ℹ️</div>
            <div class="activity-content">
              <p>No hay actividad reciente.</p>
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