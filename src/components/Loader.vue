<template>
    <div class="loader-overlay">
      <div class="spinner"></div>
    </div>
  </template>
  <script>
    export default{
        name: 'LOADERcd',
    }
</script>
  
  <style scoped>
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(5px);
    background-color: rgba(128, 90, 213, 0.1); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .spinner {
    width: 60px;
    height: 60px;
    border: 6px solid #e9d5ff; 
    border-top: 6px solid #7c3aed; 
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>