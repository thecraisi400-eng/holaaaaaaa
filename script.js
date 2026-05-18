/* Parte 1/7: archivo orquestador */
(function loadScriptPartsSequentially() {
  const files = [
    'script-part2.js',
    'script-part3.js',
    'script-part4.js',
    'script-part5.js',
    'script-part6.js',
    'script-part7.js'
  ];

  const loadNext = (i) => {
    if (i >= files.length) return;
    const s = document.createElement('script');
    s.src = files[i];
    s.onload = () => loadNext(i + 1);
    document.body.appendChild(s);
  };

  loadNext(0);
})();
