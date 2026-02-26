// Configuración
const API_BASE_URL = 'https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod'; // Reemplazar después del deploy

// Estados de la UI
const states = {
    scanWaiting: document.getElementById('scanWaiting'),
    processing: document.getElementById('processing'),
    confirmData: document.getElementById('confirmData'),
    success: document.getElementById('success'),
    error: document.getElementById('error')
};

// Elementos
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const cameraContainer = document.getElementById('cameraContainer');
const qrVideo = document.getElementById('qrVideo');
const manualUrl = document.getElementById('manualUrl');
const manualSubmitBtn = document.getElementById('manualSubmitBtn');
const nextAttendeeBtn = document.getElementById('nextAttendeeBtn');
const retryBtn = document.getElementById('retryBtn');
const manualEntryBtn = document.getElementById('manualEntryBtn');
const downloadBadgeBtn = document.getElementById('downloadBadgeBtn');
const badgeForm = document.getElementById('badgeForm');
const cancelBtn = document.getElementById('cancelBtn');

// Estadísticas
let totalBadges = 0;
let eventBadges = 0;

// Evento activo
let activeEventId = null;
let activeEventData = null;
let reportAttendees = [];
let reportEventData = {};

// Scanner de QR
let html5QrCode = null;
let isScanning = false;

// Cambiar estado de la UI
function showState(stateName) {
    Object.values(states).forEach(state => state.classList.add('hidden'));
    states[stateName].classList.remove('hidden');
}

// Actualizar paso del proceso
function updateProcessStep(stepNumber, status = 'active') {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
        step.classList.remove('active', 'completed');
        step.classList.add(status);
        
        if (status === 'completed') {
            step.querySelector('.step-icon').textContent = '✅';
        }
    }
}

// Iniciar cámara para escaneo
async function startCamera() {
    try {
        cameraContainer.classList.remove('hidden');
        startCameraBtn.classList.add('hidden');
        
        // Verificar si Html5Qrcode está disponible
        if (typeof Html5Qrcode === 'undefined') {
            throw new Error('Librería de QR no cargada');
        }
        
        html5QrCode = new Html5Qrcode("qrReader");
        
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };
        
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onQRCodeScanned,
            onScanError
        );
        
        isScanning = true;
    } catch (error) {
        console.error('Error al iniciar cámara:', error);
        
        let errorMsg = 'No se pudo acceder a la cámara. ';
        if (error.name === 'NotAllowedError') {
            errorMsg += 'Permiso denegado. Por favor permite el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
            errorMsg += 'No se encontró ninguna cámara.';
        } else if (error.name === 'NotSupportedError') {
            errorMsg += 'La cámara requiere HTTPS. Usa entrada manual.';
        } else {
            errorMsg += 'Usa entrada manual. Error: ' + error.message;
        }
        
        alert(errorMsg);
        stopCamera();
    }
}

// Detener cámara
async function stopCamera() {
    if (html5QrCode && isScanning) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (error) {
            console.error('Error al detener cámara:', error);
        }
    }
    
    cameraContainer.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
    isScanning = false;
}

// Callback cuando se escanea un QR
function onQRCodeScanned(decodedText) {
    if (!isScanning) return;
    
    console.log('QR escaneado:', decodedText);
    
    // Detener escaneo
    stopCamera();
    
    // Procesar el QR
    processProfile(decodedText);
}

// Callback de error de escaneo (silencioso)
function onScanError(error) {
    // Ignorar errores de escaneo continuo
}

// Procesar perfil del usuario
async function processProfile(profileUrl) {
    if (!activeEventId) {
        alert('No hay un evento activo. Crea un evento antes de registrar asistentes.');
        return;
    }

    showState('processing');
    document.getElementById('processingStatus').textContent = 'Extrayendo datos del perfil...';
    updateProcessStep(1, 'active');
    
    try {
        // Paso 1: Extraer datos del perfil
        const profileData = await fetchProfileData(profileUrl);
        updateProcessStep(1, 'completed');
        
        // Generar badge automáticamente sin confirmación
        await generateBadgeAutomatically(profileData);
        
    } catch (error) {
        console.error('Error al procesar:', error);
        showError(error.message || 'Error al procesar el perfil');
    }
}

