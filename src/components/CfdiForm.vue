<template>
  <div class="cfdi-form">
    <!-- Panel de configuración de API -->
    <div class="api-config-panel">
      <h3>Configuración de API</h3>
      <div class="config-row">
        <div class="form-group">
          <label for="apiUrl">URL del API:</label>
          <input
            id="apiUrl"
            v-model="apiConfig.url"
            type="url"
            placeholder="https://api.ejemplo.com/cfdi"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="bearerToken">Bearer Token:</label>
          <input
            id="bearerToken"
            v-model="apiConfig.token"
            type="password"
            placeholder="Tu Bearer Token"
            class="form-control"
          />
        </div>
      </div>
    </div>

    <!-- Panel de carga de Excel -->
    <div class="excel-panel">
      <h3>Cargar datos desde Excel</h3>
      <div class="excel-actions">
        <button @click="downloadTemplate" class="btn btn-secondary">
          📥 Descargar Plantilla Excel
        </button>
        <input
          ref="excelInput"
          type="file"
          accept=".xlsx,.xls"
          @change="handleExcelUpload"
          style="display: none"
        />
        <button @click="$refs.excelInput.click()" class="btn btn-primary">
          📤 Cargar Excel
        </button>
      </div>
      <div v-if="excelData.length > 0" class="excel-preview">
        <p>{{ excelData.length }} registros cargados</p>
        <button @click="fillFormFromExcel" class="btn btn-success">
          Llenar formulario con datos de Excel
        </button>
      </div>
    </div>

    <!-- Formulario CFDI -->
    <form @submit.prevent="submitForm" class="cfdi-form-container">
      <div class="form-section">
        <h3>Información General del Comprobante</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Folio:</label>
            <input v-model="formData.Folio" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label>Fecha:</label>
            <input v-model="formData.Fecha" type="datetime-local" class="form-control" />
          </div>          <div class="form-group">
            <label>SubTotal:</label>
            <input 
              v-model.number="formData.SubTotal" 
              type="number" 
              step="0.01" 
              class="form-control"
              readonly
              style="background-color: #f8f9fa;"
            />
          </div>
          <div class="form-group">
            <label>Descuento:</label>
            <input v-model.number="formData.Descuento" type="number" step="0.01" class="form-control" />
          </div>
          <div class="form-group">
            <label>Total:</label>
            <input 
              v-model.number="formData.Total" 
              type="number" 
              step="0.01" 
              class="form-control"
              readonly
              style="background-color: #f8f9fa;"
            />
          </div>
        </div>
      </div>

      <!-- CFDI Relacionados -->
      <div class="form-section">
        <h3>CFDI Relacionados</h3>
        <div class="form-group">
          <label>CFDI Relacionado (separar por comas si son varios):</label>
          <textarea 
            v-model="cfdiRelacionadoInput"
            class="form-control"
            rows="3"
            placeholder="UUID1, UUID2, UUID3..."
          ></textarea>
        </div>
      </div>

      <!-- Conceptos -->
      <div class="form-section">
        <h3>Conceptos</h3>
        <div v-for="(concepto, index) in formData.Conceptos" :key="index" class="concepto-item">
          <div class="concepto-header">
            <h4>Concepto {{ index + 1 }}</h4>
            <button
              v-if="formData.Conceptos.length > 1"
              @click="removeConcepto(index)"
              type="button"
              class="btn btn-danger btn-sm"
            >
              Eliminar
            </button>
          </div>
          <div class="form-row">            <div class="form-group">
              <label>Cantidad:</label>
              <input 
                v-model.number="concepto.Cantidad" 
                type="number" 
                step="0.01" 
                class="form-control"
                @input="calculateTotals"
              />
            </div>
            <div class="form-group">
              <label>Valor Unitario:</label>
              <input 
                v-model.number="concepto.ValorUnitario" 
                type="number" 
                step="0.01" 
                class="form-control"
                @input="calculateTotals"
              />
            </div>
            <div class="form-group">
              <label>Importe:</label>
              <input 
                v-model.number="concepto.Importe" 
                type="number" 
                step="0.01" 
                class="form-control"
                readonly
                style="background-color: #f8f9fa;"
              />
            </div>
            <div class="form-group">
              <label>Descuento:</label>
              <input 
                v-model.number="concepto.Descuento" 
                type="number" 
                step="0.01" 
                class="form-control"
                @input="calculateTotals"
              />
            </div>
          </div>
          <div class="form-row">            <div class="form-group">
              <label>Base (IVA):</label>
              <input 
                v-model.number="concepto.Impuestos.Traslados[0].Base" 
                type="number" 
                step="0.01" 
                class="form-control"
                readonly
                style="background-color: #f8f9fa;"
              />
            </div>
            <div class="form-group">
              <label>Importe IVA:</label>
              <input 
                v-model.number="concepto.Impuestos.Traslados[0].Importe" 
                type="number" 
                step="0.01" 
                class="form-control"
                readonly
                style="background-color: #f8f9fa;"
              />
            </div>
          </div>
        </div>        <button @click="addConcepto" type="button" class="btn btn-primary">
          Agregar Concepto
        </button>
      </div>      <!-- Resumen de Totales -->
      <TotalsSummary :form-data="formData" />

      <!-- Estado de Validación -->
      <ValidationStatus :form-data="formData" :api-config="apiConfig" />

      <!-- Addenda -->
      <div class="form-section">
        <h3>Addenda</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Ruta ID:</label>
            <input v-model="addendaData.rutaId" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label>Shipments:</label>
            <input v-model="addendaData.shipments" type="text" class="form-control" />
          </div>
        </div>
      </div>      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="button" @click="calculateTotals" class="btn btn-info">
          🧮 Calcular Totales
        </button>
        <button type="button" @click="clearForm" class="btn btn-secondary">
          🗑️ Limpiar Formulario
        </button>
        <button type="submit" :disabled="isSubmitting" class="btn btn-success">
          {{ isSubmitting ? '⏳ Enviando...' : '📤 Enviar CFDI' }}
        </button>
      </div>
    </form>

    <!-- Área de mensajes -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { saveAs } from 'file-saver'
