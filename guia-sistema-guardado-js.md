# Guía avanzada: sistema de guardado `.js` para no perder progreso en tu juego Ninja Idle

Esta guía está aterrizada a **tu juego actual** (estado global, héroe/equipo, misiones, slots, menú `CARGAR PARTIDA` y `wake lock`).

---

## 15 sugerencias clave para un guardado sólido (sin pérdida de datos)

## 1) Centraliza todo en un `SaveSchema` único y versionado
Usa una estructura con `version`, `timestamp`, `summary` y `state` para evitar datos sueltos.

**En tu caso debe incluir mínimo:**
- Identidad: `characterId`, `character`, `characterSprite`, `clan`, `clanName`.
- Progreso: `level`, `rank`, `exp`, `expCurrentLevelStart`, `expMax`.
- Recursos: `gold`, `hp`, `hpMax`, `mp`, `mpMax`.
- Combate: `atk`, `def`, `activeSection`.
- Visual/UI: `characterVisual`.
- Equipo: niveles de `weapon1`, `weapon2`, `head`, `chest`, `gloves`, `boots`.
- Misión actual: `rank`, `missionIndex`, `enemySnapshot`, `progressPct`, `autoMode`.
- Opciones: `keepAwakeEnabled`, audio, etc.

> Regla: todo lo que “sume o reste” (oro, HP, MP, EXP, niveles de equipo, progreso de misión) debe tener un campo explícito.

## 2) Persiste cambios por eventos, no solo por tiempo
Además del autosave cada 20–60s, guarda inmediatamente cuando ocurra:
- recompensa de misión (`+xp`, `+gold`),
- daño/curación (`-hp/+hp`, `-mp/+mp`),
- mejora de equipo (`-gold`, `slot.level++`),
- cambio de personaje/clan,
- cambio importante de pantalla (`activeSection`).

## 3) Mantén guardado atómico (`temp -> validate -> main`)
Tu flujo correcto es:
1. Escribir en `slot_temp`.
2. Validar checksum + schema.
3. Mover a `slot_main`.
4. Guardar backup de la versión anterior.

Con esto evitas corrupción por cierre súbito.

## 4) Usa doble respaldo por slot
Por slot, guarda:
- `main`,
- `backup`,
- `temp`.

Si falla `main`, cargas `backup` automáticamente y marcas `recoveredFromBackup=true` para mostrar aviso al jugador.

## 5) Valida rangos para evitar estados imposibles
Antes de guardar y cargar:
- `gold >= 0`,
- `hp` entre `0..hpMax`,
- `mp` entre `0..mpMax`,
- `level >= 1`,
- `slot.level` de equipo entre `1..80`.

Así previenes errores silenciosos por datos corruptos o edición manual.

## 6) Guarda también el estado derivado del héroe/equipo
Tu daño real depende del héroe base + bonos de equipo. Por eso conviene persistir:
- `baseHero` (o datos suficientes para reconstruirlo),
- `equipmentBonuses` o al menos niveles de slots,
- snapshot final (`stats`) para restaurar UI rápido.

## 7) Evita depender solo de `summary`; guarda estado completo
`summary` (nombre, nivel, fecha) es ideal para listar slots, pero **no** basta para restaurar partida completa.

`summary` = vista de menú.
`state` = verdad completa del juego.

## 8) Migra partidas antiguas por versión
Cuando cambies estructura (`v1 -> v2`):
- detecta `payload.version`,
- aplica migrador,
- vuelve a guardar en nueva versión.

Nunca rompas slots viejos.

## 9) Implementa cola de guardado (anti-race condition)
Si guardas muy seguido (eventos + autosave), evita escrituras simultáneas:
- `saveInFlight` boolean,
- `pendingSave` flag para reintentar justo al terminar,
- `debounce` corto (300–800 ms) para ráfagas de cambios.

## 10) Crea un “snapshot de salida” en eventos críticos del navegador
Dispara `saveNow('exit')` en:
- `visibilitychange` (cuando pasa a hidden),
- `pagehide`,
- `beforeunload`.

En móvil esto reduce muchísimo pérdida al minimizar/cerrar app.

