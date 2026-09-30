// ReUnite API client
// Works with the frontend immediately; when a FastAPI backend is running,
// set window.REUNITE_API_ORIGIN before loading app.js or use port 8000.
(() => {
  const origin = window.REUNITE_API_ORIGIN
    || localStorage.getItem('reunite-api-origin')
    || `${location.protocol === 'file:' ? 'http:' : location.protocol}//${location.hostname || '127.0.0.1'}:${location.port && location.protocol !== 'file:' ? location.port : '8000'}`;

  const base = `${origin.replace(/\/$/, '')}/api/v1`;

  async function request(path, options = {}) {
    const response = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
      headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
    const type = response.headers.get('content-type') || '';
    return type.includes('application/json') ? response.json() : response.text();
  }

  const api = {
    get: (path) => request(path),
    del: (path) => request(path, { method: 'DELETE' }),
    postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
    dashboard: () => request('/dashboard'),
    cameras: () => request('/cameras/'),
    alerts: (limit = 50) => request(`/alerts/?limit=${limit}`),
    detectionTimeline: (hours = 24) => request(`/analytics/detection-timeline?hours=${hours}`),
    watchlistActivity: () => request('/analytics/watchlist-activity'),
    cameraActivity: () => request('/analytics/camera-activity'),
    detections: (cameraId, hours = 24) => request(`/cameras/${encodeURIComponent(cameraId)}/detections?hours=${hours}`),
    heatmap: (cameraId) => request(`/cameras/${encodeURIComponent(cameraId)}/heatmap`),
    timeline: (personId) => request(`/persons/${encodeURIComponent(personId)}/timeline`),
    addCamera: (payload) => request('/cameras/', { method: 'POST', body: JSON.stringify(payload) }),
    startStream: (cameraId) => request(`/cameras/${encodeURIComponent(cameraId)}/start`, { method: 'POST' }),
    stopStream: (cameraId) => request(`/cameras/${encodeURIComponent(cameraId)}/stop`, { method: 'POST' }),
    updatePerson: (personId, payload) => request(`/persons/${encodeURIComponent(personId)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    enrollFace: (personId, formData) => request(`/persons/${encodeURIComponent(personId)}/face`, { method: 'POST', body: formData }),
    uploadVideo: (formData) => request('/upload/video', { method: 'POST', body: formData }),
    jobStatus: (jobId) => request(`/upload/jobs/${encodeURIComponent(jobId)}`),
    ackAlert: (alertId) => request(`/alerts/${encodeURIComponent(alertId)}/ack`, { method: 'POST' }),
  };

  window.ReUniteAPI = api;
  window.api = api;
})();