// Generar badge automáticamente
async function generateBadgeAutomatically(profileData) {
    document.getElementById('processingStatus').textContent = 'Generando badge...';
    updateProcessStep(2, 'active');
    
    try {
        // Preparar datos para el badge (sin email)
        const badgeData = {
            username: profileData.username || '',
            fullName: profileData.fullName || '',
            company: profileData.company || '',
            role: profileData.role || '',
            email: '' // Email vacío
        };

        // Incluir eventId si hay un evento activo
        if (activeEventId) {
            badgeData.eventId = activeEventId;
        }
        
        const badgeResult = await generateBadge(badgeData);
        updateProcessStep(2, 'completed');
        
        // Paso 3: Enviar a impresora
        document.getElementById('processingStatus').textContent = 'Enviando a impresora...';
        updateProcessStep(3, 'active');
        
        await sendToPrinter(badgeResult.badgeUrl);
        updateProcessStep(3, 'completed');
        
        // Mostrar éxito
        showSuccess(badgeData, badgeResult);
        
    } catch (error) {
        console.error('Error al generar badge:', error);
        showError(error.message || 'Error al generar el badge');
    }
}

// Mostrar éxito
async function fetchProfileData(profileUrl) {
    try {
        const response = await fetch(`${API_BASE_URL}/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileUrl })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'No se pudo obtener los datos del perfil');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en fetchProfileData:', error);
        throw error;
    }
}

// Generar badge
async function generateBadge(profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-badge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'No se pudo generar el badge');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en generateBadge:', error);
        throw error;
    }
}

// Enviar a impresora
async function sendToPrinter(badgeUrl) {
    try {
        const autoPrint = document.getElementById('autoPrintToggle').checked;
        
        if (autoPrint) {
            // Impresión automática habilitada
            const printWindow = window.open(badgeUrl, '_blank', 'width=800,height=600');
            
            if (printWindow) {
                // Esperar a que cargue el PDF y luego imprimir
                printWindow.addEventListener('load', function() {
                    setTimeout(() => {
                        printWindow.print();
                        // Cerrar ventana después de imprimir (opcional)
                        // printWindow.close();
                    }, 1000);
                });
            } else {
                // Si el popup fue bloqueado, mostrar mensaje
                console.warn('Popup bloqueado. Habilita popups para impresión automática.');
            }
        } else {
            // Solo abrir el PDF sin imprimir automáticamente
            window.open(badgeUrl, '_blank');
        }
        
        // Simular delay para la UI
        return new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Error al enviar a impresora:', error);
        // Continuar aunque falle la impresión automática
        return Promise.resolve();
    }
}

// Mostrar éxito
function showSuccess(profileData, badgeResult) {
    document.getElementById('attendeeName').textContent = profileData.fullName || 'N/A';
    document.getElementById('attendeeCompany').textContent = profileData.company || '';
    document.getElementById('attendeeUsername').textContent = `@${profileData.username}`;
    
    downloadBadgeBtn.href = badgeResult.badgeUrl;
    downloadBadgeBtn.download = `badge-${profileData.username}.pdf`;
    
    // Actualizar estadísticas
    totalBadges++;
    eventBadges++;
    document.getElementById('totalBadges').textContent = totalBadges;
    document.getElementById('lastHour').textContent = eventBadges;
    
    showState('success');
    
    // Auto-avanzar después de 5 segundos
    setTimeout(() => {
        if (states.success.classList.contains('hidden') === false) {
            resetToScan();
        }
    }, 5000);
}

// Mostrar error
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showState('error');
}

// Resetear a estado de escaneo
function resetToScan() {
    manualUrl.value = '';
    showState('scanWaiting');
}

// Event Listeners
startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);

manualSubmitBtn.addEventListener('click', () => {
    let input = manualUrl.value.trim();
    if (input) {
        // Si es solo el username (con o sin @), construir la URL completa
        if (!input.startsWith('http')) {
            // Remover @ si existe
            if (input.startsWith('@')) {
                input = input.substring(1);
            }
            // Construir URL completa
            input = `https://builder.aws.com/community/@${input}`;
        }
        processProfile(input);
    } else {
        alert('Por favor ingresa un username válido');
    }
});

manualUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        manualSubmitBtn.click();
    }
});

nextAttendeeBtn.addEventListener('click', resetToScan);
retryBtn.addEventListener('click', resetToScan);
manualEntryBtn.addEventListener('click', resetToScan);

// Soporte para lectores de QR físicos (teclado)
let qrBuffer = '';
let qrTimeout = null;

document.addEventListener('keypress', (e) => {
    // Solo capturar si estamos en estado de espera
    if (!states.scanWaiting.classList.contains('hidden')) {
        // Ignorar si el foco está en un input
        if (e.target.tagName === 'INPUT') return;
        
        clearTimeout(qrTimeout);
        
        qrBuffer += e.key;
        
        // Procesar después de 100ms sin input (fin de escaneo)
        qrTimeout = setTimeout(() => {
            if (qrBuffer.includes('builder.aws.com') || qrBuffer.includes('http')) {
                processProfile(qrBuffer);
            }
            qrBuffer = '';
        }, 100);
    }
});


// Cargar estadísticas al inicio
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (response.ok) {
            const stats = await response.json();
            totalBadges = stats.total || 0;
            document.getElementById('totalBadges').textContent = totalBadges;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ─── Gestión de Eventos ───────────────────────────────────────────────────────

function updateEventBanner(event) {
    const banner = document.getElementById('eventBanner');
    const noBanner = document.getElementById('noEventBanner');

    if (event) {
        activeEventId = event.eventId;
        activeEventData = event;
        document.getElementById('bannerEventName').textContent = event.name;
        document.getElementById('bannerEventVenue').textContent = `— ${event.venue}`;
        document.getElementById('bannerEventDate').textContent = `— ${event.date}`;
        banner.classList.remove('hidden');
        noBanner.classList.add('hidden');
    } else {
        activeEventId = null;
        activeEventData = null;
        eventBadges = 0;
        document.getElementById('lastHour').textContent = '0';
        banner.classList.add('hidden');
        noBanner.classList.remove('hidden');
    }
}

async function loadActiveEvent() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/active`);
        if (response.ok) {
            const data = await response.json();
            updateEventBanner(data.event || null);

            if (data.event) {
                // Cargar conteo real de asistentes del evento
                const reportRes = await fetch(`${API_BASE_URL}/events/${data.event.eventId}/report`);
                if (reportRes.ok) {
                    const reportData = await reportRes.json();
                    eventBadges = reportData.count || 0;
                    document.getElementById('lastHour').textContent = eventBadges;
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar evento activo:', error);
    }
}

function openCreateEventModal() {
    // Pre-rellenar fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    document.getElementById('eventName').value = '';
    document.getElementById('eventVenue').value = '';
    document.getElementById('createEventModal').classList.remove('hidden');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.add('hidden');
}

async function submitCreateEvent() {
    const name = document.getElementById('eventName').value.trim();
    const venue = document.getElementById('eventVenue').value.trim();
    const date = document.getElementById('eventDate').value;

    if (!name || !venue || !date) {
        alert('Por favor completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, venue, date })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                alert(`Ya existe un evento activo: "${data.activeEvent.name}". Termínalo antes de crear uno nuevo.`);
            } else {
                alert(data.error || 'Error al crear el evento.');
            }
            return;
        }

        closeCreateEventModal();
        updateEventBanner(data.event);
    } catch (error) {
        console.error('Error al crear evento:', error);
        alert('Error de conexión al crear el evento.');
    }
}

async function endEvent() {
    if (!activeEventId) return;

    const confirmed = confirm(`¿Terminar el evento "${activeEventData.name}"?\n\nSe abrirá el reporte de asistentes para que puedas descargarlo o enviarlo.`);
    if (!confirmed) return;

    const eventIdToReport = activeEventId;

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventIdToReport}/end`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            updateEventBanner(null);
            // Abrir reporte automáticamente al terminar
            await openReportModalForEvent(eventIdToReport);
        } else {
            const data = await response.json();
            alert(data.error || 'Error al terminar el evento.');
        }
    } catch (error) {
        console.error('Error al terminar evento:', error);
        alert('Error de conexión al terminar el evento.');
    }
}

