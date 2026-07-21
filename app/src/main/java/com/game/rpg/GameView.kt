package com.game.rpg

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import kotlin.random.Random

class GameView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    // Colores
    private val bgDark = Color.parseColor("#141833")
    private val bgMedium = Color.parseColor("#1a1f38")
    private val bgDarker = Color.parseColor("#0b0d17")
    private val pathBrown = Color.parseColor("#8B6914")
    private val grassGreen = Color.parseColor("#2D5016")
    private val treeDark = Color.parseColor("#1a3a0f")
    private val treeLight = Color.parseColor("#3d6b1c")
    private val goldColor = Color.parseColor("#FFD700")
    private val diamondColor = Color.parseColor("#00CED1")
    private val powerOrange = Color.parseColor("#FF6B35")

    // Paints
    private val bgPaint = Paint()
    private val pathPaint = Paint()
    private val grassPaint = Paint()
    private val treePaint = Paint()
    private val textPaint = Paint()
    private val windowBgPaint = Paint()
    private val windowBorderPaint = Paint()

    // Personaje
    private var characterX = 50f
    private val characterY = 380f
    private val characterWidth = 48f
    private val characterHeight = 64f
    private var isWalking = true
    private var walkFrame = 0
    private var walkTimer = 0

    // Escenario - desplazamiento
    private var scrollOffset = 0f
    private val scrollSpeed = 2f

    // Árboles
    private data class Tree(val x: Float, val y: Float, val scale: Float, val isBig: Boolean)
    private val trees = mutableListOf<Tree>()

    // Enemigos
    private data class Enemy(var x: Float, var y: Float, val width: Float = 48f, val height: Float = 64f, var isActive: Boolean = false)
    private val enemies = mutableListOf<Enemy>()
    private var enemySpawnTimer = 0
    private var enemySpawnCounter = 0

    // Progreso
    private var currentWorld = 1
    private var currentStage = 0
    private val stagesPerWorld = 3
    private var enemiesDefeated = 0

    // Recursos
    private var gold = 100
    private var diamonds = 10
    private var power = 150
    private val characterName = "Héroe"

    init {
        initPaints()
        initTrees()
    }

    private fun initPaints() {
        bgPaint.color = bgDark

        pathPaint.color = pathBrown
        pathPaint.style = Paint.Style.FILL

        grassPaint.color = grassGreen
        grassPaint.style = Paint.Style.FILL

        treePaint.color = treeDark
        treePaint.style = Paint.Style.FILL

        textPaint.color = Color.WHITE
        textPaint.textSize = 14f
        textPaint.isAntiAlias = true
        textPaint.typeface = Typeface.DEFAULT_BOLD

        windowBgPaint.color = Color.parseColor("#3a3f5a")
        windowBgPaint.style = Paint.Style.FILL

        windowBorderPaint.color = powerOrange
        windowBorderPaint.style = Paint.Style.STROKE
        windowBorderPaint.strokeWidth = 4f
    }

    private fun initTrees() {
        trees.clear()
        val random = Random(42)
        
        // Árboles arriba del camino
        for (i in 0 until 15) {
            val x = random.nextInt(0, 800).toFloat()
            val y = random.nextInt(50, 200).toFloat()
            val isBig = random.nextFloat() > 0.5f
            val scale = if (isBig) 1.5f else 0.8f
            trees.add(Tree(x, y, scale, isBig))
        }

        // Árboles abajo del camino
        for (i in 0 until 15) {
            val x = random.nextInt(0, 800).toFloat()
            val y = random.nextInt(450, 480).toFloat()
            val isBig = random.nextFloat() > 0.5f
            val scale = if (isBig) 1.5f else 0.8f
            trees.add(Tree(x, y, scale, isBig))
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Fondo
        canvas.drawColor(bgDark)

        // Guardar estado para el scrolling
        canvas.save()
        canvas.translate(-scrollOffset, 0f)

        // Dibujar césped (arriba y abajo del camino)
        canvas.drawRect(0f, 0f, 1000f, 350f, grassPaint)
        canvas.drawRect(0f, 450f, 1000f, 480f, grassPaint)

        // Dibujar camino de tierra
        canvas.drawRect(0f, 350f, 1000f, 450f, pathPaint)

        // Detalles del camino (líneas decorativas)
        pathPaint.color = Color.parseColor("#6B4423")
        for (i in 0..20) {
            val lineX = i * 50f - (scrollOffset % 50f)
            canvas.drawLine(lineX, 395f, lineX + 30f, 395f, pathPaint)
            canvas.drawLine(lineX, 405f, lineX + 30f, 405f, pathPaint)
        }
        pathPaint.color = pathBrown

        // Dibujar árboles
        for (tree in trees) {
            drawTree(canvas, tree.x, tree.y, tree.scale, tree.isBig)
        }

        // Dibujar personaje
        drawCharacter(canvas, characterX, characterY)

        // Dibujar enemigos
        for (enemy in enemies) {
            if (enemy.isActive) {
                drawEnemy(canvas, enemy.x, enemy.y)
            }
        }

        canvas.restore()

        // Dibujar UI (no se desplaza)
        drawUI(canvas)
        drawProgressWindow(canvas)

        // Actualizar lógica
        update()

        // Invalidar para redibujar
        invalidate()
    }

    private fun drawTree(canvas: Canvas, x: Float, y: Float, scale: Float, isBig: Boolean) {
        val trunkWidth = if (isBig) 20f * scale else 10f * scale
        val trunkHeight = if (isBig) 50f * scale else 30f * scale
        val foliageRadius = if (isBig) 60f * scale else 35f * scale

        // Tronco
        treePaint.color = Color.parseColor("#5D4E37")
        canvas.drawRect(
            x - trunkWidth / 2,
            y + foliageRadius,
            x + trunkWidth / 2,
            y + foliageRadius + trunkHeight,
            treePaint
        )

        // Follaje - capa oscura
        treePaint.color = treeDark
        canvas.drawCircle(x, y, foliageRadius, treePaint)

        // Follaje - capa clara (highlight)
        treePaint.color = treeLight
        canvas.drawCircle(x - foliageRadius * 0.3f, y - foliageRadius * 0.3f, foliageRadius * 0.6f, treePaint)
    }

    private fun drawCharacter(canvas: Canvas, x: Float, y: Float) {
        // Cuerpo
        val bodyPaint = Paint()
        bodyPaint.color = Color.parseColor("#4A90D9")
        bodyPaint.style = Paint.Style.FILL
        canvas.drawRect(x, y + 20f, x + characterWidth, y + characterHeight - 8f, bodyPaint)

        // Cabeza
        val headPaint = Paint()
        headPaint.color = Color.parseColor("#FFD7A8")
        headPaint.style = Paint.Style.FILL
        canvas.drawCircle(x + characterWidth / 2, y + 12f, 14f, headPaint)

        // Piernas (animación simple)
        val legPaint = Paint()
        legPaint.color = Color.parseColor("#2C3E50")
        legPaint.style = Paint.Style.FILL

        val legOffset = if (walkFrame % 2 == 0) 0f else 3f
        canvas.drawRect(x + 8f - legOffset, y + characterHeight - 8f, x + 18f - legOffset, y + characterHeight + 4f, legPaint)
        canvas.drawRect(x + characterWidth - 18f + legOffset, y + characterHeight - 8f, x + characterWidth - 8f + legOffset, y + characterHeight + 4f, legPaint)

        // Brazos
        val armPaint = Paint()
        armPaint.color = Color.parseColor("#4A90D9")
        armPaint.style = Paint.Style.FILL
        canvas.drawRect(x - 4f, y + 22f, x + 6f, y + 38f, armPaint)
        canvas.drawRect(x + characterWidth - 6f, y + 22f, x + characterWidth + 4f, y + 38f, armPaint)
    }

    private fun drawEnemy(canvas: Canvas, x: Float, y: Float) {
        // Cuerpo enemigo
        val bodyPaint = Paint()
        bodyPaint.color = Color.parseColor("#8B0000")
        bodyPaint.style = Paint.Style.FILL
        canvas.drawRect(x, y + 20f, x + 48f, y + 64f - 8f, bodyPaint)

        // Cabeza enemiga
        val headPaint = Paint()
        headPaint.color = Color.parseColor("#4A4A4A")
        headPaint.style = Paint.Style.FILL
        canvas.drawCircle(x + 24f, y + 12f, 14f, headPaint)

        // Ojos rojos brillantes
        val eyePaint = Paint()
        eyePaint.color = Color.parseColor("#FF0000")
        eyePaint.style = Paint.Style.FILL
        canvas.drawCircle(x + 18f, y + 10f, 3f, eyePaint)
        canvas.drawCircle(x + 30f, y + 10f, 3f, eyePaint)

        // Piernas
        val legPaint = Paint()
        legPaint.color = Color.parseColor("#2C1810")
        legPaint.style = Paint.Style.FILL
        canvas.drawRect(x + 8f, y + 56f, x + 18f, y + 68f, legPaint)
        canvas.drawRect(x + 30f, y + 56f, x + 40f, y + 68f, legPaint)
    }

    private fun drawUI(canvas: Canvas) {
        // Indicador de Oro
        val goldText = "💰 $gold"
        textPaint.color = goldColor
        textPaint.textSize = 16f
        canvas.drawText(goldText, 15f, 30f, textPaint)

        // Indicador de Diamantes
        val diamondText = "💎 $diamonds"
        textPaint.color = diamondColor
        canvas.drawText(diamondText, 15f, 55f, textPaint)

        // Poder y Nombre
        val powerText = "$characterName - Poder: $power"
        textPaint.color = powerOrange
        textPaint.textSize = 18f
        canvas.drawText(powerText, width - textPaint.measureText(powerText) - 15f, 35f, textPaint)
    }

    private fun drawProgressWindow(canvas: Canvas) {
        val windowWidth = 180f
        val windowHeight = 70f
        val x = width / 2 - windowWidth / 2
        val y = 60f

        // Fondo de la ventana
        canvas.drawRoundRect(x, y, x + windowWidth, y + windowHeight, 12f, 12f, windowBgPaint)

        // Borde
        canvas.drawRoundRect(x, y, x + windowWidth, y + windowHeight, 12f, 12f, windowBorderPaint)

        // Texto
        textPaint.color = Color.WHITE
        textPaint.textSize = 14f
        val worldText = "Mundo $currentWorld"
        canvas.drawText(worldText, x + windowWidth / 2 - textPaint.measureText(worldText) / 2, y + 25f, textPaint)

        // Etapa actual
        textPaint.textSize = 12f
        val stageText = "Desafío ${currentStage + 1}/$stagesPerWorld"
        canvas.drawText(stageText, x + windowWidth / 2 - textPaint.measureText(stageText) / 2, y + 45f, textPaint)

        // Progreso visual (puntos)
        for (i in 0 until stagesPerWorld) {
            val dotX = x + 50f + i * 35f
            val dotY = y + 58f
            val paint = Paint()
            paint.style = Paint.Style.FILL
            paint.color = if (i < currentStage) powerOrange else Color.parseColor("#555555")
            canvas.drawCircle(dotX, dotY, 6f, paint)
        }
    }

    private fun update() {
        // Actualizar animación de caminata
        walkTimer++
        if (walkTimer > 10) {
            walkTimer = 0
            walkFrame++
        }

        // Mover personaje hasta la mitad
        val midpoint = width / 2f - characterWidth / 2
        if (characterX < midpoint && isWalking) {
            characterX += scrollSpeed
        }

        // Desplazar escenario cuando el personaje llega a la mitad
        if (characterX >= midpoint) {
            scrollOffset += scrollSpeed
            if (scrollOffset > 800f) {
                scrollOffset = 0f
            }
        }

        // Spawn de enemigos aleatorio
        enemySpawnTimer++
        if (enemySpawnTimer > 200 && enemies.count { it.isActive } < 3) {
            enemySpawnTimer = 0
            spawnEnemies()
        }

        // Mover enemigos hacia el personaje
        for (enemy in enemies) {
            if (enemy.isActive) {
                val targetX = characterX
                if (enemy.x > targetX + 100f) {
                    enemy.x -= 1.5f
                } else if (enemy.x < targetX - 100f) {
                    enemy.x += 1.5f
                }

                // Colisión simple (simulada - combate automático)
                if (Math.abs(enemy.x - characterX) < 50f) {
                    // Simular derrota del enemigo
                    enemy.isActive = false
                    enemiesDefeated++
                    gold += Random.nextInt(10, 30)
                    
                    // Actualizar progreso
                    currentStage = (currentStage + 1) % stagesPerWorld
                    if (currentStage == 0) {
                        currentWorld++
                        power += 20 // Aumentar poder al pasar de mundo
                    }
                }
            }
        }
    }

    private fun spawnEnemies() {
        val count = Random.nextInt(1, 4) // 1, 2 o 3 enemigos
        enemySpawnCounter = count

        for (i in 0 until count) {
            val side = if (Random.nextBoolean()) 0 else 1 // 0 = izquierda, 1 = derecha
            val x = if (side == 0) -60f else width.toFloat()
            val y = 380f + Random.nextInt(-20, 20)

            if (!enemies.any { it.isActive && Math.abs(it.x - x) < 100f }) {
                enemies.add(Enemy(x, y))
                enemies.last().isActive = true
            }
        }

        // Limpiar enemigos viejos
        enemies.removeAll { !it.isActive }
    }
}
