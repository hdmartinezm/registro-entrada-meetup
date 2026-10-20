export const SpeakerQAView = {
    render() {
        return `
        <header class="app-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-direction: column; gap: 12px; position: relative;">
            <button id="btn-settings-speaker" style="position: absolute; right: 0; top: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">
                <i class="ph ph-gear"></i>
            </button>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h1>Consola Q&A</h1>
                    <p class="subtitle">Gestión en Vivo</p>
                </div>
                <button id="btn-manage-polls" style="background: none; border: none; color: var(--color-cyan); font-size: 28px; cursor: pointer;">
                    <i class="ph ph-list-dashes"></i>
                </button>
            </div>
        </header>
        <div class="speaker-actions" style="margin-bottom: 24px;">
            <button class="btn btn-primary" id="btn-open-launch-poll">
                <i class="ph ph-lightning"></i> Lanzar Encuesta Rápida
            </button>
        </div>
        <h3>Preguntas de la Audiencia</h3>
        <div class="speaker-qa-list" style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div class="card qa-card speaker-card neon-border">
                <div class="qa-card-body">
                    <h4 class="qa-author">Maria DB <span class="badge-new">NUEVO</span></h4>
                    <p class="qa-text">¿Cómo manejas los cold starts cuando usas modelos pesados en Lambda?</p>
                </div>
                <div class="speaker-qa-controls">
                    <div class="upvote-badge"><i class="ph-fill ph-heart"></i> 42</div>
                    <button class="btn-mark-answered" title="Marcar como respondida"><i class="ph ph-check"></i></button>
                </div>
            </div>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-manage-polls').addEventListener('click', () => router.navigate('speaker-polls'));
        
        document.getElementById('btn-settings-speaker').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            router.navigate('settings');
        });
        
        document.getElementById('btn-open-launch-poll').addEventListener('click', () => {
            const modal = document.getElementById('modal-launch-poll');
            if(modal) modal.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate(20);
        });
        
        document.querySelectorAll('.btn-mark-answered').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.speaker-card');
                if (card) {
                    card.classList.toggle('answered');
                    if (navigator.vibrate) navigator.vibrate(20);
                    const icon = e.currentTarget.querySelector('i');
                    icon.className = card.classList.contains('answered') ? 'ph-fill ph-check-circle' : 'ph ph-check';
                }
            });
        });
    }
};

export const SpeakerFeedbackView = {
    render() {
        return `
        <header class="app-header">
            <h1>Analytics</h1>
            <p class="subtitle">Feedback de Sesión</p>
        </header>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div class="card neon-border" style="padding: 16px; text-align: center;">
                <i class="ph-fill ph-trend-up" style="font-size: 32px; color: var(--color-success); margin-bottom: 8px; display: block;"></i>
                <h2 style="font-size: 24px; color: var(--color-success);">94%</h2>
                <p style="font-size: 11px; color: var(--color-text-secondary);">Retención</p>
            </div>
            <div class="card neon-border" style="padding: 16px; text-align: center; border-color: var(--color-cyan);">
                <i class="ph-fill ph-chats" style="font-size: 32px; color: var(--color-cyan); margin-bottom: 8px; display: block;"></i>
                <h2 style="font-size: 24px; color: var(--color-cyan);">187</h2>
                <p style="font-size: 11px; color: var(--color-text-secondary);">Interacciones Totales</p>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <h3>Sentiment de la Audiencia</h3>
            <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; overflow: hidden;">
                    <div style="width: 75%; background: var(--color-success);"></div>
                    <div style="width: 20%; background: var(--color-aws-orange);"></div>
                    <div style="width: 5%; background: var(--color-danger);"></div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--color-text-secondary);">
                <span><i class="ph-fill ph-smiley" style="color: var(--color-success);"></i> 75% Positivo</span>
                <span><i class="ph-fill ph-smiley-blank" style="color: var(--color-aws-orange);"></i> 20% Neutral</span>
                <span><i class="ph-fill ph-smiley-sad" style="color: var(--color-danger);"></i> 5% Negativo</span>
            </div>
        </div>

        <div class="card neon-border">
            <h3>Picos de Atención</h3>
            <div class="css-chart" style="margin-top: 16px;">
                <div class="chart-bar-container"><div class="chart-bar" style="height: 50%;"></div><span>10m</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 90%; background-color: var(--color-success);"></div><span>20m</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 70%;"></div><span>30m</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 100%; background-color: var(--color-cyan);"></div><span>40m</span></div>
            </div>
            <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 12px;"><i class="ph-fill ph-lightbulb"></i> Insight IA: El mayor pico de atención ocurrió durante el Demo de Bedrock al minuto 40.</p>
        </div>
        `;
    }
};

export const SpeakerPollsManagerView = {
    render() {
        return `
        <header class="app-header" style="display: flex; gap: 16px; align-items: center;">
            <button id="btn-back-to-console" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;"><i class="ph ph-arrow-left"></i></button>
            <div>
                <h1 style="font-size: 20px;">Mis Encuestas</h1>
                <p class="subtitle">Borradores guardados</p>
            </div>
        </header>
        <div style="margin-bottom: 24px;">
            <button class="btn btn-secondary" id="btn-open-poll-builder"><i class="ph ph-plus"></i> Crear Nueva Encuesta</button>
        </div>
        
        <h3 style="margin-bottom: 12px; color: var(--color-cyan);">Encuesta Activa (Live)</h3>
        <div class="card poll-card neon-border" style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px;">¿Qué framework de IA usas más?</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="position: relative; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; overflow: hidden;">
                    <div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-cyan); width: 68%; opacity: 0.4;"></div>
                    <span style="position: relative; z-index: 1; font-weight: bold;">LangChain - 68%</span>
                </div>
                <div style="position: relative; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; overflow: hidden;">
                    <div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-aws-orange); width: 32%; opacity: 0.4;"></div>
                    <span style="position: relative; z-index: 1;">AWS Bedrock Agents - 32%</span>
                </div>
            </div>
            <p style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary); text-align: right;">Total votos: 142</p>
        </div>

        <h3 style="margin-bottom: 12px;">Borradores Guardados</h3>
        <div class="draft-polls-list" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="card poll-card draft-poll-item" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin-bottom: 4px;">¿Nivel de experiencia con AWS?</h4>
                    <p style="font-size: 12px; color: var(--color-text-secondary);">Básico, Intermedio, Avanzado</p>
                </div>
                <button class="btn-delete-poll" style="background: none; border: none; color: var(--color-danger); font-size: 20px; cursor: pointer; padding: 8px;"><i class="ph ph-trash"></i></button>
            </div>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-back-to-console').addEventListener('click', () => router.navigate('speaker-qa'));
        
        document.getElementById('btn-open-poll-builder').addEventListener('click', () => {
            const modal = document.getElementById('modal-create-poll');
            if(modal) modal.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate(20);
        });

        document.querySelectorAll('.btn-delete-poll').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.draft-poll-item');
                if (item) {
                    item.style.transition = 'opacity 0.3s ease';
                    item.style.opacity = '0';
                    setTimeout(() => item.remove(), 300);
                    if (navigator.vibrate) navigator.vibrate(20);
                }
            });
        });
    }
};

