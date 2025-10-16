<template>
    <div class="container">
        <h1>Nueva Orden de Trabajo</h1>

        <form @submit.prevent="guardarOrden" class="orden-trabajo-form">
        <!-- Sección de Datos del Cliente -->
        <div class="form-section">
            <h2>Datos del Cliente</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label for="nombreApellido">Nombre y Apellido *</label>
                    <input
                    type="text"
                    id="nombreApellido"
                    v-model="formData.cliente.nombreApellido"
                    required
                    class="form-control"
                    />
                </div>

                <div class="form-group dni-group">
                    <label for="dni">DNI *</label>
                    <div class="dni-container">
                    <input
                        type="number"
                        id="dni"
                        v-model="formData.cliente.dni"
                        required
                        class="form-control"
                    />
                    <div class="dni-buttons">
                        <button type="button" @click="buscarCliente" class="btn-secondary">
                        Buscar
                        </button>
                        <button type="button" @click="agregarCliente" class="btn-secondary">
                        Agregar Cliente
                        </button>
                    </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="fechaIngreso">Fecha de Ingreso *</label>
                    <input
                    type="date"
                    id="fechaIngreso"
                    v-model="formData.fechaIngreso"
                    required
                    class="form-control"
                    />
                </div>

                <div class="form-group full-width">
                    <label for="observaciones">Observaciones</label>
                    <textarea
                    id="observaciones"
                    v-model="formData.observaciones"
                    class="form-control"
                    rows="3"
                    ></textarea>
                </div>
            </div>
        </div>

        <!-- Sección de Datos del Equipo -->
        <div class="form-section">
            <h2>Datos del Equipo</h2>
            <div class="form-grid">
            <div class="form-group">
                <label for="tipoProducto">Tipo de Producto *</label>
                <input
                type="text"
                id="tipoProducto"
                v-model="formData.equipo.tipo"
                required
                class="form-control"
                placeholder="Ej: Televisor, Notebook, PC, etc."
                />
            </div>

            <div class="form-group">
                <label for="modelo">Modelo *</label>
                <input
                type="text"
                id="modelo"
                v-model="formData.equipo.modelo"
                required
                class="form-control"
                />
            </div>

            <div class="form-group">
                <label for="numeroSerie">Número de Serie</label>
                <input
                type="text"
                id="numeroSerie"
                v-model="formData.equipo.numeroSerie"
                class="form-control"
                />
            </div>

            <div class="form-group full-width">
                <label for="falla">Descripción de la Falla *</label>
                <textarea
                id="falla"
                v-model="formData.equipo.falla"
                required
                class="form-control"
                rows="3"
                ></textarea>
            </div>
            </div>
        </div>

        <!-- Botones de Acción -->
        <div class="form-actions">
            <button type="submit" class="btn-primary">Guardar Orden</button>
            <button type="button" @click="cancelar" class="btn-secondary">
            Cancelar
            </button>
        </div>
        </form>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'

    const router = useRouter()

    // Estado del formulario
    const formData = reactive({
    cliente: {
        nombreApellido: '',
        dni: '',
    },
    fechaIngreso: new Date().toISOString().split('T')[0],
    observaciones: '',
    equipo: {
        tipo: '',
        modelo: '',
        numeroSerie: '',
        falla: '',
    },
    costoReparacion: 0,
    sena: 0,
    })

    // Métodos
    const buscarCliente = async () => {
    if (!formData.cliente.dni) {
        Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingrese un DNI para buscar',
        })
        return
    }

    try {
        // TODO: Implementar búsqueda de cliente en el backend
        // const response = await axios.get(`/api/clientes/${formData.cliente.dni}`)
        // formData.cliente = response.data
    } catch (error) {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el cliente',
        })
    }
    }

    const agregarCliente = () => {
    // TODO: Implementar navegación al formulario de cliente nuevo
    router.push('/clientes/nuevo')
    }

    const guardarOrden = async () => {
    try {
        // TODO: Implementar guardado de orden en el backend
        // await axios.post('/api/ordenes', formData)
        
        await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Orden de trabajo guardada correctamente',
        })
        
        router.push('/ordenes')
    } catch (error) {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la orden de trabajo',
        })
    }
    }

    const cancelar = () => {
    router.back()
    }
</script>

<style scoped>
    .orden-trabajo-form {
    max-width: 1100px;
    margin: 0 auto;
    }

    .form-section {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    }

    .form-section h2 {
    color: #0078be;
    margin-bottom: 20px;
    font-size: 1.5em;
    }

    .form-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 20px;
    }

    .form-group {
    margin-bottom: 15px;
    }

    .form-group.full-width {
    grid-column: 1 / -1;
    }

    .form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    }

    .form-control:focus {
    outline: none;
    border-color: #0078be;
    box-shadow: 0 0 0 2px rgba(0, 120, 190, 0.2);
    }

    .dni-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    }

    .dni-buttons {
    display: flex;
    gap: 10px;
    }

    .dni-container input {
    width: 100%;
    }

    label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    }

    .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    }

    .btn-primary {
    background: #0078be;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    }

    .btn-primary:hover {
    background: #005a8c;
    }

    .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    }

    .btn-secondary:hover {
    background: #5a6268;
    }

    textarea {
    resize: vertical;
    min-height: 100px;
    }

    /* Estilos para campos requeridos */
    label:has(+ input:required)::after,
    label:has(+ select:required)::after,
    label:has(+ textarea:required)::after {
    content: ' *';
    color: #dc3545;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
    .dni-container {
        flex-direction: column;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .form-actions button {
        width: 100%;
    }
    }
</style>
