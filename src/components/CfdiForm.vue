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
      <!-- Información sobre CORS -->
      <div v-if="showCorsInfo" class="cors-info">
        <div class="cors-header">
          <strong>🚫 Problema de CORS Detectado</strong>
          <button @click="showCorsInfo = false" class="close-btn">×</button>
        </div>
        <p>
          <strong>¿Qué es CORS?</strong> Es una política de seguridad del
          navegador que bloquea peticiones entre diferentes dominios.
        </p>

        <h4>💡 Soluciones:</h4>
        <div class="solution-list">
          <div class="solution-item development" v-if="isDevelopment">
            <span class="solution-badge">🔧 DESARROLLO</span>
            <div class="solution-content">
              <strong>Proxy automático activado</strong>
              <p>
                Las peticiones se redirigen automáticamente a través del proxy
                de Vite.
              </p>
              <p><strong>URL original:</strong> {{ apiConfig.url }}</p>
              <p>
                <strong>URL del proxy:</strong> {{ getApiUrl(apiConfig.url) }}
              </p>
            </div>
          </div>

          <div class="solution-item production">
            <span class="solution-badge">🌐 PRODUCCIÓN</span>
            <div class="solution-content">
              <strong>Configuración del servidor</strong>
              <p>El servidor debe incluir estos headers:</p>
              <code
                >Access-Control-Allow-Origin: *<br />
                Access-Control-Allow-Headers: Authorization, Content-Type<br />
                Access-Control-Allow-Methods: POST, OPTIONS</code
              >
            </div>
          </div>

          <div class="solution-item temporary">
            <span class="solution-badge">⚠️ TEMPORAL</span>
            <div class="solution-content">
              <strong>Extensión CORS</strong>
              <p>
                Solo para pruebas: Instala una extensión como "CORS Unblock" en
                tu navegador.
              </p>
              <p><em>¡No recomendado para producción!</em></p>
            </div>
          </div>
        </div>

        <div class="cors-actions">
          <button
            @click="retryRequest"
            class="btn btn-primary btn-sm"
            :disabled="isSubmitting"
          >
            🔄 Reintentar Petición
          </button>
          <button @click="testConnection" class="btn btn-info btn-sm">
            🧪 Probar Conexión
          </button>
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
            <input
              v-model="formData.Fecha"
              type="datetime-local"
              class="form-control"
              step="1"
            />
          </div>
          <div class="form-group">
            <label>SubTotal:</label>
            <input
              v-model.number="formData.SubTotal"
              type="number"
              step="0.0001"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>Descuento:</label>
            <input
              v-model.number="formData.Descuento"
              type="number"
              step="0.0001"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>Total:</label>
            <input
              v-model.number="formData.Total"
              type="number"
              step="0.0001"
              class="form-control"
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
            placeholder='{ "UUID": "8379e089-9ff4-45df-bdca-77108f1c61cd" }, { "UUID": "e57577ad-9fb9-456e-98f6-9d5ff651f0b0" } o simplemente: UUID1, UUID2, UUID3...'
          ></textarea>
          <small class="form-text text-muted">
            Acepta formato con objetos JSON o UUIDs simples separados por comas
          </small>
        </div>
      </div>

      <!-- Conceptos -->
      <div class="form-section">
        <h3>Conceptos</h3>
        <div
          v-for="(concepto, index) in formData.Conceptos"
          :key="index"
          class="concepto-item"
        >
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
          <div class="form-row">
            <div class="form-group">
              <label>Cantidad:</label>
              <input
                v-model.number="concepto.Cantidad"
                type="number"
                step="0.0001"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Valor Unitario:</label>
              <input
                v-model.number="concepto.ValorUnitario"
                type="number"
                step="0.01"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Importe:</label>
              <input
                v-model.number="concepto.Importe"
                type="number"
                step="0.0001"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Descuento:</label>
              <input
                v-model.number="concepto.Descuento"
                type="number"
                step="0.0001"
                class="form-control"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Base (IVA):</label>
              <input
                v-model.number="concepto.Impuestos.Traslados[0].Base"
                type="number"
                step="0.0001"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Importe IVA:</label>
              <input
                v-model.number="concepto.Impuestos.Traslados[0].Importe"
                type="number"
                step="0.0001"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <button @click="addConcepto" type="button" class="btn btn-primary">
          Agregar Concepto
        </button>
      </div>
      <!-- Resumen de Totales -->
      <TotalsSummary :form-data="formData" />
      <!-- Estado de Validación -->
      <ValidationStatus
        :form-data="formData"
        :api-config="apiConfig"
        :addenda-data="addendaData"
      /><!-- Addenda -->
      <div class="form-section">
        <h3>Addenda</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Ruta ID (separar por comas):</label>
            <textarea
              v-model="addendaData.rutaId"
              class="form-control"
              rows="3"
              placeholder="RUTA001, RUTA002, RUTA003..."
              @blur="updateAddenda"
            ></textarea>
            <small class="form-text"
              >Ingrese múltiples IDs de ruta separados por comas</small
            >
          </div>
          <div class="form-group">
            <label>Shipments (separar por comas):</label>
            <textarea
              v-model="addendaData.shipments"
              class="form-control"
              rows="3"
              placeholder="SHIP001, SHIP002, SHIP003..."
              @blur="updateAddenda"
            ></textarea>
            <small class="form-text"
              >Ingrese múltiples shipments separados por comas</small
            >
          </div>
        </div>

        <!-- Preview de valores múltiples -->
        <div
          v-if="
            addendaPreview.rutaCount > 0 || addendaPreview.shipmentsCount > 0
          "
          class="addenda-preview"
        >
          <h4>Vista Previa</h4>
          <div class="preview-row">
            <div v-if="addendaPreview.rutaCount > 0" class="preview-group">
              <strong>Rutas ({{ addendaPreview.rutaCount }}):</strong>
              <div class="preview-items">
                <span
                  v-for="ruta in addendaPreview.rutaIds"
                  :key="ruta"
                  class="preview-item"
                >
                  {{ ruta }}
                </span>
                <span v-if="addendaPreview.rutaCount > 3" class="preview-more">
                  +{{ addendaPreview.rutaCount - 3 }} más...
                </span>
              </div>
            </div>
            <div v-if="addendaPreview.shipmentsCount > 0" class="preview-group">
              <strong>Shipments ({{ addendaPreview.shipmentsCount }}):</strong>
              <div class="preview-items">
                <span
                  v-for="shipment in addendaPreview.shipments"
                  :key="shipment"
                  class="preview-item"
                >
                  {{ shipment }}
                </span>
                <span
                  v-if="addendaPreview.shipmentsCount > 3"
                  class="preview-more"
                >
                  +{{ addendaPreview.shipmentsCount - 3 }} más...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="button" @click="verifyTotals" class="btn btn-info">
          ✅ Verificar Totales
        </button>
        <button type="button" @click="clearForm" class="btn btn-secondary">
          🗑️ Limpiar Formulario
        </button>
        <button type="submit" :disabled="isSubmitting" class="btn btn-success">
          {{ isSubmitting ? "⏳ Enviando..." : "📤 Enviar CFDI" }}
        </button>
      </div>
      
      <!-- Resultado de verificación -->
      <div v-if="verificationResult" class="verification-result" :class="verificationResult.isValid ? 'valid' : 'invalid'">
        <h4>{{ verificationResult.isValid ? '✅ Verificación Exitosa' : '❌ Errores en la Verificación' }}</h4>
        <div v-if="!verificationResult.isValid && verificationResult.errors.length > 0">
          <ul>
            <li v-for="(error, index) in verificationResult.errors" :key="index">{{ error }}</li>
          </ul>
        </div>
        <div v-if="verificationResult.isValid" class="success-message">
          <p>Todos los valores ingresados son correctos y coinciden con los cálculos esperados.</p>
          <p><strong>Valores verificados:</strong></p>
          <ul>
            <li>SubTotal: {{ verificationResult.expectedValues.subtotal.toFixed(2) }}</li>
            <li>Total IVA: {{ verificationResult.expectedValues.totalIva.toFixed(2) }}</li>
            <li>Total: {{ verificationResult.expectedValues.total.toFixed(2) }}</li>
          </ul>
        </div>
      </div>
    </form>

    <!-- Área de mensajes -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { saveAs } from "file-saver";