import axios from 'axios'
import { ExcelService } from '../services/ExcelService.js'
import { CfdiCalculator } from '../services/CfdiCalculator.js'
import { useNotifications, useApiConfig } from '../composables/useCommon.js'
import TotalsSummary from './TotalsSummary.vue'
import ValidationStatus from './ValidationStatus.vue'

// Composables
const { message, messageType, showMessage } = useNotifications()
const { apiConfig, saveApiConfig } = useApiConfig()

// Watch para guardar configuración de API automáticamente
watch(() => [apiConfig.url, apiConfig.token], () => {
  saveApiConfig()
}, { deep: true })

// Datos del formulario
const formData = reactive({
  Complemento: null,
  Version: "4.0",
  Serie: "ML",
  Folio: "",
  Fecha: "",
  Sello: "",
  FormaPago: "99",
  Certificado: null,
  CondicionesDePago: null,
  SubTotal: 0,
  Descuento: 0,
  Moneda: "MXN",
  TipoDeComprobante: "I",
  Total: 0,
  MetodoPago: "PPD",
  Exportacion: "01",
  LugarExpedicion: "07020",
  Emisor: {
    Rfc: "SSB160405MA7",
    Nombre: "SERVICIOS AL SUPER BETA",
    RegimenFiscal: "601"
  },
  Receptor: {
    Rfc: "DCM991109KR2",
    Nombre: "DEREMATE.COM DE MEXICO",
    NumRegIdTrib: null,
    RegimenFiscalReceptor: "601",
    DomicilioFiscalReceptor: "11520",
    UsoCFDI: "G03"
  },
  CfdiRelacionados: [
    {
      TipoRelacion: "06",
      CfdiRelacionado: []
    }
  ],
  Conceptos: [
    {
      Impuestos: {
        Traslados: [
          {
            Base: 0,
            Importe: 0,
            Impuesto: "002",
            TasaOCuota: "0.160000",
            TipoFactor: "Tasa"
          }
        ]
      },
      InformacionAduanera: null,
      CuentaPredial: null,
      ComplementoConcepto: null,
      Parte: null,
      ObjetoImp: "02",
      ClaveProdServ: "78102200",
      Cantidad: 0,
      ClaveUnidad: "E48",
      Unidad: "No aplica",
      Descripcion: "Servicio de última Milla",
      ValorUnitario: 0,
      Importe: 0,
      Descuento: 0
    }
  ],
  Impuestos: {
    TotalImpuestosTrasladados: 0,
    ObjetoImp: "02",
    Traslados: [
      {
        Base: 0,
        Importe: 0,
        Impuesto: "002",
        TasaOCuota: "0.160000",
        TipoFactor: "Tasa"
      }
    ]
  },
  AddendaSpecified: true,
  Addenda: {
    any: [
      {
        Addenda: {
          "@xmlns:Addenda": "http://www.Addenda/",
          "@xsi:schemaLocation": "http://www.addenda.xsd",
          "@version": "1.0",
          "Addenda:Datos": {
            "Addenda:rutaId": "",
            "Addenda:shipments": ""
          }
        }
      }
    ]
  }
})

