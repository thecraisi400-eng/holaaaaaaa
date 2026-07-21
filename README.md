# Walking Hero - Android Game

## Descripción
Aplicación de juego para Android con dimensiones fijas de 393px x 817px, que presenta un personaje caminando por un camino de tierra en un bosque denso.

## Características Principales

### Sección Superior (480px)
- **Camino de tierra horizontal** con animación de desplazamiento
- **Personaje sprite** que camina automáticamente desde la izquierda hasta el centro
- **Bosque denso** con árboles grandes y pequeños de formas realistas
- **Enemigos** que aparecen aleatoriamente (1-3) y se mueven hacia el personaje
- **Indicadores UI:**
  - 💰 Oro actual
  - 💎 Monedas especiales
  - Poder del personaje y nombre
  - Contador de progreso por mundo (3 desafíos por mundo)

### Sección Inferior (337px)
- **8 ranuras de equipamiento** con emojis:
  - HP ❤️
  - ATAQUE ⚔️
  - DEFENSA 🛡️
  - AGILIDAD 💨
  - CRÍTICO 💥
  - VELOCIDAD 👟
  - EVASIÓN 🌀
  - REGENERACIÓN 🔄

- **Panel Kunai:**
  - Sprite de kunai realista
  - Nivel del kunai
  - Indicador "Auto"

- **6 botones principales:**
  - 🎉 EVENTO
  - 🏰 MAZMORRAS
  - ⚔️ BATALLA
  - 🦸 HÉROE
  - 👥 CLANES
  - 🛒 TIENDA

## Paleta de Colores
- Fondo principal: #141833
- Fondo secundario: #1a1f38
- Fondo oscuro: #0b0d17

## Estructura del Proyecto
```
app/
├── src/main/
│   ├── java/com/game/walkinghero/
│   │   ├── MainActivity.java
│   │   └── GameView.java
│   ├── res/
│   │   ├── layout/
│   │   │   ├── activity_main.xml
│   │   │   └── equipment_slot.xml
│   │   ├── drawable/
│   │   │   ├── kunai_icon.xml
│   │   │   ├── ui_panel_bg.xml
│   │   │   └── button_game_bg.xml
│   │   ├── values/
│   │   │   ├── colors.xml
│   │   │   ├── strings.xml
│   │   │   ├── styles.xml
│   │   │   └── themes.xml
│   │   └── mipmap-*/
│   │       └── ic_launcher.xml
│   └── AndroidManifest.xml
├── build.gradle
└── proguard-rules.pro
```

## Requisitos
- Android SDK 24+
- Android Studio Arctic Fox o superior

## Compilación
1. Abrir el proyecto en Android Studio
2. Sincronizar Gradle
3. Ejecutar en emulador o dispositivo físico

## Notas
- Los botones y ranuras de equipamiento son visuales (no funcionales según requerimientos)
- El movimiento del personaje y enemigos es automático
- El progreso de mundo se actualiza automáticamente al derrotar enemigos
