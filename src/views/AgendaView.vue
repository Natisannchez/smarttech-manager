<script setup>
import { ref, onMounted } from 'vue'
import { agendaService } from '@/services/api'

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
    items.value = Array.isArray(resp.data) ? resp.data : (resp.data?.data || [])
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
        Mostrando <b>{{ items.length }}</b>
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
          <tr v-for="i in items" :key="i._id">
            <td>{{ i.orden?.codigo_orden_visible ?? i.codigo ?? '—' }}</td>
            <td>{{ i.orden?.cliente?.nombre_apellido ?? i.cliente ?? '—' }}</td>
            <td>{{ i.tecnico?.nombre_apellido ?? i.tecnico ?? '—' }}</td>
            <td><span class="pill">{{ i.estado ?? '—' }}</span></td>
            <td>{{ i.orden?.fecha_ingreso ? new Date(i.orden.fecha_ingreso).toLocaleString() : '—' }}</td>
            <td>{{ i.fecha_revision ? new Date(i.fecha_revision).toLocaleString() : '—' }}</td>
            <td>{{ i.fecha_limite ? new Date(i.fecha_limite).toLocaleDateString() : '—' }}</td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="7" class="empty">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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
