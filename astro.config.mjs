// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://reep.app',
  // Sortie « directory » (défaut) : /mentions-legales/ fonctionne sur n'importe
  // quel hébergeur statique, y compris un simple serveur de fichiers.
});
