<template>
  <div class="totals-summary">
    <h4>Resumen de Totales</h4>
    <div class="totals-grid">
      <div class="total-item">
        <span class="total-label">Subtotal:</span>
        <span class="total-value">{{ formatCurrency(totals.subtotal) }}</span>
      </div>
      <div class="total-item">
        <span class="total-label">Descuento:</span>
        <span class="total-value discount">{{ formatCurrency(totals.descuento) }}</span>
      </div>
      <div class="total-item">
        <span class="total-label">IVA (16%):</span>
        <span class="total-value tax">{{ formatCurrency(totals.iva) }}</span>
      </div>
      <div class="total-item total-final">
        <span class="total-label">Total:</span>
        <span class="total-value">{{ formatCurrency(totals.total) }}</span>
      </div>
    </div>
    <div class="concepts-count">
      <small>{{ conceptsCount }} concepto{{ conceptsCount !== 1 ? 's' : '' }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CfdiCalculator } from '../services/CfdiCalculator.js'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const totals = computed(() => ({
  subtotal: props.formData.SubTotal || 0,
  descuento: props.formData.Descuento || 0,
  iva: props.formData.Impuestos?.TotalImpuestosTrasladados || 0,
  total: props.formData.Total || 0
}))

const conceptsCount = computed(() => props.formData.Conceptos?.length || 0)

const formatCurrency = (amount) => {
  return CfdiCalculator.formatCurrency(amount)
}
</script>

<style scoped>
.totals-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  border: 2px solid #dee2e6;
}

.totals-summary h4 {
  margin: 0 0 15px 0;
  color: #495057;
  text-align: center;
}

.totals-grid {
  display: grid;
  gap: 10px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.total-final {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  font-weight: bold;
  font-size: 1.1em;
  border: 2px solid #1e7e34;
}

.total-label {
  font-weight: 600;
}

.total-value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.total-value.discount {
  color: #dc3545;
}

.total-value.tax {
  color: #fd7e14;
}

.concepts-count {
  text-align: center;
  margin-top: 10px;
  color: #6c757d;
}

.concepts-count small {
  font-style: italic;
}
</style>
