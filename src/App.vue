<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const buscadorInput = ref("")
const menuOpen = ref(false) // Agregar estado para el menú

function buscar() {
  if (!buscadorInput.value.trim()) return
  router.push({ path: '/busqueda', query: { q: buscadorInput.value.trim() } })
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <aside class="menu">
    <div class="nav-container">
      <button class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="menu-items" :class="{ active: menuOpen }">
        <router-link to="/home" @click="menuOpen = false">🏠 Dashboard</router-link>
        <router-link to="/administracion" @click="menuOpen = false">⚙️ Administración</router-link>
        <router-link to="/agenda" @click="menuOpen = false">📅 Agenda</router-link>
        <router-link to="/programar" @click="menuOpen = false">🗓️ Programar</router-link>
      </div>
    </div>

    <div class="derechaNavBar">
      <input
        id="buscadorInput"
        class="entryBuscador"
        type="text"
        placeholder="Buscar Cliente u Orden de Trabajo"
        v-model="buscadorInput"
        @keyup.enter="buscar"
      />
      <button id="buscadorBtn" @click="buscar">
        <img src="./assets/lupa.png" alt="Buscar" style="width:20px; height:20px; margin-right: 6px;" />
        <span>Buscar</span>
      </button>
    </div>

    <div id="resultadosBuscador"></div>
  </aside>

  <main class="page">
    <router-view />
  </main>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; /* Permite que los elementos se envuelvan en pantallas pequeñas */
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e5e5;
  justify-content: flex-start;
  align-items: center;
  background: #fafafa; /* color de fondo */
}

.menu :deep(a) {
  text-decoration: none;
  padding: .5rem .8rem;
  border-radius: 6px;
  color: #333;
}

.menu :deep(a.router-link-active) {
  background: #f2f2f2;
  font-weight: 600;
}

.page {
  padding: 1rem;
}
.derechaNavBar {
  margin-left: auto; /* Empuja el buscador a la derecha */
  display: GRID;
  align-items: center;
  gap: 0.5rem; /* Espacio entre el input y el botón */
}
.entryBuscador {
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.derechaNavBar input, .derechaNavBar button {
  position: relative;
  height: 30px; /* Establece la altura en 30px */
  vertical-align: middle; /* Alinea el contenido verticalmente */
  line-height: 30px; /* Establece la línea de base del texto en 30px */
  font-size: 14px; /* Tamaño de fuente adecuado */
}

/* Agregar media queries para diferentes tamaños de pantalla */
@media (max-width: 768px) {
  .menu {
    flex-direction: column;
    align-items: stretch;
  }

  .derechaNavBar {
    margin-left: 0;
    width: 100%;
  }

  .entryBuscador {
    width: 100%;
  }

  button {
    width: 100%;
    justify-content: center;
  }

  .menu :deep(a) {
    display: block;
    text-align: center;
    margin: 0.2rem 0;
  }

  .hamburger {
    display: flex;
    margin-bottom: 1rem;
  }

  .menu-items {
    display: none;
    width: 100%;
  }

  .menu-items.menu-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #fafafa;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .menu {
    position: relative;
    padding-top: 0.5rem;
  }

  /* Animación del botón hamburguesa */
  .menu-open + .hamburger span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .menu-open + .hamburger span:nth-child(2) {
    opacity: 0;
  }

  .menu-open + .hamburger span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
}

@media (max-width: 480px) {
  .menu {
    padding: 0.5rem;
    gap: 0.3rem;
  }

  .derechaNavBar {
    gap: 0.3rem;
  }

  .menu-items.menu-open {
    top: 50px;
  }
}

.nav-container {
  display: flex;
  align-items: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.hamburger span {
  width: 30px;
  height: 3px;
  background: #333;
  border-radius: 3px;
  transition: all 0.3s linear;
}

.menu-items {
  display: flex;
  gap: 1rem;
}

@media (max-width: 768px) {
  .nav-container {
    width: 100%;
    margin-bottom: 1rem;
  }

  .hamburger {
    display: flex;
  }

  .menu-items {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #fafafa;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 1000;
    flex-direction: column;
  }

  .menu-items.active {
    display: flex;
  }

  .menu-items a {
    padding: 0.5rem 1rem;
    width: 100%;
    text-align: left;
  }

  .menu {
    position: relative;
    flex-direction: column;
  }

  .derechaNavBar {
    width: 100%;
  }
}
</style>