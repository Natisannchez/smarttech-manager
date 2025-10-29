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
        <h1>🏠 SmartTech Manager</h1>
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
          <button class="action-btn primary" @click="navigateTo('/ordenes/nueva')">
            <i class="fas fa-plus-circle"></i>
            <span>Nueva Orden</span>
          </button>
          
          <button class="action-btn secondary" @click="navigateTo('/clientes')">
            <i class="fas fa-users"></i>
            <span>Gestionar Clientes</span>
          </button>
          
          <button class="action-btn tertiary" @click="navigateTo('/agenda')">
            <i class="fas fa-calendar-alt"></i>
            <span>Ver Agenda</span>
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
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 24px;
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 28px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.welcome-section h1 {
  color: #1a202c;
  margin: 0 0 8px 0;
  font-size: 1.9rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.welcome-section p {
  margin: 4px 0;
  color: #718096;
  font-size: 1rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #a0aec0;
  font-weight: 400;
}

.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(229, 62, 62, 0.2);
}

.logout-btn:hover {
  background: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  background: white;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #4299e1;
}

.stat-card:nth-child(2)::before {
  background: #48bb78;
}

.stat-card:nth-child(3)::before {
  background: #ed8936;
}

.stat-card:nth-child(4)::before {
  background: #9f7aea;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 14px;
  color: #4299e1;
}

.stat-card:nth-child(2) .stat-icon {
  color: #48bb78;
}

.stat-card:nth-child(3) .stat-icon {
  color: #ed8936;
}

.stat-card:nth-child(4) .stat-icon {
  color: #9f7aea;
}

.stat-info h3 {
  margin: 0;
  font-size: 2.2rem;
  color: #1a202c;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.stat-info p {
  margin: 8px 0 0 0;
  color: #718096;
  font-size: 0.95rem;
  font-weight: 500;
}

.actions-section {
  margin-bottom: 48px;
}

.actions-section h2 {
  color: #1a202c;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.action-btn {
  background: white;
  border: none;
  padding: 28px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.action-btn i {
  font-size: 2.2rem;
  transition: transform 0.3s ease;
}

.action-btn:hover i {
  transform: scale(1.1);
}

.action-btn.primary::before { background: #4299e1; }
.action-btn.primary i { color: #4299e1; }

.action-btn.secondary::before { background: #48bb78; }
.action-btn.secondary i { color: #48bb78; }

.action-btn.tertiary::before { background: #ed8936; }
.action-btn.tertiary i { color: #ed8936; }

.action-btn.quaternary::before { background: #9f7aea; }
.action-btn.quaternary i { color: #9f7aea; }

.action-btn span {
  font-weight: 500;
  color: #2d3748;
  font-size: 1rem;
}

.recent-activity {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.recent-activity h2 {
  color: #1a202c;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
  border-left: 4px solid #4299e1;
}

.activity-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.activity-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  color: #4299e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-content p {
  margin: 0 0 6px 0;
  color: #2d3748;
  font-weight: 500;
}

.activity-time {
  font-size: 0.85rem;
  color: #a0aec0;
  font-weight: 400;
}

@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card, .action-btn, .recent-activity {
    padding: 24px;
  }
}

.stat-card p {
  color: #718096;
}
</style>