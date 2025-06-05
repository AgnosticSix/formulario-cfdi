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
- ✅ Cálculo automático de totales e impuestos

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

### Envío y Exportación
1. Configura todos los datos necesarios
2. Usa "Calcular Totales" para recalcular automáticamente
3. Envía el CFDI al API
4. El archivo XML se descargará automáticamente si la respuesta es exitosa

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
