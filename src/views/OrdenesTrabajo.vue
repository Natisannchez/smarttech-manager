<template>
    <div class="container">
        <h1>Nueva Orden de Trabajo</h1>

        <form @submit.prevent="guardarOrden" class="orden-trabajo-form">
        <!-- Sección de Datos del Cliente -->
        <div class="form-section">
            <h2>Datos del Cliente</h2>
            <div class="form-grid">
                <!-- Tipo de Cliente -->
                <div class="form-group">
                    <label for="tipoCliente">Tipo de Cliente *</label>
                    <select
                        id="tipoCliente"
                        v-model="formData.cliente.tipoCliente"
                        required
                        class="form-control"
                        @change="handleTipoClienteChange"
                    >
                        <option value="particular">Particular</option>
                        <option value="empresa">Empresa</option>
                    </select>
                </div>

                <!-- Nombre y Apellido -->
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

                <!-- DNI -->
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

                <!-- Nombre de Empresa (condicional) -->
                <div v-if="formData.cliente.tipoCliente === 'empresa'" class="form-group">
                    <label for="nombreEmpresa">Empresa *</label>
                    <select
                        id="nombreEmpresa"
                        v-model="formData.cliente.nombreEmpresa"
                        required
                        class="form-control"
                    >
                        <option value="">Seleccione una empresa</option>
                        <option value="Mercantil Andina">Mercantil Andina</option>
                        <option value="Scrapfree">Scrapfree</option>
                        <option value="Hospital Italiano">Hospital Italiano</option>
                    </select>
                </div>

                <!-- Código de Orden Externa (solo para empresas) -->
                <div v-if="formData.cliente.tipoCliente === 'empresa'" class="form-group">
                    <label for="codigoOrdenVisible">Número de Orden Externo *</label>
                    <input
                        type="text"
                        id="codigoOrdenVisible"
                        v-model="formData.codigoOrdenVisible"
                        required
                        class="form-control"
                    />
                </div>

                <!-- Teléfono -->
                <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono"
                        v-model="formData.cliente.telefono"
                        class="form-control"
                    />
                </div>

                <!-- Domicilio -->
                <div class="form-group">
                    <label for="domicilio">Domicilio</label>
                    <input
                        type="text"
                        id="domicilio"
                        v-model="formData.cliente.domicilio"
                        class="form-control"
                    />
                </div>

                <!-- Fecha de Ingreso -->
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
                    <label for="marca">Marca *</label>
                    <input
                        type="text"
                        id="marca"
                        v-model="formData.equipo.marca"
                        required
                        class="form-control"
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
                    <label for="numeroSerie">Número de Serie *</label>
                    <input
                        type="text"
                        id="numeroSerie"
                        v-model="formData.equipo.numeroSerie"
                        required
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
import { clientesService, ordenesService, productosService } from '@/services/api'

const router = useRouter()

// Estado del formulario
const formData = reactive({
  cliente: {
    nombreApellido: '',
    dni: '',
    tipoCliente: 'particular', // 'particular' o 'empresa'
    nombreEmpresa: '', // Solo si es empresa
    telefono: '',
    domicilio: ''
  },
  fechaIngreso: new Date().toISOString().split('T')[0],
  observaciones: '',
  equipo: {
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    falla: '',
  },
  codigoOrdenVisible: '', // Solo para clientes empresa
  estado: 'Ingresado'
})

