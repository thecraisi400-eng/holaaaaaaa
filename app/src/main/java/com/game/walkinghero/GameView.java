package com.game.walkinghero;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.view.View;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GameView extends View {
    private Paint paint;
    private Paint gradientPaint;
    private Paint textPaint;
    
    // Game state
    private float playerX;
    private float sceneryOffset;
    private boolean movingRight = true;
    private List<Tree> trees;
    private List<Enemy> enemies;
    private Random random;
    
    // Dimensions
    private int viewWidth;
    private int viewHeight;
    private float pathY;
    private float pathHeight;
    
    // Animation
    private long lastFrameTime;
    private float walkAnimation;
    
    public GameView(Context context) {
        super(context);
        init();
    }
    
    private void init() {
        paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        gradientPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setTypeface(Typeface.DEFAULT_BOLD);
        random = new Random();
        
        trees = new ArrayList<>();
        enemies = new ArrayList<>();
        playerX = 50;
        sceneryOffset = 0;
        
        generateTrees();
    }
    
    private void generateTrees() {
        trees.clear();
        // Generate trees along the path
        for (int i = 0; i < 20; i++) {
            float x = random.nextInt(viewWidth + 200) - 100;
            float y = 0;
            float size = 40 + random.nextFloat() * 60;
            TreeType type = random.nextBoolean() ? TreeType.LARGE : TreeType.SMALL;
            trees.add(new Tree(x, y, size, type));
        }
    }
    
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        viewWidth = w;
        viewHeight = h;
        pathHeight = h * 0.25f;
        pathY = h * 0.6f;
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        long currentTime = System.currentTimeMillis();
        float deltaTime = (currentTime - lastFrameTime) / 1000f;
        lastFrameTime = currentTime;
        
        update(deltaTime);
        render(canvas);
        
        invalidate();
    }
    
    private void update(float deltaTime) {
        // Update walk animation
        walkAnimation += deltaTime * 10;
        if (walkAnimation > Math.PI * 2) {
            walkAnimation -= Math.PI * 2;
        }
        
        // Move player to middle then scroll scenery
        if (playerX < viewWidth / 2) {
            playerX += 50 * deltaTime;
        } else {
            // Scroll scenery instead
            sceneryOffset += 50 * deltaTime;
            if (sceneryOffset > viewWidth) {
                sceneryOffset = 0;
            }
        }
        
        // Update trees position
        for (Tree tree : trees) {
            tree.x -= 50 * deltaTime;
            if (tree.x < -100) {
                tree.x = viewWidth + 100;
                tree.size = 40 + random.nextFloat() * 60;
                tree.type = random.nextBoolean() ? TreeType.LARGE : TreeType.SMALL;
            }
        }
        
        // Spawn enemies randomly
        if (enemies.isEmpty() && random.nextFloat() < 0.01f) {
            spawnEnemies();
        }
        
        // Update enemies
        for (int i = enemies.size() - 1; i >= 0; i--) {
            Enemy enemy = enemies.get(i);
            enemy.update(deltaTime, playerX);
            if (enemy.x < -50) {
                enemies.remove(i);
            }
        }
    }
    
    private void spawnEnemies() {
        int count = 1 + random.nextInt(3); // 1-3 enemies
        for (int i = 0; i < count; i++) {
            float x = viewWidth + i * 80;
            float y = pathY - 30;
            enemies.add(new Enemy(x, y));
        }
    }
    
    private void render(Canvas canvas) {
        // Draw sky gradient background
        LinearGradient skyGradient = new LinearGradient(
            0, 0, 0, viewHeight,
            Color.parseColor("#1a1f38"),
            Color.parseColor("#0b0d17"),
            Shader.TileMode.CLAMP
        );
        gradientPaint.setShader(skyGradient);
        canvas.drawRect(0, 0, viewWidth, viewHeight, gradientPaint);
        
        // Draw grass/terrain
        paint.setColor(Color.parseColor("#2D5016"));
        canvas.drawRect(0, pathY, viewWidth, viewHeight, paint);
        
        // Draw grass details
        paint.setColor(Color.parseColor("#3D6B1E"));
        for (int i = 0; i < viewWidth; i += 30) {
            float grassX = (i - sceneryOffset % 30 + viewWidth) % viewWidth;
            canvas.drawOval(grassX, pathY - 10, grassX + 20, pathY + 10, paint);
        }
        
        // Draw dirt path
        paint.setColor(Color.parseColor("#8B6914"));
        canvas.drawRect(0, pathY - pathHeight / 2, viewWidth, pathY + pathHeight / 2, paint);
        
        // Draw path details (lighter streaks)
        paint.setColor(Color.parseColor("#A08030"));
        for (int i = 0; i < viewWidth; i += 60) {
            float streakX = (i - sceneryOffset % 60 + viewWidth) % viewWidth;
            canvas.drawRect(streakX, pathY - pathHeight / 4, streakX + 40, pathY + pathHeight / 4, paint);
        }
        
        // Draw path edges
        paint.setColor(Color.parseColor("#6B5010"));
        canvas.drawRect(0, pathY - pathHeight / 2, viewWidth, pathY - pathHeight / 2 + 5, paint);
        canvas.drawRect(0, pathY + pathHeight / 2 - 5, viewWidth, pathY + pathHeight / 2, paint);
        
        // Draw trees (behind path)
        for (Tree tree : trees) {
            drawTree(canvas, tree);
        }
        
        // Draw enemies
        for (Enemy enemy : enemies) {
            drawEnemy(canvas, enemy);
        }
        
        // Draw player
        drawPlayer(canvas);
    }
    
    private void drawTree(Canvas canvas, Tree tree) {
        float x = tree.x;
        float y = pathY - pathHeight / 2;
        float size = tree.size;
        
        // Draw trunk
        paint.setColor(Color.parseColor("#4A3728"));
        float trunkWidth = size * 0.2f;
        float trunkHeight = size * 0.4f;
        canvas.drawRect(x - trunkWidth / 2, y - trunkHeight, 
                       x + trunkWidth / 2, y, paint);
        
        // Draw foliage (layers for depth)
        paint.setColor(Color.parseColor("#1E4D2B"));
        
        if (tree.type == TreeType.LARGE) {
            // Large tree - multiple layers
            Path leaves1 = new Path();
            leaves1.moveTo(x - size / 2, y - trunkHeight);
            leaves1.lineTo(x, y - trunkHeight - size);
            leaves1.lineTo(x + size / 2, y - trunkHeight);
            canvas.drawPath(leaves1, paint);
            
            paint.setColor(Color.parseColor("#2D6B3D"));
            Path leaves2 = new Path();
            leaves2.moveTo(x - size / 3, y - trunkHeight - size / 2);
            leaves2.lineTo(x, y - trunkHeight - size * 1.3f);
            leaves2.lineTo(x + size / 3, y - trunkHeight - size / 2);
            canvas.drawPath(leaves2, paint);
        } else {
            // Small tree - simple triangle
            Path leaves = new Path();
            leaves.moveTo(x - size / 3, y - trunkHeight);
            leaves.lineTo(x, y - trunkHeight - size * 0.6f);
            leaves.lineTo(x + size / 3, y - trunkHeight);
            canvas.drawPath(leaves, paint);
        }
    }
    
    private void drawPlayer(Canvas canvas) {
        float x = playerX;
        float y = pathY - pathHeight / 2;
        float size = 50;
        
        // Body
        paint.setColor(Color.parseColor("#4A90D9"));
        canvas.drawRect(x - size / 4, y - size / 2, x + size / 4, y, paint);
        
        // Head
        paint.setColor(Color.parseColor("#FFD5B4"));
        canvas.drawCircle(x, y - size / 2 - 10, 12, paint);
        
        // Legs (animated)
        paint.setColor(Color.parseColor("#2C3E50"));
        float legOffset = (float) Math.sin(walkAnimation) * 8;
        canvas.drawRect(x - size / 6 + legOffset, y, x - size / 6 + legOffset + 8, y + 25, paint);
        canvas.drawRect(x + size / 6 - legOffset, y, x + size / 6 - legOffset + 8, y + 25, paint);
        
        // Arms (animated)
        paint.setColor(Color.parseColor("#FFD5B4"));
        float armOffset = (float) Math.cos(walkAnimation) * 6;
        canvas.drawRect(x - size / 3, y - size / 3 + armOffset, 
                       x - size / 3 + 6, y - size / 6 + armOffset, paint);
        canvas.drawRect(x + size / 3 - 6, y - size / 3 - armOffset, 
                       x + size / 3, y - size / 6 - armOffset, paint);
        
        // Weapon (kunai)
        paint.setColor(Color.parseColor("#6B7280"));
        canvas.drawRect(x + size / 3, y - size / 4, x + size / 3 + 20, y - size / 4 + 4, paint);
    }
    
    private void drawEnemy(Canvas canvas, Enemy enemy) {
        float x = enemy.x;
        float y = enemy.y;
        float size = 45;
        
        // Enemy body (red/dark)
        paint.setColor(Color.parseColor("#8B0000"));
        canvas.drawRect(x - size / 3, y - size / 2, x + size / 3, y, paint);
        
        // Enemy head
        paint.setColor(Color.parseColor("#4A0000"));
        canvas.drawCircle(x, y - size / 2 - 8, 10, paint);
        
        // Glowing eyes
        paint.setColor(Color.parseColor("#FF0000"));
        canvas.drawCircle(x - 3, y - size / 2 - 10, 3, paint);
        canvas.drawCircle(x + 3, y - size / 2 - 10, 3, paint);
        
        // Legs
        paint.setColor(Color.parseColor("#2C1810"));
        canvas.drawRect(x - size / 4, y, x - size / 4 + 6, y + 20, paint);
        canvas.drawRect(x + size / 4 - 6, y, x + size / 4, y + 20, paint);
        
        // Arms reaching forward
        paint.setColor(Color.parseColor("#8B0000"));
        canvas.drawRect(x + size / 3, y - size / 4, x + size / 3 + 15, y - size / 4 + 6, paint);
    }
    
    // Inner classes
    private enum TreeType {
        LARGE, SMALL
    }
    
    private static class Tree {
        float x, y, size;
        TreeType type;
        
        Tree(float x, float y, float size, TreeType type) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.type = type;
        }
    }
    
    private static class Enemy {
        float x, y;
        float speed;
        
        Enemy(float x, float y) {
            this.x = x;
            this.y = y;
            this.speed = 30 + (float) (Math.random() * 20);
        }
        
        void update(float deltaTime, float playerX) {
            x -= speed * deltaTime;
        }
    }
}
