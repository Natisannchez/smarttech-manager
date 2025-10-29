<template>
  <div class="orders-list-container">
    <!-- ...existing code... -->
  </div>
    <div class="header">
      <h1>📋 Órdenes de Trabajo</h1>
      <p>Gestión y seguimiento de órdenes</p>
    </div>

    <!-- Barra de búsqueda y botón nueva orden -->
    <div class="search-bar">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nombre, DNI o producto..."
          class="form-control"
          aria-label="Buscar órdenes de trabajo"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="handleSearch" 
          class="btn-primary search-button"
          aria-label="Realizar búsqueda"
        >
          🔍 Buscar
        </button>
      </div>
      <button @click="goToNuevaOrden" class="btn-primary btn-nueva-orden" style="margin-top:10px;">
        + Nueva Orden de Trabajo
      </button>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="loading-state" role="status" aria-label="Cargando órdenes">
      <div class="loading-skeleton" v-for="n in 5" :key="n">
        <div class="skeleton-row"></div>
      </div>
    </div>

    <div v-else-if="error" class="error-state" role="alert">
      <div class="error-message">
        <span>⚠️ Error al cargar las órdenes</span>
        <p>{{ error }}</p>
        <button @click="fetchOrders" class="btn-primary">
          Reintentar
        </button>
      </div>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-message">
        <span>📭 No hay órdenes para mostrar</span>
        <p>No se encontraron órdenes que coincidan con tu búsqueda</p>
      </div>
    </div>

    <!-- Tabla de órdenes -->
    <div v-else class="table-responsive">
      <table class="orders-table" role="grid" aria-label="Listado de órdenes de trabajo">
        <thead>
          <tr>
            <th scope="col" @click="sort('numeroOrden')" class="sortable">
              № Orden
              <span class="sort-icon">{{ getSortIcon('numeroOrden') }}</span>
            </th>
            <th scope="col" @click="sort('nombreApellido')" class="sortable">
              Cliente
              <span class="sort-icon">{{ getSortIcon('nombreApellido') }}</span>
            </th>
            <th scope="col" @click="sort('dni')" class="sortable">
              DNI
              <span class="sort-icon">{{ getSortIcon('dni') }}</span>
            </th>
            <th scope="col" @click="sort('producto')" class="sortable">
              Producto
              <span class="sort-icon">{{ getSortIcon('producto') }}</span>
            </th>
            <th scope="col" @click="sort('estado')" class="sortable">
              Estado
              <span class="sort-icon">{{ getSortIcon('estado') }}</span>
            </th>
            <th scope="col" @click="sort('fecha_ingreso')" class="sortable">
              Fecha
              <span class="sort-icon">{{ getSortIcon('fecha_ingreso') }}</span>
            </th>
            <th scope="col">Acciones</th>
    <th scope="col">Editar Estado</th>
    </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.numeroOrden" class="order-row">
            <td>
              {{
                order.codigo_orden_visible
                  || order.numeroOrden
                  || (order._id ? 'ORD-' + order._id.slice(-4).toUpperCase() : '—')
              }}
            </td>
              <td>{{ order.codigo_orden_visible || order.numeroOrden || (order._id ? 'ORD-' + order._id.slice(-4).toUpperCase() : '—') }}</td>
              <td>{{ order.cliente?.nombre_apellido || order.cliente?.nombre || order.cliente || '—' }}</td>
              <td>{{ order.cliente?.dni || order.dni || '—' }}</td>
              <td>{{ order.producto?.tipo_producto || order.producto?.marca || order.producto?.modelo || order.producto || '—' }}</td>
              <td :class="'estado-' + (order.estado ? order.estado.toLowerCase() : '')">{{ order.estado || '—' }}</td>
              <td>{{ order.fecha_ingreso ? new Date(order.fecha_ingreso).toLocaleDateString() + ' ' + new Date(order.fecha_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString() + ' ' + new Date(order.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') }}</td>
              <td>
                <button 
                  @click.stop="order.showDetail = !order.showDetail"
                  class="btn-secondary btn-sm"
                  aria-label="Ver detalles de la orden"
                >
                  {{ order.showDetail ? 'Ocultar' : 'Ver detalles' }}
                </button>
              </td>
          <div v-if="order.showDetail" class="order-detail-panel">
            <div class="order-detail-panel-content">
              <h3>Detalle de Orden № {{ order.codigo_orden_visible || order.numeroOrden || (order._id ? 'ORD-' + order._id.slice(-4).toUpperCase() : '—') }}</h3>
              <ul class="order-detail-list">
                <li><strong>Cliente:</strong> {{ order.cliente?.nombre_apellido || order.cliente?.nombre || order.cliente || '—' }}</li>
                <li><strong>DNI:</strong> {{ order.cliente?.dni || order.dni || '—' }}</li>
                <li><strong>Producto:</strong>
                  <ul>
                    <li><strong>Tipo:</strong> {{ order.producto?.tipo_producto || '—' }}</li>
                    <li><strong>Marca:</strong> {{ order.producto?.marca || '—' }}</li>
                    <li><strong>Modelo:</strong> {{ order.producto?.modelo || '—' }}</li>
                    <li><strong>N° Serie:</strong> {{ order.producto?.numero_serie || '—' }}</li>
                  </ul>
                </li>
                <li><strong>Estado:</strong> {{ order.estado || '—' }}</li>
                <li><strong>Fecha de ingreso:</strong> {{ order.fecha_ingreso ? new Date(order.fecha_ingreso).toLocaleDateString() + ' ' + new Date(order.fecha_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString() + ' ' + new Date(order.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') }}</li>
              </ul>
              <button class="btn-primary" @click="order.showDetail = false">Cerrar</button>
            </div>
          </div>
            <td>
              <input
                type="text"
                v-model="order.estado"
                @change="handleEstadoChange(order)"
                class="form-control"
                placeholder="Escribe estado o comentario..."
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de detalle de orden -->
    <div v-if="modalVisible" class="modal-overlay">
      <div class="modal-content">
        <h2>Detalle de Orden № {{ selectedOrder.codigo_orden_visible || selectedOrder.numeroOrden || (selectedOrder._id ? 'ORD-' + selectedOrder._id.slice(-4).toUpperCase() : '—') }}</h2>
        <ul class="order-detail-list">
          <li><strong>Cliente:</strong> {{ selectedOrder.cliente?.nombre_apellido || selectedOrder.cliente?.nombre || selectedOrder.cliente || '—' }}</li>
          <li><strong>DNI:</strong> {{ selectedOrder.cliente?.dni || selectedOrder.dni || '—' }}</li>
          <li><strong>Producto:</strong>
            <ul>
              <li><strong>Tipo:</strong> {{ selectedOrder.producto?.tipo_producto || '—' }}</li>
              <li><strong>Marca:</strong> {{ selectedOrder.producto?.marca || '—' }}</li>
              <li><strong>Modelo:</strong> {{ selectedOrder.producto?.modelo || '—' }}</li>
              <li><strong>N° Serie:</strong> {{ selectedOrder.producto?.numero_serie || '—' }}</li>
            </ul>
          </li>
          <li><strong>Estado:</strong> {{ selectedOrder.estado || '—' }}</li>
          <li><strong>Fecha de ingreso:</strong> {{ selectedOrder.fecha_ingreso ? new Date(selectedOrder.fecha_ingreso).toLocaleString() : (selectedOrder.fecha_creacion ? new Date(selectedOrder.fecha_creacion).toLocaleString() : '—') }}</li>
        </ul>
        <button class="btn-primary" @click="modalVisible = false">Cerrar</button>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="btn-secondary"
        aria-label="Página anterior"
      >
        ←
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button 
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="btn-secondary"
        aria-label="Página siguiente"
      >
        →
      </button>
    </div>
</template>

<script setup>
    // Ir a crear nueva orden
    const goToNuevaOrden = () => {
      router.push('/ordenes/nueva')
    }
import { onMounted as vueOnMounted } from 'vue'

// Cerrar popover al hacer clic fuera
vueOnMounted(() => {
  document.addEventListener('click', () => {
    paginatedOrders.value.forEach(order => {
      if (order.showDetail) order.showDetail = false
    })
  })
})

    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { ordenesService } from '@/services/api'

    // Corrección: definir modalVisible y selectedOrder
    const modalVisible = ref(false)
    const selectedOrder = ref({})

    // Mostrar detalle de orden en modal
    const showOrderDetail = (order) => {
      selectedOrder.value = order
      modalVisible.value = true
    }

    const router = useRouter()

    // Estado
    const orders = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const sortColumn = ref('numeroOrden')
    const sortDirection = ref('asc')

    // Función para manejar el cambio de estado en frontend
    const handleEstadoChange = (order) => {
      // Aquí podrías agregar lógica para guardar el estado en backend si lo deseas
      // Por ahora solo actualiza el mock/local
      // Ejemplo: mostrar mensaje
      order.estado = order.estado
    }

    // Métodos
    const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const resp = await ordenesService.getAll()
      // El backend debe devolver { success, data: [...] }
      orders.value = Array.isArray(resp.data) ? resp.data : (resp.data?.data || [])
    } catch (e) {
      error.value = 'No se pudieron cargar las órdenes. Por favor, intente nuevamente.'
    } finally {
      loading.value = false
    }
    }

    const goToOrderDetail = (orderId) => {
    router.push(`/ordenes/${orderId}`)
    }

    const sort = (column) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
    }
    }

    const getSortIcon = (column) => {
    if (sortColumn.value !== column) return '↕️'
    return sortDirection.value === 'asc' ? '↑' : '↓'
    }

    const handleSearch = () => {
      // Reiniciar a la primera página cuando se realiza una búsqueda
      currentPage.value = 1
      // Aquí podríamos añadir lógica adicional cuando tengamos el backend
      // Por ejemplo, hacer una llamada a la API con los parámetros de búsqueda
    }

    // Computed properties
    const filteredOrders = computed(() => {
    let filtered = [...orders.value]
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(order => {
        // Buscar en cliente
        const cliente = (order.cliente?.nombre_apellido || order.cliente?.nombre || order.cliente || '').toString().toLowerCase()
        // Buscar en dni
        const dni = (order.cliente?.dni || order.dni || '').toString().toLowerCase()
        // Buscar en producto
        const producto = (order.producto?.tipo_producto || order.producto?.marca || order.producto?.modelo || order.producto || '').toString().toLowerCase()
        // Buscar en estado
        const estado = (order.estado || '').toString().toLowerCase()
        // Buscar en fecha
        const fecha = (order.fecha_ingreso || order.fecha_creacion || '').toString().toLowerCase()
        return cliente.includes(query) || dni.includes(query) || producto.includes(query) || estado.includes(query) || fecha.includes(query)
      })
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
        const aValue = a[sortColumn.value]
        const bValue = b[sortColumn.value]
        
        if (sortDirection.value === 'asc') {
        return aValue > bValue ? 1 : -1
        } else {
        return aValue < bValue ? 1 : -1
        }
    })
    
    return filtered
    })

    const totalPages = computed(() => 
    Math.ceil(filteredOrders.value.length / itemsPerPage)
    )

    const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredOrders.value.slice(start, end)
    })

    // Lifecycle
    onMounted(() => {
    fetchOrders()
    })
