<script setup>
import { ref, onMounted, computed } from 'vue'

/* ===========================
   Estado UI
   =========================== */
const loading = ref(true)
const error = ref(null)

// filtros
const q = ref('')          // búsqueda por texto (cliente, código, técnico)
const estado = ref('')     // estado seleccionado
const desde = ref('')      // yyyy-mm-dd
const hasta = ref('')      // yyyy-mm-dd

// dataset (mock por ahora)
const items = ref([])

/* ===========================
   Mock de asignaciones de agenda
   (cuando tengan API, reemplazar cargar() )
   =========================== */
const MOCK = [
  {
    _id: 'ag1',
    codigo: '4501',
    cliente: 'Juan Pérez',
    tecnico: 'Ezequiel Castro',
    estado: 'Asignada',
    fechaIngreso: new Date(Date.now() - 3*864e5).toISOString(),
    fechaRevision: new Date(Date.now() + 2*3600e3).toISOString(), // +2 horas
    fechaLimite: new Date(Date.now() + 5*864e5).toISOString()
  },
  {
    _id: 'ag2',
    codigo: 'EXT-778',
    cliente: 'Hospital Italiano',
    tecnico: 'Nicolás Cuadrado',
    estado: 'En revisión',
    fechaIngreso: new Date(Date.now() - 2*864e5).toISOString(),
    fechaRevision: new Date(Date.now() + 26*3600e3).toISOString(), // +26 h
    fechaLimite: new Date(Date.now() + 2*864e5).toISOString()
  },
  {
    _id: 'ag3',
    codigo: 'EXT-995',
    cliente: 'Mercantil Andina',
    tecnico: 'Francisco Galera',
    estado: 'Asignada',
    fechaIngreso: new Date(Date.now() - 1*864e5).toISOString(),
    fechaRevision: new Date(Date.now() + 50*3600e3).toISOString(),
    fechaLimite: new Date(Date.now() + 3*864e5).toISOString()
  }
]

async function cargar() {
  try {
    loading.value = true
    error.value = null
    // simulamos fetch
    await new Promise(r => setTimeout(r, 250))
    items.value = MOCK
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar la agenda.'
  } finally {
    loading.value = false
  }
}

/* ===========================
   Filtro derivado
   =========================== */
const estadosDisponibles = computed(() => {
  const set = new Set(items.value.map(i => i.estado))
  return Array.from(set)
})

const filtrados = computed(() => {
  const text = q.value.trim().toLowerCase()
  const d = desde.value ? new Date(desde.value + 'T00:00:00') : null
  const h = hasta.value ? new Date(hasta.value + 'T23:59:59') : null
  const est = estado.value

  return items.value
    .filter(i => {
      // texto en cliente/código/técnico
      const hayTexto =
        !text ||
        i.cliente.toLowerCase().includes(text) ||
        i.codigo.toLowerCase().includes(text) ||
        (i.tecnico || '').toLowerCase().includes(text)

      // rango por fecha de revisión
      const fr = new Date(i.fechaRevision)
      const enRango =
        (!d || fr >= d) &&
        (!h || fr <= h)

      // estado
      const byEstado = !est || i.estado === est

      return hayTexto && enRango && byEstado
    })
    // ordenamos por fecha de revisión ascendente
    .sort((a, b) => new Date(a.fechaRevision) - new Date(b.fechaRevision))
})

function limpiar() {
  q.value = ''
  estado.value = ''
  desde.value = ''
  hasta.value = ''
}

onMounted(cargar)
</script>

<template>
  <div class="page">
    <h2>Agenda de órdenes</h2>

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
        Mostrando <b>{{ filtrados.length }}</b> de {{ items.length }}
      </div>

      <table class="tbl">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Técnico</th>
            <th>Estado</th>
            <th>Ingreso</th>
            <th>Revisión</th>
            <th>Fecha límite</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in filtrados" :key="i._id">
            <td>{{ i.codigo }}</td>
            <td>{{ i.cliente }}</td>
            <td>{{ i.tecnico || '—' }}</td>
            <td><span class="pill">{{ i.estado }}</span></td>
            <td>{{ new Date(i.fechaIngreso).toLocaleString() }}</td>
            <td>{{ new Date(i.fechaRevision).toLocaleString() }}</td>
            <td>{{ new Date(i.fechaLimite).toLocaleDateString() }}</td>
          </tr>
          <tr v-if="!filtrados.length">
            <td colspan="7" class="empty">Sin resultados con esos filtros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 24px; }
h2 { font-size: 1.6rem; margin-bottom: 12px; }
.filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px; }
.filters input[type="text"], .filters input[type="date"], .filters select {
  padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
}
.btn, .btn-sec { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
.btn { background:#3498db; color:#fff; }
.btn:hover { background:#2980b9; }
.btn-sec { background:#ecf0f1; color:#2c3e50; }
.tbl { width: 100%; border-collapse: collapse; font-size: .95rem; }
.tbl th, .tbl td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
.tbl thead { background:#f8fafc; }
.empty { text-align: center; color:#6b7280; }
.pill { background:#eef2ff; color:#3730a3; padding:2px 8px; border-radius: 999px; font-size: .8rem; }
.meta { color:#6b7280; margin-bottom: 6px; }
@media (max-width: 820px) {
  .tbl { font-size: .85rem; }
  .filters { gap: 8px; }
}
/* Compactar filtros en escritorio */
@media (min-width: 900px) {
  .filters {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto auto;
    gap: 10px;
    align-items: center;
  }

  .filters input[type="text"],
  .filters input[type="date"],
  .filters select {
    width: 100%;
  }
}

/* ====== Filtros compactos y alineados ====== */
.filters {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr auto; /* search, estado, desde, hasta, botones */
  gap: 18px;
  align-items: end;              /* alinea inputs y botones por la base */
  margin: 12px 0 18px;
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 160px;
}

.label {
  font-weight: 600;
  color: #3b4252;
  margin-bottom: 6px;
  line-height: 1;
}

.label.center {
  text-align: center;            /* “Desde” y “Hasta” centrados */
}

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

.filters select {
  min-width: 60px;               /* para que se lea “Todos los estados” completo */ 
  margin-right: 6px;
}

.actions {
  display: flex;
  gap: 10px;
  align-self: end;               /* se alinea con la base de los inputs */
}

.actions .btn-primary,
.actions .btn-secondary {
  height: 40px;                  /* misma altura que los inputs */
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
}

.actions .btn-primary {
  background: #3b82f6;
  color: #fff;
}

.actions .btn-primary:hover { background: #2563eb; }

.actions .btn-secondary {
  background: #eef2f7;
  color: #1f2937;
  border-color: #e5e7eb;
}

.actions .btn-secondary:hover { background: #e7ebf2; }

/* Responsive: en pantallas chicas se apila prolijo */
@media (max-width: 900px) {
  .filters {
    grid-template-columns: 2fr 1.3fr 1fr 1fr auto;  /* una columna */
  }
  .label.center { text-align: left; }
}




</style>
