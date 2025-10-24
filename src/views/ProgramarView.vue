<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ordenesAgendaService, tecnicosService, agendaService } from '@/services/api'

const router = useRouter()

// estado del formulario
const ordenId = ref('')
const tecnicoDni = ref('')
const fechaRevision = ref('')
const fechaLimite = ref('')
const guardando = ref(false)
const error = ref('')

// datasets
const pendientes = ref([])  // órdenes estado=Ingresado
const tecnicos = ref([])

// helpers de días hábiles
const FERIADOS = [] // ['2025-12-25']

function esNoHabil (d) {
  const day = d.getDay()
  if (day === 0 || day === 6) return true
  const iso = d.toISOString().slice(0,10)
  return FERIADOS.includes(iso)
}
function sumarDiasHabiles (fechaISO, n) {
  const d = new Date(fechaISO)
  let rest = n
  while (rest > 0) {
    d.setDate(d.getDate() + 1)
    if (!esNoHabil(d)) rest--
  }
  return d.toISOString().slice(0,10)
}
function diasPorCliente (o) {
  if (!o) return 7
  const nombre = (o.cliente?.nombre_apellido || o.cliente?.nombre || '').toLowerCase()
  const tipo   = (o.cliente?.tipo_cliente || o.cliente?.tipo || '').toLowerCase()
  if (tipo === 'particular') return 7
  if (nombre.includes('hospital italiano')) return 2
  if (nombre.includes('mercantil andina'))  return 3
  if (nombre.includes('scrapfree'))         return 5
  return 3
}
function calcularFechaLimite (o) {
  const fi = o?.fecha_ingreso || o?.orden?.fecha_ingreso
  if (!fi) return ''
  return sumarDiasHabiles(fi, diasPorCliente(o))
}

const orden = computed(() => pendientes.value.find(p => (p._id === ordenId.value) || (String(p.id_orden) === String(ordenId.value))) || null)

const ahoraLocalMin = computed(() => new Date().toISOString().slice(0,16))
const puedeGuardar = computed(() =>
  !!ordenId.value && !!tecnicoDni.value && !!fechaRevision.value && !guardando.value
)

// cargar datos reales
async function cargarPendientes () {
  // GET /api/ordenes-agenda?estado=Ingresado
  const resp = await ordenesAgendaService.list({ estado: 'Ingresado' })
  const raw = Array.isArray(resp.data) ? resp.data : (resp.data?.data || [])
  // normalizar algunos campos para el select
  pendientes.value = raw.map(o => ({
    ...o,
    _id: o._id ?? o.id_orden ?? o.codigo_orden_visible,
    codigo: o.codigo_orden_visible ?? o.codigo ?? String(o.id_orden ?? '—'),
    cliente: o.cliente || o.orden?.cliente || {},
    fecha_ingreso: o.fecha_ingreso ?? o.orden?.fecha_ingreso
  }))
}

async function cargarTecnicos () {
  const resp = await tecnicosService.getAll()
  const raw = Array.isArray(resp.data) ? resp.data : (resp.data?.data || [])
  tecnicos.value = raw.map(t => ({
    dni: t.dni,
    nombre: t.nombre_apellido ?? t.nombre
  }))
}

async function init () {
  try {
    error.value = ''
    await Promise.all([cargarPendientes(), cargarTecnicos()])
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar datos iniciales.'
  }
}

onMounted(init)

// re-calcular fecha límite al cambiar orden
watchEffect(() => {
  fechaLimite.value = orden.value ? calcularFechaLimite(orden.value) : ''
})

// acciones
function limpiar () {
  ordenId.value = ''
  tecnicoDni.value = ''
  fechaRevision.value = ''
  fechaLimite.value = ''
  error.value = ''
}

async function guardar () {
  error.value = ''
  if (!puedeGuardar.value) {
    error.value = 'Completá la orden, el técnico y la fecha de revisión.'
    return
  }
  const tsRev = new Date(fechaRevision.value).getTime()
  if (isNaN(tsRev) || tsRev < Date.now()) {
    error.value = 'La fecha de revisión no puede ser en el pasado.'
    return
  }

  const oSel = orden.value
  const payload = {
    id_orden: oSel?.id_orden ?? oSel?._id ?? oSel?.codigo, // el backend acepta cualquiera de estos según implementaron
    dni_tecnico: tecnicoDni.value,
    fecha_revision: fechaRevision.value,
    fecha_limite: fechaLimite.value
  }

  try {
    guardando.value = true
    await agendaService.create(payload) // POST /api/agenda
    alert('Asignación guardada.')
    router.push('/agenda')
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo guardar la asignación.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <h2>Programar orden</h2>
    <p class="sub">Seleccioná una orden “Ingresado”, un técnico y la fecha/hora de revisión.</p>

    <div class="grid">
      <div class="field">
        <label>Orden pendiente</label>
        <select v-model="ordenId">
          <option disabled value="">Seleccionar…</option>
          <option v-for="o in pendientes" :key="o._id" :value="o._id">
            {{ o.codigo }} — {{ o.cliente?.nombre_apellido || o.cliente?.nombre || '—' }}
          </option>
        </select>
        <small v-if="orden">
          Ingreso: {{ orden.fecha_ingreso ? new Date(orden.fecha_ingreso).toLocaleString() : '—' }}
          · Límite sugerida: <b>{{ fechaLimite || '—' }}</b>
        </small>
      </div>

      <div class="field">
        <label>Técnico</label>
        <select v-model="tecnicoDni">
          <option disabled value="">Seleccionar…</option>
          <option v-for="t in tecnicos" :key="t.dni" :value="t.dni">
            {{ t.nombre }} ({{ t.dni }})
          </option>
        </select>
      </div>

      <div class="field">
        <label>Fecha y hora de revisión</label>
        <input
          v-model="fechaRevision"
          type="datetime-local"
          :min="ahoraLocalMin"
          placeholder="Seleccioná fecha y hora"
        />
      </div>

      <div class="field">
        <label>Fecha límite (automática)</label>
        <input v-model="fechaLimite" type="date" disabled />
      </div>
    </div>

    <div class="actions">
      <button class="btn-secondary" @click="limpiar">Limpiar</button>
      <button class="btn-primary" :disabled="!puedeGuardar" @click="guardar">
        {{ guardando ? 'Guardando…' : 'Guardar asignación' }}
      </button>
    </div>

    <p v-if="error" class="err">{{ error }}</p>
  </div>
</template>

<style scoped>
.wrap { max-width: 900px; margin: 0 auto; padding: 24px; }
h2 { font-size: 1.6rem; margin-bottom: 6px; }
.sub { color: #6b7280; margin-bottom: 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
label { font-weight: 600; }
select, input { padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
.actions { display: flex; gap: 10px; margin-top: 16px; }
.btn-primary, .btn-secondary { padding: 10px 15px; border: none; border-radius: 6px;
  cursor: pointer; font-weight: 600; transition: background 0.2s; }
.btn-primary { background:#3498db; color:#fff; }
.btn-primary:disabled { opacity:.5; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background:#2980b9; }
.btn-secondary { background:#ecf0f1; color:#2c3e50; }
.btn-secondary:hover { background:#bdc3c7; }
.err { margin-top: 10px; color: #dc2626; }
@media (max-width: 768px){ .grid { grid-template-columns: 1fr; } }
</style>
