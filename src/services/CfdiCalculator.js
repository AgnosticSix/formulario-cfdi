import { CFDI_CONSTANTS, CFDI_UTILS } from '../config/constants.js'

export class CfdiCalculator {  static calculateConceptoTotals(concepto) {
    // Calcular importe del concepto (con 4 decimales)
    concepto.Importe = CFDI_UTILS.roundToFour(concepto.Cantidad * concepto.ValorUnitario)
    
    // Calcular base para IVA (importe menos descuento) (con 4 decimales)
    const descuento = concepto.Descuento || 0
    concepto.Impuestos.Traslados[0].Base = CFDI_UTILS.roundToFour(concepto.Importe - descuento)
    
    // Calcular IVA (16%) (con 4 decimales)
    concepto.Impuestos.Traslados[0].Importe = CFDI_UTILS.roundToFour(
      concepto.Impuestos.Traslados[0].Base * CFDI_CONSTANTS.IMPUESTOS.IVA.TASA
    )
    
    return concepto
  }    static calculateGlobalTotals(formData) {
    let subtotal = 0
    let totalDescuentos = 0
    let totalIva = 0
    
    // Calcular totales de todos los conceptos
    formData.Conceptos.forEach(concepto => {
      subtotal += concepto.Importe || 0
      totalDescuentos += concepto.Descuento || 0
      totalIva += concepto.Impuestos.Traslados[0].Importe || 0
    })    // SubTotal debe ser la suma bruta de importes (sin restar descuentos)
    formData.SubTotal = CFDI_UTILS.roundToTwo(subtotal)
    
    // Calcular el subtotal neto (después de descuentos) para la base de impuestos
    const subtotalNeto = CFDI_UTILS.roundToTwo(subtotal - totalDescuentos)
    
    // Actualizar impuestos globales (con 4 decimales)
    formData.Impuestos.TotalImpuestosTrasladados = CFDI_UTILS.formatToString(totalIva, 2)
    formData.Impuestos.Traslados[0].Base = subtotalNeto
    formData.Impuestos.Traslados[0].Importe = CFDI_UTILS.formatToString(totalIva, 2)
    
    // Calcular total final usando el subtotal neto (con 4 decimales)
    formData.Total = CFDI_UTILS.roundToTwo(subtotalNeto + totalIva)
    
    return formData
  }
  
  static validateCfdiData(formData) {
    const errors = []
    
    // Validaciones básicas
    if (!formData.Folio || formData.Folio.trim() === '') {
      errors.push('El folio es requerido')
    }
    
    if (!formData.Fecha || formData.Fecha.trim() === '') {
      errors.push('La fecha es requerida')
    }
    
    if (formData.SubTotal <= 0) {
      errors.push('El subtotal debe ser mayor a 0')
    }
    
    if (formData.Total <= 0) {
      errors.push('El total debe ser mayor a 0')
    }
    
    // Validar conceptos
    if (!formData.Conceptos || formData.Conceptos.length === 0) {
      errors.push('Debe haber al menos un concepto')
    } else {
      formData.Conceptos.forEach((concepto, index) => {
        if (!concepto.Cantidad || concepto.Cantidad <= 0) {
          errors.push(`Concepto ${index + 1}: La cantidad debe ser mayor a 0`)
        }
        
        if (!concepto.ValorUnitario || concepto.ValorUnitario <= 0) {
          errors.push(`Concepto ${index + 1}: El valor unitario debe ser mayor a 0`)
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
    static formatDateForCfdi(date) {
    return CFDI_UTILS.formatDateForCfdi(date)
  }
  
  static formatCurrency(amount) {
    return CFDI_UTILS.formatCurrency(amount)
  }
  
  static validateRFC(rfc) {
    return CFDI_UTILS.validateRFC(rfc)
  }
  
  // Funciones para manejar múltiples valores en Addenda
  static parseMultipleValues(valueString) {
    if (!valueString || typeof valueString !== 'string') return []
    return valueString.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }
  
  static formatMultipleValues(valuesArray) {
    if (!Array.isArray(valuesArray)) return ''
    return valuesArray.filter(v => v && v.trim().length > 0).join(', ')
  }
  
  static validateMultipleValues(valueString, fieldName) {
    const values = this.parseMultipleValues(valueString)
    const errors = []
    
    values.forEach((value, index) => {
      if (value.length < 3) {
        errors.push(`${fieldName} ${index + 1}: Valor muy corto (mínimo 3 caracteres)`)
      }
      if (value.length > 50) {
        errors.push(`${fieldName} ${index + 1}: Valor muy largo (máximo 50 caracteres)`)
      }
      // Validar caracteres especiales si es necesario
      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        errors.push(`${fieldName} ${index + 1}: Solo se permiten letras, números, guiones y guiones bajos`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      values
    }
  }
}
