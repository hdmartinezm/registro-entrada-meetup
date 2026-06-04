export const OrgHistoryView = {
    render() {
        return `
        <header class="app-header" style="display: flex; gap: 16px; align-items: center;">
            <button id="btn-back-org-dash" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;"><i class="ph ph-arrow-left"></i></button>
            <div>
                <h1 style="font-size: 20px;">Auditoría de Eventos</h1>
                <p class="subtitle">Recreación de retención minuto a minuto</p>
            </div>
        </header>

        <div style="margin-bottom: 24px;">
            <label style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; display: block;">Seleccionar Evento Pasado</label>
            <select class="auth-input" id="history-event-selector">
                <option value="awspectrum-2025">AWSpectrum LATAM 2025</option>
                <option value="aws-summit-2024">AWS Summit Bogotá 2024</option>
                <option value="serverless-conf-23">Serverless Conf 2023</option>
            </select>
        </div>

        <div class="card neon-border" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3>Línea de Tiempo (Actividad)</h3>
                <span id="history-time-display" style="font-family: monospace; color: var(--color-aws-orange); font-weight: bold; font-size: 16px;">10:00 AM</span>
            </div>
            
            <!-- CSS Chart (Dynamic) -->
            <div class="css-chart" id="history-chart" style="height: 120px;">
                <div class="chart-bar-container"><div class="chart-bar" style="height: 30%;" data-height="30"></div><span>10h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 50%;" data-height="50"></div><span>11h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 90%; background-color: var(--color-danger);" data-height="90"></div><span>12h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 60%;" data-height="60"></div><span>13h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 40%;" data-height="40"></div><span>14h</span></div>
                <div class="chart-bar-container"><div class="chart-bar" style="height: 20%;" data-height="20"></div><span>15h</span></div>
            </div>

            <div style="margin-top: 32px;">
                <label style="font-size: 13px; color: var(--color-text-secondary); display: flex; justify-content: space-between;">
                    <span>Recrear Tiempo</span>
                    <span><i class="ph-fill ph-play-circle" id="btn-play-history" style="font-size: 20px; color: var(--color-cyan); cursor: pointer;"></i></span>
                </label>
                <input type="range" id="history-scrubber" min="0" max="100" value="0" style="width: 100%; margin-top: 12px; accent-color: var(--color-cyan);">
            </div>
        </div>

        <div class="card">
            <h3>Insights del Minuto</h3>
            <ul style="list-style: none; padding: 0; margin-top: 12px; font-size: 13px; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 8px;" id="history-insights">
                <li><i class="ph-fill ph-warning-circle" style="color: var(--color-aws-orange);"></i> 10:00 AM - Inicio lento, 30% de la audiencia conectada.</li>
                <li><i class="ph-fill ph-info" style="color: var(--color-cyan);"></i> 10:15 AM - Acceso masivo a la sala principal.</li>
            </ul>
        </div>
        `;
    },
    onMount(router) {
        document.getElementById('btn-back-org-dash').addEventListener('click', () => router.navigate('org-dashboard'));

        const scrubber = document.getElementById('history-scrubber');
        const timeDisplay = document.getElementById('history-time-display');
        const bars = document.querySelectorAll('#history-chart .chart-bar');
        const btnPlay = document.getElementById('btn-play-history');
        this.playInterval = null;

        const updateTimeline = (value) => {
            // Map 0-100 to time 10:00 AM to 03:00 PM (15:00)
            const startHour = 10;
            const totalHours = 5;
            const currentHourDecimal = startHour + (value / 100) * totalHours;
            
            const hours = Math.floor(currentHourDecimal);
            const minutes = Math.floor((currentHourDecimal - hours) * 60);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours > 12 ? hours - 12 : hours;
            
            timeDisplay.innerText = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

            // Highlight bars based on scrubber position
            bars.forEach((bar, index) => {
                const barPosition = (index / (bars.length - 1)) * 100;
                if (Math.abs(value - barPosition) < 10) {
                    bar.style.filter = 'brightness(1.5)';
                    bar.style.boxShadow = '0 0 10px var(--color-cyan-glow)';
                } else {
                    bar.style.filter = 'brightness(0.7)';
                    bar.style.boxShadow = 'none';
                }
            });
            if (navigator.vibrate && value % 10 === 0) navigator.vibrate(5);
        };

        scrubber.addEventListener('input', (e) => updateTimeline(e.target.value));

        btnPlay.addEventListener('click', () => {
            if (this.playInterval) {
                clearInterval(this.playInterval);
                this.playInterval = null;
                btnPlay.className = 'ph-fill ph-play-circle';
            } else {
                btnPlay.className = 'ph-fill ph-pause-circle';
                this.playInterval = setInterval(() => {
                    let val = parseInt(scrubber.value);
                    if (val >= 100) {
                        clearInterval(this.playInterval);
                        this.playInterval = null;
                        btnPlay.className = 'ph-fill ph-play-circle';
                        return;
                    }
                    scrubber.value = val + 1;
                    updateTimeline(scrubber.value);
                }, 100);
            }
        });
    },
    destroy() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }
};
