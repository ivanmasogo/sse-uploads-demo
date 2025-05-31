import { ref, onMounted, onUnmounted } from 'vue'

export function useUploadEvents() {
  const uploads = ref([])
  const connected = ref(false)
  const channel = new BroadcastChannel('uploads')
  let isLeader = false
  let evtSource = null
  let responded = false

  const handleMessage = (event) => {
    const { type, data } = event.data

    if (type === 'ask-for-leader' && isLeader) {
      channel.postMessage({ type: 'i-am-leader' })
    }

    if (type === 'i-am-leader') {
      responded = true
      console.log('📡 Esta pestaña no es la líder, escucha desde BroadcastChannel.')
    }

    if (type === 'uploads-update') {
      console.log('[NO líder] Recibido update:', data)
      applyUpdates(data)
      connected.value = true
    }

    if (type === 'leader-closed' && !isLeader) {
      console.log('[INFO] El líder se ha cerrado. Esta pestaña tomará el control.')
      becomeLeader()
    }
  }

  const applyUpdates = (updates) => {
    let changed = false
    for (const update of updates) {
      const i = uploads.value.findIndex(u => u.internalId === update.internalId)
      if (i !== -1) {
        uploads.value[i] = { ...uploads.value[i], ...update }
        changed = true
      }
    }
    if (changed) {
      uploads.value = [...uploads.value]
    }
  }

  const becomeLeader = () => {
    if (isLeader) return

    isLeader = true
    console.log('✅ Esta pestaña es la líder. Conectada al backend vía SSE.')

    evtSource = new EventSource('http://localhost:3000/events')

    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.updates) {
        applyUpdates(data.updates)
        channel.postMessage({ type: 'uploads-update', data: data.updates })
      }
      connected.value = true
    }

    evtSource.onerror = () => {
      connected.value = false
    }
  }

  onMounted(async () => {
    const res = await fetch('http://localhost:3000/uploads')
    uploads.value = await res.json()

    channel.addEventListener('message', handleMessage)
    channel.postMessage({ type: 'ask-for-leader' })

    setTimeout(() => {
      if (!responded) {
        becomeLeader()
      }
    }, 500)

    window.addEventListener('beforeunload', () => {
      if (isLeader) {
        channel.postMessage({ type: 'leader-closed' })
      }
    })
  })

  onUnmounted(() => {
    if (isLeader) {
      channel.postMessage({ type: 'leader-closed' })
    }
    channel.removeEventListener('message', handleMessage)
    if (evtSource) evtSource.close()
  })

  return { uploads, connected }
}
