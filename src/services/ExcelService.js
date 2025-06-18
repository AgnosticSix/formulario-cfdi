import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export class ExcelService {
  static generateTemplate() {
    const templateData = [
      {
        'Folio': 'ML-12345',
        'Fecha': '2024-12-04T10:00:00',
        'SubTotal': 1000.00,
        'Descuento': 0.00,
        'Total': 1160.00,
        'CfdiRelacionado': 'UUID-EJEMPLO-1,UUID-EJEMPLO-2',
        'Concepto1_Cantidad': 1,
        'Concepto1_ValorUnitario': 1000.00,
        'Concepto1_Importe': 1000.00,
        'Concepto1_Descuento': 0.00,
        'Concepto1_Base': 1000.00,
        'Concepto1_ImporteIVA': 160.00,
        'Concepto2_Cantidad': '',
        'Concepto2_ValorUnitario': '',
        'Concepto2_Importe': '',
        'Concepto2_Descuento': '',
        'Concepto2_Base': '',
        'Concepto2_ImporteIVA': '',
        'RutaId': 'RUTA001, RUTA002, RUTA003',
        'Shipments': 'SHIP001, SHIP002, SHIP003'
      }
    ]
    
    const ws = XLSX.utils.json_to_sheet(templateData)
    
    // Establecer anchos de columna
    const colWidths = [
      { wch: 15 }, // Folio
      { wch: 20 }, // Fecha
      { wch: 12 }, // SubTotal
      { wch: 12 }, // Descuento
      { wch: 12 }, // Total
      { wch: 40 }, // CfdiRelacionado
      { wch: 15 }, // Concepto1_Cantidad
      { wch: 18 }, // Concepto1_ValorUnitario
      { wch: 15 }, // Concepto1_Importe
      { wch: 18 }, // Concepto1_Descuento
      { wch: 15 }, // Concepto1_Base
      { wch: 18 }, // Concepto1_ImporteIVA
      { wch: 15 }, // Concepto2_Cantidad
      { wch: 18 }, // Concepto2_ValorUnitario
      { wch: 15 }, // Concepto2_Importe
      { wch: 18 }, // Concepto2_Descuento      { wch: 15 }, // Concepto2_Base
      { wch: 18 }, // Concepto2_ImporteIVA
      { wch: 25 }, // RutaId (aumentado para múltiples valores)
      { wch: 25 }  // Shipments (aumentado para múltiples valores)
    ]
    ws['!cols'] = colWidths
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla CFDI")
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, 'plantilla_cfdi.xlsx')
  }
  
  static readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsArrayBuffer(file)
    })
  }
  
  static validateExcelData(data) {
    const requiredFields = ['Folio', 'Fecha', 'SubTotal', 'Total']
    const errors = []
    
    if (!data || data.length === 0) {
      errors.push('El archivo Excel está vacío')
      return { isValid: false, errors }
    }
    
    const firstRow = data[0]
    requiredFields.forEach(field => {
      if (!firstRow.hasOwnProperty(field) || firstRow[field] === '') {
        errors.push(`Campo requerido faltante: ${field}`)
      }
    })
    
    // Validar que los números sean válidos
    const numericFields = ['SubTotal', 'Total', 'Descuento']
    numericFields.forEach(field => {
      if (firstRow[field] && isNaN(parseFloat(firstRow[field]))) {
        errors.push(`Campo ${field} debe ser un número válido`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
