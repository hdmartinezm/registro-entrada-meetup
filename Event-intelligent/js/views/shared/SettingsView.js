import { store } from '../../core/store.js';
import { ThreeAvatar } from '../../utils/ThreeAvatar.js';

export const SettingsView = {
    avatarPreview: null,

    render() {
        return `
        <header class="app-header">
            <h1>Ajustes</h1>
            <p class="subtitle">Configuración de Cuenta y Plataforma</p>
        </header>

        <!-- Customización 3D -->
        <h3 style="margin-top: 16px; margin-bottom: 12px; color: var(--color-neon-purple);">Mi Avatar 3D</h3>
        <div class="card" style="margin-bottom: 24px; text-align: center;">
            <div id="settings-avatar-container" style="width: 150px; height: 150px; margin: 0 auto;"></div>
            
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
                <button class="btn btn-secondary btn-shape" data-shape="rabbit" style="width: auto; padding: 8px 16px;">Conejo</button>
                <button class="btn btn-secondary btn-shape" data-shape="bear" style="width: auto; padding: 8px 16px;">Oso</button>
                <button class="btn btn-secondary btn-shape" data-shape="fox" style="width: auto; padding: 8px 16px;">Zorro</button>
            </div>
        </div>

        <div class="card settings-list">
            <div class="settings-row">
                <div class="settings-info">
                    <div class="settings-icon-bg" style="color: var(--color-aws-orange);"><i class="ph ph-moon"></i></div>
                    <span>Modo Oscuro</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="theme-toggle" checked>
                    <span class="slider"></span>
                </label>
            </div>
            
            <!-- Speaker Mode Toggle -->
            <div class="settings-divider" id="speaker-mode-divider" style="display: none;"></div>
            <div class="settings-row" id="speaker-mode-row" style="display: none;">
                <div class="settings-info">
                    <div class="settings-icon-bg" style="color: var(--color-aws-orange);"><i class="ph ph-chalkboard-teacher"></i></div>
                    <span>Modo Speaker Activo</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="speaker-mode-toggle">
                    <span class="slider"></span>
                </label>
            </div>

            <!-- Organizer Mode Toggle -->
            <div class="settings-divider" id="org-mode-divider" style="display: none;"></div>
            <div class="settings-row" id="org-mode-row" style="display: none;">
                <div class="settings-info">
                    <div class="settings-icon-bg" style="color: var(--color-cyan);"><i class="ph ph-shield-check"></i></div>
                    <span>Modo Organizador Activo</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="org-mode-toggle">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        
        <button class="btn btn-danger" id="btn-logout">Cerrar Sesión</button>
        `;
    },

    onMount(router) {
        // Init 3D Preview
        setTimeout(() => {
            const currentShape = localStorage.getItem('avatarShape') || 'rabbit';
            this.avatarPreview = new ThreeAvatar('settings-avatar-container', currentShape);
        }, 100);

        // Change Shape Logic
        document.querySelectorAll('.btn-shape').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = e.currentTarget.dataset.shape;
                localStorage.setItem('avatarShape', shape);
                if (this.avatarPreview) this.avatarPreview.setShape(shape);
                if (navigator.vibrate) navigator.vibrate(20);
            });
        });

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('change', (e) => {
            document.body.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
            if (navigator.vibrate) navigator.vibrate(20);
        });

        // Toggles visibility
        const spkRow = document.getElementById('speaker-mode-row');
        const spkDiv = document.getElementById('speaker-mode-divider');
        const spkToggle = document.getElementById('speaker-mode-toggle');
        
        const orgRow = document.getElementById('org-mode-row');
        const orgDiv = document.getElementById('org-mode-divider');
        const orgToggle = document.getElementById('org-mode-toggle');

        if (store.currentUserRole === 'speaker') {
            spkRow.style.display = 'flex';
            spkDiv.style.display = 'block';
            spkToggle.checked = store.isSpeakerModeActive;
            
            spkToggle.addEventListener('change', (e) => {
                store.isSpeakerModeActive = e.target.checked;
                router.navigate(e.target.checked ? 'speaker-qa' : 'home');
            });
        }

        if (store.currentUserRole === 'organizer') {
            orgRow.style.display = 'flex';
            orgDiv.style.display = 'block';
            orgToggle.checked = store.isOrgModeActive;

            orgToggle.addEventListener('change', (e) => {
                store.isOrgModeActive = e.target.checked;
                router.navigate(e.target.checked ? 'org-hub' : 'home');
            });
        }

        document.getElementById('btn-logout').addEventListener('click', () => {
            store.setRole('attendee'); // reset
            router.navigate('auth');
        });
    },

    destroy() {
        if(this.avatarPreview) {
            this.avatarPreview.destroy();
            this.avatarPreview = null;
        }
    }
};
