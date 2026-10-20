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
let availableCameras = [];
let currentCameraIndex = 0;

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

        // Obtener lista de cámaras disponibles
        availableCameras = await Html5Qrcode.getCameras();
        console.log('Cámaras disponibles:', availableCameras);

        // Mostrar/ocultar botón de girar según cantidad de cámaras
        const flipBtn = document.getElementById('flipCameraBtn');
        if (flipBtn) {
            flipBtn.style.display = availableCameras.length > 1 ? 'block' : 'none';
        }

        // Intentar usar cámara trasera primero (environment)
        currentCameraIndex = availableCameras.findIndex(cam =>
            cam.label.toLowerCase().includes('back') ||
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('trasera') ||
            cam.label.toLowerCase().includes('environment')
        );
        if (currentCameraIndex === -1) currentCameraIndex = 0;

        html5QrCode = new Html5Qrcode("qrReader");

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        if (availableCameras.length > 0) {
            await html5QrCode.start(
                availableCameras[currentCameraIndex].id,
                config,
                onQRCodeScanned,
                onScanError
            );
        } else {
            // Fallback a facingMode si no hay lista de cámaras
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onQRCodeScanned,
                onScanError
            );
        }

        isScanning = true;
        updateFlipButtonText();
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

// Girar cámara (frontal/trasera)
async function flipCamera() {
    console.log('flipCamera llamado, cámaras:', availableCameras.length);

    if (!html5QrCode) {
        alert('No hay instancia de cámara');
        return;
    }

    if (availableCameras.length < 2) {
        alert('Solo hay ' + availableCameras.length + ' cámara(s) disponible(s)');
        return;
    }

    try {
        // Detener cámara actual
        if (isScanning) {
            await html5QrCode.stop();
            html5QrCode.clear();
        }

        // Cambiar al siguiente índice de cámara
        currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
        console.log('Cambiando a cámara:', currentCameraIndex, availableCameras[currentCameraIndex]);

        // Recrear instancia
        html5QrCode = new Html5Qrcode("qrReader");

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        await html5QrCode.start(
            availableCameras[currentCameraIndex].id,
            config,
            onQRCodeScanned,
            onScanError
        );

        isScanning = true;
        updateFlipButtonText();
    } catch (error) {
        console.error('Error al girar cámara:', error);
        alert('Error al cambiar cámara: ' + error.message);
    }
}

// Actualizar texto del botón de girar cámara
function updateFlipButtonText() {
    const flipBtn = document.getElementById('flipCameraBtn');
    if (!flipBtn || availableCameras.length === 0) return;

    const currentCam = availableCameras[currentCameraIndex];
    const label = currentCam.label.toLowerCase();

    if (label.includes('front') || label.includes('user') || label.includes('frontal')) {
        flipBtn.textContent = '🔄 Usar Trasera';
    } else if (label.includes('back') || label.includes('rear') || label.includes('trasera')) {
        flipBtn.textContent = '🔄 Usar Frontal';
    } else {
        flipBtn.textContent = '🔄 Cambiar Cámara';
    }
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
    document.getElementById('processingStatus').textContent = 'Buscando asistente...';
    updateProcessStep(1, 'active');

    try {
        // Para eventos The Guild IT (CSV), buscar primero en pre-registrados
        if (activeEventData && activeEventData.eventType === 'the-guild-it') {
            const searchTerm = profileUrl.replace(/^@/, '').trim();
            const preregistered = await findPreregisteredByName(searchTerm);

            if (preregistered) {
                updateProcessStep(1, 'completed');
                // Usar datos del pre-registrado directamente
                const profileData = {
                    fullName: preregistered.fullName,
                    company: preregistered.company || '',
                    role: preregistered.role || '',
                    email: preregistered.email || '',
                    username: ''
                };
                await generateBadgeAutomatically(profileData);
                return;
            } else {
                // No encontrado en pre-registrados, permitir entrada manual
                const profileData = {
                    fullName: searchTerm,
                    company: '',
                    role: '',
                    email: '',
                    username: ''
                };
                updateProcessStep(1, 'completed');
                await generateBadgeAutomatically(profileData);
                return;
            }
        }

        // Para AWS UG, usar el flujo normal de scraping
        document.getElementById('processingStatus').textContent = 'Extrayendo datos del perfil...';
        const profileData = await fetchProfileData(profileUrl);
        updateProcessStep(1, 'completed');

        // Generar badge automáticamente sin confirmación
        await generateBadgeAutomatically(profileData);

    } catch (error) {
        console.error('Error al procesar:', error);
        showError(error.message || 'Error al procesar el perfil');
    }
}

