export const api = {
    baseUrl: 'https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod',
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    getAuthToken() {
        return localStorage.getItem('quantum_token') || '';
    },

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = { ...this.defaultHeaders, ...options.headers };
        const token = this.getAuthToken();
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized. Redirigiendo a login...');
                }
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Fetch failed:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
    },
    
    async put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
    },

    // --- Métodos específicos del backend de Registro MeetUp ---

    async getActiveEvent() {
        return this.get('/events/active');
    },

    async createEvent(name, venue, date) {
        return this.post('/events', { name, venue, date });
    },

    async endEvent(eventId) {
        return this.put(`/events/${eventId}/end`, {});
    },

    async getEventReport(eventId) {
        return this.get(`/events/${eventId}/report`);
    },

    async getStats() {
        return this.get('/stats');
    },

    async importFromEventbrite(eventUrl, accessToken, eventId) {
        return this.post('/import/eventbrite', { eventUrl, accessToken, eventId });
    },

    async importFromMeetupManual(eventId, attendees) {
        return this.post('/import/meetup-manual', { eventId, attendees, source: 'meetup' });
    },

    async getPreregistered(eventId) {
        return this.get(`/import/preregistered/${eventId}`);
    },

    async getImportStatus(eventId) {
        return this.get(`/import/status/${eventId}`);
    },

    async scrapeProfile(profileUrl) {
        return this.post('/scrape', { profileUrl });
    },

    async generateBadge(data) {
        return this.post('/generate-badge', data);
    }
};
