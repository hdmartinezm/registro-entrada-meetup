export const store = {
    usersDb: [],
    currentUserRole: 'attendee', // fallback
    isSpeakerModeActive: false,
    isOrgModeActive: false,
    activeEvent: null,

    // --- Pub/Sub Pattern (Vanilla State Manager) ---
    listeners: [],
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    
    setState(newState) {
        Object.assign(this, newState);
        this.notify();
    },
    
    notify() {
        this.listeners.forEach(listener => listener(this));
    },

    getState() {
        return {
            currentUserRole: this.currentUserRole,
            isSpeakerModeActive: this.isSpeakerModeActive,
            isOrgModeActive: this.isOrgModeActive,
            activeEvent: this.activeEvent
        };
    },
    // -----------------------------------------------

    async loadUsers() {
        try {
            const response = await fetch('users.txt');
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');
                lines.forEach((line, index) => {
                    if(index > 0 && line.trim().length > 0) {
                        const [email, password, role] = line.split(',');
                        this.usersDb.push({ email: email.trim(), password: password.trim(), role: role.trim() });
                    }
                });
                console.log('Users loaded from TXT:', this.usersDb);
            } else {
                throw new Error('No se pudo cargar users.txt');
            }
        } catch (error) {
            console.warn('Fallback: Cargando usuarios en memoria.', error);
            this.usersDb = [
                { email: 'attendee@aws.com', password: 'quantum2026', role: 'attendee' },
                { email: 'speaker@aws.com', password: 'quantum2026', role: 'speaker' },
                { email: 'org@aws.com', password: 'quantum2026', role: 'organizer' }
            ];
        }
    },
    
    setRole(role) {
        this.setState({
            currentUserRole: role,
            isSpeakerModeActive: (role === 'speaker'),
            isOrgModeActive: (role === 'organizer')
        });
    }
};