async function openReportModalForEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/report`);
        const data = await response.json();

        reportAttendees = data.attendees || [];
        reportEventData = data.event || {};

        document.getElementById('reportEventTitle').textContent =
            `${reportEventData.name || ''} — ${reportEventData.venue || ''} — ${reportEventData.date || ''}`;
        document.getElementById('reportCount').textContent =
            `${reportAttendees.length} asistente(s) registrado(s)`;

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = reportAttendees.map(a => `
            <tr>
                <td>${a.fullName || ''}</td>
                <td>${a.company || ''}</td>
                <td>${a.role || ''}</td>
                <td>${a.email || ''}</td>
                <td>${a.username ? '@' + a.username : ''}</td>
                <td>${a.timestamp ? new Date(a.timestamp).toLocaleString('es-MX') : ''}</td>
            </tr>`).join('');

        // Guardar eventId para envío de email aunque ya no haya evento activo
        document.getElementById('reportModal').dataset.eventId = eventId;
        document.getElementById('reportModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar reporte:', error);
        alert('Error al cargar el reporte.');
    }
}

async function openReportModal() {
    if (!activeEventId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/events/${activeEventId}/report`);
        const data = await response.json();

        reportAttendees = data.attendees || [];
        reportEventData = data.event || activeEventData || {};

        document.getElementById('reportEventTitle').textContent =
            `${reportEventData.name || ''} — ${reportEventData.venue || ''} — ${reportEventData.date || ''}`;
        document.getElementById('reportCount').textContent =
            `${reportAttendees.length} asistente(s) registrado(s)`;

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = reportAttendees.map(a => `
            <tr>
                <td>${a.fullName || ''}</td>
                <td>${a.company || ''}</td>
                <td>${a.role || ''}</td>
                <td>${a.email || ''}</td>
                <td>${a.username ? '@' + a.username : ''}</td>
                <td>${a.timestamp ? new Date(a.timestamp).toLocaleString('es-MX') : ''}</td>
            </tr>`).join('');

        document.getElementById('reportModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar reporte:', error);
        alert('Error al cargar el reporte.');
    }
}

function closeReportModal() {
    document.getElementById('reportModal').classList.add('hidden');
}

function downloadCSV() {
    if (!reportAttendees.length) {
        alert('No hay asistentes para exportar.');
        return;
    }

    const fileParts = [reportEventData.name, reportEventData.venue, reportEventData.date]
        .filter(Boolean)
        .map(p => p.replace(/\s+/g, '-'));
    const fileName = `asistentes-${fileParts.join('-') || 'evento'}.csv`;
    const headers = ['Nombre', 'Empresa', 'Rol', 'Email', 'Username', 'Hora'];
    const rows = reportAttendees.map(a => [
        a.fullName || '',
        a.company || '',
        a.role || '',
        a.email || '',
        a.username ? '@' + a.username : '',
        a.timestamp ? new Date(a.timestamp).toLocaleString('es-MX') : ''
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

async function sendReportByEmail() {
    const email = document.getElementById('reportEmail').value.trim();
    if (!email) {
        alert('Por favor ingresa un correo electrónico.');
        return;
    }

    const eventId = activeEventId || document.getElementById('reportModal').dataset.eventId;
    if (!eventId) return;

    const btn = document.getElementById('sendReportEmailBtn');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/send-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Reporte enviado a ${email} (${data.count} asistente(s)).`);
        } else {
            alert(data.error || 'Error al enviar el reporte.');
        }
    } catch (error) {
        console.error('Error al enviar reporte:', error);
        alert('Error de conexión al enviar el reporte.');
    } finally {
        btn.textContent = 'Enviar por Email';
        btn.disabled = false;
    }
}

// ─── Inicialización ───────────────────────────────────────────────────────────

// Los botones usan onclick en el HTML — no se necesitan addEventListener aquí

loadStats();
loadActiveEvent();
showState('scanWaiting');
