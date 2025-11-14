const assert = require('assert');
const path = require('path');

console.log('Iniciando pruebas unitarias básicas...');

const content = require(path.join(__dirname, '..', 'src', 'dialogs', 'data', 'content.js'));

function selectVariant(entry, sedeId) {
    if (typeof entry === 'object' && entry !== null) {
        const key = sedeId ? String(sedeId) : 'default';
        return entry[key] || entry.default || Object.values(entry)[0];
    }
    return entry;
}

// Test 1: clave string simple
assert.ok(typeof content['vacaciones, licencias y permisos'] === 'string', 'La clave "vacaciones, licencias y permisos" debe ser un string.');

// Test 2: clave con variantes por sede
const licencia = content['procedimiento de licencia médica'];
assert.ok(typeof licencia === 'object' && licencia !== null, 'La clave "procedimiento de licencia médica" debe ser un objeto con variantes por sede.');
assert.ok(licencia.default || Object.keys(licencia).length > 0, 'El objeto de licencia debe tener al menos una variante (default o por sede).');

// Test 3: selección de variante por sede
const sel2 = selectVariant(licencia, 2);
assert.ok(typeof sel2 === 'string', 'La selección para sede 2 debe devolver un string.');

// Test 4: otra entrada con variantes
const aguinaldo = content['aguinaldos y gratificaciones'];
assert.ok(aguinaldo && (typeof aguinaldo === 'object' || typeof aguinaldo === 'string'), 'La clave "aguinaldos y gratificaciones" debe existir.');
if (typeof aguinaldo === 'object') {
    const selDefault = selectVariant(aguinaldo, 'nonexistent');
    assert.ok(typeof selDefault === 'string', 'Fallback a variante default debe devolver string.');
}

// Test 5: verificar que los menús exportan una clase/función
const menusToCheck = [
    'src/dialogs/level1/VacacionesMenu.js',
    'src/dialogs/level1/BeneficiosMenu.js',
    'src/dialogs/level1/SaludSegurosMenu.js',
    'src/dialogs/main/AuthMenu.js',
    'src/bot/MinerBot.js'
];

for (const m of menusToCheck) {
    const modPath = path.join(__dirname, '..', m);
    let mod;
    try {
        mod = require(modPath);
    } catch (err) {
        throw new Error(`No fue posible cargar el módulo ${m} desde ${modPath}: ${err.message}`);
    }
    assert.ok(typeof mod === 'function' || typeof mod === 'object', `El módulo ${m} debe exportar una función o clase.`);
}

console.log('Todas las pruebas pasaron correctamente.');
process.exit(0);
