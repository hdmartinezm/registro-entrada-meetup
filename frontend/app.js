// Configuración de la API
const API_BASE_URL = 'https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod'; // Reemplazar después del deploy

// Elementos del DOM
const scanPromptEl = document.getElementById('scanPrompt');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const formEl = document.getElementById('badgeForm');
const successEl = document.getElementById('success');
const downloadLink = document.getElementById('downloadLink');
const printBtn = document.getElementById('printBtn');
const profileUrlInput = document.getElementById('profileUrlInput');
const loadProfileBtn = document.getElementById('loadProfileBtn');

// Extraer parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        profileUrl: params.get('profile') || params.get('url'),
        username: params.get('username')
    };
}

// Mostrar error
function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    scanPromptEl.classList.add('hidden');
}

// Ocultar error
function hideError() {
    errorEl.classList.add('hidden');
}

// Cargar datos del perfil
async function loadProfileData(profileUrl) {
    scanPromptEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    hideError();

    try {
        const response = await fetch(`${API_BASE_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profileUrl })
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener los datos del perfil');
        }

        const data = await response.json();
        populateForm(data);
        formEl.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        loadingEl.classList.add('hidden');
    }
}

// Llenar formulario con datos
function populateForm(data) {
    document.getElementById('username').value = data.username || '';
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('company').value = data.company || '';
    document.getElementById('role').value = data.role || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('bio').value = data.bio || '';
}

// Generar badge
async function generateBadge(formData) {
    loadingEl.classList.remove('hidden');
    hideError();

    try {
        const response = await fetch(`${API_BASE_URL}/generate-badge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('No se pudo generar el badge');
        }

        const result = await response.json();
        showSuccess(result.badgeUrl);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingEl.classList.add('hidden');
    }
}

// Mostrar éxito
function showSuccess(badgeUrl) {
    formEl.classList.add('hidden');
    successEl.classList.remove('hidden');
    downloadLink.href = badgeUrl;
    
    printBtn.onclick = () => {
        window.open(badgeUrl, '_blank');
    };
}

// Manejar envío del formulario
formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        fullName: document.getElementById('fullName').value,
        company: document.getElementById('company').value,
        role: document.getElementById('role').value,
        email: document.getElementById('email').value,
        bio: document.getElementById('bio').value
    };

    await generateBadge(formData);
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const { profileUrl, username } = getUrlParams();
    
    // Si viene de un QR escaneado, cargar automáticamente
    if (profileUrl) {
        loadProfileData(profileUrl);
    } else if (username) {
        loadProfileData(`https://builder.aws.com/community/@${username}`);
    }
    
    // Botón para carga manual
    loadProfileBtn.addEventListener('click', () => {
        const url = profileUrlInput.value.trim();
        if (url) {
            loadProfileData(url);
        } else {
            showError('Por favor ingresa una URL válida');
        }
    });
    
    // Enter en el input
    profileUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadProfileBtn.click();
        }
    });
});