// Buscar pre-registrado por nombre
async function findPreregisteredByName(searchTerm) {
    try {
        const response = await fetch(`${API_BASE_URL}/import/preregistered/${activeEventId}`);
        const data = await response.json();

        if (!data.attendees || data.attendees.length === 0) {
            return null;
        }

        // Buscar coincidencia exacta o parcial (case insensitive)
        const searchLower = searchTerm.toLowerCase();
        const found = data.attendees.find(a =>
            a.fullName.toLowerCase() === searchLower ||
            a.fullName.toLowerCase().includes(searchLower) ||
            (a.email && a.email.toLowerCase().includes(searchLower))
        );

        return found || null;
    } catch (error) {
        console.error('Error buscando pre-registrado:', error);
        return null;
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
document.getElementById('flipCameraBtn')?.addEventListener('click', flipCamera);

manualSubmitBtn.addEventListener('click', () => {
    let input = manualUrl.value.trim();
    if (input) {
        // Para The Guild IT, pasar el nombre directamente
        if (activeEventData && activeEventData.eventType === 'the-guild-it') {
            processProfile(input);
        } else {
            // Para AWS UG, construir URL si es solo username
            if (!input.startsWith('http')) {
                if (input.startsWith('@')) {
                    input = input.substring(1);
                }
                input = `https://builder.aws.com/community/@${input}`;
            }
            processProfile(input);
        }
    } else {
        alert('Por favor ingresa un nombre válido');
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
    const manualInput = document.getElementById('manualUrl');

    if (event) {
        activeEventId = event.eventId;
        activeEventData = event;
        document.getElementById('bannerEventName').textContent = event.name;
        document.getElementById('bannerEventVenue').textContent = `— ${event.venue}`;
        document.getElementById('bannerEventDate').textContent = `— ${event.date}`;
        banner.classList.remove('hidden');
        noBanner.classList.add('hidden');

        // Actualizar placeholder según tipo de evento
        if (event.eventType === 'the-guild-it') {
            manualInput.placeholder = 'Nombre del asistente';
        } else {
            manualInput.placeholder = '@username o username';
        }
    } else {
        activeEventId = null;
        activeEventData = null;
        eventBadges = 0;
        document.getElementById('lastHour').textContent = '0';
        banner.classList.add('hidden');
        noBanner.classList.remove('hidden');
        manualInput.placeholder = '@username o username';
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
    const eventType = document.getElementById('eventType').value;

    if (!name || !venue || !date || !eventType) {
        alert('Por favor completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, venue, date, eventType })
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


// ─── Importación de Asistentes (Meetup / Eventbrite) ──────────────────────────

function openImportModal() {
    if (!activeEventId) {
        alert('Primero crea un evento activo para poder importar asistentes.');
        return;
    }
    document.getElementById('importModal').classList.remove('hidden');
    document.getElementById('importResult').classList.add('hidden');

    // Mostrar tabs según tipo de evento
    const isGuildIt = activeEventData && activeEventData.eventType === 'the-guild-it';
    document.getElementById('importTabsAwsUg').classList.toggle('hidden', isGuildIt);
    document.getElementById('importTabsGuildIt').classList.toggle('hidden', !isGuildIt);

    // Ocultar todos los contenidos de tabs
    document.querySelectorAll('.import-tab-content').forEach(c => c.classList.add('hidden'));

    // Mostrar tab por defecto según tipo
    if (isGuildIt) {
        document.getElementById('importTabCsv').classList.remove('hidden');
        document.getElementById('importSubtitle').textContent = 'Importa la lista de asistentes desde un archivo CSV';
    } else {
        document.getElementById('importTabMeetup').classList.remove('hidden');
        document.getElementById('importSubtitle').textContent = 'Importa la lista de pre-registrados desde Meetup.com o Eventbrite';
    }

    // Cargar pre-registrados existentes
    loadPreregistered();
}

function closeImportModal() {
    document.getElementById('importModal').classList.add('hidden');
}

function switchImportTab(tab) {
    // Actualizar tabs activos en ambos grupos
    document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.import-tab-content').forEach(c => c.classList.add('hidden'));

    if (tab === 'csv') {
        document.querySelector('#importTabsGuildIt .import-tab').classList.add('active');
        document.getElementById('importTabCsv').classList.remove('hidden');
    } else if (tab === 'meetup') {
        document.querySelectorAll('#importTabsAwsUg .import-tab')[0].classList.add('active');
        document.getElementById('importTabMeetup').classList.remove('hidden');
    } else if (tab === 'eventbrite') {
        document.querySelectorAll('#importTabsAwsUg .import-tab')[1].classList.add('active');
        document.getElementById('importTabEventbrite').classList.remove('hidden');
    }
}

async function executeImport(source) {
    const resultDiv = document.getElementById('importResult');
    const resultContent = document.getElementById('importResultContent');

    let payload = { eventId: activeEventId };

    // CSV import para The Guild IT
    if (source === 'csv') {
        const fileInput = document.getElementById('csvFile');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Selecciona un archivo CSV.');
            return;
        }

        const file = fileInput.files[0];
        const csvText = await file.text();

        // Parsear CSV
        const attendees = parseCSV(csvText);
        if (attendees.length === 0) {
            alert('No se encontraron registros válidos en el CSV.');
            return;
        }

        payload.attendees = attendees;
        payload.source = 'csv';

        // Mostrar loading
        resultDiv.classList.remove('hidden');
        resultContent.textContent = 'Importando asistentes desde CSV...';

        try {
            const response = await fetch(`${API_BASE_URL}/import/csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                resultContent.textContent = 'Error: ' + (data.error || 'Error desconocido');
                return;
            }

            resultContent.textContent = 'Importación exitosa - Fuente: CSV - Encontrados: ' +
                data.totalFound + ' | Nuevos: ' + data.imported + ' | Actualizados: ' + (data.updated || 0);

            // Recargar lista de pre-registrados
            await loadPreregistered();

            // Limpiar file input
            fileInput.value = '';
            document.getElementById('csvPreview').classList.add('hidden');

        } catch (error) {
            console.error('Error en importación CSV:', error);
            resultContent.textContent = 'Error de conexión: ' + error.message;
        }
        return;
    }

    // Meetup import (AWS UG)
    if (source === 'meetup') {
        const eventUrl = document.getElementById('meetupEventUrl').value.trim();
        const accessToken = document.getElementById('meetupToken').value.trim();

        if (!eventUrl) {
            alert('Ingresa la URL del evento de Meetup.');
            return;
        }
        if (!accessToken) {
            alert('Ingresa tu Access Token de Meetup.');
            return;
        }

        payload.eventUrl = eventUrl;
        payload.accessToken = accessToken;
    } else {
        // Eventbrite import (AWS UG)
        const eventUrl = document.getElementById('eventbriteEventUrl').value.trim();
        const accessToken = document.getElementById('eventbriteToken').value.trim();

        if (!eventUrl) {
            alert('Ingresa la URL del evento de Eventbrite.');
            return;
        }
        if (!accessToken) {
            alert('Ingresa tu API Token de Eventbrite.');
            return;
        }

        payload.eventUrl = eventUrl;
        payload.accessToken = accessToken;
    }

    // Mostrar loading
    resultDiv.classList.remove('hidden');
    resultContent.innerHTML = '<div class="spinner-small"></div> Importando asistentes...';

    try {
        const response = await fetch(`${API_BASE_URL}/import/${source}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            resultContent.innerHTML = `
                <div class="import-error">
                    <strong>❌ Error:</strong> ${data.error || 'Error desconocido'}
                    ${data.hint ? `<br><small>${data.hint}</small>` : ''}
                    ${data.details ? `<br><small>Detalles: ${data.details}</small>` : ''}
                </div>`;
            return;
        }

        resultContent.innerHTML = `
            <div class="import-success">
                <strong>✅ Importación exitosa</strong><br>
                Fuente: <strong>${data.source === 'meetup' ? 'Meetup.com' : 'Eventbrite'}</strong><br>
                Encontrados: <strong>${data.totalFound}</strong> |
                Importados: <strong>${data.imported}</strong> |
                Duplicados omitidos: <strong>${data.skipped}</strong>
            </div>`;

        // Recargar lista de pre-registrados
        await loadPreregistered();

    } catch (error) {
        console.error('Error en importación:', error);
        resultContent.innerHTML = `
            <div class="import-error">
                <strong>❌ Error de conexión:</strong> ${error.message}
            </div>`;
    }
}

// Parsear CSV: detecta formato automáticamente (Luma / simple)
function parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    const attendees = [];

    // Parsear primera línea como headers
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.trim().toLowerCase());

    // Detectar formato Luma (tiene columnas específicas como guest_id, qr_code_url, etc.)
    const isLumaFormat = headers.includes('guest_id') ||
                         headers.includes('qr_code_url') ||
                         headers.some(h => h.includes('linkedin') || h.includes('empresa') || h.includes('cargo'));

    if (isLumaFormat) {
        // Mapeo de columnas Luma
        const colMap = {
            name: headers.indexOf('name'),
            email: headers.indexOf('email'),
            company: headers.findIndex(h => h.includes('empresa') || h.includes('company')),
            role: headers.findIndex(h => h.includes('cargo') || h.includes('role') || h.includes('job')),
            // Buscar columna de perfil de LinkedIn (no linkedin_click_id)
            linkedin: headers.findIndex(h => h.includes('perfil') && h.includes('linkedin') || h === 'linkedin_profile')
        };

        // Si no hay columna 'name', buscar alternativas
        if (colMap.name === -1) {
            colMap.name = headers.indexOf('first_name');
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const fields = parseCSVLine(line);

            // Obtener nombre (usar 'name' o combinar first_name + last_name)
            let fullName = '';
            if (headers.indexOf('name') !== -1) {
                fullName = (fields[headers.indexOf('name')] || '').trim();
            }
            if (!fullName && headers.indexOf('first_name') !== -1) {
                const firstName = (fields[headers.indexOf('first_name')] || '').trim();
                const lastName = (fields[headers.indexOf('last_name')] || '').trim();
                fullName = [firstName, lastName].filter(Boolean).join(' ');
            }

            if (!fullName) continue;

            attendees.push({
                fullName: fullName,
                email: colMap.email !== -1 ? (fields[colMap.email] || '').trim() : '',
                company: colMap.company !== -1 ? (fields[colMap.company] || '').trim() : '',
                role: colMap.role !== -1 ? (fields[colMap.role] || '').trim() : '',
                linkedin: colMap.linkedin !== -1 ? (fields[colMap.linkedin] || '').trim() : ''
            });
        }
    } else {
        // Formato simple: Nombre, Email, Empresa, Role
        let startIndex = 0;
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('nombre') || firstLine.includes('email') || firstLine.includes('name')) {
            startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const fields = parseCSVLine(line);
            if (fields.length >= 1) {
                attendees.push({
                    fullName: (fields[0] || '').trim(),
                    email: (fields[1] || '').trim(),
                    company: (fields[2] || '').trim(),
                    role: (fields[3] || '').trim()
                });
            }
        }
    }

    return attendees.filter(a => a.fullName); // Filtrar registros sin nombre
}

// Parsear una línea CSV respetando comillas
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current);
    return fields;
}

async function loadPreregistered() {
    if (!activeEventId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/import/preregistered/${activeEventId}`);
        const data = await response.json();

        const list = document.getElementById('preregisteredList');
        const tbody = document.getElementById('preregisteredTableBody');
        const stats = document.getElementById('preregisteredStats');

        if (!data.attendees || data.attendees.length === 0) {
            list.classList.add('hidden');
            return;
        }

        list.classList.remove('hidden');

        const total = data.attendees.length;
        const checkedIn = data.attendees.filter(a => a.status === 'checked_in').length;
        const pending = total - checkedIn;

        stats.innerHTML = `
            Total: <strong>${total}</strong> |
            Check-in: <strong>${checkedIn}</strong> |
            Pendientes: <strong>${pending}</strong>
        `;

        tbody.innerHTML = data.attendees.map(a => `
            <tr class="${a.status === 'checked_in' ? 'row-checked-in' : ''}">
                <td>${a.fullName}</td>
                <td>${a.email || '—'}</td>
                <td>${a.company || '—'}</td>
                <td><span class="source-badge source-${a.source}">${a.source}</span></td>
                <td><span class="status-badge status-${a.status}">${a.status === 'checked_in' ? '✅ Check-in' : '⏳ Pendiente'}</span></td>
            </tr>`).join('');

    } catch (error) {
        console.error('Error cargando pre-registrados:', error);
    }
}

// Preview del CSV al seleccionar archivo
function setupCSVPreview() {
    const csvFile = document.getElementById('csvFile');
    if (!csvFile) return;

    csvFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            document.getElementById('csvPreview').classList.add('hidden');
            return;
        }

        try {
            const csvText = await file.text();
            const attendees = parseCSV(csvText);

            const previewDiv = document.getElementById('csvPreview');
            const countSpan = document.getElementById('csvPreviewCount');
            const tableDiv = document.getElementById('csvPreviewTable');

            if (attendees.length === 0) {
                previewDiv.classList.add('hidden');
                return;
            }

            countSpan.textContent = attendees.length;

            // Mostrar primeros 5 registros
            const previewRows = attendees.slice(0, 5);
            const hasLinkedIn = attendees.some(a => a.linkedin);
            const colCount = hasLinkedIn ? 5 : 4;

            let tableHTML = '<table class="report-table"><thead><tr><th>Nombre</th><th>Email</th><th>Empresa</th><th>Cargo</th>';
            if (hasLinkedIn) tableHTML += '<th>LinkedIn</th>';
            tableHTML += '</tr></thead><tbody>';

            for (const a of previewRows) {
                tableHTML += '<tr>';
                tableHTML += '<td>' + escapeHTML(a.fullName) + '</td>';
                tableHTML += '<td>' + escapeHTML(a.email || '—') + '</td>';
                tableHTML += '<td>' + escapeHTML(a.company || '—') + '</td>';
                tableHTML += '<td>' + escapeHTML(a.role || '—') + '</td>';
                if (hasLinkedIn) {
                    const linkedInDisplay = a.linkedin ? '✓' : '—';
                    tableHTML += '<td>' + linkedInDisplay + '</td>';
                }
                tableHTML += '</tr>';
            }

            if (attendees.length > 5) {
                tableHTML += '<tr><td colspan="' + colCount + '" style="text-align:center;color:#666;">... y ' + (attendees.length - 5) + ' más</td></tr>';
            }

            tableHTML += '</tbody></table>';
            tableDiv.innerHTML = tableHTML;
            previewDiv.classList.remove('hidden');

        } catch (error) {
            console.error('Error en preview CSV:', error);
        }
    });
}

// Escapar HTML para prevenir XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// Inicializar preview de CSV cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCSVPreview);
} else {
    setupCSVPreview();
}
