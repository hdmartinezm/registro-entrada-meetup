export const OrgDashboardView = {
    render() {
        return `
        <header class="app-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-direction: column; gap: 12px; position: relative;">
            <button id="btn-settings-org" style="position: absolute; right: 0; top: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">
                <i class="ph ph-gear"></i>
            </button>
            <div>
                <h1>Centro de Operaciones</h1>
                <p class="subtitle">Métricas en Vivo</p>
            </div>
            <button id="btn-org-history" class="btn btn-secondary" style="width: 100%; border-color: var(--color-cyan); color: var(--color-cyan);">
                <i class="ph ph-clock-counter-clockwise"></i> Recrear Eventos Pasados
            </button>
        </header>

        <!-- KPI Metrics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div class="card neon-border" style="padding: 16px; text-align: center;">
                <h2 style="font-size: 28px; color: var(--color-aws-orange);">94%</h2>
                <p style="font-size: 12px; color: var(--color-text-secondary);">Retención Actual</p>
            </div>
            <div class="card neon-border" style="padding: 16px; text-align: center; border-color: var(--color-cyan);">
                <h2 style="font-size: 28px; color: var(--color-cyan);">1.2k</h2>
                <p style="font-size: 12px; color: var(--color-text-secondary);">Interacciones/min</p>
            </div>
            <div class="card neon-border" style="padding: 16px; text-align: center; grid-column: span 2; border-color: var(--color-success);">
                <h2 style="font-size: 28px; color: var(--color-success);">2,840 <i class="ph-fill ph-bookmark-simple" style="font-size: 24px;"></i></h2>
                <p style="font-size: 12px; color: var(--color-text-secondary);">Asistentes agregaron la sesión <strong>"Serverless AI"</strong> a su Itinerario</p>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <h3>Engagement Global</h3>
            <div class="css-chart" style="margin-top: 16px;">
                <div class="chart-bar-container"><div class="chart-bar" style="height: 40%;"></div><span>10h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 80%; background-color: var(--color-aws-orange);"></div><span>11h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 60%;"></div><span>12h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 90%; background-color: var(--color-cyan);"></div><span>13h</span></div>
            </div>
        </div>

        <div class="card neon-border">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3>Mapas de Calor (Salas)</h3>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label style="font-size: 12px; color: var(--color-text-secondary);">Nº Salas:</label>
                    <input type="number" id="input-room-count" value="4" min="1" max="12" class="auth-input" style="width: 60px; padding: 4px; height: auto;">
                </div>
            </div>
            
            <div class="heatmap-grid" id="dynamic-heatmap" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                <!-- Dynamically generated -->
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 10px; color: var(--color-text-secondary);">
                <span><div style="display:inline-block; width:10px; height:10px; background:rgba(6,182,212,0.1); border-radius:2px;"></div> Vacío</span>
                <span><div style="display:inline-block; width:10px; height:10px; background:rgba(6,182,212,0.8); border-radius:2px;"></div> Medio</span>
                <span><div style="display:inline-block; width:10px; height:10px; background:rgba(255,51,102,0.9); border-radius:2px;"></div> Lleno</span>
            </div>
        </div>
        `;
    },
    onMount(router) {
        const btnHistory = document.getElementById('btn-org-history');
        if(btnHistory) {
            btnHistory.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(20);
                router.navigate('org-history');
            });
        }

        const btnSettings = document.getElementById('btn-settings-org');
        if(btnSettings) {
            btnSettings.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(20);
                router.navigate('settings');
            });
        }

        const roomInput = document.getElementById('input-room-count');
        const heatmapGrid = document.getElementById('dynamic-heatmap');

        const generateHeatmap = () => {
            const count = parseInt(roomInput.value) || 4;
            heatmapGrid.innerHTML = '';
            
            if (count > 6) heatmapGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            else if (count === 1) heatmapGrid.style.gridTemplateColumns = '1fr';
            else heatmapGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';

            for (let i = 1; i <= count; i++) {
                const fillPercent = Math.floor(Math.random() * 100);
                
                let bgColor = 'rgba(6,182,212,0.1)';
                let textColor = 'var(--color-text-secondary)';
                if (fillPercent > 80) { bgColor = 'rgba(255,51,102,0.9)'; textColor = 'white'; }
                else if (fillPercent > 40) { bgColor = 'rgba(6,182,212,0.8)'; textColor = 'white'; }

                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.style.background = bgColor;
                cell.style.borderRadius = '6px';
                cell.style.padding = '12px';
                cell.style.display = 'flex';
                cell.style.flexDirection = 'column';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.transition = 'all 0.3s ease';

                cell.innerHTML = `
                    <span style="font-weight: bold; color: ${textColor};">Sala ${i}</span>
                    <span style="font-size: 12px; color: ${textColor}; opacity: 0.8;">${fillPercent}%</span>
                `;

                heatmapGrid.appendChild(cell);
            }
        };

        generateHeatmap();
        
        if (roomInput) {
            roomInput.addEventListener('change', () => {
                if (navigator.vibrate) navigator.vibrate(10);
                generateHeatmap();
            });
        }
    }
};

