import { ref, reactive } from 'vue'

export function useNotifications() {
  const message = ref('')
  const messageType = ref('')

  const showMessage = (text, type = 'info') => {
    message.value = text
    messageType.value = type
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      message.value = ''
      messageType.value = ''
    }, 5000)
  }

  const clearMessage = () => {
    message.value = ''
    messageType.value = ''
  }

  return {
    message,
    messageType,
    showMessage,
    clearMessage
  }
}

export function useApiConfig() {
  const apiConfig = reactive({
    url: localStorage.getItem('cfdi_api_url') || 'https://services.sw.com.mx/v3/cfdi33/issue/json/v4',
    token: localStorage.getItem('cfdi_api_token') || ''
  })

  const saveApiConfig = () => {
    localStorage.setItem('cfdi_api_url', apiConfig.url)
    localStorage.setItem('cfdi_api_token', apiConfig.token)
  }

  const clearApiConfig = () => {
    apiConfig.url = ''
    apiConfig.token = ''
    localStorage.removeItem('cfdi_api_url')
    localStorage.removeItem('cfdi_api_token')
  }

  return {
    apiConfig,
    saveApiConfig,
    clearApiConfig
  }
}
