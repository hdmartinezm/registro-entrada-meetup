import { store } from '../../core/store.js';

export const AuthView = {
    render() {
        return `
        <div class="auth-container">
            <header class="auth-header">
                <i class="ph-fill ph-cube auth-logo-icon cube-3d"></i>
                <h1>Bienvenido</h1>
                <p class="subtitle" id="auth-subtitle">a la comunidad de Builders</p>
                <div style="margin-top: 16px;">
                    <select class="lang-selector">
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                        <option value="pt">PT</option>
                    </select>
                </div>
            </header>

            <div class="auth-form" id="auth-form">
                <p class="auth-error" id="auth-error" style="display: none;"></p>
                
                <input type="text" class="auth-input" id="auth-name" placeholder="Tu Nombre Completo" style="display: none;">
                <input type="email" class="auth-input" id="auth-email" placeholder="Correo Electrónico" value="attendee@aws.com">
                <input type="password" class="auth-input" id="auth-password" placeholder="Contraseña" value="quantum2026">
                
                <div class="auth-actions">
                    <button class="btn btn-primary" id="btn-login">Iniciar Sesión</button>
                    <div class="divider"><span>O</span></div>
                    <button class="btn btn-scan-qr" id="btn-scan-auth">
                        <i class="ph-fill ph-qr-code"></i> Escanear Gafete
                    </button>
                    <button class="btn btn-secondary" id="btn-register-toggle" style="margin-top: 8px;">Crear Cuenta</button>
                </div>
            </div>
        </div>
        `;
    },

    onMount(router) {
        const btnLogin = document.getElementById('btn-login');
        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');
        const authError = document.getElementById('auth-error');
        const btnRegisterToggle = document.getElementById('btn-register-toggle');
        const authNameInput = document.getElementById('auth-name');
        const authSubtitle = document.getElementById('auth-subtitle');
        const btnScanAuth = document.getElementById('btn-scan-auth');
        let isRegisterMode = false;

        btnRegisterToggle.addEventListener('click', () => {
            isRegisterMode = !isRegisterMode;
            if (authError) authError.style.display = 'none';
            if (isRegisterMode) {
                authNameInput.style.display = 'block';
                btnLogin.innerText = 'Registrarse';
                btnRegisterToggle.innerText = 'Ya tengo cuenta';
                authSubtitle.innerText = 'Crea tu perfil de Builder';
                emailInput.value = '';
                passwordInput.value = '';
            } else {
                authNameInput.style.display = 'none';
                btnLogin.innerText = 'Iniciar Sesión';
                btnRegisterToggle.innerText = 'Crear Cuenta';
                authSubtitle.innerText = 'a la comunidad de Builders';
                emailInput.value = 'attendee@aws.com';
                passwordInput.value = 'quantum2026';
            }
        });

        btnLogin.addEventListener('click', () => {
            const email = emailInput.value;
            const pass = passwordInput.value;
            
            if (isRegisterMode) {
                const name = authNameInput.value;
                if(email && pass && name) {
                    alert('Cuenta creada exitosamente para ' + name);
                    btnRegisterToggle.click();
                } else {
                    authError.innerText = "Por favor, completa todos los campos.";
                    authError.style.display = 'block';
                    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
                }
                return;
            }

            const user = store.usersDb.find(u => u.email === email && u.password === pass);

            if (user) {
                authError.style.display = 'none';
                store.setRole(user.role);
                
                if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
                
                if (user.role === 'organizer') router.navigate('org-hub');
                else if (user.role === 'speaker') router.navigate('speaker-qa');
                else router.navigate('home');
            } else {
                authError.innerText = "Credenciales incorrectas.";
                authError.style.display = 'block';
                if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
            }
        });

        btnScanAuth.addEventListener('click', () => router.navigate('scan'));
    }
};
