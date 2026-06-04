export const Modals = {
    render() {
        return `
        <!-- Modal: Leaderboard -->
        <div class="modal-overlay hidden" id="modal-leaderboard">
            <div class="card modal-content neon-border">
                <div class="modal-header">
                    <h2>Top Builders</h2>
                    <button class="btn-close-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="leaderboard-list">
                    <div class="leaderboard-item highlight"><span>1. Alex Costa</span><span>12,450 XP</span></div>
                    <div class="leaderboard-item"><span>2. Sarah J.</span><span>11,200 XP</span></div>
                    <div class="leaderboard-item"><span>3. Miguel R.</span><span>10,800 XP</span></div>
                    <div class="leaderboard-item" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                        <span style="color: var(--color-text-secondary);">12. Tú</span><span style="color: var(--color-aws-orange);">8,450 XP</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Rewards -->
        <div class="modal-overlay hidden" id="modal-rewards">
            <div class="card modal-content neon-border">
                <div class="modal-header">
                    <h2>Recompensas Desbloqueadas</h2>
                    <button class="btn-close-modal"><i class="ph ph-x"></i></button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="reward-item">
                        <i class="ph-fill ph-ticket" style="font-size: 24px; color: var(--color-aws-orange);"></i>
                        <div>
                            <h4>Sudadera Exclusiva</h4>
                            <p style="font-size: 12px; color: var(--color-success);">¡Reclamable en el stand!</p>
                        </div>
                    </div>
                    <div class="reward-item" style="opacity: 0.5;">
                        <i class="ph-fill ph-lock-key" style="font-size: 24px;"></i>
                        <div>
                            <h4>Vuelo AWS re:Invent</h4>
                            <p style="font-size: 12px;">Se desbloquea al Nivel 20</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Launch Poll -->
        <div class="modal-overlay hidden" id="modal-launch-poll">
            <div class="card modal-content neon-border" style="border-color: var(--color-aws-orange);">
                <div class="modal-header">
                    <h2>Lanzar Encuesta</h2>
                    <button class="btn-close-modal"><i class="ph ph-x"></i></button>
                </div>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px;">Selecciona un borrador para lanzarlo en vivo:</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary btn-select-poll" style="text-align: left; justify-content: space-between;">
                        <span>¿Qué framework de IA usas más?</span>
                        <i class="ph-fill ph-rocket-launch" style="color: var(--color-aws-orange);"></i>
                    </button>
                    <button class="btn btn-secondary btn-select-poll" style="text-align: left; justify-content: space-between;">
                        <span>¿Nivel de experiencia con AWS?</span>
                        <i class="ph-fill ph-rocket-launch" style="color: var(--color-aws-orange);"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal: Create Poll -->
        <div class="modal-overlay hidden" id="modal-create-poll">
            <div class="card modal-content neon-border">
                <div class="modal-header">
                    <h2>Crear Encuesta</h2>
                    <button class="btn-close-modal"><i class="ph ph-x"></i></button>
                </div>
                <form id="form-create-poll">
                    <input type="text" class="auth-input" placeholder="Pregunta (ej. ¿Framework favorito?)" required style="margin-bottom: 12px;">
                    <input type="text" class="auth-input" placeholder="Opción 1" required style="margin-bottom: 8px;">
                    <input type="text" class="auth-input" placeholder="Opción 2" required style="margin-bottom: 16px;">
                    <button type="submit" class="btn btn-primary">Guardar Borrador</button>
                </form>
            </div>
        </div>
        <!-- Modal: Confirm -->
        <div class="modal-overlay hidden" id="modal-confirm" style="z-index: 10000;">
            <div class="card modal-content neon-border" style="border-color: var(--color-danger); text-align: center;">
                <i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--color-danger); margin-bottom: 16px;"></i>
                <h2 id="confirm-title" style="margin-bottom: 8px;">¿Estás seguro?</h2>
                <p id="confirm-message" style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 24px;">Esta acción no se puede deshacer.</p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" id="btn-confirm-cancel" style="flex: 1;">Cancelar</button>
                    <button class="btn btn-primary" id="btn-confirm-ok" style="flex: 1; background: var(--color-danger); border-color: var(--color-danger);">Confirmar</button>
                </div>
            </div>
        </div>
        `;
    },
    
    bindEvents() {
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.currentTarget.closest('.modal-overlay').classList.add('hidden');
                if (navigator.vibrate) navigator.vibrate(10);
            });
        });

        // Launch poll logic
        document.querySelectorAll('.btn-select-poll').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.currentTarget.closest('.modal-overlay').classList.add('hidden');
                alert('¡Encuesta lanzada en vivo a todos los asistentes!');
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            });
        });

        // Create poll logic
        const formCreate = document.getElementById('form-create-poll');
        if (formCreate) {
            formCreate.addEventListener('submit', (e) => {
                e.preventDefault();
                document.getElementById('modal-create-poll').classList.add('hidden');
                alert('Borrador de encuesta guardado exitosamente.');
                e.target.reset();
                if (navigator.vibrate) navigator.vibrate(30);
            });
        }
    },

    confirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('modal-confirm');
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-message').innerText = message;
            
            modal.classList.remove('hidden');
            
            const btnOk = document.getElementById('btn-confirm-ok');
            const btnCancel = document.getElementById('btn-confirm-cancel');
            
            const cleanup = () => {
                btnOk.removeEventListener('click', onOk);
                btnCancel.removeEventListener('click', onCancel);
                modal.classList.add('hidden');
            };
            
            const onOk = () => {
                if (navigator.vibrate) navigator.vibrate([50]);
                cleanup();
                resolve(true);
            };
            
            const onCancel = () => {
                cleanup();
                resolve(false);
            };
            
            btnOk.addEventListener('click', onOk);
            btnCancel.addEventListener('click', onCancel);
        });
    }
};
