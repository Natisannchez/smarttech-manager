<script setup>
const estadoEditando = ref(null)
const nuevoEstado = ref('')
const estadosPosibles = [
  'Ingresado',
  'Asignada',
  'En revisión',
  'Cerrada'
]

function getEstadosGuardados() {
  try {
    return JSON.parse(localStorage.getItem('agendaEstados') || '{}')
  } catch { return {} }
}

function setEstadosGuardados(estados) {
  localStorage.setItem('agendaEstados', JSON.stringify(estados))
}

function mostrarAsignarEstado(item) {
  estadoEditando.value = item._id
  nuevoEstado.value = item.estado || ''
}

function confirmarAsignarEstado(item) {
  item.estado = nuevoEstado.value
  // Guardar en localStorage
  const estados = getEstadosGuardados()
  estados[item._id] = nuevoEstado.value
  setEstadosGuardados(estados)
  estadoEditando.value = null
}
import { ref, onMounted } from 'vue'
import { agendaService } from '@/services/api'
import { useRouter } from 'vue-router'
const router = useRouter()
const goToProgramar = () => {
  router.push('/programar')
}

// Estado UI
const loading = ref(true)
const error = ref(null)

// filtros
const q = ref('')
const estado = ref('')
const desde = ref('')
const hasta = ref('')

// datos
const items = ref([])
const itemsFiltrados = ref([])

// Cargar desde backend
async function cargar () {
  try {
    loading.value = true
    error.value = null

    const params = {
      q: q.value || undefined,
      estado: estado.value || undefined,
      desde: desde.value || undefined,
      hasta: hasta.value || undefined,
    }

    const resp = await agendaService.list(params)
    // backend devuelve { success, data: [...] }
    let arr = Array.isArray(resp.data) ? resp.data : (resp.data?.data || [])
    // Restaurar estados guardados
    const estados = getEstadosGuardados()
    arr.forEach(i => {
      if (estados[i._id]) i.estado = estados[i._id]
    })
  items.value = arr
  filtrar()
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar la agenda.'
  } finally {
    loading.value = false
  }
}

function limpiar () {
  q.value = ''
  estado.value = ''
  desde.value = ''
  hasta.value = ''
  cargar()
}

onMounted(cargar)
// Filtrar agenda en tiempo real
function filtrar() {
  let arr = [...items.value]
  // Filtro texto
  if (q.value) {
    const query = q.value.toLowerCase()
    arr = arr.filter(i =>
      (i.orden?.codigo_orden_visible || i.codigo || '').toString().toLowerCase().includes(query) ||
      (i.cliente?.nombre_apellido || i.cliente || '').toLowerCase().includes(query) ||
      (i.tecnico?.nombre_apellido || i.tecnico || '').toLowerCase().includes(query) ||
      (i.estado || '').toLowerCase().includes(query)
    )
  }
  // Filtro estado
  if (estado.value) {
    arr = arr.filter(i => i.estado === estado.value)
  }
  // Filtro fechas
  if (desde.value) {
    arr = arr.filter(i => {
      const fecha = i.orden?.fecha_ingreso || i.fecha_revision
      return fecha && new Date(fecha) >= new Date(desde.value)
    })
  }
  if (hasta.value) {
    arr = arr.filter(i => {
      const fecha = i.orden?.fecha_ingreso || i.fecha_revision
      return fecha && new Date(fecha) <= new Date(hasta.value)
    })
  }
  itemsFiltrados.value = arr
}

// Watchers para filtros en tiempo real
import { watch } from 'vue'
watch([q, estado, desde, hasta, items], filtrar)
</script>

