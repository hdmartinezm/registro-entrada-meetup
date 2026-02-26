const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
    let browser = null;
    
    try {
        const body = JSON.parse(event.body);
        const { profileUrl } = body;
        
        if (!profileUrl) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'profileUrl es requerido' })
            };
        }

        // Extraer username de la URL
        const usernameMatch = profileUrl.match(/@([a-zA-Z0-9_-]+)/);
        const username = usernameMatch ? usernameMatch[1] : '';

        if (!username) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'No se pudo extraer el username de la URL' })
            };
        }

        console.log('Iniciando navegador para:', profileUrl);

        // Lanzar navegador headless
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Bloquear solo imágenes y fuentes para cargar más rápido (pero permitir CSS y JS)
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            // Bloquear solo imágenes y fuentes pesadas
            if (['image', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });
        
        // Navegar a la página del perfil
        console.log('Navegando a la página...');
        await page.goto(profileUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });

        // Esperar 3 segundos para que cargue el contenido dinámico
        await page.waitForTimeout(3000);

        console.log('Extrayendo datos del perfil...');

        // Extraer datos del perfil
        const profileData = await page.evaluate(() => {
            const data = {};
            
            // Obtener todo el texto visible
            const pageText = document.body.innerText;
            data.pageText = pageText;
            
            // Buscar el nombre (primera línea después del username)
            const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);
            
            // Buscar el username @xxx
            const usernameIndex = lines.findIndex(l => l.startsWith('@'));
            
            if (usernameIndex > 0) {
                // El nombre está justo antes del username
                data.fullName = lines[usernameIndex - 1];
                
                // La línea después del username tiene formato: "Puesto - Empresa"
                if (usernameIndex + 1 < lines.length) {
                    const jobLine = lines[usernameIndex + 1];
                    
                    // Parsear "Product Development Manager - Escala 24x7"
                    if (jobLine.includes(' - ')) {
                        const parts = jobLine.split(' - ');
                        data.role = parts[0].trim();
                        data.company = parts.slice(1).join(' - ').trim();
                    } else {
                        data.role = jobLine;
                    }
                }
            }
            
            // Buscar email (si está visible)
            const emailMatch = pageText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
                data.email = emailMatch[1];
            }
            
            // Buscar la bio (después de "About")
            const aboutIndex = lines.findIndex(l => l === 'About');
            if (aboutIndex >= 0 && aboutIndex + 1 < lines.length) {
                // La bio está después de "About" y antes de "Translate"
                let bio = '';
                for (let i = aboutIndex + 1; i < lines.length; i++) {
                    if (lines[i] === 'Translate' || lines[i] === 'Activity') break;
                    if (lines[i].length > 20) {
                        bio = lines[i];
                        break;
                    }
                }
                if (bio) data.bio = bio;
            }
            
            return data;
        });

        await browser.close();
        browser = null;

        console.log('Datos extraídos:', profileData);

        // Procesar y limpiar datos
        const cleanedData = {
            username: username,
            fullName: profileData.fullName || '',
            company: profileData.company || '',
            role: profileData.role || '',
            email: profileData.email || '',
            bio: profileData.bio || `AWS Builder Community Member - @${username}`
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(cleanedData)
        };

    } catch (error) {
        console.error('Error:', error);
        
        if (browser) {
            await browser.close();
        }

        // En caso de error, retornar datos vacíos para que el usuario los complete
        const usernameMatch = event.body ? JSON.parse(event.body).profileUrl?.match(/@([a-zA-Z0-9_-]+)/) : null;
        const username = usernameMatch ? usernameMatch[1] : '';

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                username: username,
                fullName: '',
                company: '',
                role: '',
                email: '',
                bio: `AWS Builder Community Member - @${username}`,
                error: 'No se pudieron extraer datos automáticamente. Por favor completa manualmente.'
            })
        };
    }
};
