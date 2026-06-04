export const api = {
    baseUrl: 'https://api.quantum-awspectrum.demo', // Reemplazar con API Gateway real
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    getAuthToken() {
        // En producción, obtener de Cognito / localStorage
        return localStorage.getItem('quantum_token') || '';
    },

    async request(endpoint, options = {}) {
        const url = \`\${this.baseUrl}\${endpoint}\`;
        const headers = { ...this.defaultHeaders, ...options.headers };
        const token = this.getAuthToken();
        
        if (token) {
            headers['Authorization'] = \`Bearer \${token}\`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            // Mock delay para simular red en la PWA actual
            if(url.includes('.demo')) {
                return await this.mockResponse(endpoint, options);
            }

            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized. Redirigiendo a login...');
                    // router.navigate('auth')
                }
                throw new Error(\`API Error: \${response.status}\`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Fetch failed:', error);
            throw error; // Dejar que el UI maneje el error (ej. mostrando un Toast)
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

    // --- MOCK RESPONSE PARA SIMULACIÓN ---
    async mockResponse(endpoint, options) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(\`[API MOCK] \${options.method || 'GET'} \${endpoint}\`);
                resolve({ success: true, mocked: true, endpoint });
            }, 800);
        });
    }
};
