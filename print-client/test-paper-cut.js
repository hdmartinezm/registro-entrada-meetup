#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PRINTER_NAME = process.env.PRINTER_NAME || 'Ribetec_RT_420ME';
const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

console.log('🧪 Prueba de Comando de Corte de Papel');
console.log('=====================================\n');

// Crear comandos ESC/POS
const commands = {
    'Avanzar 3 líneas + Corte completo': Buffer.from([
        0x1B, 0x64, 0x03,  // ESC d 3 - Avanzar 3 líneas
        0x1D, 0x56, 0x00   // GS V 0 - Corte completo
    ]),
    'Corte parcial': Buffer.from([
        0x1B, 0x69         // ESC i - Corte parcial
    ]),
    'Avanzar 5 líneas + Expulsar': Buffer.from([
        0x1B, 0x64, 0x05,  // ESC d 5 - Avanzar 5 líneas
        0x0C               // FF - Form feed (expulsar)
    ]),
    'Solo expulsar': Buffer.from([
        0x0C               // FF - Form feed (expulsar)
    ])
};

console.log('Comandos disponibles:');
Object.keys(commands).forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
});

console.log('\n📝 Instrucciones:');
console.log('1. Primero imprime un badge de prueba');
console.log('2. Luego ejecuta este script para probar comandos de corte');
console.log('3. Observa cuál comando hace que la impresora expulse el papel\n');

// Probar cada comando
let commandIndex = 1;
for (const [name, buffer] of Object.entries(commands)) {
    console.log(`\n🧪 Prueba ${commandIndex}/${Object.keys(commands).length}: ${name}`);
    console.log('   Bytes:', Array.from(buffer).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    try {
        const cmdFile = path.join(TEMP_DIR, `cut-test-${commandIndex}.bin`);
        fs.writeFileSync(cmdFile, buffer);
        
        console.log('   📤 Enviando comando a la impresora...');
        execSync(`cat "${cmdFile}" | lp -d ${PRINTER_NAME} -o raw`, { stdio: 'pipe' });
        
        fs.unlinkSync(cmdFile);
        
        console.log('   ✅ Comando enviado');
        console.log('   ⏳ Esperando 3 segundos...');
        execSync('sleep 3');
        
        console.log('   ❓ ¿La impresora expulsó el papel? (observa físicamente)');
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
    
    commandIndex++;
}

console.log('\n\n📊 Resumen:');
console.log('Anota cuál comando funcionó mejor para expulsar el papel.');
console.log('Luego actualiza la función sendPaperCutCommand() en index.js');
console.log('con el comando que mejor funcionó.\n');
