<template>
  <div class="tecnicos-container">
    <!-- Header -->
    <div class="header">
      <h1>Gestión de Técnicos</h1>
      <button class="btn-agregar" @click="abrirModalNuevoTecnico">
        <i class="fas fa-plus"></i>
        Agregar Técnico
      </button>
    </div>

    <!-- Mensajes de alerta -->
    <div v-if="mensaje" :class="['alerta', mensaje.tipo]">
      <i :class="mensaje.tipo === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ mensaje.texto }}
    </div>

    <!-- Tabla de Técnicos -->
    <div class="tabla-container">
      <table v-if="tecnicos.length">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre y Apellido</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tecnico in tecnicos" :key="tecnico.dni">
            <td>{{ tecnico.dni }}</td>
            <td>{{ tecnico.nombre_apellido }}</td>
            <td>{{ tecnico.telefono || '-' }}</td>
            <td>
              <span 
                class="estado-badge"
                :class="tecnico.activo ? 'activo' : 'inactivo'"
              >
                {{ tecnico.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <button class="btn-accion editar" @click="editarTecnico(tecnico)">
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn-accion toggle" 
                  :class="tecnico.activo ? 'desactivar' : 'activar'"
                  @click="confirmarCambioEstado(tecnico)"
                >
                  <i :class="tecnico.activo ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        <i class="fas fa-users-slash"></i>
        <p>No hay técnicos registrados</p>
      </div>
    </div>

    <!-- Modal de Formulario -->
    <ModalFormTecnico
      :is-visible="mostrarModalForm"
      :tecnico-data="tecnicoSeleccionado"
      @close="cerrarModalForm"
      @success="handleSuccess"
    />

    <!-- Modal de Confirmación -->
    <ModalConfirmacion
      :is-visible="mostrarModalConfirmacion"
      :title="tituloConfirmacion"
      :message="mensajeConfirmacion"
      :confirm-text="textoConfirmacion"
      :is-dangerous="!tecnicoParaEstado?.activo"
      :loading="loadingEstado"
      @close="cerrarModalConfirmacion"
      @confirm="cambiarEstadoTecnico"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router' 
import { tecnicosService } from '@/services/api'
import ModalFormTecnico from '@/components/tecnicos/ModalFormTecnico.vue'
import ModalConfirmacion from '@/components/shared/ModalConfirmacion.vue'

const route = useRoute() 

// Estado
const tecnicos = ref([])
const mensaje = ref(null)
const mostrarModalForm = ref(false)
const tecnicoSeleccionado = ref(null)
const mostrarModalConfirmacion = ref(false)
const tecnicoParaEstado = ref(null)
const loadingEstado = ref(false)

// Propiedades computadas para el modal de confirmación
const tituloConfirmacion = ref('')
const mensajeConfirmacion = ref('')
const textoConfirmacion = ref('')

// Cargar técnicos al montar el componente
onMounted(async () => {
  await cargarTecnicos()
  // 3. VERIFICA EL PARÁMETRO DE LA URL Y ABRE EL MODAL
  if (route.query.nuevo === 'true') {
    abrirModalNuevoTecnico()
  }
})

// Funciones
const cargarTecnicos = async () => {
  try {
    const response = await tecnicosService.getAll()
    tecnicos.value = response.data.data || []
    console.log('Técnicos cargados:', tecnicos.value)
  } catch (error) {
    console.error('Error al cargar técnicos:', error)
    mostrarMensaje('Error al cargar los técnicos', 'error')
  }
}

const abrirModalNuevoTecnico = () => {
  tecnicoSeleccionado.value = null
  mostrarModalForm.value = true
}

const editarTecnico = (tecnico) => {
  tecnicoSeleccionado.value = { ...tecnico }
  mostrarModalForm.value = true
}

const cerrarModalForm = () => {
  mostrarModalForm.value = false
  tecnicoSeleccionado.value = null
}

const confirmarCambioEstado = (tecnico) => {
  tecnicoParaEstado.value = tecnico
  tituloConfirmacion.value = tecnico.activo ? 'Desactivar Técnico' : 'Activar Técnico'
  mensajeConfirmacion.value = `¿Está seguro que desea ${tecnico.activo ? 'desactivar' : 'activar'} al técnico ${tecnico.nombre_apellido}?`
  textoConfirmacion.value = tecnico.activo ? 'Desactivar' : 'Activar'
  mostrarModalConfirmacion.value = true
}

const cerrarModalConfirmacion = () => {
  mostrarModalConfirmacion.value = false
  tecnicoParaEstado.value = null
  loadingEstado.value = false
}

const cambiarEstadoTecnico = async () => {
  if (!tecnicoParaEstado.value) return

  loadingEstado.value = true
  try {
    console.log('Cambiando estado del técnico:', tecnicoParaEstado.value.dni)
    const response = await tecnicosService.toggleEstado(tecnicoParaEstado.value.dni)
    console.log('Respuesta del servidor:', response)
    await cargarTecnicos()
    mostrarMensaje(`Técnico ${tecnicoParaEstado.value.activo ? 'desactivado' : 'activado'} exitosamente`, 'success')
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    mostrarMensaje(error.response?.data?.message || 'Error al cambiar el estado del técnico', 'error')
  } finally {
    cerrarModalConfirmacion()
  }
}

const handleSuccess = async (mensaje) => {
  await cargarTecnicos()
  mostrarMensaje(mensaje, 'success')
}

const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.value = { texto, tipo }
  setTimeout(() => {
    mensaje.value = null
  }, 3000)
}
</script>

<style scoped>
.tecnicos-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.btn-agregar {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-agregar:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.tabla-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

.estado-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.estado-badge.activo {
  background-color: #e1f7e1;
  color: #27ae60;
}

.estado-badge.inactivo {
  background-color: #f8d7da;
  color: #dc3545;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  border: none;
  background: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-accion.editar {
  color: #3498db;
}

.btn-accion.editar:hover {
  background-color: #ebf5fb;
}

.btn-accion.toggle {
  font-size: 1.2rem;
}

.btn-accion.toggle.desactivar {
  color: #e74c3c;
}

.btn-accion.toggle.activar {
  color: #2ecc71;
}

.btn-accion.toggle.desactivar:hover {
  background-color: #fdedec;
}

.btn-accion.toggle.activar:hover {
  background-color: #e1f7e1;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #95a5a6;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.alerta {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerta.success {
  background-color: #e1f7e1;
  color: #27ae60;
}

.alerta.error {
  background-color: #f8d7da;
  color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .tecnicos-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .btn-agregar {
    width: 100%;
    justify-content: center;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>