// Métodos
const buscarCliente = async () => {
  if (!formData.cliente.dni) {
    await Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Por favor, ingrese un DNI para buscar',
    })
    return
  }

  try {
    const response = await clientesService.buscarPorDNI(formData.cliente.dni)
    
    // Si encontramos el cliente, actualizamos todos los campos
    if (response.data) {
      formData.cliente.nombreApellido = response.data.nombre_apellido
      formData.cliente.telefono = response.data.telefono || ''
      formData.cliente.domicilio = response.data.domicilio || ''
      formData.cliente.tipoCliente = response.data.tipo_cliente || 'particular'
      if (response.data.tipo_cliente === 'empresa') {
        formData.cliente.nombreEmpresa = response.data.nombre_empresa || ''
      }

      await Swal.fire({
        icon: 'success',
        title: 'Cliente encontrado',
        text: 'Los datos del cliente han sido cargados',
      })
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Cliente no encontrado',
        text: '¿Desea registrar un nuevo cliente?',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'No, cancelar'
      })

      if (result.isConfirmed) {
        agregarCliente()
      }
    } else {
      console.error('Error al buscar cliente:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al buscar el cliente. Por favor, intente nuevamente.',
      })
    }
  }
}

const agregarCliente = () => {
  if (formData.cliente.dni) {
    localStorage.setItem('temp_dni', formData.cliente.dni)
  }
  router.push('/clientes')
}

const handleTipoClienteChange = () => {
  // Limpiar campos relacionados con empresa si se cambia a particular
  if (formData.cliente.tipoCliente === 'particular') {
    formData.cliente.nombreEmpresa = ''
    formData.codigoOrdenVisible = ''
  }
}

const validarFormulario = () => {
  // Validar campos específicos de empresa
  if (formData.cliente.tipoCliente === 'empresa') {
    if (!formData.cliente.nombreEmpresa) {
      throw new Error('Debe seleccionar una empresa')
    }
    if (!formData.codigoOrdenVisible) {
      throw new Error('Debe ingresar el número de orden externo')
    }
  }

  // Validar campos obligatorios del producto
  if (!formData.equipo.numeroSerie) {
    throw new Error('El número de serie del producto es obligatorio')
  }
}

const guardarOrden = async () => {
  try {
    // Validar el formulario
    validarFormulario()

    // Preparar y validar datos del producto
    const productoData = {
      numero_serie: String(formData.equipo.numeroSerie).trim(),
      tipo_producto: String(formData.equipo.tipo).trim(),
      marca: String(formData.equipo.marca || '').trim(),
      modelo: String(formData.equipo.modelo || '').trim()
    };

    // Validar datos del producto
    if (!productoData.numero_serie || !productoData.tipo_producto) {
      throw new Error('El número de serie y tipo de producto son obligatorios');
    }

    console.log('Datos del producto a crear:', productoData);

    // Preparar datos de la orden
    const ordenData = {
      cliente_dni: String(formData.cliente.dni),
      producto_numero_serie: productoData.numero_serie,
      fecha_ingreso: new Date().toISOString(),
      descripcion_falla: String(formData.equipo.falla || '').trim(),
      estado: 'Ingresado',
      codigo_orden_visible: formData.cliente.tipoCliente === 'empresa' 
        ? String(formData.codigoOrdenVisible).trim()
        : null // Para particulares se generará automáticamente en el backend
    };

    // Intentar crear el cliente (si ya existe, ignoramos el error 400)
    const nuevoCliente = {
      dni: formData.cliente.dni,
      nombre_apellido: formData.cliente.nombreApellido,
      telefono: formData.cliente.telefono || '',
      domicilio: formData.cliente.domicilio || '',
      tipo_cliente: formData.cliente.tipoCliente,
      nombre_empresa: formData.cliente.tipoCliente === 'empresa' ? formData.cliente.nombreEmpresa : null
    };

    try {
      await clientesService.create(nuevoCliente);
      console.log('Cliente creado exitosamente');
    } catch (error) {
      // Si el error es 400, significa que el cliente ya existe, lo cual está bien
      if (error.response && error.response.status !== 400) {
        throw error;
      }
      console.log('Cliente ya existe, continuando con la orden');
    }

    // Crear o actualizar el producto
    try {
      await productosService.create(productoData)
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Si el producto ya existe, lo actualizamos
        await productosService.update(productoData.numero_serie, productoData)
      } else {
        throw error
      }
    }

    // Crear la orden
    await ordenesService.create(ordenData)

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
      text: error.message || 'No se pudo guardar la orden de trabajo',
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
