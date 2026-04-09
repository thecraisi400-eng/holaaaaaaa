# Guía práctica: sistema de guardado en JavaScript para juegos

## 1) Define un **modelo único de guardado** (Save Schema)
Crea un objeto `saveData` con versión (`version`), progreso, inventario, ajustes y timestamp.
Esto evita inconsistencias y facilita migraciones futuras.

## 2) Guarda en **puntos críticos** y también en intervalos
Haz autosave al:
- completar misión,
- subir nivel,
- cambiar escena,
- pausar/salir.
Y añade un guardado cada 30–60 segundos como respaldo.

## 3) Implementa **doble slot + backup**
No sobrescribas un único archivo. Usa:
- `slotA` (actual),
- `slotB` (anterior estable),
- `backup` opcional.
Si falla la escritura, recupera desde el slot previo.

## 4) Usa guardado **atómico**
Primero escribe en una clave temporal (`save_temp`), valida, y luego promueve a `save_main`.
Así evitas archivos corruptos por cierre inesperado.

## 5) Añade **checksum/hash** para detectar corrupción
Guarda un hash del contenido (`SHA-256` por ejemplo). Al cargar, recalcula y compara.
Si no coincide, muestra recuperación de backup.

## 6) Versiona y migra datos
Incluye `version` en el save. Si cambias estructura en actualizaciones, aplica migradores:
`v1 -> v2 -> v3`, sin romper partidas viejas.

## 7) Valida siempre antes de guardar y antes de cargar
Valida tipos y rangos (vida no negativa, nivel válido, inventario con IDs existentes).
Nunca asumas que los datos están bien formados.

## 8) Diseña bien la opción **"CARGAR PARTIDA"**
En el menú de carga muestra:
- nombre del slot,
- tiempo jugado,
- fecha/hora del guardado,
- progreso principal,
- mini-resumen (misión actual, nivel, zona).
Y botones: `Cargar`, `Eliminar`, `Duplicar`.

## 9) Maneja salida de app y pérdida de foco
Escucha eventos web/móvil (`visibilitychange`, `pagehide`, `beforeunload`) para forzar autosave rápido.
En móvil híbrido (Cordova/Capacitor), también escucha pausa/reanudación (`pause`/`resume`).

## 10) Telemetría de errores y pruebas de estrés
Registra fallos de guardado/carga (sin datos sensibles) y prueba:
- cierre abrupto,
- batería baja,
- falta de espacio,
- app en segundo plano.
Esto reduce pérdidas reales en producción.

---

## Cómo implementar "CARGAR PARTIDA" (flujo recomendado)

1. Usuario abre `CARGAR PARTIDA`.
2. Cargas metadatos de slots (no todo el save aún).
3. Renderizas la lista con resumen de cada slot.
4. Al elegir slot, verificas integridad (hash + versión).
5. Si está bien, hidratas el estado del juego.
6. Si falla, propones recuperar backup.

## Base técnica sugerida
- Web simple: `localStorage` para prototipo.
- Producción: `IndexedDB` (mejor capacidad y fiabilidad).
- Híbrido móvil: almacenamiento local + sincronización opcional en la nube.

---

## Pantalla siempre encendida mientras juegan (móvil/web)

### Opción recomendada (Web): Screen Wake Lock API
- Solicita `navigator.wakeLock.request('screen')` al iniciar partida.
- Re-solicita al volver de segundo plano.
- Libera lock al pausar/salir para ahorrar batería.

### Fallback
- Si no hay compatibilidad, usa librería tipo `NoSleep.js` como alternativa.
- En apps nativas/híbridas, usa plugin específico de keep-awake (Capacitor/Cordova/React Native).

### UX importante
- Informa al usuario que aumentará consumo de batería.
- Agrega un toggle en Ajustes: `Mantener pantalla encendida`.

---

## Arquitectura mínima (resumen)

- `SaveService.js`: serializar, validar, guardar/cargar, backups.
- `SaveSchema.js`: estructura y validadores.
- `SaveMigrations.js`: migraciones por versión.
- `LoadMenuUI.js`: interfaz de slots.
- `WakeLockService.js`: controlar pantalla activa.
