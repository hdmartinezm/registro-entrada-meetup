export const AgendaView = {
    render() {
        return `
        <header class="app-header">
            <h1>Agenda</h1>
            <p class="subtitle">Tus sesiones recomendadas</p>
        </header>
        <div class="day-tabs-container">
            <div class="day-tabs" style="display: flex; gap: 8px;">
                <button class="day-tab active" id="tab-all-sessions">Todas</button>
                <button class="day-tab" id="tab-my-itinerary" style="color: var(--color-cyan); border-color: var(--color-cyan);">Mi Itinerario <i class="ph-fill ph-bookmark-simple"></i></button>
            </div>
        </div>

        <div id="itinerary-banner" class="card neon-border hidden" style="margin-bottom: 16px; background: rgba(6,182,212,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: var(--color-cyan);"><i class="ph ph-timer"></i> Siguiente Sesión</h3>
                    <p style="font-size: 13px;">Construyendo con Bedrock</p>
                </div>
                <div style="font-size: 24px; font-weight: bold; font-family: monospace;">14:59</div>
            </div>
        </div>

        <div class="agenda-timeline">
            <div class="agenda-item" data-added="true">
                <div class="agenda-time">10:00 AM</div>
                <div class="card agenda-card">
                    <div class="agenda-card-content">
                        <h3>Keynote: Quantum Computing</h3>
                        <p class="speaker"><i class="ph ph-user"></i> Dr. Elena Rosas</p>
                    </div>
                    <button class="btn-add-itinerary added"><i class="ph ph-check"></i></button>
                </div>
            </div>
            <div class="agenda-item" data-added="false">
                <div class="agenda-time">11:30 AM <span class="badge-live pulse">LIVE</span></div>
                <div class="card agenda-card current-session">
                    <div class="agenda-card-content">
                        <h3>Serverless AI Architecture</h3>
                        <p class="speaker"><i class="ph ph-user"></i> Carlos Ruiz</p>
                    </div>
                    <button class="btn-add-itinerary"><i class="ph ph-plus"></i></button>
                </div>
            </div>
            <div class="agenda-item" data-added="true">
                <div class="agenda-time">02:00 PM</div>
                <div class="card agenda-card">
                    <div class="agenda-card-content">
                        <h3>Construyendo con Bedrock</h3>
                        <p class="speaker"><i class="ph ph-user"></i> Ana Maria D.</p>
                    </div>
                    <button class="btn-add-itinerary added"><i class="ph ph-check"></i></button>
                </div>
            </div>
        </div>
        `;
    },
    onMount(router) {
        // Toggle itinerary buttons
        document.querySelectorAll('.btn-add-itinerary').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.agenda-item');
                if(this.classList.contains('added')) {
                    this.classList.remove('added');
                    this.innerHTML = '<i class="ph ph-plus"></i>';
                    if (item) item.setAttribute('data-added', 'false');
                } else {
                    this.classList.add('added');
                    this.innerHTML = '<i class="ph ph-check"></i>';
                    if (item) item.setAttribute('data-added', 'true');
                }
                if (navigator.vibrate) navigator.vibrate(20);
                
                // Refresh filter if "Mi Itinerario" is active
                const tabMy = document.getElementById('tab-my-itinerary');
                if(tabMy && tabMy.classList.contains('active')) {
                    applyFilter(true);
                }
            });
        });

        const tabAll = document.getElementById('tab-all-sessions');
        const tabMy = document.getElementById('tab-my-itinerary');
        const banner = document.getElementById('itinerary-banner');
        const items = document.querySelectorAll('.agenda-item');

        const applyFilter = (onlyAdded) => {
            items.forEach(item => {
                if (onlyAdded) {
                    item.style.display = item.getAttribute('data-added') === 'true' ? 'flex' : 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
        };

        if(tabAll && tabMy) {
            tabAll.addEventListener('click', () => {
                tabAll.classList.add('active');
                tabMy.classList.remove('active');
                banner.classList.add('hidden');
                applyFilter(false);
            });

            tabMy.addEventListener('click', () => {
                tabMy.classList.add('active');
                tabAll.classList.remove('active');
                banner.classList.remove('hidden');
                applyFilter(true);
            });
        }
    }
};

export const MissionsView = {
    render() {
        return `
        <header class="app-header">
            <h1>Misiones</h1>
            <p class="subtitle">Completa retos para subir de nivel</p>
        </header>
        <div class="missions-list">
            <div class="card mission-card neon-border">
                <div class="mission-icon active"><i class="ph-fill ph-rocket-launch"></i></div>
                <div class="mission-info">
                    <h3>Conector Quantum</h3>
                    <p>Escanea 3 gafetes de asistentes de nivel superior.</p>
                    <div class="mission-progress">
                        <div class="progress-bar small"><div class="progress-fill aws-gradient" style="width: 66%;"></div></div>
                        <span>2/3</span>
                    </div>
                    <span class="mission-xp">+500 XP</span>
                    <button class="btn btn-secondary btn-do-mission" style="margin-top: 12px; padding: 8px;">Ir al Escáner</button>
                </div>
            </div>
            <div class="card mission-card completed">
                <div class="mission-icon"><i class="ph-fill ph-check-circle"></i></div>
                <div class="mission-info">
                    <h3>Madrugador Serverless</h3>
                    <p>Asiste a la primera charla del día.</p>
                    <span class="mission-xp">+200 XP</span>
                </div>
            </div>
        </div>
        `;
    },
    onMount(router) {
        document.querySelectorAll('.btn-do-mission').forEach(btn => {
            btn.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(20);
                router.navigate('scan');
            });
        });
    }
};

