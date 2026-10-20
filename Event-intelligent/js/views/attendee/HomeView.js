import { ThreeAvatar } from '../../utils/ThreeAvatar.js';

export const HomeView = {
    avatar: null,

    render() {
        return `
        <main class="app-content">
            <header class="app-header text-center" style="margin-bottom: 16px; position: relative;">
                <button id="btn-settings" style="position: absolute; right: 16px; top: 16px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">
                    <i class="ph ph-gear"></i>
                </button>
                <h1>¡Hola, Builder!</h1>
                <p class="subtitle">Día 2 • AWSpectrum 2026</p>
            </header>

            <div class="dashboard-avatar-container">
                <!-- Three.js Container -->
                <div id="three-avatar-container" style="width: 150px; height: 150px; z-index: 10;"></div>
                <div class="level-badge">Nivel 12</div>
            </div>

            <div class="card xp-container neon-border">
                <div class="xp-header">
                    <span>Progreso Total</span>
                    <span class="xp-points">8,450 XP</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill aws-gradient" style="width: 75%;"></div>
                </div>
                <p class="xp-hint">1,550 XP para Nivel 13</p>
            </div>

            <h2 style="margin-bottom: 16px;">Accesos Rápidos</h2>
            <div class="quick-actions-grid">
                <div class="card quick-action" id="btn-quick-agenda">
                    <i class="ph ph-calendar-check"></i>
                    <span>Mi Itinerario</span>
                </div>
                <div class="card quick-action" id="btn-quick-scan">
                    <i class="ph ph-qr-code"></i>
                    <span>Escanear</span>
                </div>
                <div class="card quick-action" id="btn-quick-qa">
                    <i class="ph ph-chats-circle"></i>
                    <span>Live Q&A</span>
                </div>
                <div class="card quick-action" id="btn-quick-rewards">
                    <i class="ph ph-gift"></i>
                    <span>Recompensas</span>
                </div>
            </div>
        </main>
        `;
    },

    onMount(router) {
        // Initialize 3D Avatar
        setTimeout(() => {
            this.avatar = new ThreeAvatar('three-avatar-container', localStorage.getItem('avatarShape') || 'rabbit');
        }, 100);

        document.getElementById('btn-quick-agenda').addEventListener('click', () => router.navigate('agenda'));
        document.getElementById('btn-quick-scan').addEventListener('click', () => router.navigate('scan'));
        document.getElementById('btn-quick-qa').addEventListener('click', () => router.navigate('qa'));
        
        document.getElementById('btn-settings').addEventListener('click', () => router.navigate('settings'));

        document.getElementById('btn-quick-rewards').addEventListener('click', () => {
            const modal = document.getElementById('modal-rewards');
            if (modal) modal.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate(20);
        });
    },

    destroy() {
        if(this.avatar) {
            this.avatar.destroy();
            this.avatar = null;
        }
    }
};
