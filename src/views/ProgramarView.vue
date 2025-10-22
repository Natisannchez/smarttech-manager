<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ===========================
   MOCKS (cambiá por API luego)
   =========================== */
const pendientes = ref([
  { _id:'o4501', codigo:'4501', cliente:{ nombre:'Juan Pérez', tipo:'particular' }, fecha_ingreso:new Date().toISOString(), estado:'Ingresado' },
  { _id:'o4502', codigo:'EXT-778', cliente:{ nombre:'Hospital Italiano', tipo:'empresa' }, fecha_ingreso:new Date().toISOString(), estado:'Ingresado' },
  { _id:'o4503', codigo:'EXT-995', cliente:{ nombre:'Mercantil Andina', tipo:'empresa' }, fecha_ingreso:new Date().toISOString(), estado:'Ingresado' },
  { _id:'o4504', codigo:'EXT-441', cliente:{ nombre:'Scrapfree', tipo:'empresa' }, fecha_ingreso:new Date().toISOString(), estado:'Ingresado' }
])

const tecnicos = ref([
  { dni:'30111222', nombre:'Ezequiel Castro' },
  { dni:'28444999', nombre:'Nicolás Cuadrado' },
  { dni:'29222333', nombre:'Francisco Galera' }
])

/* ===========================
   estado del formulario
   =========================== */
const ordenId = ref('')
const tecnicoDni = ref('')
const fechaRevision = ref('')
const fechaLimite = ref('')
const guardando = ref(false)
const error = ref('')

/* ===========================
   1) DÍAS HÁBILES
   =========================== */
// feriados opcionales (YYYY-MM-DD)
const FERIADOS = [
  // '2025-12-25',
  // '2026-01-01'
]

// true si es sábado, domingo o feriado
function esNoHabil(d) {
  const day = d.getDay() // 0 domingo, 6 sábado
  if (day === 0 || day === 6) return true
  const iso = d.toISOString().slice(0,10)
  return FERIADOS.includes(iso)
}

// suma N días hábiles a una fecha ISO y devuelve YYYY-MM-DD
function sumarDiasHabiles(fechaISO, n) {
  const d = new Date(fechaISO)
  let rest = n
  while (rest > 0) {
    d.setDate(d.getDate() + 1)
    if (!esNoHabil(d)) rest--
  }
  return d.toISOString().slice(0,10)
}

function diasPorCliente(o) {
  if (!o) return 7
  const nombre = (o.cliente?.nombre || '').toLowerCase()
  const tipo = (o.cliente?.tipo || '').toLowerCase()
  if (tipo === 'particular') return 7
  if (nombre.includes('hospital italiano')) return 2
  if (nombre.includes('mercantil andina'))  return 3
  if (nombre.includes('scrapfree'))         return 5
  return 3
}

function calcularFechaLimite(o) {
  if (!o?.fecha_ingreso) return ''
  return sumarDiasHabiles(o.fecha_ingreso, diasPorCliente(o))
}

/* ===========================
   derivados + efectos
   =========================== */
const orden = computed(() => pendientes.value.find(p => p._id === ordenId.value) || null)
watch(orden, (o) => { fechaLimite.value = o ? calcularFechaLimite(o) : '' })

const ahoraLocalMin = computed(() => new Date().toISOString().slice(0,16)) // para min en datetime-local
const puedeGuardar = computed(() =>
  !!ordenId.value && !!tecnicoDni.value && !!fechaRevision.value && !guardando.value
)

/* ===========================
   acciones
   =========================== */
function limpiar() {
  ordenId.value = ''
  tecnicoDni.value = ''
  fechaRevision.value = ''
  fechaLimite.value = ''
  error.value = ''
}

async function guardar() {
  error.value = ''
  if (!puedeGuardar.value) {
    error.value = 'Completá la orden, el técnico y la fecha de revisión.'
    return
  }

  // validación extra: fecha de revisión no puede ser pasada
  const tsRev = new Date(fechaRevision.value).getTime()
  if (isNaN(tsRev) || tsRev < Date.now()) {
    error.value = 'La fecha de revisión no puede ser en el pasado.'
    return
  }

  const payload = {
    id_orden: ordenId.value,
    dni_tecnico: tecnicoDni.value,
    fecha_revision: fechaRevision.value,
    fecha_limite: fechaLimite.value
  }

  try {
    guardando.value = true
    // TODO: reemplazar por llamadas reales:
    // await AgendaApi.crearAsignacion(payload)
    // await AgendaApi.marcarOrdenAsignada(ordenId.value)
    console.log('ASIGNACIÓN (mock):', payload)
    alert('Asignación guardada (mock).')
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
            {{ o.codigo }} — {{ o.cliente?.nombre || '—' }}
          </option>
        </select>
        <small v-if="orden">
          Ingreso: {{ new Date(orden.fecha_ingreso).toLocaleString() }}
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
