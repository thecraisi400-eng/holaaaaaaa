(() => {
  const STYLE_ID = 'arbol-ranks-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .arbol-host {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .arbol-shell {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .arbol-root {
        --ink:#0d1117; --panel:#131a26; --surface:#1c2740; --btn-bg:#162035; --overlay:rgba(8,12,20,0.88);
        --text:#c9d4e8; --dim:#3d5070; --accent:#3fa8ff; --rc:#3fa8ff;
        width: min(100%, 355px);
        height: min(100%, 500px);
        min-height: 0;
        background: transparent;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(63,168,255,.12);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        font-family: 'Courier New', Courier, monospace;
      }
      .arbol-root *, .arbol-root *::before, .arbol-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
      .arbol-root #hdr { flex-shrink:0; width:100%; height:36px; background:var(--panel); border-bottom:1px solid rgba(63,168,255,.08); display:flex; align-items:center; justify-content:space-between; padding:0 8px; }
      .arbol-root #pts-wrap{display:flex;align-items:center;gap:5px;} .arbol-root #pts-lbl{font-size:7px;color:var(--dim);text-transform:uppercase;letter-spacing:1.2px;} .arbol-root #pts-val{font-size:14px;font-weight:900;color:var(--accent);letter-spacing:2px;min-width:42px;text-align:right;transition:color .3s;}
      .arbol-root #pts-val.flash{animation:ptFlash .5s ease-out;} @keyframes ptFlash{0%{color:#ffd700;transform:scale(1.25);}100%{color:var(--accent);transform:scale(1);}}
      .arbol-root #timeline{display:flex;gap:4px;align-items:center;} .arbol-root .rpip{width:26px;height:26px;border-radius:50%;background:var(--btn-bg);border:1.5px solid var(--dim);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--dim);cursor:pointer;transition:all .25s;position:relative;user-select:none;}
      .arbol-root .rpip.done{border-color:#ffd700;color:#ffd700;background:rgba(255,215,0,.08);} .arbol-root .rpip.done::after{content:'✓';position:absolute;top:-4px;right:-3px;font-size:7px;color:#ffd700;background:var(--panel);border-radius:50%;width:11px;height:11px;line-height:11px;text-align:center;}
      .arbol-root .rpip.cur{border-color:var(--rc);color:var(--rc);background:rgba(63,168,255,.1);box-shadow:0 0 8px var(--rc);animation:pipPulse 2s ease-in-out infinite;} @keyframes pipPulse{0%,100%{box-shadow:0 0 6px var(--rc);}50%{box-shadow:0 0 16px var(--rc);}}
      .arbol-root .rpip.future{opacity:.35;cursor:not-allowed;} .arbol-root .rpip.future::before{content:'🔒';font-size:7px;position:absolute;bottom:-2px;right:-2px;}
      .arbol-root #body{flex:1;width:100%;display:flex;overflow:hidden;min-height:0;} .arbol-root #stats{flex-shrink:0;width:82px;height:100%;background:var(--panel);border-right:1px solid rgba(63,168,255,.07);padding:5px 4px;display:flex;flex-direction:column;gap:3px;}
      .arbol-root .stats-hd{font-size:6px;color:var(--dim);text-transform:uppercase;letter-spacing:1px;text-align:center;padding-bottom:3px;border-bottom:1px solid rgba(63,168,255,.08);margin-bottom:2px;} .arbol-root .sr{display:flex;align-items:center;background:var(--surface);border-radius:3px;padding:3px 4px;border:1px solid rgba(63,168,255,.05);gap:2px;}
      .arbol-root .si{font-size:10px;width:14px;text-align:center;flex-shrink:0;filter:drop-shadow(0 0 1px rgba(63,168,255,.3));} .arbol-root .sn{font-size:5.5px;color:var(--dim);flex:1;padding-left:2px;font-weight:600;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .arbol-root .sv{font-size:7px;font-weight:700;color:var(--text);min-width:26px;text-align:right;flex-shrink:0;transition:color .3s;}
      .arbol-root .sv.up{animation:statUp .65s ease-out;} @keyframes statUp{0%{color:#ffd700;transform:scale(1.2);}50%{color:#00ff88;}100%{color:var(--text);transform:scale(1);}} .arbol-root .sdiv{height:1px;background:rgba(63,168,255,.05);flex-shrink:0;margin:2px 0;}
      .arbol-root .stot{margin-top:auto;flex-shrink:0;background:rgba(63,168,255,.05);border:1px solid rgba(63,168,255,.1);border-radius:3px;padding:4px 2px;text-align:center;} .arbol-root .stot-lbl{font-size:5px;color:var(--dim);text-transform:uppercase;letter-spacing:.8px;} .arbol-root .stot-v{font-size:10px;font-weight:900;color:var(--accent);margin-top:2px;}
      .arbol-root #rp{flex:1;height:100%;display:flex;flex-direction:column;padding:6px;gap:5px;background:transparent;min-width:0;min-height:0;} .arbol-root #rk-hdr{flex-shrink:0;height:42px;background:var(--panel);border-radius:6px;padding:5px 8px;border:1px solid rgba(63,168,255,.08);display:flex;flex-direction:column;justify-content:center;}
      .arbol-root #rk-row{display:flex;align-items:center;gap:7px;} .arbol-root #rk-badge{font-size:12px;font-weight:900;color:var(--rc);text-shadow:0 0 8px var(--rc);letter-spacing:.5px;transition:color .3s,text-shadow .3s;} .arbol-root #rk-name{font-size:9px;color:var(--text);text-transform:uppercase;letter-spacing:1px;} .arbol-root #rk-lore{font-size:6.5px;color:var(--dim);font-style:italic;margin-top:2px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .arbol-root #cnst{flex:1;background:var(--panel);border-radius:6px;border:1px solid rgba(63,168,255,.08);position:relative;overflow:hidden;min-height:0;} .arbol-root #cnst-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;}
      .arbol-root .nw{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;z-index:2;} .arbol-root .nd{width:40px;height:40px;border-radius:50%;background:var(--btn-bg);border:2px solid var(--dim);display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;transition:all .3s;}
      .arbol-root .nd .emoji-color{filter:grayscale(1) brightness(.3);transition:all .3s ease;} .arbol-root .nd.act .emoji-color{filter:grayscale(0) brightness(1);} .arbol-root .nd.lck .emoji-color{filter:grayscale(1) brightness(.2);opacity:.6;} .arbol-root .nd.sil .emoji-color{filter:grayscale(1) brightness(.15);opacity:.3;} .arbol-root .nd.avl .emoji-color{filter:grayscale(.7) brightness(.5);transition:all .2s;} .arbol-root .nd.avl:hover .emoji-color{filter:grayscale(0) brightness(1);}
      .arbol-root .nd.lck{opacity:.85;filter:none;cursor:not-allowed;} .arbol-root .nd.sil{opacity:.7;filter:none;cursor:not-allowed;border-color:rgba(80,80,80,.3);} .arbol-root .nd.sil::after{content:'⛓';position:absolute;font-size:9px;bottom:-3px;right:-3px;opacity:.6;}
      .arbol-root .nd.avl{border-color:var(--rc);cursor:pointer;animation:nGlow 1.5s ease-in-out infinite;} @keyframes nGlow{0%,100%{box-shadow:0 0 7px var(--rc),inset 0 0 5px rgba(63,168,255,.1);}50%{box-shadow:0 0 18px var(--rc),inset 0 0 10px rgba(63,168,255,.2);}}
      .arbol-root .nd.act{background:var(--surface);border-color:var(--rc);box-shadow:0 0 22px var(--rc);} .arbol-root .nlbl{font-size:5.5px;color:var(--dim);text-transform:uppercase;margin-top:2px;letter-spacing:.5px;}
      .arbol-root .ntt{display:none;position:absolute;background:var(--overlay);border:1px solid rgba(63,168,255,.3);border-radius:5px;padding:5px 7px;width:96px;z-index:10;pointer-events:none;top:50%;transform:translateY(-50%);left:46px;} .arbol-root .nw:hover .ntt{display:block;} .arbol-root .ntt-t{font-size:8px;color:var(--accent);font-weight:700;margin-bottom:2px;} .arbol-root .ntt-b{font-size:6.5px;color:var(--dim);} .arbol-root .ntt-a{font-size:6.5px;color:#00ff88;font-weight:700;}
      .arbol-root #rbonus{flex-shrink:0;height:52px;background:var(--surface);border-radius:6px;border:1px solid rgba(63,168,255,.1);padding:5px 8px;display:flex;align-items:center;gap:8px;position:relative;overflow:hidden;} .arbol-root #rbonus.lck::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.52);backdrop-filter:blur(1.5px);border-radius:6px;z-index:1;} .arbol-root #rbonus.lck #blck{display:flex;}
      .arbol-root #blck{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;z-index:2;flex-direction:column;align-items:center;gap:1px;} .arbol-root #blck span{font-size:5.5px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;} .arbol-root #bic{font-size:22px;flex-shrink:0;z-index:0;} .arbol-root .bi{flex:1;z-index:0;} .arbol-root .bi-lbl{font-size:6.5px;color:var(--dim);text-transform:uppercase;letter-spacing:1px;} .arbol-root .bi-t{font-size:9px;color:var(--rc);font-weight:700;margin:1px 0;transition:color .3s;} .arbol-root .bi-d{font-size:6.5px;color:var(--dim);line-height:1.3;} .arbol-root #bbar{position:absolute;bottom:0;left:0;height:2px;background:var(--rc);transition:width .4s ease,background .3s;box-shadow:0 0 5px var(--rc);}
      .arbol-root #syn{flex-shrink:0;height:28px;background:var(--panel);border-radius:5px;border:1px solid rgba(63,168,255,.07);padding:0 8px;display:flex;align-items:center;gap:4px;} .arbol-root .syn-lbl{font-size:6px;color:var(--dim);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;} .arbol-root .syn-segs{display:flex;gap:3px;flex:1;} .arbol-root .sseg{flex:1;height:10px;background:var(--btn-bg);border-radius:2px;border:1px solid rgba(63,168,255,.08);transition:all .35s;} .arbol-root .sseg.on{background:var(--rc);box-shadow:0 0 6px var(--rc);} .arbol-root .syn-cnt{font-size:8px;color:var(--text);font-weight:700;min-width:22px;text-align:right;}
      .arbol-root #bot{flex-shrink:0;width:100%;height:34px;background:var(--panel);border-top:1px solid rgba(63,168,255,.07);display:flex;align-items:center;justify-content:space-between;padding:0 10px;}
      .arbol-root #add-btn{background:var(--btn-bg);border:1px solid rgba(63,168,255,.2);color:var(--accent);font-size:7.5px;font-family:inherit;padding:4px 10px;border-radius:4px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;transition:all .2s;} .arbol-root #add-btn:hover{background:rgba(63,168,255,.14);border-color:var(--accent);box-shadow:0 0 8px rgba(63,168,255,.3);} .arbol-root #status-txt{font-size:6.5px;color:var(--dim);text-transform:uppercase;letter-spacing:.8px;}
      .arbol-root #asc-ov{display:none;position:absolute;inset:0;background:var(--overlay);z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:10px;} .arbol-root #asc-ov.show{display:flex;animation:fadeIn .35s ease;} @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      .arbol-root .asc-em{font-size:52px;animation:spinIn .7s ease-out;} @keyframes spinIn{from{transform:rotate(-180deg) scale(0);opacity:0}to{transform:rotate(0deg) scale(1);opacity:1}}
      .arbol-root .asc-ttl{font-size:16px;font-weight:900;color:var(--rc);text-shadow:0 0 18px var(--rc),0 0 40px var(--rc);text-transform:uppercase;letter-spacing:3px;animation:ascPulse .6s alternate infinite;} @keyframes ascPulse{from{text-shadow:0 0 10px var(--rc);}to{text-shadow:0 0 30px var(--rc),0 0 70px var(--rc);}}
      .arbol-root .asc-sub{font-size:8px;color:var(--dim);text-transform:uppercase;letter-spacing:2px;}
    `;
    document.head.appendChild(style);
  }

  function createArbolMarkup() {
    return `
      <div class="arbol-host">
        <div class="arbol-shell" id="arbol-shell">
          <div class="arbol-root" id="gp">
            <div id="hdr">
              <div id="pts-wrap"><span id="pts-lbl">PC</span><span id="pts-val">0000</span></div>
              <div id="timeline">
                <div class="rpip" data-r="0">D</div><div class="rpip" data-r="1">C</div><div class="rpip" data-r="2">B</div><div class="rpip" data-r="3">A</div><div class="rpip" data-r="4">S</div>
              </div>
            </div>
            <div id="body">
              <div id="stats">
                <div class="stats-hd">⚡ ESTADÍSTICAS ⚡</div>
                <div class="sr"><span class="si">💖</span><span class="sn">VIDA</span><span class="sv" id="v-hp">500</span></div>
                <div class="sr"><span class="si">🗡️</span><span class="sn">FUERZA</span><span class="sv" id="v-atk">120</span></div>
                <div class="sr"><span class="si">🛡️</span><span class="sn">DEF</span><span class="sv" id="v-def">80</span></div>
                <div class="sr"><span class="si">🌪️</span><span class="sn">AGIL</span><span class="sv" id="v-spd">95</span></div>
                <div class="sr"><span class="si">🎯</span><span class="sn">CRIT</span><span class="sv" id="v-crit">15</span></div>
                <div class="sdiv"></div>
                <div class="sr"><span class="si">🌀</span><span class="sn">CHAKRA</span><span class="sv" id="v-chk">200</span></div>
                <div class="sr"><span class="si">⚡</span><span class="sn">PODER</span><span class="sv" id="v-pwr">310</span></div>
                <div class="stot"><div class="stot-lbl">💪 PODER TOTAL</div><div class="stot-v" id="v-tot">1320</div></div>
              </div>
              <div id="rp">
                <div id="rk-hdr"><div id="rk-row"><span id="rk-badge">RANGO-D</span><span id="rk-name">Genin</span></div><div id="rk-lore">Tu chakra apenas despierta. Cada batalla forja el camino.</div></div>
                <div id="cnst"><svg id="cnst-svg" xmlns="http://www.w3.org/2000/svg"></svg></div>
                <div id="rbonus" class="lck"><div id="blck">🔒<span>Completa el Rango</span></div><span id="bic">🌱</span><div class="bi"><div class="bi-lbl">Bono de Rango</div><div class="bi-t" id="bt">Chakra Despierto</div><div class="bi-d" id="bd">+10% a todos los stats pasivos</div></div><div id="bbar" style="width:0%"></div></div>
                <div id="syn"><span class="syn-lbl">✨ SINTONÍA ✨</span><div class="syn-segs"><div class="sseg" id="ss0"></div><div class="sseg" id="ss1"></div><div class="sseg" id="ss2"></div><div class="sseg" id="ss3"></div><div class="sseg" id="ss4"></div></div><span class="syn-cnt" id="syn-cnt">0/5</span></div>
              </div>
            </div>
            <div id="bot"><button id="add-btn">⚡ Ganar PC</button><span id="status-txt">Sistema de Rango Activo</span></div>
            <div id="asc-ov"><div class="asc-em" id="asc-em">⭐</div><div class="asc-ttl" id="asc-ttl">RANGO COMPLETADO</div><div class="asc-sub" id="asc-sub">Ascendiendo…</div></div>
          </div>
        </div>
      </div>
    `;
  }

  function mountArbolUI({ container }) {
    ensureStyle();
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend', createArbolMarkup());

    const root = container.querySelector('.arbol-root');
    const logic = window.createRanksLogic({ root });

    const listeners = [];
    const on = (el, event, handler, options) => {
      el.addEventListener(event, handler, options);
      listeners.push(() => el.removeEventListener(event, handler, options));
    };

    root.querySelectorAll('.rpip').forEach((pip) => {
      const handler = () => logic.viewRank(Number(pip.dataset.r));
      on(pip, 'click', handler);
    });

    const addBtn = root.querySelector('#add-btn');
    on(addBtn, 'click', logic.addPoints);

    const resizeHandler = () => logic.render();
    on(window, 'resize', resizeHandler);

    logic.init();

    return {
      destroy() {
        while (listeners.length) {
          const off = listeners.pop();
          off();
        }
        container.replaceChildren();
      }
    };
  }

  window.mountArbolUI = mountArbolUI;
})();
