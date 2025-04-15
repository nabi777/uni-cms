<template>
    <div class="bottom-bar">
      <h3>{{ title }}</h3>
      <!-- Placeholder for future content -->
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BottomBar',
    props: {
      title: {
        type: String,
        default: 'Model List'
      }
    }
  }
  </script>
  
  <style scoped>
  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 200px; /* Adjust to match your sidebar width */
    width: calc(100% - 200px); /* Adjust to match your sidebar width */
    background-color: white;
    border-top: 1px solid #dee2e6;
    padding: 20px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
  }
  
  .slot {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  
  .total-items {
    font-size: 14px;
    color: #6c757d;
  }
  
  .pagination button {
    padding: 5px 10px;
    margin-left: 5px;
    border: none;
    background-color: #17a2b8;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  </style>
  