export const ScanView = {
    render() {
        return `
        <div class="scanner-container cyberpunk">
            <div class="scanner-header absolute">
                <button class="btn-close-scan" id="btn-close-scan"><i class="ph ph-x"></i> CANCEL</button>
                <div class="hud-text">SYS.SCANNER_ACTIVE</div>
            </div>
            <div class="scanner-viewport">
                <div class="scanner-frame cyberpunk-frame">
                    <div class="corner top-left"></div>
                    <div class="corner top-right"></div>
                    <div class="corner bottom-left"></div>
                    <div class="corner bottom-right"></div>
                    <div class="crosshair"></div>
                    <div class="scan-line horizontal"></div>
                    <div class="scan-line vertical"></div>
                </div>
            </div>
            <div class="scanner-footer absolute">
                <div class="hud-warning">/// ALINEAR MARCADOR CUÁNTICO ///</div>
                <button class="btn btn-secondary btn-glitch" id="btn-simulate-scan">SIMULAR ESCANEO [DEV]</button>
            </div>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-close-scan').addEventListener('click', () => {
            history.back(); // Or router.navigate('home') based on state
        });
        document.getElementById('btn-simulate-scan').addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate([30, 100, 30]);
            alert('¡Escaneo Cyberpunk Exitoso! \n\nMisión "Conector Quantum" progresada (+500 XP)');
            router.navigate('missions');
        });
    }
};

export const QAView = {
    render() {
        return `
        <header class="app-header">
            <h1>Live Q&A</h1>
            <p class="subtitle">Interactúa con el ponente en vivo</p>
        </header>
        <div class="qa-tabs">
            <button class="qa-tab active" data-qa-target="qa-chat">Preguntas</button>
            <button class="qa-tab" data-qa-target="qa-polls">Encuestas <span class="badge-new">1</span></button>
        </div>
        
        <section id="qa-chat" class="qa-content active">
            <div class="qa-input-area">
                <input type="text" class="auth-input" placeholder="Haz una pregunta...">
                <button class="btn-send"><i class="ph-bold ph-paper-plane-right"></i></button>
            </div>
            <div class="qa-list">
                <div class="card qa-card">
                    <div class="qa-card-body">
                        <h4 class="qa-author">Maria DB</h4>
                        <p class="qa-text">¿Cómo manejas los cold starts cuando usas modelos pesados en Lambda?</p>
                    </div>
                    <button class="btn-upvote active">
                        <i class="ph-fill ph-heart"></i>
                        <span class="upvote-count">43</span>
                    </button>
                </div>
            </div>
        </section>

        <section id="qa-polls" class="qa-content">
            <div class="card poll-card neon-border">
                <h3 style="margin-bottom: 16px;">¿Qué framework de IA usas más?</h3>
                <div id="poll-options-1" style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary btn-poll-option" style="justify-content: flex-start;">LangChain</button>
                    <button class="btn btn-secondary btn-poll-option" style="justify-content: flex-start;">AWS Bedrock Agents</button>
                </div>
            </div>
        </section>
        `;
    },
    onMount(router) {
        const qaTabs = document.querySelectorAll('.qa-tab');
        const qaContents = document.querySelectorAll('.qa-content');
        
        qaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                qaTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.dataset.qaTarget;
                qaContents.forEach(content => {
                    if(content.id === targetId) content.classList.add('active');
                    else content.classList.remove('active');
                });
                if (navigator.vibrate) navigator.vibrate(20);
            });
        });

        // Upvote Logic
        const handleUpvote = (btn) => {
            const countSpan = btn.querySelector('.upvote-count');
            const icon = btn.querySelector('i');
            let currentCount = parseInt(countSpan.innerText);
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                countSpan.innerText = currentCount - 1;
                icon.className = 'ph ph-heart';
            } else {
                btn.classList.add('active');
                countSpan.innerText = currentCount + 1;
                icon.className = 'ph-fill ph-heart';
            }
            if (navigator.vibrate) navigator.vibrate(30);
        };

        document.querySelectorAll('.btn-upvote').forEach(btn => {
            btn.addEventListener('click', () => handleUpvote(btn));
        });

        // Send Question Logic
        const btnSendQa = document.querySelector('.btn-send');
        const inputQa = document.querySelector('.qa-input-area input');
        if (btnSendQa && inputQa) {
            btnSendQa.addEventListener('click', () => {
                const questionText = inputQa.value.trim();
                if (questionText) {
                    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                    const qaList = document.querySelector('.qa-list');
                    const newCard = document.createElement('div');
                    newCard.className = 'card qa-card neon-border';
                    newCard.innerHTML = `
                        <div class="qa-card-body">
                            <h4 class="qa-author">Tú <span class="badge-new">AHORA</span></h4>
                            <p class="qa-text">${questionText}</p>
                        </div>
                        <button class="btn-upvote active">
                            <i class="ph-fill ph-heart"></i>
                            <span class="upvote-count">1</span>
                        </button>
                    `;
                    qaList.prepend(newCard);
                    inputQa.value = '';
                    newCard.querySelector('.btn-upvote').addEventListener('click', function() { handleUpvote(this); });
                }
            });
        }

        // Poll logic
        const pollOptions = document.querySelectorAll('.btn-poll-option');
        pollOptions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = btn.parentElement;
                if(parent.hasAttribute('data-voted')) return;
                parent.setAttribute('data-voted', 'true');
                
                const isFirstOption = btn.innerText.includes('LangChain');
                const percent1 = isFirstOption ? 68 : 32;
                const percent2 = isFirstOption ? 32 : 68;

                const btns = parent.querySelectorAll('.btn-poll-option');
                
                btns[0].innerHTML = `<div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-cyan); width: ${percent1}%; opacity: 0.4; border-radius: 8px;"></div><span style="position: relative; z-index: 1; font-weight: bold;">LangChain - ${percent1}%</span>`;
                btns[0].style.position = 'relative';
                btns[0].style.justifyContent = 'flex-start';
                btns[0].className = 'btn btn-secondary btn-poll-option';
                
                btns[1].innerHTML = `<div class="poll-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; background: var(--color-aws-orange); width: ${percent2}%; opacity: 0.4; border-radius: 8px;"></div><span style="position: relative; z-index: 1; font-weight: bold;">AWS Bedrock Agents - ${percent2}%</span>`;
                btns[1].style.position = 'relative';
                btns[1].style.justifyContent = 'flex-start';
                btns[1].className = 'btn btn-secondary btn-poll-option';

                btn.innerHTML += ' <span style="position: relative; z-index: 1; margin-left: auto; color: white;"><i class="ph-fill ph-check-circle"></i> Votado</span>';
                
                if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
            });
        });
    }
};