import axios from "axios";
import { ExcelService } from "../services/ExcelService.js";
import { CfdiCalculator } from "../services/CfdiCalculator.js";
import { CFDI_UTILS } from "../config/constants.js";
import { useNotifications, useApiConfig } from "../composables/useCommon.js";
import TotalsSummary from "./TotalsSummary.vue";
import ValidationStatus from "./ValidationStatus.vue";

// Composables
const { message, messageType, showMessage } = useNotifications();
const { apiConfig, saveApiConfig } = useApiConfig();

// Watch para guardar configuración de API automáticamente
watch(
  () => [apiConfig.url, apiConfig.token],
  () => {
    saveApiConfig();
  },
  { deep: true }
);

// Datos del formulario
const formData = reactive({
  Complemento: null,
  Version: "4.0",
  Serie: "ML",
  Folio: "",
  Fecha: new Date().toISOString().slice(0, 19),
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
    RegimenFiscal: "601",
  },
  Receptor: {
    Rfc: "DCM991109KR2",
    Nombre: "DEREMATE.COM DE MEXICO",
    NumRegIdTrib: null,
    RegimenFiscalReceptor: "601",
    DomicilioFiscalReceptor: "11520",
    UsoCFDI: "G03",
  },
  CfdiRelacionados: [
    {
      TipoRelacion: "06",
      CfdiRelacionado: [],
    },
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
            TipoFactor: "Tasa",
          },
        ],
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
      Descuento: 0,
    },
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
        TipoFactor: "Tasa",
      },
    ],
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
            "Addenda:shipments": "",
          },
        },
      },
    ],
  },
});