export const OrgLeaderboardView = {
    render() {
        return `
        <header class="app-header">
            <h1>Ranking Global</h1>
            <p class="subtitle">Top Builders</p>
        </header>
        <div class="global-leaderboard-list">
            <div class="card gl-item top-1">
                <div class="gl-rank">🥇</div>
                <div class="gl-info"><h4>Alex Costa</h4><p>Master Quantum</p></div>
                <div class="gl-score">12,450 XP</div>
            </div>
            <div class="card gl-item top-2">
                <div class="gl-rank">🥈</div>
                <div class="gl-info"><h4>Sarah J.</h4><p>Serverless Ninja</p></div>
                <div class="gl-score">11,200 XP</div>
            </div>
        </div>
        `;
    }
};

export const OrgMissionsBuilderView = {
    render() {
        return `
        <header class="app-header">
            <h1>Crear Reto Global</h1>
        </header>
        <div class="card">
            <form id="form-add-mission">
                <input type="text" class="auth-input" id="org-mission-title" placeholder="Título del Reto" required>
                <input type="text" class="auth-input" id="org-mission-desc" placeholder="Descripción" required>
                <input type="number" class="auth-input" id="org-mission-xp" placeholder="XP a otorgar" required>
                <button type="submit" class="btn btn-primary" style="margin-top: 16px;">Publicar Reto Push</button>
            </form>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('form-add-mission').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('org-mission-title').value;
            if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
            alert(`¡Reto Global "${title}" publicado!`);
            e.target.reset();
        });
    }
};

export const OrgQAInsightsView = {
    render() {
        return `
        <header class="app-header">
            <h1>Q&A IA Insights</h1>
            <p class="subtitle">Análisis de Audiencia</p>
        </header>
        <div class="card" style="margin-bottom: 24px;">
            <h3><i class="ph ph-fire"></i> Top Preguntas</h3>
            <div style="margin-top: 16px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <p>¿Cómo manejas los cold starts cuando usas modelos pesados en Lambda?</p>
                <span style="color: #ff3366; font-weight: bold; font-size: 12px;"><i class="ph-fill ph-heart"></i> 42</span>
            </div>
        </div>

        <div class="card neon-border">
            <h3><i class="ph ph-chart-pie-slice"></i> Tendencia en Encuestas</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px;">Sesión: Serverless AI Architecture</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="position: relative; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; overflow: hidden;">
                    <div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-cyan); width: 68%; opacity: 0.4;"></div>
                    <span style="position: relative; z-index: 1; font-weight: bold;">LangChain (Dominante) - 68%</span>
                </div>
                <div style="position: relative; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; overflow: hidden;">
                    <div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-aws-orange); width: 32%; opacity: 0.4;"></div>
                    <span style="position: relative; z-index: 1;">AWS Bedrock Agents - 32%</span>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: var(--color-success);"><i class="ph-fill ph-lightbulb"></i> Insight IA: La audiencia prefiere LangChain fuertemente. El speaker debería enfocar el demo en este framework.</div>
        </div>
        `;
    }
};

export const OrgQuantumEngineView = {
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
            <h1>Motor Cuántico</h1>
            <p class="subtitle">Predicciones Analíticas IA</p>
        </header>

        <div class="card neon-border" style="text-align: center; margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px;">Riesgo de Abandono (Global)</h3>
            <div class="quantum-gauge">
                <div class="quantum-needle" id="q-needle" style="transform: rotate(-30deg);"></div>
                <div class="quantum-gauge-inner"><span id="q-risk-val">28%</span></div>
            </div>
            <p style="font-size: 12px; color: var(--color-text-secondary);">Riesgo Bajo: Atención estable en salas principales.</p>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 16px 0;">
            <h3 style="padding: 0 16px; margin-bottom: 16px;">Red de Escenarios Probables</h3>
            <div style="position: relative; height: 220px; width: 100%; overflow: hidden; background: rgba(0,0,0,0.2);">
                <!-- Nodes -->
                <div class="quantum-node" style="width: 50px; height: 50px; left: 10%; top: 85px; border-color: var(--color-success);">T0<br>Actual</div>
                
                <div class="quantum-node" style="width: 40px; height: 40px; left: 50%; top: 30px;">S1<br>60%</div>
                <div class="quantum-node" style="width: 40px; height: 40px; left: 50%; top: 140px; border-color: var(--color-danger);">S2<br>40%</div>
                
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 10px; border-color: var(--color-success);">O1<br>Éxito</div>
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 80px;">O2<br>Neutro</div>
                <div class="quantum-node" style="width: 45px; height: 45px; left: 85%; top: 170px; border-color: var(--color-danger);">O3<br>Fuga</div>

                <!-- Edges -->
                <div class="quantum-edge" style="left: 20%; top: 110px; width: 35%; transform: rotate(-25deg);"></div>
                <div class="quantum-edge" style="left: 20%; top: 110px; width: 35%; transform: rotate(25deg); background: rgba(255,51,102,0.5);"></div>
                <div class="quantum-edge" style="left: 58%; top: 50px; width: 30%; transform: rotate(-15deg); background: rgba(0,255,100,0.5);"></div>
                <div class="quantum-edge" style="left: 58%; top: 50px; width: 30%; transform: rotate(15deg);"></div>
                <div class="quantum-edge" style="left: 58%; top: 160px; width: 30%; transform: rotate(10deg); background: rgba(255,51,102,0.5);"></div>
            </div>
            <p style="font-size: 11px; color: var(--color-text-secondary); text-align: center; margin-top: 12px;">S1: Retención óptima | S2: Aburrimiento inminente</p>
        </div>

        <h3 style="margin-bottom: 16px;">Intervenciones Adaptativas</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="card neon-border" style="border-color: var(--color-success); position: relative; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; height: 100%; width: 85%; background: var(--color-success); opacity: 0.1;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h4 style="color: var(--color-success);"><i class="ph-fill ph-target"></i> Activar Misión Relámpago</h4>
                        <span style="font-weight: bold;">85% Éxito</span>
                    </div>
                    <p style="font-size: 13px; color: var(--color-text-secondary);">Redirige tráfico inactivo hacia el Booth A mediante una notificación push lúdica (+500XP).</p>
                    <button class="btn btn-primary btn-q-action" style="margin-top: 12px; padding: 8px; width: auto; font-size: 12px; background: var(--color-success);">Ejecutar Ahora</button>
                </div>
            </div>

            <div class="card neon-border" style="border-color: var(--color-cyan); position: relative; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; height: 100%; width: 62%; background: var(--color-cyan); opacity: 0.1;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h4 style="color: var(--color-cyan);"><i class="ph-fill ph-speaker-high"></i> Priorizar Dinámica Q&A</h4>
                        <span style="font-weight: bold;">62% Éxito</span>
                    </div>
                    <p style="font-size: 13px; color: var(--color-text-secondary);">Sugerir al Speaker de Serverless que inicie una ronda rápida de Q&A para recuperar atención.</p>
                    <button class="btn btn-secondary btn-q-action" style="margin-top: 12px; padding: 8px; width: auto; font-size: 12px;">Notificar Speaker</button>
                </div>
            </div>
        </div>
        `;
    },
    onMount(router) {
        const needle = document.getElementById('q-needle');
        const valText = document.getElementById('q-risk-val');
        
        let currentRisk = 28;
        
        this.simInterval = setInterval(() => {
            if (!needle) return;
            // Random walk simulation
            const shift = (Math.random() - 0.5) * 15;
            currentRisk = Math.max(0, Math.min(100, currentRisk + shift));
            
            // Map 0-100 to -90 to +90 degrees for gauge needle
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

        document.querySelectorAll('.btn-q-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                e.currentTarget.innerText = '¡Intervención Iniciada!';
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.disabled = true;
            });
        });
    },
    destroy() {
        if(this.simInterval) clearInterval(this.simInterval);
    }
};

