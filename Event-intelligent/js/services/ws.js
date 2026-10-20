export const wsService = {
    socket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    listeners: new Map(),

    connect(eventId) {
        const token = localStorage.getItem('quantum_token') || 'dummy-token';
        // const url = \`wss://sockets.quantum-awspectrum.demo?eventId=\${eventId}&token=\${token}\`;
        
        // Simulación temporal de WebSockets para el entorno actual
        console.log(\`[WS] Simulando conexión a evento \${eventId}...\`);
        this.socket = {
            readyState: 1, // OPEN
            send: (data) => console.log('[WS MOCK SEND]', data),
            close: () => console.log('[WS MOCK CLOSE]')
        };
        
        setTimeout(() => {
            this.notify('connected', { eventId });
        }, 500);

        // --- Código de producción comentado ---
        /*
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
            console.log('[WS] Conectado exitosamente');
            this.reconnectAttempts = 0;
            this.notify('connected', { eventId });
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notify(data.type, data.payload);
            } catch(e) {
                console.error('[WS] Error parseando mensaje', e);
            }
        };

        this.socket.onclose = () => {
            console.log('[WS] Desconectado');
            this.notify('disconnected', null);
            this.attemptReconnect(eventId);
        };

        this.socket.onerror = (error) => {
            console.error('[WS] Error', error);
        };
        */
    },

    attemptReconnect(eventId) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            console.log(\`[WS] Intentando reconectar en \${timeout}ms (Intento \${this.reconnectAttempts})\`);
            setTimeout(() => this.connect(eventId), timeout);
        } else {
            console.error('[WS] Falló la reconexión tras máximos intentos.');
            this.notify('reconnect_failed', null);
        }
    },

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    },

    notify(eventType, payload) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(cb => cb(payload));
        }
    },

    send(type, payload) {
        if (this.socket && this.socket.readyState === 1) { // WebSocket.OPEN
            this.socket.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('[WS] Intento de envío pero no está conectado');
        }
    },

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
};
