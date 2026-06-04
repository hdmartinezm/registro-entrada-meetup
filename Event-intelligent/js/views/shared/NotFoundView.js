export const NotFoundView = {
    render() {
        return `
        <div class="view active" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 24px;">
            <i class="ph-fill ph-warning-circle" style="font-size: 80px; color: var(--color-danger); margin-bottom: 24px; filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.4));"></i>
            <h1 style="font-size: 32px; margin-bottom: 12px;">404</h1>
            <p class="subtitle" style="margin-bottom: 32px;">Parece que te has desviado del camino. Esta zona no está mapeada en nuestro sistema.</p>
            <button class="btn btn-primary" id="btn-404-home" style="width: 100%; max-width: 300px;">
                <i class="ph ph-house"></i> Volver al Inicio
            </button>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-404-home').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            router.navigate('auth'); // fallback a auth, el router ya protegerá y mandará a home/hub si está logueado
        });
    }
};
