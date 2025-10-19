<template>
    <div class="orders-list-container">
        <div class="header">
        <h1>📋 Órdenes de Trabajo</h1>
        <p>Gestión y seguimiento de órdenes</p>
        </div>

    <!-- Barra de búsqueda -->
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
    </div>        <!-- Estados de carga y error -->
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
            </tr>
            </thead>
            <tbody>
            <tr v-for="order in paginatedOrders" :key="order.numeroOrden" @click="goToOrderDetail(order.numeroOrden)" class="order-row">
                <td>{{ order.numeroOrden }}</td>
                <td>{{ order.nombreApellido }}</td>
                <td>{{ order.dni }}</td>
                <td>{{ order.producto }}</td>
                <td :class="'estado-' + order.estado.toLowerCase()">{{ order.estado }}</td>
                <td>{{ order.fecha_ingreso }}</td>
                <td>
                <button 
                    @click.stop="goToOrderDetail(order.numeroOrden)"
                    class="btn-secondary btn-sm"
                    aria-label="Ver detalles de la orden"
                >
                    Ver detalles
                </button>
                </td>
            </tr>
            </tbody>
        </table>
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
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { ordenesService } from '@/services/api'
    import Swal from 'sweetalert2'

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

    // Métodos
    const fetchOrders = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await ordenesService.getAll()
        orders.value = response.data.data.map(order => ({
          numeroOrden: order.codigo_orden_visible,
          nombreApellido: order.cliente.nombre_apellido,
          dni: order.cliente.dni,
          producto: `${order.producto.tipo_producto} ${order.producto.marca} ${order.producto.modelo}`,
          estado: order.estado,
          fecha_ingreso: new Date(order.fecha_ingreso).toLocaleDateString()
        }))
      } catch (e) {
        console.error('Error al cargar órdenes:', e)
        error.value = 'No se pudieron cargar las órdenes. Por favor, intente nuevamente.'
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las órdenes. Por favor, intente nuevamente.',
        })
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

    const handleSearch = async () => {
      // Reiniciar a la primera página cuando se realiza una búsqueda
      currentPage.value = 1
      await fetchOrders() // Recargar las órdenes
    }

    // Cargar datos cuando se monta el componente
    onMounted(() => {
      fetchOrders()
    })

    // Computed properties
    const filteredOrders = computed(() => {
    let filtered = [...orders.value]
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
        order.nombreApellido.toLowerCase().includes(query) ||
        order.dni.includes(query) ||
        order.producto.toLowerCase().includes(query)
        )
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
</script>

<style scoped>
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