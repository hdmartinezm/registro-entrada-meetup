import { store } from './core/store.js';
import { router } from './core/router.js';
import { Nav } from './components/Nav.js';
import { Modals } from './components/Modals.js';
import { DynamicBackground } from './utils/DynamicBackground.js';

// Vistas
import { AuthView } from './views/auth/AuthView.js';
import { HomeView } from './views/attendee/HomeView.js';
import { AgendaView, MissionsView, ScanView, QAView } from './views/attendee/AttendeeViews.js';
import { SpeakerQAView, SpeakerFeedbackView, SpeakerPollsManagerView, SpeakerQuantumEngineView } from './views/speaker/SpeakerViews.js';
import { OrgDashboardView, OrgLeaderboardView, OrgMissionsBuilderView, OrgQAInsightsView, OrgQuantumEngineView, OrgEventHubView, OrgEventBuilderView } from './views/organizer/OrganizerViews.js';
import { OrgHistoryView } from './views/organizer/OrgHistoryView.js';
import { SettingsView } from './views/shared/SettingsView.js';
import { NotFoundView } from './views/shared/NotFoundView.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init background
    new DynamicBackground('bg-canvas');

    // 2. Load state
    await store.loadUsers();

    // 3. Inject global UI
    document.getElementById('nav-container').innerHTML = Nav.render();
    document.getElementById('modals-container').innerHTML = Modals.render();

    // 4. Init Router
    router.init('app-container', 'nav-container');

    // Auth
    router.addRoute('auth', AuthView);
    
    // Attendee
    router.addRoute('home', HomeView);
    router.addRoute('agenda', AgendaView);
    router.addRoute('missions', MissionsView);
    router.addRoute('scan', ScanView);
    router.addRoute('qa', QAView);
    
    // Speaker
    router.addRoute('speaker-qa', SpeakerQAView);
    router.addRoute('speaker-polls', SpeakerPollsManagerView);
    router.addRoute('speaker-feedback', SpeakerFeedbackView);
    router.addRoute('speaker-quantum', SpeakerQuantumEngineView);

    // Organizer
    router.addRoute('org-hub', OrgEventHubView);
    router.addRoute('org-builder', OrgEventBuilderView);
    router.addRoute('org-dashboard', OrgDashboardView);
    router.addRoute('org-history', OrgHistoryView);
    router.addRoute('org-leaderboard', OrgLeaderboardView);
    router.addRoute('org-missions', OrgMissionsBuilderView);
    router.addRoute('org-qa', OrgQAInsightsView);
    router.addRoute('org-quantum', OrgQuantumEngineView);

    // Shared
    router.addRoute('settings', SettingsView);
    router.addRoute('404', NotFoundView);

    // 5. Bind Global Events
    Nav.bindEvents(router);
    Modals.bindEvents();

    // 6. Init Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('Service Worker registrado', reg.scope);
        }).catch(err => {
            console.error('Service Worker falló', err);
        });
    }

    // 7. Start App
    router.navigate('auth');
});
