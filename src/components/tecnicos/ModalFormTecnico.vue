<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editar Técnico' : 'Nuevo Técnico' }}</h2>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-tecnico">
        <div class="form-group">
          <label for="dni">DNI</label>
          <input
            type="number"
            id="dni"
            v-model="formData.dni"
            :disabled="isEditing"
            required
            placeholder="Ingrese el DNI"
          >
        </div>

        <div class="form-group">
          <label for="nombre_apellido">Nombre y Apellido</label>
          <input
            type="text"
            id="nombre_apellido"
            v-model="formData.nombre_apellido"
            required
            placeholder="Ingrese nombre y apellido"
          >
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            v-model="formData.telefono"
            placeholder="Ingrese el teléfono"
          >
        </div>

        <div class="form-group">
          <label for="direccion">Dirección</label>
          <input
            type="text"
            id="direccion"
            v-model="formData.direccion"
            placeholder="Ingrese la dirección"
          >
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="!loading">{{ isEditing ? 'Guardar Cambios' : 'Crear Técnico' }}</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { tecnicosService } from '../../services/api'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  tecnicoData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const formData = ref({
  dni: '',
  nombre_apellido: '',
  telefono: '',
  direccion: ''
})

const isEditing = computed(() => !!props.tecnicoData?.dni)

watch(() => props.tecnicoData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  }
}, { deep: true })

watch(() => props.isVisible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    dni: '',
    nombre_apellido: '',
    telefono: '',
    direccion: ''
  }
}

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value) {
      await tecnicosService.update(formData.value.dni, formData.value)
      emit('success', 'Técnico actualizado exitosamente')
    } else {
      await tecnicosService.create(formData.value)
      emit('success', 'Técnico creado exitosamente')
    }
    closeModal()
  } catch (error) {
    console.error('Error:', error)
    alert(error.response?.data?.message || 'Error al procesar la operación')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>