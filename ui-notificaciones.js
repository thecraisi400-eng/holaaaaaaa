(function () {
    const CONTAINER_ID = 'notificaciones-centro';
    const STYLE_ID = 'notificaciones-centro-styles';

    function asegurarEstilos() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${CONTAINER_ID} {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                z-index: 9999;
                padding: 16px;
                box-sizing: border-box;
            }
            .notificacion-toast {
                min-width: min(90vw, 280px);
                max-width: min(92vw, 360px);
                padding: 14px 18px;
                border-radius: 16px;
                color: #ffffff;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96));
                border: 2px solid rgba(148, 163, 184, 0.45);
                box-shadow: 0 18px 48px rgba(15, 23, 42, 0.45);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 15px;
                font-weight: 700;
                text-align: center;
                letter-spacing: 0.2px;
                opacity: 0;
                transform: translateY(12px) scale(0.96);
                animation: notificacionCentroIn 0.24s ease-out forwards, notificacionCentroOut 0.3s ease-in forwards 2.3s;
            }
            .notificacion-toast.tipo-xp {
                background: linear-gradient(135deg, rgba(146, 64, 14, 0.97), rgba(251, 191, 36, 0.96));
                border-color: rgba(254, 243, 199, 0.9);
                color: #1f2937;
            }
            .notificacion-toast.tipo-oro {
                background: linear-gradient(135deg, rgba(133, 77, 14, 0.97), rgba(245, 158, 11, 0.96));
                border-color: rgba(253, 230, 138, 0.92);
                color: #1f2937;
            }
            .notificacion-toast.tipo-nivel {
                background: linear-gradient(135deg, rgba(91, 33, 182, 0.97), rgba(168, 85, 247, 0.96));
                border-color: rgba(221, 214, 254, 0.9);
            }
            .notificacion-toast.tipo-sistema {
                background: linear-gradient(135deg, rgba(22, 101, 52, 0.97), rgba(34, 197, 94, 0.96));
                border-color: rgba(187, 247, 208, 0.92);
                color: #052e16;
            }
            .notificacion-toast.tipo-arbol {
                background: linear-gradient(135deg, rgba(6, 95, 70, 0.97), rgba(16, 185, 129, 0.96));
                border-color: rgba(167, 243, 208, 0.92);
                color: #ecfdf5;
                font-size: 17px;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18), 0 18px 48px rgba(6, 95, 70, 0.45);
            }
            @keyframes notificacionCentroIn {
                from { opacity: 0; transform: translateY(12px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes notificacionCentroOut {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to { opacity: 0; transform: translateY(-10px) scale(0.98); }
            }
        `;
        document.head.appendChild(style);
    }

    function asegurarContenedor() {
        asegurarEstilos();
        let container = document.getElementById(CONTAINER_ID);
        if (container) return container;
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        document.body.appendChild(container);
        return container;
    }

    function mostrarNotificacion(mensaje, tipo) {
        if (!mensaje || tipo !== 'arbol') return;
        const container = asegurarContenedor();
        container.innerHTML = '';

        const toast = document.createElement('div');
        toast.className = 'notificacion-toast' + (tipo ? ` tipo-${tipo}` : '');
        toast.textContent = mensaje;
        container.appendChild(toast);

        window.clearTimeout(toast._cleanupTimeout);
        toast._cleanupTimeout = window.setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 2700);
    }

    window.mostrarNotificacion = mostrarNotificacion;
})();