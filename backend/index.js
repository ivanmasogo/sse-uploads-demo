const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());

let clients = [];
let intervalId = null;

// SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);
  console.log(`Cliente conectado. Total: ${clients.length}`);

  // Iniciar intervalo si es el primer cliente
  if (clients.length === 1 && !intervalId) {
    startUpdates();
  }

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log(`Cliente desconectado. Total: ${clients.length}`);

    // Parar intervalo si ya no hay clientes
    if (clients.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('⏹️ Intervalo detenido: sin clientes conectados.');
    }
  });
});

// Utilidades
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const random = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
  return random.toISOString().split('T')[0];
}

let uploads = Array.from({ length: 20 }, (_, i) => ({
  internalId: uuidv4(),
  id: `file${i + 1}`,
  name: `documento_${i + 1}.pdf`,
  url: `https://example.com/uploads/file${i + 1}`,
  fecha: randomDate(),
  progress: 0
}));

let previousUploads = JSON.parse(JSON.stringify(uploads));

// REST: lista completa
app.get('/uploads', (req, res) => {
  res.json(uploads);
});

// ⏱️ Lógica del intervalo
function startUpdates() {
  console.log('▶️ Iniciando intervalo de actualización...');
  intervalId = setInterval(() => {
    const changed = [];

    uploads = uploads.map((upload, index) => {
      const prev = previousUploads[index];

      // Simular cambios
      let newId = upload.id;
      let newUrl = upload.url;
      let newFecha = upload.fecha;
      let newProgress = upload.progress;

      if (Math.random() < 0.05) {
        newId = `archivo_${Math.floor(Math.random() * 10000)}`;
      }
      if (Math.random() < 0.05) {
        newUrl = `https://cdn.example.com/uploads/${newId}?v=${Date.now()}`;
      }
      if (Math.random() < 0.02) {
        newFecha = randomDate();
      }
      if (newProgress < 100) {
        newProgress = Math.min(newProgress + Math.floor(Math.random() * 4), 100);
      }

      const changes = { internalId: upload.internalId };
      if (newId !== prev.id) changes.id = newId;
      if (newUrl !== prev.url) changes.url = newUrl;
      if (newFecha !== prev.fecha) changes.fecha = newFecha;
      if (newProgress !== prev.progress) changes.progress = newProgress;

      if (Object.keys(changes).length > 1) {
        const updated = {
          ...upload,
          id: newId,
          url: newUrl,
          fecha: newFecha,
          progress: newProgress
        };
        previousUploads[index] = { ...updated };
        changed.push(changes);
        return updated;
      }

      return upload;
    });

    if (changed.length > 0) {
      const data = JSON.stringify({ updates: changed });
      clients.forEach(client => client.write(`data: ${data}\n\n`));
      console.log('📡 Cambios enviados:', changed);
    }
  }, 3000);
}

app.listen(PORT, () => {
  console.log(`Servidor SSE corriendo en http://localhost:${PORT}`);
});
