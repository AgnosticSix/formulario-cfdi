import { CFDI_CONSTANTS, CFDI_UTILS } from '../config/constants.js'

export class CfdiCalculator {
  static calculateConceptoTotals(concepto) {
    // Calcular importe del concepto
    concepto.Importe = CFDI_UTILS.roundToTwo(concepto.Cantidad * concepto.ValorUnitario)
    
    // Calcular base para IVA (importe menos descuento)
    const descuento = concepto.Descuento || 0
    concepto.Impuestos.Traslados[0].Base = CFDI_UTILS.roundToTwo(concepto.Importe - descuento)
    
    // Calcular IVA (16%)
    concepto.Impuestos.Traslados[0].Importe = CFDI_UTILS.roundToTwo(
      concepto.Impuestos.Traslados[0].Base * CFDI_CONSTANTS.IMPUESTOS.IVA.TASA
    )
    
    return concepto
  }
    static calculateGlobalTotals(formData) {
    let subtotal = 0
    let totalDescuentos = 0
    let totalIva = 0
    
    // Calcular totales de todos los conceptos
    formData.Conceptos.forEach(concepto => {
      subtotal += concepto.Importe || 0
      totalDescuentos += concepto.Descuento || 0
      totalIva += concepto.Impuestos.Traslados[0].Importe || 0
    })
    
    // Aplicar descuento global
    const descuentoGlobal = formData.Descuento || 0
    formData.SubTotal = CFDI_UTILS.roundToTwo(subtotal - totalDescuentos - descuentoGlobal)
    
    // Actualizar impuestos globales
    formData.Impuestos.TotalImpuestosTrasladados = CFDI_UTILS.roundToTwo(totalIva)
    formData.Impuestos.Traslados[0].Base = formData.SubTotal
    formData.Impuestos.Traslados[0].Importe = CFDI_UTILS.roundToTwo(totalIva)
    
    // Calcular total final
    formData.Total = CFDI_UTILS.roundToTwo(formData.SubTotal + totalIva)
    
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
}
