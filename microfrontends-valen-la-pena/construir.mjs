// Empaqueta cada zona por separado, como si cada equipo tuviera su repo: cada archivo lleva su propio React.
// Uso: node construir.mjs [--comentarios-v2] [--evento-renombrado]
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {statSync} from 'node:fs';

const REACT = fileURLToPath(new URL('./node_modules', import.meta.url));
const v2 = process.argv.includes('--comentarios-v2');
const renombrado = process.argv.includes('--evento-renombrado');
const zonas = {
  reproductor: {EVENTO: renombrado ? 'videoTerminado' : 'video-terminado'},
  recomendados: {},
  comentarios: {VERSION: v2 ? '2' : '1'},
};
for (const [zona, vars] of Object.entries(zonas)) {
  await build({
    entryPoints: [`${zona}/index.jsx`], outfile: `${zona}/dist/${zona}.js`, bundle: true, minify: true, format: 'esm',
    jsx: 'automatic', jsxImportSource: 'react', tsconfigRaw: {}, logLevel: 'warning',
    alias: {react: `${REACT}/react`, 'react-dom': `${REACT}/react-dom`, scheduler: `${REACT}/scheduler`},
    define: {'process.env.NODE_ENV': '"production"', ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]))},
  });
  console.log(`${zona}/dist/${zona}.js  ${(statSync(`${zona}/dist/${zona}.js`).size / 1024).toFixed(1)} kB`);
}
