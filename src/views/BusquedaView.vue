<template>
  <div class="busqueda-container">
    <h2>Resultados de búsqueda para "{{ $route.query.q }}"</h2>
    <div v-if="loading">Buscando...</div>
    <div v-else>
      <div v-if="resultados.equipos.length || resultados.personas.length">
        <div v-if="resultados.equipos.length">
          <h3>Equipos</h3>
          <ul>
            <li v-for="eq in resultados.equipos" :key="eq._id">
              <router-link :to="getEquipoRuta(eq)">{{ eq.nombre }} ({{ eq.producto }})</router-link>
            </li>
          </ul>
        </div>
        <div v-if="resultados.personas.length">
          <h3>Personas</h3>
          <ul>
            <li v-for="ag in resultados.personas" :key="ag._id">
              <router-link :to="getPersonaRuta(ag)">{{ ag.nombre }} ({{ ag.producto || 'Sin producto' }})</router-link>
            </li>
          </ul>
        </div>
      </div>
      <div v-else>
        <p>No se encontraron resultados.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { equiposService, agentesService } from '../services/api'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const resultados = ref({ equipos: [], personas: [] })

function normalizar(str) {
  return (str || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function getEquipoRuta(eq) {
  // Redirige a la vista del producto correspondiente
  const prod = (eq.producto || '').toLowerCase()
  if (prod === 'movistar') return '/movistar'
  if (prod === 'claro') return '/claro'
  if (prod === 'adt') return '/adt'
  if (prod === 'dateros') return '/dateros'
  if (prod === 'supervision') return '/supervision'
  if (prod === 'administracion') return '/administracion'
  if (prod === 'it') return '/it'
  if (prod === 'desvinculados') return '/desvinculados'
  return '/'
}

function getPersonaRuta(ag) {
  // Si tiene producto, usarlo; si no, buscar el equipo y usar su producto
  if (ag.producto) {
    const base = getEquipoRuta({ producto: ag.producto })
    return { path: base, query: { agente: ag._id } }
  } else if (ag.equipo_id) {
    // Buscar el equipo en los resultados actuales
    let eq = resultados.value.equipos.find(e => e._id === ag.equipo_id)
    // Si no está en los resultados, buscar en todos los equipos
    if (!eq && window.__ALL_EQUIPOS__) {
      eq = window.__ALL_EQUIPOS__.find(e => e._id === ag.equipo_id)
    }
    let base = '/'
    if (eq && eq.producto) {
      base = getEquipoRuta(eq)
    }
    return { path: base, query: { agente: ag._id } }
  } else {
    return { path: '/', query: { agente: ag._id } }
  }
}

async function buscar(q) {
  loading.value = true
  const [equiposRes, agentesRes] = await Promise.all([
    equiposService.getAll(),
    agentesService.getAll()
  ])
  // Guardar todos los equipos en window para acceso global rápido
  window.__ALL_EQUIPOS__ = equiposRes.data || []
  const qNorm = normalizar(q)
  resultados.value.equipos = (equiposRes.data || []).filter(e => normalizar(e.nombre).includes(qNorm))
  resultados.value.personas = (agentesRes.data || []).filter(a => normalizar(a.nombre).includes(qNorm))
  loading.value = false
}

onMounted(() => {
  if (route.query.q) buscar(route.query.q)
})

watch(() => route.query.q, (q) => {
  if (q) buscar(q)
})
</script>

<style scoped>
.busqueda-container {
  max-width: 700px;
  margin: 3rem auto;
  background: linear-gradient(to bottom right, #f9f9f9, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

h3 {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #34495e;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.75rem;
  padding: 0.6rem 1rem;
  background-color: #f0f4f8;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #dceefb;
}

router-link {
  text-decoration: none;
  color: #2980b9;
  font-weight: 500;
  transition: color 0.3s ease;
}

router-link:hover {
  color: #1abc9c;
}

p {
  text-align: center;
  font-size: 1.1rem;
  color: #888;
  margin-top: 2rem;
}

[v-cloak] {
  display: none;
}
</style>
