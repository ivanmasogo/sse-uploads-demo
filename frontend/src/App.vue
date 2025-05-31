<template>
  <div class="container">
    <h1>Subidas activas</h1>
    <p v-if="!connected">Esperando datos...</p>

    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>URL</th>
          <th>Fecha</th>
          <th>Progreso</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in uploads" :key="file.id">
          <td>{{ file.id }}</td>
          <td>{{ file.name }}</td>
          <td><a :href="file.url" target="_blank">{{ file.url }}</a></td>
          <td>{{ file.fecha }}</td>
          <td>
            <progress :value="file.progress" max="100"></progress>
            {{ file.progress }}%
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useUploadEvents } from './composables/useUploadEvents'

const { uploads, connected } = useUploadEvents()
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
}

h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
}

p {
  font-style: italic;
  color: #666;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

th {
  background-color: #f1f1f1;
  color: #333;
  padding: 0.75rem;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #eaeaea;
  color: #444;
  font-size: 0.95rem;
}

tr:hover {
  background-color: #fafafa;
}

a {
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
}

a:hover {
  text-decoration: underline;
}

progress {
  width: 120px;
  height: 16px;
  vertical-align: middle;
  appearance: none;
  -webkit-appearance: none;
}

progress::-webkit-progress-bar {
  background-color: #eee;
  border-radius: 10px;
}

progress::-webkit-progress-value {
  background-color: #4caf50;
  border-radius: 10px;
}

progress::-moz-progress-bar {
  background-color: #4caf50;
  border-radius: 10px;
}

</style>