## 11) Añade una bandera `isBattleActive` + `battleSeed`
Si cierran en plena misión/batalla, debes restaurar coherencia:
- si `isBattleActive=true`, decide si reanudas batalla o vuelves al lobby de misión,
- usa `battleSeed` para reconstrucción determinista del enemigo/progreso.

## 12) Incluye trazabilidad mínima de errores de guardado
Guarda en memoria/local un log ligero:
- `lastSaveStatus`, `lastSaveAt`, `lastSaveReason`, `lastSaveError`.

Te ayuda a depurar reportes reales de jugadores.

## 13) “CARGAR PARTIDA”: muestra datos ricos y validados
En cada tarjeta de slot muestra:
- personaje, clan, rango, nivel,
- oro, HP/MP, misión actual,
- fecha/hora,
- badge: `integridad OK` o `reparado desde backup`.

Si checksum falla y no hay backup: deshabilitar cargar y ofrecer eliminar slot dañado.

## 14) “CARGAR PARTIDA”: hidrata en orden seguro
Orden recomendado al cargar:
1. identidad del personaje,
2. snapshot de héroe + equipo,
3. recursos/atributos globales,
4. estado de misión/batalla,
5. `activeSection` y UI,
6. `wakeLock`/opciones.

Así evitas pantallas con datos cruzados.

## 15) Pruebas de resistencia obligatorias (checklist real)
Antes de darlo por terminado, prueba:
- cerrar pestaña durante recompensa,
- recargar durante upgrade de equipo,
- perder foco y volver,
- cargar slot viejo en versión nueva,
- corrupción forzada de un slot,
- almacenamiento casi lleno.

Si todas pasan, tu riesgo de pérdida cae drásticamente.

---

## Cómo integrarlo en tu opción `CARGAR PARTIDA`

### A) Datos para tarjetas del modal
A partir de tus slots (`listSlots`) agrega en `summary`:
- `gold`, `hp`, `mp`,
- `currentMission` (`rank + misión`),
- `lastSection`,
- `integrityStatus` (`ok`, `backup-restored`, `corrupted`).

### B) Flujo UX recomendado
1. Abrir modal.
2. Render de slots con metadatos (sin cargar estado completo todavía).
3. Al pulsar **Cargar**:
   - validar checksum,
   - migrar si versión vieja,
   - hidratar estado en orden seguro,
   - cerrar modal y entrar al juego.
4. Mostrar toast:
   - "Partida cargada" o
   - "Partida recuperada desde backup".

### C) Botones extra útiles
Además de `Cargar` y `Eliminar`:
- `Duplicar slot`,
- `Exportar backup` (JSON),
- `Importar backup`.

---

## Mantener pantalla encendida (móvil) sin apagar durante partida

Tu enfoque ideal ya es correcto: **Screen Wake Lock API** + toggle de usuario.

### Implementación recomendada
- Activa wake lock solo cuando:
  - el usuario lo habilite en opciones,
  - esté en partida (no en menús estáticos).
- Re-solicita en `visibilitychange` al volver a `visible`.
- Libera wake lock al salir de partida/pausar.

### Buenas prácticas
- Guarda la preferencia (`keepAwakeEnabled`) en el save y en `localStorage`.
- Muestra aviso de batería: “Mantener pantalla encendida consume más energía”.
- Si no hay soporte (`!navigator.wakeLock`), usa fallback (`NoSleep.js`) o plugin nativo según contenedor móvil.

---

## Mini-plan de implementación (rápido)

1. **Expandir schema** con estado global + héroe + equipo + misión + opciones.
2. **Hookear eventos** de suma/resta (oro/HP/MP/EXP/equipo/misión) a `queueSave`.
3. **Fortalecer `CARGAR PARTIDA`** con validación, migración y badges de integridad.
4. **Conectar Wake Lock** al toggle y al ciclo de partida (activar/desactivar por contexto).
5. **Pasar checklist de pruebas** de cierre brusco, corrupción y recuperación.

Si quieres, en el siguiente paso te puedo dejar **el código exacto** para integrarlo archivo por archivo (`save-system.js`, `ninja-game-start.js`, `hero-system.js`, `mission-system.js` y `wake-lock-service.js`) sin romper tu lógica actual.
