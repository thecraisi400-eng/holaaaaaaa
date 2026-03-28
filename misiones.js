(() => {
  const misionesRango = Object.freeze({
    id: 'misiones-rango',
    titulo: '⚔️ MISIONES RANGO ⚔️',
    descripcion: 'Sistema cerrado de misiones por rango integrado en un contenedor aislado.'
  });

  window.MISIONES_DB = Object.freeze({
    misiones: [misionesRango],
    enemigos: []
  });

  window.getMisionesDisponibles = function getMisionesDisponibles() {
    return [...window.MISIONES_DB.misiones];
  };
})();
