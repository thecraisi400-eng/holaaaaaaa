package com.game.rpg

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.TextView

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Configurar las ranuras de equipamiento con sus emojis y nombres
        setupEquipmentSlot(R.id.slotHP, "❤️", "HP")
        setupEquipmentSlot(R.id.slotAttack, "⚔️", "ATAQUE")
        setupEquipmentSlot(R.id.slotDefense, "🛡️", "DEFENSA")
        setupEquipmentSlot(R.id.slotAgility, "💨", "AGILIDAD")
        setupEquipmentSlot(R.id.slotCritic, "💥", "CRÍTICO")
        setupEquipmentSlot(R.id.slotSpeed, "👟", "VELOCIDAD")
        setupEquipmentSlot(R.id.slotEvasion, "🌀", "EVASIÓN")
        setupEquipmentSlot(R.id.slotRegen, "🔄", "REGENERACIÓN")

        // Configurar botones principales (no funcionales, solo visuales)
        setupMainButton(findViewById(R.id.btn_event))
        setupMainButton(findViewById(R.id.btn_dungeon))
        setupMainButton(findViewById(R.id.btn_battle))
        setupMainButton(findViewById(R.id.btn_hero))
        setupMainButton(findViewById(R.id.btn_clans))
        setupMainButton(findViewById(R.id.btn_shop))
    }

    private fun setupEquipmentSlot(slotId: Int, emoji: String, name: String) {
        val slotView = findViewById<android.view.View>(slotId)
        if (slotView != null) {
            val emojiText = slotView.findViewById<TextView>(R.id.slotEmoji)
            val nameText = slotView.findViewById<TextView>(R.id.slotName)
            
            emojiText?.text = emoji
            nameText?.text = name
        }
    }

    private fun setupMainButton(button: Button?) {
        button?.setOnClickListener {
            // Botones no funcionales según especificación
            // Solo elementos visuales
        }
    }
}
