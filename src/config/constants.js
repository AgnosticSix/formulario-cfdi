// Configuración de constantes para la aplicación CFDI
export const CFDI_CONSTANTS = {
  // Versión del CFDI
  VERSION: "4.0",
  
  // Serie por defecto
  SERIE: "ML",
  
  // Moneda por defecto
  MONEDA: "MXN",
  
  // Tipo de comprobante por defecto
  TIPO_COMPROBANTE: "I", // Ingreso
  
  // Forma de pago por defecto
  FORMA_PAGO: "99", // Por definir
  
  // Método de pago por defecto
  METODO_PAGO: "PPD", // Pago en parcialidades o diferido
  
  // Exportación por defecto
  EXPORTACION: "01", // No aplica
  
  // Lugar de expedición por defecto
  LUGAR_EXPEDICION: "07020",
  
  // Datos del emisor por defecto
  EMISOR: {
    RFC: "SSB160405MA7",
    NOMBRE: "SERVICIOS AL SUPER BETA",
    REGIMEN_FISCAL: "601"
  },
  
  // Datos del receptor por defecto
  RECEPTOR: {
    RFC: "DCM991109KR2",
    NOMBRE: "DEREMATE.COM DE MEXICO",
    REGIMEN_FISCAL: "601",
    DOMICILIO_FISCAL: "11520",
    USO_CFDI: "G03"
  },
  
  // Configuración de impuestos
  IMPUESTOS: {
    IVA: {
      IMPUESTO: "002",
      TASA: 0.16,
      TASA_STRING: "0.160000",
      TIPO_FACTOR: "Tasa"
    }
  },
  
  // Configuración de conceptos por defecto
  CONCEPTO_DEFAULT: {
    OBJETO_IMP: "02",
    CLAVE_PROD_SERV: "78102200",
    CLAVE_UNIDAD: "E48",
    UNIDAD: "No aplica",
    DESCRIPCION: "Servicio de última Milla"
  },
  
  // Tipos de relación CFDI
  TIPOS_RELACION: {
    SUSTITUCION: "04",
    NOTA_CREDITO: "01",
    NOTA_DEBITO: "02",
    DEVOLUCION: "03",
    ANTICIPO: "06"
  },
  
  // Addenda por defecto
  ADDENDA: {
    XMLNS: "http://www.Addenda/",
    SCHEMA_LOCATION: "http://www.addenda.xsd",
    VERSION: "1.0"
  }
}

// Funciones de utilidad
export const CFDI_UTILS = {
  // Formatear RFC (eliminar espacios y convertir a mayúsculas)
  formatRFC(rfc) {
    return rfc ? rfc.trim().toUpperCase() : ''
  },
  
  // Validar formato de RFC
  validateRFC(rfc) {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/
    return rfcRegex.test(rfc)
  },
  
  // Formatear moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  },
  
  // Formatear fecha para CFDI
  formatDateForCfdi(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 19)
  },
  
  // Generar fecha actual para CFDI
  getCurrentCfdiDate() {
    return this.formatDateForCfdi(new Date())
  },
  
  // Redondear a 2 decimales
  roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }
}