export const OrgEventHubView = {
    render() {
        return `
        <header class="app-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-direction: column; gap: 12px; position: relative;">
            <button id="btn-settings-hub" style="position: absolute; right: 0; top: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">
                <i class="ph ph-gear"></i>
            </button>
            <div>
                <h1>Portal de Eventos</h1>
                <p class="subtitle">Selecciona o crea un nuevo evento</p>
            </div>
        </header>
        
        <div class="app-content" style="padding-top: 0;">
            <div class="card neon-border" style="margin-bottom: 24px; border-color: var(--color-cyan); text-align: center; cursor: pointer; padding: 32px 16px;" id="btn-create-event">
                <div class="scan-wrapper" style="margin: 0 auto 16px; background: linear-gradient(135deg, var(--color-cyan), var(--color-neon-purple)); width: 64px; height: 64px;">
                    <i class="ph ph-plus" style="font-size: 32px; color: white;"></i>
                </div>
                <h3 style="color: var(--color-cyan); margin-bottom: 4px;">Crear Nuevo Evento</h3>
                <p style="font-size: 13px;">Inicia el wizard para configurar un nuevo espacio</p>
            </div>

            <h3 style="margin-bottom: 16px; color: var(--color-text-secondary);">Tus Eventos Activos</h3>
            
            <div class="card event-card" style="margin-bottom: 16px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--color-success);"></div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge-live" style="margin-left: 0; margin-bottom: 8px; background: var(--color-success);">ACTIVO AHORA</span>
                        <h3 style="font-size: 18px; margin-bottom: 4px;">AWSPECTRUM 2026</h3>
                        <p style="font-size: 12px;"><i class="ph ph-calendar"></i> 14 - 16 Octubre 2026</p>
                        <p style="font-size: 12px;"><i class="ph ph-users"></i> 1,450 Asistentes Registrados</p>
                    </div>
                </div>
                <button class="btn btn-primary" id="btn-manage-awspectrum" style="margin-top: 16px; padding: 12px;">Gestionar Evento</button>
            </div>
            
            <div class="card event-card" style="margin-bottom: 16px; position: relative; overflow: hidden; opacity: 0.6;">
                <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--color-text-muted);"></div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge-live" style="margin-left: 0; margin-bottom: 8px; background: var(--color-text-muted);">BORRADOR</span>
                        <h3 style="font-size: 18px; margin-bottom: 4px;">AWS Summit Latam Demo</h3>
                        <p style="font-size: 12px;"><i class="ph ph-calendar"></i> Por definir</p>
                    </div>
                </div>
                <button class="btn btn-secondary" style="margin-top: 16px; padding: 12px;">Continuar Edición</button>
            </div>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-manage-awspectrum').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            router.navigate('org-dashboard');
        });
        
        document.getElementById('btn-create-event').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            router.navigate('org-builder');
        });

        document.getElementById('btn-settings-hub').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            router.navigate('settings');
        });
    }
};

export const OrgEventBuilderView = {
    render() {
        return `
        <style>
            .stepper-container { display: flex; justify-content: space-between; margin-bottom: 24px; position: relative; padding: 0 10px; }
            .stepper-container::before { content: ''; position: absolute; top: 15px; left: 30px; right: 30px; height: 2px; background: var(--border-subtle); z-index: 1; }
            .step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; z-index: 2; width: 60px; }
            .step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--color-bg-deep); border: 2px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: var(--color-text-muted); transition: all 0.3s ease; }
            .step-label { font-size: 10px; color: var(--color-text-muted); text-align: center; font-weight: 600; text-transform: uppercase; }
            
            .step-item.active .step-circle { border-color: var(--color-cyan); color: var(--color-cyan); box-shadow: 0 0 10px rgba(6, 182, 212, 0.3); }
            .step-item.active .step-label { color: var(--color-cyan); }
            .step-item.completed .step-circle { background: var(--color-cyan); border-color: var(--color-cyan); color: #000; }
            
            .wizard-step { display: none; animation: fadeIn 0.3s ease; }
            .wizard-step.active { display: block; }
            
            .builder-actions { display: flex; gap: 12px; margin-top: 32px; }
        </style>
        
        <header class="app-header" style="padding-bottom: 0; margin-bottom: 16px;">
            <button id="btn-back-hub" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; margin-bottom: 16px;"><i class="ph ph-arrow-left"></i></button>
            <h1>Event Builder</h1>
            <p class="subtitle">Configuración paso a paso</p>
        </header>

        <div class="app-content" style="padding-top: 16px;">
            <div class="stepper-container">
                <div class="step-item active" id="step-ind-1"><div class="step-circle">1</div><span class="step-label">Detalles</span></div>
                <div class="step-item" id="step-ind-2"><div class="step-circle">2</div><span class="step-label">Agenda</span></div>
                <div class="step-item" id="step-ind-3"><div class="step-circle">3</div><span class="step-label">Juego</span></div>
                <div class="step-item" id="step-ind-4"><div class="step-circle">4</div><span class="step-label">Equipo</span></div>
            </div>

            <div class="card" style="min-height: 400px; padding: 24px;">
                
                <!-- STEP 1: Detalles y Salas -->
                <div class="wizard-step active" id="wizard-step-1">
                    <h2 style="margin-bottom: 16px; color: var(--color-cyan);">Detalles del Evento</h2>
                    <label style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">Nombre del Evento</label>
                    <input type="text" class="auth-input" placeholder="Ej. Tech Summit 2026">
                    
                    <div style="display: flex; gap: 12px;">
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">Fecha Inicio</label>
                            <input type="date" class="auth-input">
                        </div>
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">Fecha Fin</label>
                            <input type="date" class="auth-input">
                        </div>
                    </div>

                    <h3 style="margin-top: 16px; margin-bottom: 12px;">Salas / Stages</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;" id="rooms-container">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="text" class="auth-input" style="margin-bottom: 0;" value="Main Stage" readonly>
                            <button class="btn-secondary" style="width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; cursor: pointer;"><i class="ph ph-trash" style="color: var(--color-danger);"></i></button>
                        </div>
                    </div>
                    <button class="btn btn-secondary" style="padding: 12px; font-size: 14px;"><i class="ph ph-plus"></i> Añadir Sala</button>
                </div>

                <!-- STEP 2: Agenda -->
                <div class="wizard-step" id="wizard-step-2">
                    <h2 style="margin-bottom: 16px; color: var(--color-cyan);">Agenda y Bloques</h2>
                    <p style="font-size: 13px; margin-bottom: 16px;">Añade los bloques principales de sesiones. Podrás afinar horarios exactos más adelante.</p>
                    
                    <div style="border: 1px dashed var(--border-subtle); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
                        <i class="ph ph-calendar-plus" style="font-size: 32px; color: var(--color-text-muted); margin-bottom: 8px; display: block;"></i>
                        <p style="font-weight: bold;">Añadir Sesión a la Agenda</p>
                    </div>

                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 3px solid var(--color-aws-orange);">
                            <h4 style="font-size: 14px;">Keynote Apertura</h4>
                            <p style="font-size: 11px; color: var(--color-text-secondary);">Main Stage • 09:00 AM</p>
                        </div>
                    </div>
                </div>

                <!-- STEP 3: Gamificación -->
                <div class="wizard-step" id="wizard-step-3">
                    <h2 style="margin-bottom: 16px; color: var(--color-cyan);">Gamificación</h2>
                    <p style="font-size: 13px; margin-bottom: 16px;">Define cómo los asistentes ganarán puntos.</p>
                    
                    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h4 style="color: var(--color-neon-purple);"><i class="ph-fill ph-magic-wand"></i> Asignación IA</h4>
                        </div>
                        <p style="font-size: 12px;">Generar retos automáticos basados en la temática del evento.</p>
                        <button class="btn btn-secondary" style="margin-top: 12px; padding: 8px; font-size: 12px; border-color: var(--color-neon-purple); color: var(--color-text-primary);">Auto-generar Retos</button>
                    </div>
                    
                    <button class="btn btn-secondary" style="padding: 12px; font-size: 14px;"><i class="ph ph-plus"></i> Añadir Reto Manual</button>
                </div>

                <!-- STEP 4: Equipo -->
                <div class="wizard-step" id="wizard-step-4">
                    <h2 style="margin-bottom: 16px; color: var(--color-cyan);">Gestión de Equipo</h2>
                    <p style="font-size: 13px; margin-bottom: 16px;">Invita a Speakers y Co-Organizadores.</p>

                    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                        <input type="email" class="auth-input" placeholder="correo@ejemplo.com" style="margin-bottom: 0; flex: 2;">
                        <select class="auth-input" style="margin-bottom: 0; flex: 1; padding: 0 8px;">
                            <option>Speaker</option>
                            <option>Organizer</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" style="padding: 12px; font-size: 14px; margin-bottom: 24px;"><i class="ph ph-paper-plane-tilt"></i> Enviar Invitación</button>

                    <h4 style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-secondary);">Invitaciones Pendientes</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                        <div>
                            <p style="font-size: 13px; font-weight: bold;">maria.db@aws.com</p>
                            <p style="font-size: 11px; color: var(--color-aws-orange);">Rol: Speaker</p>
                        </div>
                        <span style="font-size: 11px; color: var(--color-text-muted);">Enviado</span>
                    </div>
                </div>

            </div>

            <div class="builder-actions">
                <button class="btn btn-secondary" id="btn-prev-step" style="flex: 1; display: none;">Atrás</button>
                <button class="btn btn-primary" id="btn-next-step" style="flex: 2;">Continuar</button>
            </div>
        </div>
        `;
    },
    onMount(router) {
        let currentStep = 1;
        const totalSteps = 4;
        
        const btnNext = document.getElementById('btn-next-step');
        const btnPrev = document.getElementById('btn-prev-step');
        
        document.getElementById('btn-back-hub').addEventListener('click', () => {
            router.navigate('org-hub');
        });

        const updateUI = () => {
            // Update steps visibility
            for(let i=1; i<=totalSteps; i++) {
                const stepEl = document.getElementById(`wizard-step-${i}`);
                if(stepEl) {
                    if(i === currentStep) stepEl.classList.add('active');
                    else stepEl.classList.remove('active');
                }
                
                const indEl = document.getElementById(`step-ind-${i}`);
                if(indEl) {
                    if (i < currentStep) {
                        indEl.classList.add('completed');
                        indEl.classList.remove('active');
                    } else if (i === currentStep) {
                        indEl.classList.add('active');
                        indEl.classList.remove('completed');
                    } else {
                        indEl.classList.remove('active');
                        indEl.classList.remove('completed');
                    }
                }
            }

            // Update buttons
            if(currentStep === 1) {
                btnPrev.style.display = 'none';
                btnNext.innerText = 'Continuar';
            } else if (currentStep === totalSteps) {
                btnPrev.style.display = 'block';
                btnNext.innerText = 'Finalizar y Lanzar';
                btnNext.style.background = 'var(--color-success)';
                btnNext.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
            } else {
                btnPrev.style.display = 'block';
                btnNext.innerText = 'Continuar';
                btnNext.style.background = 'var(--color-aws-orange)';
                btnNext.style.boxShadow = '0 4px 14px var(--color-aws-orange-glow)';
            }
        };

        btnNext.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            if(currentStep < totalSteps) {
                currentStep++;
                updateUI();
            } else {
                // Finalizar -> Ir al dashboard
                router.navigate('org-dashboard');
            }
        });

        btnPrev.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(20);
            if(currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    }
};
