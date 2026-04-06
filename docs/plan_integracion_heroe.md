# Plan profesional de integración del sistema HÉROE

## Objetivo
Integrar el sistema completo de ficha/sheet (HTML+CSS+JS) dentro del HUD actual, activándolo al pulsar el botón **HÉROE**, sin romper la navegación, estilos ni lógica existente.

## 40 sugerencias críticas para integrar el nuevo script en la sección HÉROE

1. No pegues el `<!DOCTYPE html>...` completo dentro de `index.html`; extrae solo el markup interno del panel para evitar doble documento.
2. Renderiza el nuevo sistema dentro de `#hud-center` cuando `state.activeSection === 'heroe'`.
3. Crea una función `renderHeroSection()` en `script.js` y llámala solo al cambiar a HÉROE.
4. Usa un contenedor raíz único (por ejemplo `.hero-sheet-root`) para encapsular estilos y reducir colisiones CSS.
5. Migra el `<style>` inline a `styles.css` por mantenimiento y caché.
6. Renombra clases genéricas del nuevo bloque (`.modal`, `.corner`, `.sheet`) con prefijo (`.hero-modal`, `.hero-corner`, `.hero-sheet`).
7. Evita IDs duplicados globales (`modalOverlay`, `spriteImage`, etc.) si coexistirán con otros módulos.
8. Separa la data (`charStats`, `SLOTS`) de la UI para poder sincronizarla con tu estado real.
9. Convierte `charStats` a una estructura derivada de `state` para evitar dos fuentes de verdad.
10. Valida `hpMax`, `chakraMax`, `expMax` antes de dividir para prevenir NaN/Infinity.
11. Clampa porcentajes de barras entre 0 y 100 antes de pintar anchuras.
12. Añade guardas de existencia DOM antes de `getElementById(...).innerHTML`.
13. Usa delegación de eventos para slots de equipo si los re-renderizas frecuentemente.
14. Evita recrear todo el grid en cada mejora; actualiza solo el slot afectado cuando sea posible.
15. Calcula costo y estadísticas con funciones puras testeables (`calcCost`, `calcStat`).
16. Define constantes para caps (`MAX_SLOT_LEVEL = 80`) y evita números mágicos.
17. Sincroniza la mejora con oro disponible antes de subir nivel de slot.
18. Si no alcanza oro, muestra feedback visual (toast/label) en lugar de silencio.
19. Persiste niveles de equipo en almacenamiento (localStorage o backend) al confirmar mejoras.
20. Añade `try/catch` solo en operaciones no determinísticas (persistencia/red), no en render básico.
21. Usa `textContent` para textos dinámicos y reduce `innerHTML` donde no necesites markup.
22. Sanitiza URLs de sprite si vendrán de usuario/backend.
23. Implementa fallback robusto de imagen: placeholder inicial, `onerror` y reset si URL cambia.
24. Mantén la estética actual con variables CSS existentes (`--teal`, `--amber`) para coherencia visual.
25. Si necesitas nuevas variables, decláralas en `:root` y documenta su propósito.
26. Respeta el layout móvil actual (`max-width: 480px`) adaptando el ancho del sheet.
27. Añade media queries para evitar overflow horizontal en pantallas bajas.
28. Mantén `aria-label`/roles en botones de slots y cierre modal para accesibilidad básica.
29. Permite cerrar modal con tecla Escape además de click en overlay.
30. Bloquea scroll de fondo solo cuando modal esté abierto.
31. Evita animaciones infinitas costosas en todos los elementos simultáneamente.
32. Reduce sombras blur intensas en móviles de gama baja para mejorar FPS.
33. Centraliza la tabla de rarezas en un mapa para facilitar balance futuro.
34. Internacionaliza labels fijos si planeas soporte multi-idioma.
35. Reutiliza el sistema de partículas actual solo en acciones clave (mejora exitosa), no en todo click.
36. Añade pruebas manuales por flujo: abrir HÉROE, abrir modal, mejorar, cerrar, reabrir.
37. Verifica memory leaks al alternar secciones muchas veces (listeners duplicados).
38. Implementa un `destroyHeroSection()` para desmontar listeners al salir de HÉROE.
39. Deja feature flag (`ENABLE_HERO_SHEET`) para activar/desactivar el módulo rápido.
40. Haz integración incremental: primero render estático, luego interacción, luego persistencia.