// ...existing code...
</script>

<style scoped>
  .btn-nueva-orden {
    margin-left: 12px;
    font-size: 1em;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 500;
    background: #2980b9;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
  }
  .btn-nueva-orden:hover {
    background: #21618c;
  }
  .order-detail-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 340px;
    height: 100%;
    background: none;
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    pointer-events: none;
  }
  .order-detail-panel-content {
    background: #fff;
    padding: 10px 12px;
    border-radius: 12px 0 0 12px;
    box-shadow: -4px 0 24px rgba(44,62,80,0.13);
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    color: #2c3e50;
    width: 300px;
    max-height: 96vh;
    margin: 0;
    position: relative;
    pointer-events: auto;
    overflow-y: auto;
    animation: slidein 0.18s;
  }
  .order-detail-list > li {
    margin-bottom: 8px;
    font-size: 0.97em;
    background: #f8f9fa;
    border-radius: 7px;
    box-shadow: 0 1px 4px rgba(44,62,80,0.07);
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
  }
  .order-detail-list strong {
    color: #2980b9;
    font-weight: 600;
    margin-bottom: 1px;
    font-size: 0.97em;
  }
  .order-detail-list ul li {
    font-size: 0.95em;
    margin-bottom: 1px;
    color: #555;
  }
  @keyframes slidein {
    0% { opacity: 0; transform: translateX(40px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  .order-detail-popover-content h3 {
    font-size: 1.08em;
    color: #2980b9;
    margin-bottom: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .order-detail-list > li {
    margin-bottom: 12px;
    font-size: 1em;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(44,62,80,0.07);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
  }
  .order-detail-list strong {
    color: #2980b9;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .order-detail-list ul {
    margin: 6px 0 0 0;
    padding: 0;
    list-style: none;
  }
  .order-detail-list ul li {
    font-size: 0.97em;
    margin-bottom: 2px;
    color: #555;
  }
  @keyframes popin {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  .order-detail-row {
    background: #f4f8fb;
  }
  .order-detail-accordion {
    background: #f8f9fa;
    padding: 24px 28px;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgba(44,62,80,0.10);
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }
  .order-detail-accordion h3 {
    font-size: 1.18em;
    color: #2980b9;
    margin-bottom: 12px;
  }
  .modal-content {
    background: #f8f9fa;
    padding: 36px 40px;
    border-radius: 16px;
    max-width: 520px;
    margin: 40px auto;
    box-shadow: 0 8px 32px rgba(44,62,80,0.18);
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    color: #2c3e50;
  }
  .order-detail-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .order-detail-list > li {
    margin-bottom: 18px;
    font-size: 1.08em;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(44,62,80,0.07);
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
  }
  .order-detail-list strong {
    color: #2980b9;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .order-detail-list ul {
    margin: 8px 0 0 0;
    padding: 0;
    list-style: none;
  }
  .order-detail-list ul li {
    font-size: 0.98em;
    margin-bottom: 4px;
    color: #555;
  }
    .orders-list-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    }

    .header {
    text-align: center;
    margin-bottom: 30px;
    }

    .header h1 {
    color: #2c3e50;
    margin-bottom: 10px;
    }

    .header p {
    color: #666;
    }

    .search-bar {
    margin-bottom: 20px;
    }

    .search-input-group {
    display: flex;
    gap: 10px;
    align-items: stretch;
    }

    .search-input-group input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    height: 42px;
    }

    .search-button {
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 42px;
    margin: 4px 0 0 0;
    }

    @media (max-width: 768px) {
    .search-input-group {
        flex-direction: column;
    }
    
    .search-button {
        width: 100%;
    }
}    
    .table-responsive {
    overflow-x: auto;
    margin-bottom: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .orders-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
    }

    .orders-table th {
    background: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    position: sticky;
    top: 0;
    z-index: 1;
    }

    .orders-table td {
    padding: 12px;
    border-top: 1px solid #eee;
    }

    .order-row {
    cursor: pointer;
    transition: background-color 0.2s;
    }

    .order-row:hover {
    background-color: #f5f5f5;
    }

    .sortable {
    cursor: pointer;
    user-select: none;
    }

    .sort-icon {
    margin-left: 5px;
    font-size: 0.8em;
    }

    .loading-state, .error-state, .empty-state {
    padding: 40px;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .loading-skeleton {
    margin: 10px 0;
    }

    .skeleton-row {
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    }

    @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
    }

    .error-message, .empty-message {
    color: #666;
    }

    .error-message span, .empty-message span {
    font-size: 1.2em;
    font-weight: 500;
    display: block;
    margin-bottom: 10px;
    }

    .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    }

    .btn-sm {
    padding: 5px 10px;
    font-size: 0.9em;
    }

    @media (max-width: 768px) {
    .orders-list-container {
        padding: 10px;
    }
    
    .table-responsive {
        margin: 0 -10px;
        border-radius: 0;
    }
    }
</style>