# Generador de CFDI

Aplicación web desarrollada con Copilot modo Agente, con Vue.js 3 y Vite para la generación y gestión de Comprobantes Fiscales Digitales por Internet (CFDI).

## Características

- ✅ Formulario completo para datos de CFDI
- ✅ Carga de datos desde archivos Excel
- ✅ Descarga de plantilla Excel
- ✅ Integración con APIs externas
- ✅ Exportación de archivos XML
- ✅ Interfaz moderna y responsiva
- ✅ Validación de datos
- ✅ **Entrada manual de valores con verificación**
- ✅ Verificación de totales e impuestos

## Tecnologías Utilizadas

- **Vue.js 3** - Framework JavaScript con Composition API
- **Vite** - Herramienta de construcción rápida
- **Axios** - Cliente HTTP para peticiones API
- **XLSX** - Procesamiento de archivos Excel
- **File-saver** - Exportación de archivos
- **Node.js 22.14.0** - Entorno de ejecución

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd formulario-cfdi
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## Uso

### Configuración de API
1. Ingresa la URL del API donde se enviará el CFDI
2. Proporciona el Bearer Token para autenticación

### Carga de Datos
- **Formulario manual**: Llena todos los campos requeridos
- **Desde Excel**: 
  1. Descarga la plantilla Excel
  2. Llena los datos en la plantilla
  3. Carga el archivo Excel
  4. Aplica los datos al formulario

### Entrada Manual y Verificación
1. Llena manualmente todos los campos (Cantidad, Valor Unitario, Importe, Base IVA, Importe IVA, SubTotal, Total)
2. Haz clic en "Verificar Totales" para validar que los valores ingresados sean correctos
3. El sistema mostrará:
   - ✅ **Mensaje de éxito** si todos los valores son correctos
   - ❌ **Lista de errores** con los valores incorrectos y los esperados

### Envío y Exportación
1. Configura todos los datos necesarios
2. Verifica los totales usando "Verificar Totales"
3. Envía el CFDI al API
4. El archivo XML se descargará automáticamente si la respuesta es exitosa

## Entrada Manual con Verificación

Esta funcionalidad permite la captura manual de todos los valores del CFDI, con un sistema de verificación que valida que los montos totales sean correctos.

### Campos Editables
Todos los campos calculados ahora son editables manualmente:
- **Por Concepto:**
  - Importe (Cantidad × Valor Unitario)
  - Base IVA (Importe - Descuento)
  - Importe IVA (Base × 16%)
- **Totales Globales:**
  - SubTotal (suma de todos los importes)
  - Total (SubTotal - Descuentos + IVA)

### Proceso de Verificación
1. Ingresa manualmente todos los valores en el formulario
2. Presiona el botón "✅ Verificar Totales"
3. El sistema valida:
   - Que el Importe de cada concepto coincida con Cantidad × Valor Unitario
   - Que la Base IVA coincida con Importe - Descuento
   - Que el Importe IVA coincida con Base × 16%
   - Que el SubTotal global coincida con la suma de importes
   - Que el Total coincida con SubTotal - Descuentos + IVA
4. Recibe retroalimentación inmediata:
   - ✅ Verde: Todos los valores son correctos
   - ❌ Rojo: Lista detallada de errores con valores esperados

### Beneficios
- Control total sobre los valores ingresados
- Validación precisa antes del envío
- Identificación clara de discrepancias
- Mayor flexibilidad en casos especiales

## Estructura de Datos CFDI

El formulario maneja la estructura completa de CFDI versión 4.0, incluyendo:

- Datos generales del comprobante
- Información del emisor y receptor
- Conceptos con cálculo de impuestos
- CFDI relacionados
- Addenda personalizada

## API Integration

La aplicación envía los datos con:
- **Content-Type**: `application/jsontoxml`
- **Authorization**: `Bearer {token}`
- **Método**: `POST`

### Respuesta Esperada

```json
{
  "data": {
    "cfdi": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
  }
}
```

## Desarrollo

### Estructura del Proyecto

```
src/
├── components/
│   └── CfdiForm.vue
├── App.vue
├── main.js
└── style.css
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la build

## Contribución

1. Fork del proyecto
2. Crear rama para nueva característica
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
