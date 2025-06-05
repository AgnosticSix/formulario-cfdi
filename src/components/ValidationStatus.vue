<template>
  <div class="validation-status">
    <h4>Estado de Validación</h4>
    <div class="validation-items">
      <div class="validation-item" :class="{ 'valid': validations.basicInfo, 'invalid': !validations.basicInfo }">
        <span class="icon">{{ validations.basicInfo ? '✅' : '❌' }}</span>
        <span class="text">Información básica</span>
        <span class="detail">{{ getBasicInfoDetail() }}</span>
      </div>
      <div class="validation-item" :class="{ 'valid': validations.concepts, 'invalid': !validations.concepts }">
        <span class="icon">{{ validations.concepts ? '✅' : '❌' }}</span>
        <span class="text">Conceptos válidos</span>
        <span class="detail">{{ getConceptsDetail() }}</span>
      </div>
      <div class="validation-item" :class="{ 'valid': validations.totals, 'invalid': !validations.totals }">
        <span class="icon">{{ validations.totals ? '✅' : '❌' }}</span>
        <span class="text">Totales calculados</span>
        <span class="detail">{{ getTotalsDetail() }}</span>
      </div>
      <div class="validation-item" :class="{ 'valid': validations.apiConfig, 'invalid': !validations.apiConfig }">
        <span class="icon">{{ validations.apiConfig ? '✅' : '❌' }}</span>
        <span class="text">Configuración API</span>
        <span class="detail">{{ getApiConfigDetail() }}</span>
      </div>
    </div>
    <div class="overall-status" :class="{ 'ready': isFormReady, 'not-ready': !isFormReady }">
      <strong>{{ isFormReady ? '✅ Listo para enviar' : '⚠️ Completar validaciones' }}</strong>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  apiConfig: {
    type: Object,
    required: true
  }
})

const validations = computed(() => {
  const basicInfo = !!(props.formData.Folio && props.formData.Fecha)
  
  const concepts = props.formData.Conceptos && 
    props.formData.Conceptos.length > 0 && 
    props.formData.Conceptos.every(c => c.Cantidad > 0 && c.ValorUnitario > 0)
  
  const totals = props.formData.SubTotal > 0 && props.formData.Total > 0
  
  const apiConfig = !!(props.apiConfig.url && props.apiConfig.token)
  
  return {
    basicInfo,
    concepts,
    totals,
    apiConfig
  }
})

const isFormReady = computed(() => {
  return Object.values(validations.value).every(v => v)
})

// Funciones para obtener detalles de validación
const getBasicInfoDetail = () => {
  const missing = []
  if (!props.formData.Folio) missing.push('Folio')
  if (!props.formData.Fecha) missing.push('Fecha')
  
  if (missing.length === 0) return 'Completo'
  return `Falta: ${missing.join(', ')}`
}

const getConceptsDetail = () => {
  if (!props.formData.Conceptos || props.formData.Conceptos.length === 0) {
    return 'Sin conceptos'
  }
  
  const invalid = props.formData.Conceptos.filter(c => c.Cantidad <= 0 || c.ValorUnitario <= 0).length
  if (invalid > 0) {
    return `${invalid} concepto(s) inválido(s)`
  }
  
  return `${props.formData.Conceptos.length} concepto(s) válido(s)`
}

const getTotalsDetail = () => {
  if (props.formData.SubTotal <= 0) return 'Subtotal inválido'
  if (props.formData.Total <= 0) return 'Total inválido'
  return 'Totales correctos'
}

const getApiConfigDetail = () => {
  const missing = []
  if (!props.apiConfig.url) missing.push('URL')
  if (!props.apiConfig.token) missing.push('Token')
  
  if (missing.length === 0) return 'Configurado'
  return `Falta: ${missing.join(', ')}`
}
</script>

<style scoped>
.validation-status {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  border: 2px solid #dee2e6;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.validation-status h4 {
  margin: 0 0 15px 0;
  color: #495057;
  text-align: center;
}

.validation-items {
  display: grid;
  gap: 10px;
  margin-bottom: 15px;
}

.validation-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.validation-item.valid {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.validation-item.invalid {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.validation-item .icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.validation-item .text {
  font-weight: 500;
  flex: 1;
}

.validation-item .detail {
  font-size: 0.9em;
  opacity: 0.8;
  margin-left: 10px;
  font-style: italic;
}

.overall-status {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1em;
}

.overall-status.ready {
  background: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.overall-status.not-ready {
  background: #fff3cd;
  color: #856404;
  border: 2px solid #ffeaa7;
}
</style>
