package com.game.walkinghero;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Random;

public class MainActivity extends AppCompatActivity {
    
    private TextView playerPowerText;
    private TextView goldCountText;
    private TextView gemCountText;
    private TextView worldLevelText;
    private TextView stageProgressText;
    private TextView kunaiLevelText;
    
    private int gold = 0;
    private int gems = 0;
    private int worldLevel = 1;
    private int stageProgress = 0;
    private int kunaiLevel = 1;
    private int playerPower = 100;
    
    private Handler handler;
    private Runnable gameLoop;
    private Random random;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initViews();
        setupButtons();
        startGameLoop();
    }
    
    private void initViews() {
        playerPowerText = findViewById(R.id.player_power);
        goldCountText = findViewById(R.id.gold_count);
        gemCountText = findViewById(R.id.gem_count);
        worldLevelText = findViewById(R.id.world_level);
        stageProgressText = findViewById(R.id.stage_progress);
        kunaiLevelText = findViewById(R.id.kunai_level);
        
        random = new Random();
        handler = new Handler(Looper.getMainLooper());
        
        updateUI();
    }
    
    private void setupButtons() {
        Button btnEvent = findViewById(R.id.btn_event);
        Button btnDungeon = findViewById(R.id.btn_dungeon);
        Button btnBattle = findViewById(R.id.btn_battle);
        Button btnHero = findViewById(R.id.btn_hero);
        Button btnClans = findViewById(R.id.btn_clans);
        Button btnShop = findViewById(R.id.btn_shop);
        
        // Set click listeners (non-functional as per requirements - just visual)
        View.OnClickListener dummyListener = v -> {
            // Buttons are visual only, no functionality
        };
        
        btnEvent.setOnClickListener(dummyListener);
        btnDungeon.setOnClickListener(dummyListener);
        btnBattle.setOnClickListener(dummyListener);
        btnHero.setOnClickListener(dummyListener);
        btnClans.setOnClickListener(dummyListener);
        btnShop.setOnClickListener(dummyListener);
    }
    
    private void startGameLoop() {
        gameLoop = new Runnable() {
            @Override
            public void run() {
                updateGame();
                handler.postDelayed(this, 100);
            }
        };
        handler.post(gameLoop);
    }
    
    private void updateGame() {
        // Simulate defeating enemies and gaining rewards
        if (random.nextFloat() < 0.05f) {
            gold += random.nextInt(10) + 5;
            if (random.nextFloat() < 0.2f) {
                gems += random.nextInt(2) + 1;
            }
            stageProgress++;
            if (stageProgress >= 3) {
                stageProgress = 0;
                worldLevel++;
                playerPower += 50; // Increase power with world level
            }
            updateUI();
        }
    }
    
    private void updateUI() {
        playerPowerText.setText("Poder: " + playerPower);
        goldCountText.setText(String.valueOf(gold));
        gemCountText.setText(String.valueOf(gems));
        worldLevelText.setText("Mundo " + worldLevel);
        stageProgressText.setText("Desafío " + stageProgress + "/3");
        kunaiLevelText.setText(String.valueOf(kunaiLevel));
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (handler != null && gameLoop != null) {
            handler.removeCallbacks(gameLoop);
        }
    }
}