// Variables de control
const isSubmitting = ref(false)
const excelData = ref([])
const cfdiRelacionadoInput = ref('')
const addendaData = reactive({
  rutaId: '',
  shipments: ''
})

// Métodos para manejar conceptos
const addConcepto = () => {
  formData.Conceptos.push({
    Impuestos: {
      Traslados: [
        {
          Base: 0,
          Importe: 0,
          Impuesto: "002",
          TasaOCuota: "0.160000",
          TipoFactor: "Tasa"
        }
      ]
    },
    InformacionAduanera: null,
    CuentaPredial: null,
    ComplementoConcepto: null,
    Parte: null,
    ObjetoImp: "02",
    ClaveProdServ: "78102200",
    Cantidad: 0,
    ClaveUnidad: "E48",
    Unidad: "No aplica",
    Descripcion: "Servicio de última Milla",
    ValorUnitario: 0,
    Importe: 0,
    Descuento: 0
  })
}

const removeConcepto = (index) => {
  formData.Conceptos.splice(index, 1)
  calculateTotals()
}

// Calcular totales
const calculateTotals = () => {
  try {
    // Calcular totales para cada concepto
    formData.Conceptos.forEach(concepto => {
      CfdiCalculator.calculateConceptoTotals(concepto)
    })
    
    // Calcular totales globales
    CfdiCalculator.calculateGlobalTotals(formData)
    
    showMessage('Totales calculados correctamente', 'success')
  } catch (error) {
    showMessage('Error al calcular totales: ' + error.message, 'error')
  }
}

// Generar plantilla de Excel
const downloadTemplate = () => {
  try {
    ExcelService.generateTemplate()
    showMessage('Plantilla Excel descargada exitosamente', 'success')
  } catch (error) {
    showMessage('Error al generar la plantilla Excel', 'error')
  }
}

// Manejar carga de Excel
const handleExcelUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const jsonData = await ExcelService.readExcelFile(file)
    
    // Validar datos
    const validation = ExcelService.validateExcelData(jsonData)
    if (!validation.isValid) {
      showMessage(`Errores en Excel: ${validation.errors.join(', ')}`, 'error')
      return
    }
    
    excelData.value = jsonData
    showMessage('Excel cargado correctamente', 'success')
  } catch (error) {
    showMessage('Error al leer el archivo Excel: ' + error.message, 'error')
  }
}

// Llenar formulario desde Excel
const fillFormFromExcel = () => {
  if (excelData.value.length === 0) return
  
  const data = excelData.value[0] // Tomar primer registro
  
  formData.Folio = data.Folio || ''
  formData.Fecha = data.Fecha || ''
  formData.SubTotal = parseFloat(data.SubTotal) || 0
  formData.Descuento = parseFloat(data.Descuento) || 0
  formData.Total = parseFloat(data.Total) || 0
  
  // CFDI Relacionados
  if (data.CfdiRelacionado) {
    cfdiRelacionadoInput.value = data.CfdiRelacionado
    formData.CfdiRelacionados[0].CfdiRelacionado = data.CfdiRelacionado.split(',').map(s => s.trim())
  }
  
  // Conceptos
  if (formData.Conceptos.length > 0) {
    formData.Conceptos[0].Cantidad = parseFloat(data.Concepto1_Cantidad) || 0
    formData.Conceptos[0].ValorUnitario = parseFloat(data.Concepto1_ValorUnitario) || 0
    formData.Conceptos[0].Importe = parseFloat(data.Concepto1_Importe) || 0
    formData.Conceptos[0].Descuento = parseFloat(data.Concepto1_Descuento) || 0
    formData.Conceptos[0].Impuestos.Traslados[0].Base = parseFloat(data.Concepto1_Base) || 0
    formData.Conceptos[0].Impuestos.Traslados[0].Importe = parseFloat(data.Concepto1_ImporteIVA) || 0
  }
  
  // Addenda
  addendaData.rutaId = data.RutaId || ''
  addendaData.shipments = data.Shipments || ''
  
  updateAddenda()
  showMessage('Formulario llenado desde Excel', 'success')
}

// Actualizar addenda
const updateAddenda = () => {
  formData.Addenda.any[0].Addenda["Addenda:Datos"]["Addenda:rutaId"] = addendaData.rutaId
  formData.Addenda.any[0].Addenda["Addenda:Datos"]["Addenda:shipments"] = addendaData.shipments
}