export const SpeakerQuantumEngineView = {
    render() {
        return `
        <style>
            .quantum-gauge {
                width: 150px; height: 75px; 
                border-radius: 150px 150px 0 0;
                background: conic-gradient(from 270deg at 50% 100%, var(--color-success) 0%, var(--color-aws-orange) 50%, var(--color-danger) 100%);
                position: relative;
                margin: 0 auto 16px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
            }
            .quantum-gauge-inner {
                position: absolute; top: 10px; left: 10px; right: 10px; bottom: 0;
                background: var(--color-bg-card);
                border-radius: 140px 140px 0 0;
                display: flex; align-items: flex-end; justify-content: center;
                padding-bottom: 10px; font-size: 24px; font-weight: bold;
            }
            .quantum-needle {
                position: absolute; bottom: 0; left: 50%;
                width: 4px; height: 65px; background: white;
                transform-origin: bottom center;
                transition: transform 1s cubic-bezier(0.1, 0.9, 0.2, 1);
                border-radius: 4px;
                z-index: 2;
            }
            .quantum-node {
                position: absolute;
                border-radius: 50%;
                background: var(--color-bg-card);
                border: 2px solid var(--color-cyan);
                box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
                display: flex; align-items: center; justify-content: center;
                color: white; font-size: 10px; text-align: center; font-weight: bold;
                animation: quantumPulse 2s infinite alternate;
                z-index: 2;
            }
            .quantum-edge {
                position: absolute;
                height: 2px;
                background: linear-gradient(90deg, rgba(6,182,212,0.8), rgba(255,153,0,0.8));
                transform-origin: 0 50%;
                z-index: 1;
                opacity: 0.6;
                animation: flowEdge 3s linear infinite;
            }
            @keyframes quantumPulse {
                from { box-shadow: 0 0 10px rgba(6, 182, 212, 0.3); }
                to { box-shadow: 0 0 25px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(6, 182, 212, 0.5); }
            }
            @keyframes flowEdge {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
            }
        </style>
        <header class="app-header">
            <h1>Copiloto Cuántico</h1>
            <p class="subtitle">Predicciones Analíticas IA para tu Charla</p>
        </header>

        <div class="card neon-border" style="text-align: center; margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px;">Riesgo de Abandono (Tu Sesión)</h3>
            <div class="quantum-gauge">
                <div class="quantum-needle" id="q-needle-spk" style="transform: rotate(-30deg);"></div>
                <div class="quantum-gauge-inner"><span id="q-risk-val-spk">15%</span></div>
            </div>
            <p style="font-size: 12px; color: var(--color-text-secondary);">Riesgo Bajo: Audiencia sumamente cautivada.</p>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 16px 0;">
            <h3 style="padding: 0 16px; margin-bottom: 16px;">Red de Escenarios: Demo Bedrock</h3>
            <div style="position: relative; height: 220px; width: 100%; overflow: hidden; background: rgba(0,0,0,0.2);">
                <!-- Nodes -->
                <div class="quantum-node" style="width: 50px; height: 50px; left: 10%; top: 85px; border-color: var(--color-success);">T0<br>Actual</div>
                
                <div class="quantum-node" style="width: 40px; height: 40px; left: 50%; top: 30px;">S1<br>85%</div>
                <div class="quantum-node" style="width: 40px; height: 40px; left: 50%; top: 140px; border-color: var(--color-danger);">S2<br>15%</div>
                
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 10px; border-color: var(--color-success);">O1<br>WOW!</div>
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 80px;">O2<br>Neutro</div>
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 170px; border-color: var(--color-danger);">O3<br>Confuso</div>

                <!-- Edges -->
                <div class="quantum-edge" style="left: 20%; top: 110px; width: 35%; transform: rotate(-25deg);"></div>
                <div class="quantum-edge" style="left: 20%; top: 110px; width: 35%; transform: rotate(25deg); background: rgba(255,51,102,0.5);"></div>
                <div class="quantum-edge" style="left: 58%; top: 50px; width: 30%; transform: rotate(-15deg); background: rgba(0,255,100,0.5);"></div>
                <div class="quantum-edge" style="left: 58%; top: 50px; width: 30%; transform: rotate(15deg);"></div>
                <div class="quantum-edge" style="left: 58%; top: 160px; width: 30%; transform: rotate(10deg); background: rgba(255,51,102,0.5);"></div>
            </div>
            <p style="font-size: 11px; color: var(--color-text-secondary); text-align: center; margin-top: 12px;">S1: Demo fluido | S2: Fallo de red detectado</p>
        </div>

        <h3 style="margin-bottom: 16px;">Sugerencias del Motor</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="card neon-border" style="border-color: var(--color-success); position: relative; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; height: 100%; width: 92%; background: var(--color-success); opacity: 0.1;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h4 style="color: var(--color-success);"><i class="ph-fill ph-chart-line-up"></i> Encuesta Estratégica</h4>
                        <span style="font-weight: bold;">92% Éxito</span>
                    </div>
                    <p style="font-size: 13px; color: var(--color-text-secondary);">Lanzar la encuesta "¿Nivel de experiencia con AWS?" ahora maximizará la participación en un 30%.</p>
                    <button class="btn btn-primary btn-spk-action" style="margin-top: 12px; padding: 8px; width: auto; font-size: 12px; background: var(--color-success);">Lanzar Encuesta</button>
                </div>
            </div>
        </div>
        `;
    },
    onMount(router) {
        const needle = document.getElementById('q-needle-spk');
        const valText = document.getElementById('q-risk-val-spk');
        
        let currentRisk = 15;
        
        this.simInterval = setInterval(() => {
            if (!needle) return;
            // Random walk simulation (Speaker context is more stable)
            const shift = (Math.random() - 0.5) * 8;
            currentRisk = Math.max(0, Math.min(100, currentRisk + shift));
            
            const angle = -90 + (currentRisk / 100) * 180;
            needle.style.transform = `rotate(${angle}deg)`;
            valText.innerText = Math.round(currentRisk) + '%';
            
            if (currentRisk > 60) {
                valText.style.color = 'var(--color-danger)';
            } else if (currentRisk > 35) {
                valText.style.color = 'var(--color-aws-orange)';
            } else {
                valText.style.color = 'var(--color-success)';
            }
        }, 2000);

        document.querySelectorAll('.btn-spk-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                e.currentTarget.innerText = '¡Acción Lanzada!';
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.disabled = true;
            });
        });
    },
    destroy() {
        if(this.simInterval) clearInterval(this.simInterval);
    }
};
