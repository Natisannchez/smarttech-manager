<template>
  <div class="clientes-container">
    <div class="header">
      <h1>🧑‍💼 Gestión de Clientes</h1>
      <button class="btn-primary" @click="mostrarFormulario = true">
        <i class="fas fa-plus"></i> Nuevo Cliente
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label>Buscar:</label>
        <input 
          v-model="filtroTexto" 
          placeholder="Nombre, teléfono o email..."
          class="input-search"
        />
      </div>
      <div class="filtro-grupo">
        <label>Tipo:</label>
        <select v-model="filtroTipo">
          <option value="">Todos</option>
          <option value="particular">Particular</option>
          <option value="institucional">Institucional</option>
        </select>
      </div>
    </div>

    <!-- Lista de Clientes -->
    <div class="clientes-grid">
      <div 
        v-for="cliente in clientesFiltrados" 
        :key="cliente.id"
        class="cliente-card"
        :class="{ 'institucional': cliente.tipo === 'institucional' }"
      >
        <div class="cliente-header">
          <div class="cliente-info">
            <h3>{{ cliente.nombre }}</h3>
            <span class="tipo-badge" :class="cliente.tipo">
              {{ cliente.tipo === 'particular' ? '👤 Particular' : '🏢 Institucional' }}
            </span>
          </div>
          <div class="cliente-acciones">
            <button class="btn-icon" @click="editarCliente(cliente)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" @click="eliminarCliente(cliente.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="cliente-detalles">
          <p v-if="cliente.telefono"><i class="fas fa-phone"></i> {{ cliente.telefono }}</p>
          <p v-if="cliente.email"><i class="fas fa-envelope"></i> {{ cliente.email }}</p>
          <p v-if="cliente.direccion"><i class="fas fa-map-marker-alt"></i> {{ cliente.direccion }}</p>
          <p v-if="cliente.tipo === 'institucional' && cliente.contacto">
            <i class="fas fa-user-tie"></i> Contacto: {{ cliente.contacto }}
          </p>
        </div>

        <div class="cliente-stats">
          <span class="stat">
            <i class="fas fa-clipboard-list"></i>
            {{ obtenerOrdenesCliente(cliente.id) }} órdenes
          </span>
          <span class="stat">
            <i class="fas fa-clock"></i>
            Última: {{ cliente.ultimaOrden || 'Sin órdenes' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo/editar cliente -->
    <div v-if="mostrarFormulario" class="modal-overlay" @click="cerrarFormulario">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button class="btn-close" @click="cerrarFormulario">×</button>
        </div>
        
        <form @submit.prevent="guardarCliente" class="cliente-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre/Razón Social *</label>
              <input v-model="formularioCliente.nombre" required />
            </div>
            <div class="form-group">
              <label>Tipo *</label>
              <select v-model="formularioCliente.tipo" required>
                <option value="particular">Particular</option>
                <option value="institucional">Institucional</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>DNI/CUIT *</label>
              <input 
                v-model="formularioCliente.dni" 
                required
                :readonly="!!dniPreCargado"
              />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="formularioCliente.telefono" type="tel" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="formularioCliente.email" type="email" />
            </div>
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <textarea v-model="formularioCliente.direccion" rows="2"></textarea>
          </div>

          <div v-if="formularioCliente.tipo === 'institucional'" class="form-group">
            <label>Persona de Contacto</label>
            <input v-model="formularioCliente.contacto" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="cerrarFormulario">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ clienteEditando ? 'Actualizar' : 'Crear' }} Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estados reactivos
const mostrarFormulario = ref(false)
const clienteEditando = ref(null)
const filtroTexto = ref('')
const filtroTipo = ref('')
const dniPreCargado = ref('')

