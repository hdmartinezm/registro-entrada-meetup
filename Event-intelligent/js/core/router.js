import { store } from './store.js';

export const router = {
    routes: {},
    currentView: null,
    appContainer: null,
    bottomNavsContainer: null,

    init(containerId, navsContainerId) {
        this.appContainer = document.getElementById(containerId);
        this.bottomNavsContainer = document.getElementById(navsContainerId);
    },

    addRoute(path, viewClass) {
        this.routes[path] = viewClass;
    },

    navigate(path) {
        // Route Guard (Protección Básica)
        const publicRoutes = ['auth', 'scan'];
        if (!publicRoutes.includes(path) && store.currentUserRole === 'attendee' && !store.usersDb.some(u => u.role === store.currentUserRole)) {
            // Simplificado para el demo: si necesitas proteger más, aquí va la lógica.
            // path = 'auth';
        }

        if (!this.routes[path]) {
            console.warn(`Ruta ${path} no encontrada, redirigiendo a 404`);
            path = '404';
        }

        if (!this.routes[path]) return;
        
        // Clean up previous view if it has a destroy method
        if (this.currentView && this.currentView.destroy) {
            this.currentView.destroy();
        }

        this.currentView = this.routes[path];
        
        // Render view HTML
        this.appContainer.innerHTML = `<section class="view active" id="view-${path}">
            ${this.currentView.render()}
        </section>`;
        
        // Bind events
        if (this.currentView.onMount) {
            this.currentView.onMount(this);
        }

        this.updateBottomNavVisibility(path);
        
        if (navigator.vibrate) navigator.vibrate(20);
        window.scrollTo(0, 0);
    },

    updateBottomNavVisibility(path) {
        const role = store.currentUserRole;
        const allNavs = document.querySelectorAll('.bottom-tab-bar');
        allNavs.forEach(nav => nav.classList.add('hidden'));

        if (path === 'auth' || path === 'scan' || path === 'speaker-polls' || path === 'org-history' || path === 'org-hub' || path === 'org-builder') return;

        if (role === 'organizer' && store.isOrgModeActive) {
            const orgNav = document.getElementById('bottom-nav-org');
            if(orgNav) orgNav.classList.remove('hidden');
        } else if (role === 'speaker' && store.isSpeakerModeActive) {
            const speakerNav = document.getElementById('bottom-nav-speaker');
            if(speakerNav) speakerNav.classList.remove('hidden');
        } else {
            const attendeeNav = document.getElementById('bottom-nav-attendee');
            if(attendeeNav) attendeeNav.classList.remove('hidden');
        }

        // Update active tab styling
        const tabBtns = document.querySelectorAll('.tab-btn[data-target]');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('ph-fill')) icon.className = icon.className.replace('ph-fill', 'ph');
            
            if (btn.dataset.target === path) {
                btn.classList.add('active');
                if (icon && icon.classList.contains('ph')) icon.className = icon.className.replace('ph', 'ph-fill');
            }
        });
    }
};
