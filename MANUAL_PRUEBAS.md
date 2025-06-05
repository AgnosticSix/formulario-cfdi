# Manual de Pruebas - Generador de CFDI

## Casos de Prueba

### 1. Configuración Inicial

#### Caso 1.1: Configurar API
**Objetivo:** Verificar que la configuración de API se guarde correctamente

**Pasos:**
1. Abrir la aplicación en http://localhost:5173/
2. En el panel "Configuración de API", ingresar:
   - URL del API: `https://api.ejemplo.com/cfdi`
   - Bearer Token: `test-token-123`
3. Cambiar a otra sección del formulario
4. Recargar la página

**Resultado esperado:**
- Los datos se mantienen después de recargar
- Los datos se guardan en localStorage

#### Caso 1.2: Validación de URL
**Objetivo:** Verificar validación de formato de URL

**Pasos:**
1. Ingresar URL inválida: `texto-invalido`
2. Intentar enviar formulario

**Resultado esperado:**
- Mensaje de error indicando URL inválida

### 2. Manejo de Excel

#### Caso 2.1: Descargar Plantilla
**Objetivo:** Verificar descarga de plantilla Excel

**Pasos:**
1. Hacer clic en "📥 Descargar Plantilla Excel"

**Resultado esperado:**
- Se descarga archivo `plantilla_cfdi.xlsx`
- Archivo contiene encabezados correctos
- Archivo contiene datos de ejemplo

#### Caso 2.2: Cargar Excel Válido
**Objetivo:** Verificar carga de datos desde Excel

**Pasos:**
1. Descargar plantilla Excel
2. Modificar datos en la plantilla:
   - Folio: "TEST-001"
   - Fecha: "2024-12-04T14:30:00"
   - SubTotal: 1000.00
   - Total: 1160.00
3. Guardar archivo Excel
4. Hacer clic en "📤 Cargar Excel"
5. Seleccionar archivo modificado
6. Hacer clic en "Llenar formulario con datos de Excel"

**Resultado esperado:**
- Mensaje "Excel cargado correctamente"
- Formulario se llena con datos del Excel
- Botón "Llenar formulario" aparece

#### Caso 2.3: Cargar Excel Inválido
**Objetivo:** Verificar validación de archivos Excel

**Pasos:**
1. Crear archivo Excel con datos faltantes
2. Intentar cargar archivo

**Resultado esperado:**
- Mensaje de error especificando campos faltantes

### 3. Formulario CFDI

#### Caso 3.1: Llenar Información Básica
**Objetivo:** Verificar campos básicos del formulario

**Pasos:**
1. Llenar campos:
   - Folio: "ML-12345"
   - Fecha: Usar selector de fecha/hora actual
   - Descuento: 50.00

**Resultado esperado:**
- Campos se llenan correctamente
- Estado de validación se actualiza

#### Caso 3.2: Agregar Conceptos
**Objetivo:** Verificar manejo de conceptos

**Pasos:**
1. En el primer concepto, ingresar:
   - Cantidad: 2
   - Valor Unitario: 500.00
2. Hacer clic en "Agregar Concepto"
3. En el segundo concepto, ingresar:
   - Cantidad: 1
   - Valor Unitario: 300.00

**Resultado esperado:**
- Se agregan conceptos correctamente
- Botón "Eliminar" aparece en conceptos adicionales

#### Caso 3.3: Cálculo Automático
**Objetivo:** Verificar cálculos automáticos

**Pasos:**
1. Ingresar en concepto:
   - Cantidad: 5
   - Valor Unitario: 200.00
2. Hacer clic en "🧮 Calcular Totales"

**Resultado esperado:**
- Importe del concepto: 1000.00
- Base IVA: 1000.00
- Importe IVA: 160.00
- SubTotal global: 1000.00
- Total global: 1160.00

### 4. Validaciones

#### Caso 4.1: Estado de Validación
**Objetivo:** Verificar componente de validación

**Pasos:**
1. Observar panel "Estado de Validación" con formulario vacío
2. Llenar gradualmente los campos requeridos
3. Observar cambios en tiempo real

**Resultado esperado:**
- Estados iniciales muestran ❌ y detalles de faltantes
- Estados cambian a ✅ cuando se completan
- "Listo para enviar" aparece cuando todo está válido

#### Caso 4.2: Validación de RFC
**Objetivo:** Verificar validaciones específicas

**Pasos:**
1. Los RFC por defecto deben ser válidos
2. Verificar formato de RFC en constantes

**Resultado esperado:**
- RFC del emisor: "SSB160405MA7"
- RFC del receptor: "DCM991109KR2"

### 5. Funciones Adicionales

#### Caso 5.1: CFDI Relacionados
**Objetivo:** Verificar manejo de CFDI relacionados

