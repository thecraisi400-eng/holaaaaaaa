(() => {
  const missionsData = {
    D: [
      { name: "Eliminar lobos hambrientos", xp: 3, gold: 4, hp: 65, atk: 5, def: 2, lvl: 1 },
      { name: "Recuperar suministros robados por goblins", xp: 5, gold: 8, hp: 110, atk: 9, def: 4, lvl: 3 },
      { name: "Proteger la aldea de jabalíes", xp: 8, gold: 12, hp: 165, atk: 14, def: 7, lvl: 5 },
      { name: "Investigar ruinas infestadas de ratas gigantes", xp: 11, gold: 16, hp: 220, atk: 20, def: 10, lvl: 7 },
      { name: "Escoltar a un mercader (bandido)", xp: 15, gold: 18, hp: 280, atk: 27, def: 14, lvl: 9 },
      { name: "Cazar una bestia nocturna", xp: 20, gold: 20, hp: 380, atk: 38, def: 19, lvl: 12 }
    ],
    C: [
      { name: "Limpiar una mina de murciélagos vampíricos", xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
      { name: "Derrotar a un grupo de orcos merodeadores", xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
      { name: "Rescatar a un rehén de los bandidos", xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
      { name: "Eliminar una amenaza de lobos de las nieves", xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
      { name: "Recuperar un artefacto custodiado por esqueletos", xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
      { name: "Acabar con un troll de las colinas", xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 }
    ],
    B: [
      { name: "Exterminar una colonia de arácnidos gigantes", xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
      { name: "Detener a un invoca demonios menores", xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
      { name: "Proteger una Ciudad de ataque de grifos salvajes", xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
      { name: "Investigar desapariciones en un bosque encantado", xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
      { name: "Derrotar a un caballero oscuro errante", xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
      { name: "Asaltar una fortaleza de ogros", xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 }
    ],
    A: [
      { name: "Eliminar a un dragón joven", xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
      { name: "Infiltrarse en una base de asesinos", xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
      { name: "Proteger una ciudad de un ataque", xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
      { name: "Recuperar un tesoro de una tumba maldita", xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
      { name: "Derrotar a un guerrero legendario", xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
      { name: "Acabar con un demonio de las sombras", xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 }
    ],
    S: [
      { name: "Enfrentar a un dragón adulto", xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
      { name: "Derrotar a un señor demonio menor", xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
      { name: "Salvar el reino de un lich", xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
      { name: "Enfrentar a un titán antiguo", xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
      { name: "Combatir a un dios olvidado", xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
      { name: "Derrotar al dragón anciano", xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 }
    ]
  };

  window.MISIONES_RANGO_DATA = Object.freeze(missionsData);
})();