## 40 sugerencias del juego completo considerando la estructura actual

1. Conserva `index.html` como shell y mueve render de secciones al `script.js` para arquitectura modular.
2. Crea un router simple por sección (`renderSection(sectionKey)`) en lugar de solo overlay informativo.
3. Usa `state` como fuente única para barras, oro, estadísticas y sección activa.
4. Encapsula mutaciones de estado en funciones (`setState`, `updateResource`) para trazabilidad.
5. Implementa un sistema de eventos (pub/sub) ligero para desacoplar HUD de lógica de juego.
6. Separa configuración de secciones (`sections`) en un archivo independiente.
7. Homologa naming: actualmente mezclas español/inglés (`state`, `heroe`, `overlay`).
8. Añade un módulo de utilidades para formato numérico y porcentajes.
9. Evita texto hardcodeado de eventos temporales si no se actualiza automáticamente.
10. Incorpora timestamps de eventos para no mostrar promociones vencidas.
11. Incluye pruebas de regresión visual para HUD-top y HUD-bottom.
12. Crea tokens de diseño para tamaños (`--space-1`, `--space-2`) además de colores.
13. Unifica radios de borde para consistencia (`--radius-sm`, `--radius-md`).
14. Usa `prefers-reduced-motion` para usuarios sensibles a animaciones.
15. Optimiza partículas con límite máximo por frame para evitar sobrecarga.
16. Debounce en clicks rápidos de navegación para evitar spam de efectos.
17. Define un esquema de persistencia (localStorage/backend) para progreso de jugador.
18. Añade carga inicial desde persistencia antes de `updateBars()`.
19. Considera checksum o versión de datos guardados para migraciones futuras.
20. Implementa validaciones al cargar estado para evitar datos corruptos.
21. Crea un estado de “loading” al cambiar secciones complejas.
22. Añade logger de desarrollo desactivable por entorno (`DEV_MODE`).
23. Evita duplicar emojis como único identificador semántico de sección.
24. Añade tests unitarios para `updateBars` y cálculo de porcentajes.
25. Añade tests de interacción para navegación de botones y cierre de overlay.
26. Organiza CSS por bloques (`layout`, `components`, `effects`, `responsive`).
27. Considera CSS Layers (`@layer`) para controlar precedencia si crece el proyecto.
28. Evita selectores globales demasiado amplios cuando añadas nuevas pantallas.
29. Usa clases utilitarias para estados (`.is-active`, `.is-hidden`) en vez de inline styles.
30. Implementa control de foco al abrir/cerrar overlay para accesibilidad.
31. Añade soporte de teclado para navegar entre botones del menú.
32. Marca botones con `aria-pressed` cuando estén activos.
33. Revisa contraste en textos `--text-lo` para pantallas con brillo bajo.
34. Carga tipografías con estrategia de fallback para evitar FOIT.
35. Evalúa auto-host de fuentes si apuntas a rendimiento offline.
36. Versiona assets visuales críticos (sprites, iconos) con naming estable.
37. Mantén documentación corta por módulo (`README` por carpeta) a medida que escales.
38. Define convención de commits (feat/fix/chore) para historial claro.
39. Añade pipeline básico de lint/format para mantener consistencia de equipo.
40. Planifica separación futura en componentes (React/Vue o Web Components) si el HUD seguirá creciendo.

## Estrategia sugerida para cumplir exactamente tu punto 1 (mostrar todo al pulsar HÉROE)

1. Detectar click en botón HÉROE.
2. Limpiar `#hud-center`.
3. Inyectar estructura del Hero Sheet dentro de `#hud-center`.
4. Inicializar funciones del módulo (`updateVitalsUI`, `updateExtraStats`, `renderSlots`, `loadSprite`).
5. Al cambiar a otra sección, desmontar listeners del módulo y mostrar el panel correspondiente.

## Notas de implementación segura

- Mantén el módulo Hero aislado en archivo separado (`hero-sheet.js`) para minimizar riesgo de regresiones.
- Evita tocar la barra superior/inferior hasta estabilizar el módulo.
- Integra en 3 PRs pequeñas: estructura, estilo, lógica.