// Limpiar formulario
const clearForm = () => {
  if (confirm('¿Estás seguro de que quieres limpiar todos los datos del formulario?')) {
    // Reiniciar datos del formulario manteniendo la estructura
    Object.assign(formData, {
      Folio: "",
      Fecha: "",
      SubTotal: 0,
      Descuento: 0,
      Total: 0,
      Conceptos: [
        {
          Impuestos: {
            Traslados: [
              {
                Base: 0,
                Importe: 0,
                Impuesto: "002",
                TasaOCuota: "0.160000",
                TipoFactor: "Tasa"
              }
            ]
          },
          InformacionAduanera: null,
          CuentaPredial: null,
          ComplementoConcepto: null,
          Parte: null,
          ObjetoImp: "02",
          ClaveProdServ: "78102200",
          Cantidad: 0,
          ClaveUnidad: "E48",
          Unidad: "No aplica",
          Descripcion: "Servicio de última Milla",
          ValorUnitario: 0,
          Importe: 0,
          Descuento: 0
        }
      ],
      Impuestos: {
        TotalImpuestosTrasladados: 0,
        ObjetoImp: "02",
        Traslados: [
          {
            Base: 0,
            Importe: 0,
            Impuesto: "002",
            TasaOCuota: "0.160000",
            TipoFactor: "Tasa"
          }
        ]
      },
      CfdiRelacionados: [
        {
          TipoRelacion: "06",
          CfdiRelacionado: []
        }
      ]
    })
    
    // Limpiar otros campos
    cfdiRelacionadoInput.value = ''
    addendaData.rutaId = ''
    addendaData.shipments = ''
    excelData.value = []
    
    // Actualizar addenda
    updateAddenda()
    
    showMessage('Formulario limpiado correctamente', 'success')
  }
}

// Exportar XML
const exportXml = (xmlString) => {
  // Limpiar las diagonales invertidas
  const cleanedXml = xmlString.replace(/\\/g, '')
  
  const blob = new Blob([cleanedXml], { type: 'application/xml' })
  const filename = `cfdi_${formData.Folio || Date.now()}.xml`
  saveAs(blob, filename)
}

// Enviar formulario
const submitForm = async () => {
  if (!apiConfig.url || !apiConfig.token) {
    showMessage('Por favor configura la URL del API y el Bearer Token', 'error')
    return
  }
  
  // Validar datos del CFDI
  const validation = CfdiCalculator.validateCfdiData(formData)
  if (!validation.isValid) {
    showMessage(`Errores en el formulario: ${validation.errors.join(', ')}`, 'error')
    return
  }
  
  // Actualizar CFDI relacionados
  if (cfdiRelacionadoInput.value) {
    formData.CfdiRelacionados[0].CfdiRelacionado = cfdiRelacionadoInput.value.split(',').map(s => s.trim())
  }
  
  // Actualizar addenda
  updateAddenda()
  
  // Formatear fecha
  if (formData.Fecha) {
    formData.Fecha = CfdiCalculator.formatDateForCfdi(formData.Fecha)
  }
  
  isSubmitting.value = true
  
  try {
    const response = await axios.post(apiConfig.url, formData, {
      headers: {
        'Authorization': `Bearer ${apiConfig.token}`,
        'Content-Type': 'application/jsontoxml'
      },
      timeout: 30000 // 30 segundos de timeout
    })
    
    if (response.status === 200) {
      showMessage('CFDI enviado exitosamente', 'success')
      
      // Exportar XML si existe en la respuesta
      if (response.data && response.data.data && response.data.data.cfdi) {
        exportXml(response.data.data.cfdi)
        showMessage('XML exportado exitosamente', 'success')
      } else {
        showMessage('Advertencia: No se encontró el XML en la respuesta', 'warning')
      }
    }
  } catch (error) {
    console.error('Error al enviar CFDI:', error)
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'Error en el servidor'
      showMessage(`Error ${status}: ${message}`, 'error')
    } else if (error.request) {
      showMessage('Error de red: No se pudo conectar con el servidor. Verifica la URL del API.', 'error')
    } else {
      showMessage('Error: ' + error.message, 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.cfdi-form {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.api-config-panel, .excel-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid #007bff;
}

.config-row, .form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.form-control {
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.form-section h3 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.concepto-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #28a745;
}

.concepto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.excel-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.excel-preview {
  background: #d4edda;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.message {
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  font-weight: 600;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

@media (max-width: 768px) {
  .config-row, .form-row {
    grid-template-columns: 1fr;
  }
  
  .excel-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
