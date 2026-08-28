# Conectar con Sentido — sitio estático

Sitio sin framework ni compilación. Se sube tal cual a Netlify (arrastrando la
carpeta) o a GitHub Pages.

## Archivos

- `index.html` — inicio. **Este nombre no se cambia**: es el que busca el servidor.
- `colegios.html` — charlas para comunidades escolares
- `familias.html` — apoyo clínico para familias
- `recursos.html` — recursos gratuitos
- `styles.css` — sistema visual completo de las cuatro páginas
- `motion.js` — menú móvil, header al scroll y revelado progresivo
- `assets/logo-conectar-con-sentido.png` — logo de marca (header), fondo transparente
- `assets/logo_metodo_nido_transparente.png` — logo Método NIDO, fondo transparente
- `assets/carla-romo.png` — foto de Carla (sección "Sobre mí" del inicio)
- `assets/fotoportada.png` — foto de portada (hero del inicio)
- `assets/og.png` — imagen 1200×630 para compartir en redes (generada a partir del logo y la paleta)

Todos los enlaces son relativos, así que funcionan igual en local y publicado.

## Sistema visual

**Paleta**
| Rol | Hex |
|---|---|
| Navy (banda oscura principal) | `#1E2D3D` |
| Navy profundo (footer) | `#16222E` |
| Turquesa profundo (segunda banda oscura) | `#2A6475` |
| Turquesa de marca (acentos, enlaces) | `#3E8DA1` |
| Coral (solo acción: botones y eyebrows) | `#EA8672` |
| Rosa (detalle, con moderación) | `#E07688` |
| Crema (fondo base) | `#FBF7F2` |
| Arena (fondo claro secundario) | `#F3EBE3` |

**Tipografías** (Google Fonts, `display=swap`)
- Fraunces — h1, h2, h3 y frases en itálica
- Anton — solo números y letras pequeñas de acento (tarjetas, contadores)
- Manrope — cuerpo, botones y navegación

**Ritmo:** bandas alternadas oscuro/claro. El coral aparece solo en acciones.

**Efectos:** los títulos (`h1`/`h2`) se revelan palabra por palabra al entrar en pantalla (ver `.split-word` en `styles.css` y el bloque "Titulos revelados por palabra" en `motion.js`). Respeta `prefers-reduced-motion`.

## Para editar

Los colores y espaciados están como variables al inicio de `styles.css`.
Cambiar un valor ahí lo cambia en las cuatro páginas.