// Variables de control
const isSubmitting = ref(false);
const showCorsInfo = ref(false);
const isDevelopment = import.meta.env.DEV;

// Función para procesar CFDI relacionados
const processCfdiRelacionados = (input) => {
  if (!input || input.trim() === "") return [];

  // Dividir por comas y procesar cada elemento
  const items = input.split(",").map((s) => s.trim()).filter(s => s.length > 0);

  // Convertir cada UUID a formato de objeto esperado por el API
  return items.map((item) => {
    // Si el item ya tiene el formato { "UUID": "valor" }, extraer solo el UUID
    const uuidMatch = item.match(/{\s*"UUID"\s*:\s*"([^"]+)"\s*}/);
    if (uuidMatch) {
      return { UUID: uuidMatch[1] };
    }
    // Si es solo un UUID, crear el objeto
    return { UUID: item };
  });
};

// Función para reintentar la petición
const retryRequest = () => {
  showCorsInfo.value = false;
  submitForm();
};

// Función para probar la conexión
const testConnection = async () => {
  if (!apiConfig.url) {
    showMessage("⚠️ Configura primero la URL del API", "warning");
    return;
  }

  try {
    showMessage("🔄 Probando conexión...", "info");
    const testUrl = getApiUrl(apiConfig.url);

    // Hacer una petición OPTIONS para probar CORS
    await axios.options(testUrl, {
      headers: {
        Authorization: `Bearer ${apiConfig.token}`,
        "Content-Type": "application/jsontoxml",
      },
      timeout: 10000,
    });

    showMessage("✅ Conexión exitosa", "success");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    if (error.message.includes("CORS") || error.code === "ERR_NETWORK") {
      showMessage("❌ Problema de CORS confirmado", "error");
    } else {
      showMessage(
        "⚠️ Error de conexión: " + (error.response?.status || error.message),
        "warning"
      );
    }
  }
};
const excelData = ref([]);
const cfdiRelacionadoInput = ref("");
const addendaData = reactive({
  rutaId: "",
  shipments: "",
});

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
          TipoFactor: "Tasa",
        },
      ],
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
    Descuento: 0,
  });
};

