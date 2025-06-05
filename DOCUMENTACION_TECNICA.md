# Documentación Técnica - Generador de CFDI

## Arquitectura del Proyecto

### Estructura de Archivos

```
src/
├── components/
│   ├── CfdiForm.vue          # Componente principal del formulario
│   ├── TotalsSummary.vue     # Resumen visual de totales
│   └── ValidationStatus.vue  # Estado de validación en tiempo real
├── services/
│   ├── ExcelService.js       # Servicios para manejo de Excel
│   └── CfdiCalculator.js     # Cálculos y validaciones CFDI
├── composables/
│   └── useCommon.js          # Funciones reutilizables
├── config/
│   └── constants.js          # Constantes y configuraciones
├── App.vue                   # Aplicación principal
├── main.js                   # Punto de entrada
└── style.css                # Estilos globales
```

## Componentes

### CfdiForm.vue
**Propósito:** Componente principal que contiene todo el formulario CFDI.

**Características:**
- Formulario reactivo con Vue 3 Composition API
- Cálculo automático de totales e impuestos
- Carga y descarga de archivos Excel
- Integración con API externa
- Exportación de XML
- Validación en tiempo real

**Estado principal:**
```javascript
const formData = reactive({
  // Estructura completa del CFDI v4.0
  Version: "4.0",
  Serie: "ML",
  Folio: "",
  Fecha: "",
  // ... más campos
})
```

### TotalsSummary.vue
**Propósito:** Muestra un resumen visual de los totales calculados.

**Props:**
- `formData`: Datos del formulario CFDI

**Características:**
- Diseño tipo tarjeta con gradientes
- Formato de moneda automático
- Contador de conceptos

### ValidationStatus.vue
**Propósito:** Valida el formulario en tiempo real y muestra el estado.

**Props:**
- `formData`: Datos del formulario
- `apiConfig`: Configuración de la API

**Validaciones:**
- Información básica (Folio, Fecha)
- Conceptos válidos
- Totales calculados
- Configuración de API

## Servicios

### ExcelService.js
**Funciones principales:**
- `generateTemplate()`: Genera plantilla Excel
- `readExcelFile(file)`: Lee archivos Excel
- `validateExcelData(data)`: Valida datos de Excel

**Dependencias:**
- `xlsx`: Procesamiento de archivos Excel
- `file-saver`: Descarga de archivos

### CfdiCalculator.js
**Funciones principales:**
- `calculateConceptoTotals(concepto)`: Calcula totales por concepto
- `calculateGlobalTotals(formData)`: Calcula totales globales
- `validateCfdiData(formData)`: Valida estructura CFDI
- `formatDateForCfdi(date)`: Formatea fechas
- `formatCurrency(amount)`: Formatea monedas

## Composables

### useCommon.js
**useNotifications():**
```javascript
const { message, messageType, showMessage, clearMessage } = useNotifications()
```

**useApiConfig():**
```javascript
const { apiConfig, saveApiConfig, clearApiConfig } = useApiConfig()
```

## Configuración

### constants.js
Contiene todas las constantes de configuración CFDI:
- Versión y metadatos
- Datos del emisor y receptor
- Configuración de impuestos
- Tipos de relación
- Configuración de addenda

## Flujo de Datos

### 1. Carga Inicial
1. Se inicializa el formulario con estructura CFDI vacía
2. Se carga configuración API desde localStorage
3. Se muestran componentes de validación y totales

### 2. Carga desde Excel
1. Usuario descarga plantilla Excel
2. Usuario llena la plantilla
3. Usuario carga el archivo Excel
4. Sistema valida los datos
5. Sistema llena el formulario automáticamente

### 3. Cálculo de Totales
1. Usuario modifica cantidad o valor unitario
2. Sistema calcula importe del concepto
3. Sistema calcula base e IVA del concepto
4. Sistema recalcula totales globales
5. Sistema actualiza el resumen visual

### 4. Envío a API
1. Sistema valida formulario completo
2. Sistema actualiza CFDI relacionados y addenda
3. Sistema formatea fecha para CFDI
4. Sistema envía POST a API con Bearer token
5. Sistema procesa respuesta y descarga XML

## Validaciones

### Validaciones de Formulario
- **Folio:** Requerido, no vacío
- **Fecha:** Requerida, formato válido
- **Conceptos:** Al menos uno, cantidad y valor > 0
- **Totales:** SubTotal y Total > 0

### Validaciones de Excel
- **Campos requeridos:** Folio, Fecha, SubTotal, Total
- **Tipos de datos:** Números válidos para campos numéricos
- **Estructura:** Archivo no vacío

### Validaciones de API
- **URL:** Formato de URL válido
- **Token:** No vacío
- **Conectividad:** Timeout de 30 segundos

## Manejo de Errores

### Tipos de Error
1. **Errores de validación:** Mostrados en ValidationStatus
2. **Errores de red:** Timeout, conexión fallida
3. **Errores de API:** Códigos de estado HTTP
4. **Errores de archivo:** Archivos corruptos o inválidos

### Sistema de Notificaciones
```javascript
showMessage(text, type) // type: 'success', 'error', 'warning', 'info'
```

## Persistencia

### localStorage
- `cfdi_api_url`: URL de la API
- `cfdi_api_token`: Bearer token

### Archivos
- **Plantilla Excel:** Descarga automática
- **XML CFDI:** Exportación desde respuesta API

## Estilos y UI

### Diseño Responsivo
- Grid CSS para formularios
- Breakpoints para móvil (768px)
- Flex layouts para acciones

### Tema de Colores
- **Primario:** #007bff (azul)
- **Éxito:** #28a745 (verde)
- **Error:** #dc3545 (rojo)
- **Advertencia:** #ffc107 (amarillo)
- **Fondo:** Gradiente azul-violeta

### Efectos Visuales
- Hover effects en botones
- Transiciones suaves (0.3s)
- Sombras y bordes redondeados
- Campos de solo lectura con fondo gris

## Optimizaciones

### Performance
- Reactive refs solo donde necesario
- Cálculos computados para validaciones
- Lazy loading de componentes

### UX
- Auto-guardado de configuración API
- Confirmación para limpiar formulario
- Feedback visual inmediato
- Estados de carga

## Testing

### Casos de Prueba Sugeridos
1. **Carga de Excel:** Archivo válido e inválido
2. **Cálculos:** Verificar fórmulas de IVA y totales
3. **Validaciones:** Campos requeridos y opcionales
4. **API:** Respuestas exitosas y errores
5. **Exportación:** Formato XML correcto

### Datos de Prueba
- RFC válidos para emisor y receptor
- Fechas en formato ISO
- Conceptos con valores numéricos válidos
- Bearer token funcional

## Consideraciones de Seguridad

### API
- Token en campos de tipo `password`
- Headers de autorización correctos
- Validación de respuestas del servidor

### Archivos
- Validación de tipos de archivo Excel
- Sanitización de datos de entrada
- Manejo seguro de errores

## Mantenimiento

### Actualizaciones Frecuentes
- Constantes CFDI (cambios en SAT)
- Configuración de impuestos
- URLs de API de producción

### Monitoreo
- Errores de conectividad
- Fallos en validaciones
- Performance de cálculos

## Deployment

### Construcción
```bash
npm run build
```

### Variables de Entorno
- No se requieren para el cliente
- Configuración API manejada por usuario

### Compatibilidad
- Navegadores modernos (ES6+)
- Node.js 22.14.0
- Vue.js 3+