<template>
  <div class="page">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
      <h2>Agenda de órdenes</h2>
      <button @click="goToProgramar" class="btn-primary btn-programar">+ Programar</button>
    </div>
    <!-- Filtros -->
    <div class="filters">
      <div class="field">
        <label class="label">Buscar</label>
        <input
          v-model="q"
          type="text"
          placeholder="Buscar (cliente, código, técnico)…"
        />
      </div>

      <div class="field">
        <label class="label">Estado</label>
        <select v-model="estado">
          <option value="">Todos los estados</option>
          <option value="Ingresado">Ingresado</option>
          <option value="Asignada">Asignada</option>
          <option value="En revisión">En revisión</option>
          <option value="Cerrada">Cerrada</option>
        </select>
      </div>

      <div class="field">
        <label class="label center">Desde</label>
        <input v-model="desde" type="date" />
      </div>

      <div class="field">
        <label class="label center">Hasta</label>
        <input v-model="hasta" type="date" />
      </div>

      <div class="actions">
        <button class="btn-primary" @click="cargar">Refrescar</button>
        <button class="btn-secondary" @click="limpiar">Limpiar</button>
      </div>
    </div>

    <!-- Contenido -->
    <div v-if="loading">Cargando…</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <div v-else>
      <div class="meta">
        Mostrando <b>{{ itemsFiltrados.length }}</b> de {{ items.length }}
      </div>

      <table class="tbl">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Técnico</th>
            <th>Estado</th>
            <th>Acciones</th>
            <th>Ingreso</th>
            <th>Revisión</th>
            <th>Fecha límite</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in itemsFiltrados" :key="i._id">
            <td>{{ i.orden?.codigo_orden_visible ?? i.codigo ?? '—' }}</td>
            <td>{{ i.cliente?.nombre_apellido ?? '—' }}</td>
            <td>{{ i.tecnico?.nombre_apellido ?? i.tecnico ?? '—' }}</td>
            <td>
              <span class="pill" v-if="estadoEditando !== i._id">{{ i.estado ?? '—' }}</span>
              <template v-else>
                <select v-model="nuevoEstado">
                  <option v-for="e in estadosPosibles" :key="e" :value="e">{{ e }}</option>
                </select>
                <button class="btn-primary" @click="confirmarAsignarEstado(i)">Confirmar</button>
                <button class="btn-secondary" @click="estadoEditando = null">Cancelar</button>
              </template>
            </td>
            <td>
              <button v-if="estadoEditando !== i._id" class="btn-primary" @click="mostrarAsignarEstado(i)">Asignar estado</button>
            </td>
            <td>{{ i.orden?.fecha_ingreso ? new Date(i.orden.fecha_ingreso).toLocaleString() : '—' }}</td>
            <td>{{ i.fecha_revision ? new Date(i.fecha_revision).toLocaleString() : '—' }}</td>
            <td>{{ i.fecha_limite ? new Date(i.fecha_limite).toLocaleDateString() : '—' }}</td>
          </tr>
          <tr v-if="!itemsFiltrados.length">
            <td colspan="8" class="empty">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  .btn-programar {
    font-size: 1em;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 500;
    background: #27ae60;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
  }
  .btn-programar:hover {
    background: #219150;
  }
.page { max-width: 1100px; margin: 0 auto; padding: 24px; }
h2 { font-size: 1.6rem; margin-bottom: 12px; }

/* ====== Filtros compactos y alineados ====== */
.filters {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr auto;
  gap: 18px;
  align-items: end;
  margin: 12px 0 18px;
}
.field { display: flex; flex-direction: column; min-width: 160px; }
.label { font-weight: 600; color: #3b4252; margin-bottom: 6px; line-height: 1; }
.label.center { text-align: center; }

.filters input[type="text"],
.filters input[type="date"],
.filters select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}
.filters select { min-width: 60px; margin-right: 6px; }

.actions { display: flex; gap: 10px; align-self: end; }
.actions .btn-primary, .actions .btn-secondary {
  height: 40px; padding: 0 16px; border-radius: 8px; font-weight: 600;
  border: 1px solid transparent; cursor: pointer;
}
.actions .btn-primary { background:#3b82f6; color:#fff; }
.actions .btn-primary:hover { background:#2563eb; }
.actions .btn-secondary { background:#eef2f7; color:#1f2937; border-color:#e5e7eb; }
.actions .btn-secondary:hover { background:#e7ebf2; }

.tbl { width: 100%; border-collapse: collapse; font-size: .95rem; }
.tbl th, .tbl td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
.tbl thead { background:#f8fafc; }
.empty { text-align: center; color:#6b7280; }
.pill { background:#eef2ff; color:#3730a3; padding:2px 8px; border-radius: 999px; font-size: .8rem; }
.meta { color:#6b7280; margin-bottom: 6px; }

@media (max-width: 900px) {
  .filters { grid-template-columns: 2fr 1.3fr 1fr 1fr auto; }
  .label.center { text-align: left; }
}
</style>