const removeConcepto = (index) => {
  formData.Conceptos.splice(index, 1);
  verificationResult.value = null; // Clear verification when removing concepto
};

// Estado de verificación
const verificationResult = ref(null);

// Verificar totales ingresados manualmente
const verifyTotals = () => {
  try {
    verificationResult.value = CfdiCalculator.verifyTotals(formData);
    
    if (verificationResult.value.isValid) {
      showMessage("✅ Todos los valores son correctos", "success");
    } else {
      showMessage("❌ Se encontraron errores en los valores ingresados", "error");
    }
  } catch (error) {
    showMessage("Error al verificar totales: " + error.message, "error");
    verificationResult.value = null;
  }
};

// Generar plantilla de Excel
const downloadTemplate = () => {
  try {
    ExcelService.generateTemplate();
    showMessage("Plantilla Excel descargada exitosamente", "success");
  } catch (error) {
    showMessage("Error al generar la plantilla Excel", "error");
  }
};

// Manejar carga de Excel
const handleExcelUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const jsonData = await ExcelService.readExcelFile(file);

    // Validar datos
    const validation = ExcelService.validateExcelData(jsonData);
    if (!validation.isValid) {
      showMessage(`Errores en Excel: ${validation.errors.join(", ")}`, "error");
      return;
    }

    excelData.value = jsonData;
    showMessage("Excel cargado correctamente", "success");
  } catch (error) {
    showMessage("Error al leer el archivo Excel: " + error.message, "error");
  }
};

// Llenar formulario desde Excel
const fillFormFromExcel = () => {
  if (excelData.value.length === 0) return;

  const data = excelData.value[0]; // Tomar primer registro

  formData.Folio = data.Folio || "";
  formData.Fecha = data.Fecha || "";
  formData.SubTotal = parseFloat(data.SubTotal) || 0;
  formData.Descuento = parseFloat(data.Descuento) || 0;
  formData.Total = parseFloat(data.Total) || 0;
  // CFDI Relacionados
  if (data.CfdiRelacionado) {
    cfdiRelacionadoInput.value = data.CfdiRelacionado;
    formData.CfdiRelacionados[0].CfdiRelacionado = processCfdiRelacionados(
      data.CfdiRelacionado
    );
  }

  // Conceptos
  if (formData.Conceptos.length > 0) {
    formData.Conceptos[0].Cantidad = parseFloat(data.Concepto1_Cantidad) || 0;
    formData.Conceptos[0].ValorUnitario =
      parseFloat(data.Concepto1_ValorUnitario) || 0;
    formData.Conceptos[0].Importe = parseFloat(data.Concepto1_Importe) || 0;
    formData.Conceptos[0].Descuento = parseFloat(data.Concepto1_Descuento) || 0;
    formData.Conceptos[0].Impuestos.Traslados[0].Base =
      parseFloat(data.Concepto1_Base) || 0;
    formData.Conceptos[0].Impuestos.Traslados[0].Importe =
      parseFloat(data.Concepto1_ImporteIVA) || 0;
  }
  // Addenda - manejar múltiples valores
  addendaData.rutaId = data.RutaId || "";
  addendaData.shipments = data.Shipments || "";

  updateAddenda();
  showMessage("Formulario llenado desde Excel", "success");
};

// Actualizar addenda
const updateAddenda = () => {
  // Procesar múltiples valores separados por coma
  const rutaIds = addendaData.rutaId
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const shipments = addendaData.shipments
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  formData.Addenda.any[0].Addenda["Addenda:Datos"]["Addenda:rutaId"] =
    rutaIds.join(", ");
  formData.Addenda.any[0].Addenda["Addenda:Datos"]["Addenda:shipments"] =
    shipments.join(", ");
};