// Lista de clientes (simulado)
const clientes = ref([
  {
    id: 1,
    nombre: 'Juan Pérez',
    tipo: 'particular',
    telefono: '+54 261 123-4567',
    email: 'juan.perez@email.com',
    direccion: 'Av. San Martín 1234, Guaymallén',
    ultimaOrden: '10/10/2025'
  },
  {
    id: 2,
    nombre: 'Seguros Rivadavia',
    tipo: 'institucional',
    telefono: '+54 261 987-6543',
    email: 'contacto@segurosrivadavia.com',
    direccion: 'Av. España 567, Mendoza',
    contacto: 'María González',
    ultimaOrden: '12/10/2025'
  },
  {
    id: 3,
    nombre: 'Hospital Central',
    tipo: 'institucional',
    telefono: '+54 261 456-7890',
    email: 'sistemas@hospitalcentral.gov.ar',
    direccion: 'Av. Libertador 890, Mendoza',
    contacto: 'Dr. Roberto Silva',
    ultimaOrden: '11/10/2025'
  }
])

// Formulario para nuevo/editar cliente
const formularioCliente = ref({
  nombre: '',
  tipo: 'particular',
  telefono: '',
  email: '',
  direccion: '',
  contacto: ''
})

// Computed
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    const coincideTexto = !filtroTexto.value || 
      cliente.nombre.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      cliente.telefono?.includes(filtroTexto.value) ||
      cliente.email?.toLowerCase().includes(filtroTexto.value.toLowerCase())
    
    const coincideTipo = !filtroTipo.value || cliente.tipo === filtroTipo.value
    
    return coincideTexto && coincideTipo
  })
})

// Métodos
function obtenerOrdenesCliente(clienteId) {
  // En una implementación real, esto consultaría la base de datos
  return Math.floor(Math.random() * 10) + 1
}

function editarCliente(cliente) {
  clienteEditando.value = cliente
  formularioCliente.value = { ...cliente }
  mostrarFormulario.value = true
}

function eliminarCliente(clienteId) {
  if (confirm('¿Está seguro de eliminar este cliente?')) {
    const index = clientes.value.findIndex(c => c.id === clienteId)
    if (index !== -1) {
      clientes.value.splice(index, 1)
    }
  }
}

function guardarCliente() {
  if (clienteEditando.value) {
    // Editar cliente existente
    const index = clientes.value.findIndex(c => c.id === clienteEditando.value.id)
    if (index !== -1) {
      clientes.value[index] = { ...formularioCliente.value, id: clienteEditando.value.id }
    }
  } else {
    // Crear nuevo cliente
    const nuevoCliente = {
      ...formularioCliente.value,
      id: Date.now(),
      ultimaOrden: null
    }
    clientes.value.push(nuevoCliente)
  }
  
  cerrarFormulario()
}

function cerrarFormulario() {
  if (dniPreCargado.value) {
    router.back() // Volver a la orden de trabajo
  } else {
    mostrarFormulario.value = false
    clienteEditando.value = null
    formularioCliente.value = {
      nombre: '',
      tipo: 'particular',
      telefono: '',
      email: '',
      direccion: '',
      contacto: '',
      dni: ''
    }
}}

onMounted(() => {
  const tempDni = localStorage.getItem('temp_dni')
  if (tempDni) {
    dniPreCargado.value = tempDni
    formularioCliente.value.dni = tempDni
    formularioCliente.value.tipo = 'particular'
    mostrarFormulario.value = true
    localStorage.removeItem('temp_dni')
  }
})
</script>

<style scoped>
.clientes-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #2980b9;
}

.filtros {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filtro-grupo label {
  font-weight: 600;
  color: #2c3e50;
}

.input-search, select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.clientes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.cliente-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cliente-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.cliente-card.institucional {
  border-left-color: #e74c3c;
}

.cliente-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.cliente-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.tipo-badge {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tipo-badge.institucional {
  background: #e74c3c;
}

.cliente-acciones {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: #ecf0f1;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #bdc3c7;
}

.btn-icon.danger:hover {
  background: #e74c3c;
  color: white;
}

.cliente-detalles p {
  margin: 6px 0;
  color: #7f8c8d;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cliente-stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: between;
  gap: 15px;
}

.stat {
  color: #7f8c8d;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.cliente-form {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .clientes-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filtros {
    flex-direction: column;
  }
}
</style>