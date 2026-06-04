export const Nav = {
    render() {
        return `
        <!-- BOTTOM TAB BAR (ATTENDEE) -->
        <nav class="bottom-tab-bar hidden" id="bottom-nav-attendee">
            <button class="tab-btn active" data-target="home">
                <i class="ph-fill ph-house"></i>
                <span>Inicio</span>
            </button>
            <button class="tab-btn" data-target="agenda">
                <i class="ph ph-calendar-blank"></i>
                <span>Agenda</span>
            </button>
            <button class="tab-btn action-btn" data-target="scan">
                <div class="scan-wrapper">
                    <i class="ph ph-scan"></i>
                </div>
            </button>
            <button class="tab-btn" data-target="qa">
                <i class="ph ph-chats-circle"></i>
                <span>Q&A</span>
            </button>
            <button class="tab-btn" data-target="missions">
                <i class="ph ph-target"></i>
                <span>Misiones</span>
            </button>
        </nav>

        <!-- BOTTOM TAB BAR (SPEAKER) -->
        <nav class="bottom-tab-bar hidden" id="bottom-nav-speaker">
            <button class="tab-btn active" data-target="speaker-qa">
                <i class="ph-fill ph-chats"></i>
                <span>Q&A</span>
            </button>
            <button class="tab-btn" data-target="speaker-feedback">
                <i class="ph ph-chart-line-up"></i>
                <span>Analytics</span>
            </button>
            <button class="tab-btn action-btn" data-target="speaker-polls">
                <div class="scan-wrapper" style="background: linear-gradient(135deg, var(--color-aws-orange), var(--color-danger));">
                    <i class="ph ph-chart-pie-slice"></i>
                </div>
            </button>
            <button class="tab-btn" data-target="speaker-quantum">
                <i class="ph ph-atom"></i>
                <span>Quantum</span>
            </button>
            <button class="tab-btn" data-target="settings">
                <i class="ph ph-gear"></i>
                <span>Ajustes</span>
            </button>
        </nav>

        <!-- BOTTOM TAB BAR (ORGANIZER) -->
        <nav class="bottom-tab-bar hidden" id="bottom-nav-org">
            <button class="tab-btn active" data-target="org-dashboard">
                <i class="ph-fill ph-squares-four"></i>
                <span>Dashboard</span>
            </button>
            <button class="tab-btn" data-target="org-leaderboard">
                <i class="ph ph-trophy"></i>
                <span>Ranking</span>
            </button>
            <button class="tab-btn action-btn" data-target="org-missions">
                <div class="scan-wrapper" style="background: linear-gradient(135deg, var(--color-cyan), var(--color-neon-purple));">
                    <i class="ph ph-plus"></i>
                </div>
            </button>
            <button class="tab-btn" data-target="org-qa">
                <i class="ph ph-brain"></i>
                <span>Q&A IA</span>
            </button>
            <button class="tab-btn" data-target="org-quantum">
                <i class="ph ph-atom"></i>
                <span>Quantum</span>
            </button>
        </nav>
        `;
    },
    
    bindEvents(router) {
        document.querySelectorAll('.tab-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                if (target) router.navigate(target);
            });
        });
    }
};