// Validar addenda en tiempo real
const validateAddenda = () => {
  const rutaValidation = CfdiCalculator.validateMultipleValues(
    addendaData.rutaId,
    "Ruta ID"
  );
  const shipmentsValidation = CfdiCalculator.validateMultipleValues(
    addendaData.shipments,
    "Shipments"
  );

  if (!rutaValidation.isValid) {
    showMessage(
      `Errores en Ruta ID: ${rutaValidation.errors.join(", ")}`,
      "warning"
    );
  }

  if (!shipmentsValidation.isValid) {
    showMessage(
      `Errores en Shipments: ${shipmentsValidation.errors.join(", ")}`,
      "warning"
    );
  }

  return rutaValidation.isValid && shipmentsValidation.isValid;
};

// Preview de valores múltiples
const addendaPreview = computed(() => {
  const rutaIds = CfdiCalculator.parseMultipleValues(addendaData.rutaId);
  const shipments = CfdiCalculator.parseMultipleValues(addendaData.shipments);

  return {
    rutaCount: rutaIds.length,
    shipmentsCount: shipments.length,
    rutaIds: rutaIds.slice(0, 3), // Mostrar solo los primeros 3
    shipments: shipments.slice(0, 3), // Mostrar solo los primeros 3
  };
});

// Limpiar formulario
const clearForm = () => {
  if (
    confirm(
      "¿Estás seguro de que quieres limpiar todos los datos del formulario?"
    )
  ) {
    // Reiniciar datos del formulario manteniendo la estructura
    Object.assign(formData, {
      Folio: "",
      Fecha: new Date().toISOString().slice(0, 19),
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
                TipoFactor: "Tasa",
              },
            ],
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
          Descuento: 0,
        },
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
            TipoFactor: "Tasa",
          },
        ],
      },
      CfdiRelacionados: [
        {
          TipoRelacion: "06",
          CfdiRelacionado: [],
        },
      ],
    });
    // Limpiar otros campos
    cfdiRelacionadoInput.value = "";
    addendaData.rutaId = "";
    addendaData.shipments = "";
    excelData.value = [];

    // Actualizar addenda
    updateAddenda();

    showMessage("Formulario limpiado correctamente", "success");
  }
};

// Exportar XML
const exportXml = (xmlString) => {
  // Limpiar las diagonales invertidas
  const cleanedXml = xmlString.replace(/\\/g, "");

  const blob = new Blob([cleanedXml], { type: "application/xml" });
  const filename = `cfdi_${formData.Folio || Date.now()}.xml`;
  saveAs(blob, filename);
};

// Función para manejar CORS
const getApiUrl = (originalUrl) => {
  // Si estamos en desarrollo y la URL es externa, usar proxy
  if (import.meta.env.DEV && originalUrl.includes("services.sw.com.mx")) {
    const proxyUrl = originalUrl.replace(
      /https?:\/\/services\.sw\.com\.mx/,
      "/api"
    );
    console.log("🔄 Usando proxy:", originalUrl, "->", proxyUrl);
    return proxyUrl;
  }
  console.log("🌐 Usando URL directa:", originalUrl);
  return originalUrl;
};

