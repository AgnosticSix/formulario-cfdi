<script setup>
import CfdiForm from './components/CfdiForm.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Generador de CFDI</h1>
      <p>Formulario para generar Comprobantes Fiscales Digitales</p>
    </header>
    
    <main class="app-main">
      <CfdiForm />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
