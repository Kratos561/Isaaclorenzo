# Portafolio — Isaac Lorenzo (AISAK 3D)

Sitio estático: arte 3D y video. Sin build, sin dependencias: son 3 páginas
HTML, un CSS y un JS.

## Estructura
- `index.html` — portada, sobre mí, selección, servicios, proceso y contacto
- `3d.html` — galería de Arte 3D (subpágina 02)
- `videos.html` — galería de Video (subpágina 03)
- `styles.css` — estilo compartido (única fuente)
- `assets/` — logo, fondos, renders, telarañas y `animations.js`

## Ver en local
Los videos de YouTube incrustados fallan con `file://` (Error 153).
Usa el servidor incluido:

```powershell
powershell -ExecutionPolicy Bypass -File .\servidor-local.ps1
```

Luego abre <http://localhost:8000/index.html>.

## Notas
- `LEEME.txt` tiene la documentación completa del proyecto: sistema visual,
  orden de secciones, animaciones GSAP y reglas de los assets.
- Ethnocentric Rg se carga desde cdnfonts; si no aparece, `styles.css`
  cae a Bricolage Grotesque.