// Enviar formulario
const submitForm = async () => {
  if (!apiConfig.url || !apiConfig.token) {
    showMessage(
      "Por favor configura la URL del API y el Bearer Token",
      "error"
    );
    return;
  }

  // Validar datos del CFDI
  const validation = CfdiCalculator.validateCfdiData(formData);
  if (!validation.isValid) {
    showMessage(
      `Errores en el formulario: ${validation.errors.join(", ")}`,
      "error"
    );
    return;
  }
  // Actualizar CFDI relacionados
  if (cfdiRelacionadoInput.value) {
    formData.CfdiRelacionados[0].CfdiRelacionado = processCfdiRelacionados(
      cfdiRelacionadoInput.value
    );
  }

  // Actualizar addenda
  updateAddenda();
  // Formatear fecha
  if (formData.Fecha) {
    formData.Fecha = CfdiCalculator.formatDateForCfdi(formData.Fecha);
  }
  // Formatear valores numéricos principales como strings con dos decimales
  formData.SubTotal = CFDI_UTILS.formatToString(formData.SubTotal, 2);
  formData.Descuento = CFDI_UTILS.formatToString(formData.Descuento, 2);
  formData.Total = CFDI_UTILS.formatToString(formData.Total, 2);

  // Formatear valores numéricos de conceptos como strings para el API
  formData.Conceptos.forEach((concepto) => {
    // ValorUnitario siempre con 2 decimales
    concepto.ValorUnitario = CFDI_UTILS.formatToString(concepto.ValorUnitario, 2);
    
    // Importe y Descuento con 4 decimales
    concepto.Importe = CFDI_UTILS.formatToString(concepto.Importe);
    concepto.Descuento = CFDI_UTILS.formatToString(concepto.Descuento);
    
    // Asegurar que los Impuestos tengan la estructura correcta
    if (concepto.Impuestos && concepto.Impuestos.Traslados && concepto.Impuestos.Traslados.length > 0) {
      concepto.Impuestos.Traslados[0].Base = CFDI_UTILS.formatToString(concepto.Impuestos.Traslados[0].Base);
      concepto.Impuestos.Traslados[0].Importe = CFDI_UTILS.formatToString(concepto.Impuestos.Traslados[0].Importe);
    }
  });

  // Formateo de Impuestos Trasladados
  if (formData.Impuestos) {
    formData.Impuestos.TotalImpuestosTrasladados = CFDI_UTILS.formatToString(formData.Impuestos.TotalImpuestosTrasladados, 2);
    
    if (formData.Impuestos.Traslados) {
      // Verificar si Traslados es un array o un objeto
      if (Array.isArray(formData.Impuestos.Traslados)) {
        formData.Impuestos.Traslados.forEach(traslado => {
          traslado.Base = CFDI_UTILS.formatToString(traslado.Base, 2);
          traslado.Importe = CFDI_UTILS.formatToString(traslado.Importe, 2);
        });
      } else {
        // Si es un objeto en lugar de un array
        formData.Impuestos.Traslados.Base = CFDI_UTILS.formatToString(formData.Impuestos.Traslados.Base, 2);
        formData.Impuestos.Traslados.Importe = CFDI_UTILS.formatToString(formData.Impuestos.Traslados.Importe, 2);
      }
    }
  }

  isSubmitting.value = true;
  try {    // Usar URL con proxy para resolver CORS en desarrollo
    const finalUrl = getApiUrl(apiConfig.url);
    console.log("🚀 Enviando petición a:", finalUrl);
    
    // Log detallado del JSON para debugging, mostrando tipos de datos y valores finales
    console.log("📝 Datos del formulario:", JSON.stringify(formData, null, 2));
    console.log("📊 Verificación de campos importantes:");
    console.log("- SubTotal:", formData.SubTotal, typeof formData.SubTotal);
    console.log("- Fecha:", formData.Fecha);
    console.log("- Total:", formData.Total, typeof formData.Total);
    console.log("- Impuestos:", formData.Impuestos.TotalImpuestosTrasladados);

    const response = await axios.post(finalUrl, formData, {
      headers: {
        Authorization: `Bearer ${apiConfig.token}`,
        "Content-Type": "application/jsontoxml",
      },
      timeout: 30000, // 30 segundos de timeout
    });

    console.log("✅ Respuesta exitosa:", response.status, response.data);

    if (response.status === 200) {
      showMessage("✅ CFDI enviado exitosamente", "success");

      // Exportar XML si existe en la respuesta
      if (response.data && response.data.data && response.data.data.cfdi) {
        exportXml(response.data.data.cfdi);
        showMessage("📄 XML exportado exitosamente", "success");
      } else {
        showMessage(
          "⚠️ Advertencia: No se encontró el XML en la respuesta",
          "warning"
        );
        console.warn("Estructura de respuesta:", response.data);
      }
    }
  } catch (error) {
    console.error("❌ Error al enviar CFDI:", error);

    // Detectar errores de CORS específicos
    if (
      error.message &&
      (error.message.includes("CORS") ||
        error.message.includes("blocked by CORS policy"))
    ) {
      showMessage(
        "❌ Error de CORS: El navegador bloqueó la petición. Revisa la configuración.",
        "error"
      );
      showCorsInfo.value = true;
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error")
    ) {
      showMessage(
        "❌ Error de red: Posible problema de CORS o conectividad.",
        "error"
      );
      showCorsInfo.value = true;
    } else if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Error en el servidor";
      
      // Para errores 400, verificar específicamente problemas con el formato del JSON
      if (status === 400) {
        console.error("Detalles del error 400:", error.response.data);
        showMessage(`❌ Error ${status}: El API rechazó los datos. Revise el formato de los campos numéricos y fechas.`, "error");
        
        // Intenta mostrar detalles más específicos si están disponibles
        if (error.response.data && typeof error.response.data === 'object') {
          console.log("Respuesta detallada del API:", JSON.stringify(error.response.data, null, 2));
        }
      } else {
        showMessage(`❌ Error ${status}: ${message}`, "error");
      }

      // Si es un error 400+ podría ser un problema del servidor con CORS preflight o formato de datos
      if (status >= 400 && status < 500) {
        console.warn(
          "⚠️ Error del cliente, posible problema de formato de datos, CORS o autenticación"
        );
      }
    } else if (error.request) {
      // Error de red, muy posiblemente CORS
      showMessage(
        "❌ Error de red: No se pudo conectar con el servidor (posible problema de CORS).",
        "error"
      );
      showCorsInfo.value = true;
      console.error("Error de request:", error.request);
    } else {
      showMessage("❌ Error: " + error.message, "error");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.cfdi-form {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.api-config-panel,
.excel-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid #007bff;
}

.cors-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.cors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.cors-header strong {
  color: #856404;
  font-size: 1.1em;
}

.solution-list {
  margin: 15px 0;
}

.solution-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 4px solid #007bff;
}

.solution-item.development {
  border-left-color: #28a745;
}

.solution-item.production {
  border-left-color: #17a2b8;
}

.solution-item.temporary {
  border-left-color: #ffc107;
}

.solution-badge {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  margin-bottom: 8px;
}

.solution-item.development .solution-badge {
  background: #28a745;
}

.solution-item.production .solution-badge {
  background: #17a2b8;
}

.solution-item.temporary .solution-badge {
  background: #ffc107;
  color: #333;
}

.solution-content p {
  margin: 5px 0;
  color: #333;
  font-size: 0.9em;
}

.solution-content code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  display: block;
  margin: 8px 0;
  font-size: 0.85em;
  line-height: 1.4;
}

