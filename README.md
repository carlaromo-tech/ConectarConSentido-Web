# Conectar con Sentido — sitio estático

Sitio sin framework ni compilación. Se sube tal cual a Netlify (arrastrando la
carpeta) o a GitHub Pages.

## Archivos

- `index.html` — inicio. **Este nombre no se cambia**: es el que busca el servidor.
- `colegios.html` — charlas para comunidades escolares
- `familias.html` — apoyo clínico para familias
- `recursos.html` — recursos gratuitos
- `styles.css` — sistema visual completo de las cuatro páginas
- `motion.js` — menú móvil, header al scroll (se esconde al bajar, barra de lectura) y revelado progresivo
- `portada.js` — inicio y colegios: hilos dibujados a mano sobre la foto de portada (Rough.js por CDN), profundidad al bajar, franja de frases (inicio) y espectro de las cinco conversaciones (colegios)
- `assets/logo-conectar-con-sentido.png` — logo de marca (header), fondo transparente
- `assets/logo_metodo_nido_transparente.png` — logo Método NIDO, fondo transparente
- `assets/carla-romo.png` — foto de Carla (sección "Sobre mí" del inicio)
- `assets/fotoportada.png` — foto de portada (hero del inicio)
- `assets/colegios-portada.jpg` — foto de portada de colegios (imagen generada, ilustrativa)
- `assets/inicio-*.jpg`, `nido-*.jpg`, `familias-*.jpg`, `recursos-*.jpg` — acuarelas generadas para el resto de las secciones (originales en PNG en `Conectar con Sentido/Imagenes web originales`)
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

En el inicio, `portada.js` dibuja dos hilos (coral y turquesa) que se entrelazan sobre la foto, con la nota manuscrita "¿tiene a quién contarle?" en Caveat. Los trazos usan coordenadas en píxeles de `assets/fotoportada.png` (1122 × 777): si se cambia la foto, hay que reubicarlos. Las frases que rotan bajo la portada están en el arreglo `PHRASES` de ese archivo.

Cada portada elige su dibujo con `data-dibujo` en el `<svg id="hero-trazos">` (`inicio` o `colegios`); los trazos y la nota de cada una están en el objeto `DIBUJOS` de `portada.js`, en píxeles de su foto. En colegios la nota "¿y en casa, cómo lo hablamos?" va sobre el telón de `assets/colegios-portada.jpg` (1536 × 1024).

## Para editar

Los colores y espaciados están como variables al inicio de `styles.css`.
Cambiar un valor ahí lo cambia en las cuatro páginas.
