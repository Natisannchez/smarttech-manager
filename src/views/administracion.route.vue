<template>
  <div class="administracion-container">
    <div class="header">
      <h1>⚙️ Administración</h1>
      <p>Panel de configuración y gestión del sistema</p>
    </div>

    <div class="admin-sections">
      <div class="section-card">
        <div class="section-icon">👥</div>
        <h3>Gestión de Clientes</h3>
        <p>Administrar clientes particulares e institucionales</p>
        <div class="section-actions">
          <button class="btn-primary">Ver Clientes</button>
          <button class="btn-secondary">Nuevo Cliente</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-icon">📋</div>
        <h3>Órdenes de Trabajo</h3>
        <p>Crear y administrar órdenes de reparación</p>
        <div class="section-actions">
          <button class="btn-primary">Ver Órdenes</button>
          <button class="btn-secondary">Nueva Orden</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-icon">📅</div>
        <h3>Agenda</h3>
        <p>Programar y organizar el calendario de trabajo</p>
        <div class="section-actions">
          <button class="btn-primary">Ver Agenda</button>
          <button class="btn-secondary">Programar</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-icon">🔧</div>
        <h3>Técnicos</h3>
        <p>Gestionar información de los técnicos</p>
        <div class="section-actions">
          <button class="btn-primary" @click="router.push('/tecnicos')">Ver Técnicos</button>
          <button class="btn-secondary" @click="router.push('/tecnicos?nuevo=true')">Agregar Técnico</button>
        </div>
      </div>

      

      <div class="section-card">
        <div class="section-icon">⚙️</div>
        <h3>Configuración</h3>
        <p>Configuraciones generales del sistema</p>
        <div class="section-actions">
          <button class="btn-primary">Configurar</button>
          <button class="btn-secondary">Preferencias</button>
        </div>
      </div>
    </div>

    <div class="quick-stats">
      <h2>Estadísticas Rápidas</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">25</span>
          <span class="stat-label">Clientes Particulares</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">8</span>
          <span class="stat-label">Clientes Institucionales</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">12</span>
          <span class="stat-label">Órdenes Activas</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">3</span>
          <span class="stat-label">Técnicos Disponibles</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.administracion-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #3498db;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.section-card:nth-child(2) { border-left-color: #2ecc71; }
.section-card:nth-child(3) { border-left-color: #f39c12; }
.section-card:nth-child(4) { border-left-color: #e74c3c; }
.section-card:nth-child(5) { border-left-color: #9b59b6; }
.section-card:nth-child(6) { border-left-color: #34495e; }

.section-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 15px;
}

.section-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.section-card p {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  flex: 1;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #bdc3c7;
}

.quick-stats {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.quick-stats h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .admin-sections {
    grid-template-columns: 1fr;
  }
  
  .section-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>