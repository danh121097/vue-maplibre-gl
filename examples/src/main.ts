import { createApp } from 'vue';
import { setWorkerUrl } from 'maplibre-gl';
// MapLibre 6 looks for its worker next to its own module file, which a bundler
// moves. Vite's `?worker&url` emits the worker as its own asset and hands back
// its URL; without this the map stays blank with "Worker failed to load".
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import './styles/style.css';
import App from './App.vue';
import { setupRouter } from './router';

setWorkerUrl(workerUrl);

const app = createApp(App);

setupRouter(app);
app.mount('#app');