**Pasos:**
1. En el campo "CFDI Relacionado", ingresar:
   ```
   UUID-123-456, UUID-789-012, UUID-345-678
   ```

**Resultado esperado:**
- Se separan correctamente por comas
- Se almacenan en array del formData

#### Caso 5.2: Addenda
**Objetivo:** Verificar configuración de addenda

**Pasos:**
1. Ingresar en addenda:
   - Ruta ID: "RUTA001"
   - Shipments: "SHIP001"

**Resultado esperado:**
- Datos se almacenan en estructura addenda

#### Caso 5.3: Limpiar Formulario
**Objetivo:** Verificar función de limpiar

**Pasos:**
1. Llenar varios campos del formulario
2. Hacer clic en "🗑️ Limpiar Formulario"
3. Confirmar en el diálogo

**Resultado esperado:**
- Todos los campos se resetean
- Se mantiene la estructura inicial
- Mensaje de confirmación antes de limpiar

### 6. Integración API (Requiere API funcional)

#### Caso 6.1: Envío Exitoso
**Objetivo:** Verificar envío completo a API

**Pasos:**
1. Configurar URL y token válidos
2. Llenar formulario completo
3. Hacer clic en "📤 Enviar CFDI"

**Resultado esperado:**
- Mensaje "CFDI enviado exitosamente"
- Descarga automática de XML
- Estado "Enviando..." durante proceso

#### Caso 6.2: Error de API
**Objetivo:** Verificar manejo de errores

**Pasos:**
1. Configurar URL inexistente
2. Intentar enviar formulario

**Resultado esperado:**
- Mensaje de error de conectividad
- No se descarga XML

### 7. Exportación

#### Caso 7.1: Exportar XML
**Objetivo:** Verificar exportación de XML

**Pasos:**
1. Simular respuesta exitosa de API
2. Verificar descarga de archivo XML

**Resultado esperado:**
- Archivo XML se descarga con nombre `cfdi_[folio].xml`
- Contenido XML válido sin caracteres escape

### 8. Persistencia

#### Caso 8.1: Persistencia de Configuración
**Objetivo:** Verificar almacenamiento local

**Pasos:**
1. Configurar API
2. Cerrar y reabrir navegador
3. Verificar que configuración persiste

**Resultado esperado:**
- Configuración API se mantiene
- No se pierden datos de localStorage

### 9. Responsividad

#### Caso 9.1: Vista Móvil
**Objetivo:** Verificar diseño responsivo

**Pasos:**
1. Reducir ventana del navegador a 400px de ancho
2. Verificar que todos los elementos sean accesibles

**Resultado esperado:**
- Formularios se apilan verticalmente
- Botones mantienen funcionalidad
- Texto legible en pantalla pequeña

## Datos de Prueba

### Excel de Prueba
```
Folio: ML-TEST-001
Fecha: 2024-12-04T14:30:00
SubTotal: 1000.00
Descuento: 0.00
Total: 1160.00
CfdiRelacionado: UUID-TEST-123,UUID-TEST-456
Concepto1_Cantidad: 1
Concepto1_ValorUnitario: 1000.00
Concepto1_Importe: 1000.00
Concepto1_Descuento: 0.00
Concepto1_Base: 1000.00
Concepto1_ImporteIVA: 160.00
RutaId: RUTA-TEST-001
Shipments: SHIP-TEST-001
```

### API Mock Response
```json
{
  "status": 200,
  "data": {
    "cfdi": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><cfdi:Comprobante>...</cfdi:Comprobante>"
  }
}
```

## Checklist de Pruebas

- [ ] Configuración API se guarda y persiste
- [ ] Descarga de plantilla Excel funciona
- [ ] Carga de Excel válido funciona
- [ ] Validación de Excel inválido funciona
- [ ] Cálculos automáticos son correctos
- [ ] Estado de validación se actualiza en tiempo real
- [ ] Agregar/eliminar conceptos funciona
- [ ] CFDI relacionados se manejan correctamente
- [ ] Addenda se configura correctamente
- [ ] Limpiar formulario funciona con confirmación
- [ ] Envío a API funciona (con API real)
- [ ] Manejo de errores de API
- [ ] Exportación de XML funciona
- [ ] Diseño responsivo en móvil
- [ ] Persistencia de datos en localStorage
- [ ] Notificaciones aparecen y desaparecen
- [ ] Tooltips y ayudas visuales funcionan

## Herramientas de Desarrollo

### DevTools
- Usar DevTools del navegador para inspeccionar localStorage
- Verificar requests HTTP en Network tab
- Revisar errores en Console

### Archivos de Log
- Errores se muestran en consola del navegador
- Responses de API se logean para debugging

### Testing Manual
- Probar en diferentes navegadores (Chrome, Firefox, Safari)
- Probar con diferentes tamaños de pantalla
- Probar con datos extremos (números muy grandes, texto muy largo)