.cors-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ffeaa7;
}

.cors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #856404;
  padding: 0;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ffeaa7;
}

.cors-info p {
  margin: 0 0 10px 0;
  color: #856404;
}

.cors-info ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.cors-info li {
  margin-bottom: 5px;
}

.config-row,
.form-row {
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
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-text {
  font-size: 0.875em;
  color: #6c757d;
  margin-top: 0.25rem;
  font-style: italic;
}

.addenda-preview {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.addenda-preview h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 1rem;
}

.preview-row {
  display: grid;
  gap: 15px;
}

.preview-group {
  margin-bottom: 10px;
}

.preview-group strong {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.preview-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.preview-item {
  background: #2196f3;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
}

.preview-more {
  background: #ff9800;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
  font-style: italic;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #b8daff;
}

/* Estilos para resultado de verificación */
.verification-result {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.verification-result.valid {
  background: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
}

.verification-result.invalid {
  background: #f8d7da;
  border: 2px solid #dc3545;
  color: #721c24;
}

.verification-result h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.verification-result ul {
  margin: 10px 0;
  padding-left: 20px;
}

.verification-result li {
  margin: 5px 0;
}

.verification-result .success-message {
  margin-top: 10px;
}

.verification-result .success-message p {
  margin: 10px 0;
}

@media (max-width: 768px) {
  .config-row,
  .form-row {
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
