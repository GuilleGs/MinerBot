const path = require('path');

const content = require(path.join(__dirname, '..', 'src', 'dialogs', 'data', 'content.js'));

function selectVariant(entry, sedeId) {
  if (typeof entry === 'object' && entry !== null) {
    const key = sedeId ? String(sedeId) : 'default';
    return entry[key] || entry.default || Object.values(entry)[0];
  }
  return entry;
}

describe('content.js básico', () => {
  test('clave "vacaciones, licencias y permisos" existe y es string', () => {
    expect(typeof content['vacaciones, licencias y permisos']).toBe('string');
  });

  test('procedimiento de licencia médica tiene variantes por sede', () => {
    const licencia = content['procedimiento de licencia médica'];
    expect(licencia).toBeDefined();
    expect(typeof licencia === 'object' || typeof licencia === 'string').toBeTruthy();
    if (typeof licencia === 'object') {
      expect(Object.keys(licencia).length).toBeGreaterThan(0);
    }
  });

  test('selección de variante por sede devuelve string', () => {
    const licencia = content['procedimiento de licencia médica'];
    const result = selectVariant(licencia, 2);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('aguinaldos y gratificaciones existe', () => {
    const aguinaldo = content['aguinaldos y gratificaciones'];
    expect(aguinaldo).toBeDefined();
    expect(typeof aguinaldo === 'object' || typeof aguinaldo === 'string').toBeTruthy();
  });
});

describe('carga de módulos clave', () => {
  const modules = [
    'src/dialogs/level1/VacacionesMenu.js',
    'src/dialogs/level1/BeneficiosMenu.js',
    'src/dialogs/level1/SaludSegurosMenu.js',
    'src/dialogs/main/AuthMenu.js',
    'src/bot/MinerBot.js'
  ];

  modules.forEach((m) => {
    test(`cargar módulo ${m}`, () => {
      const modPath = path.join(__dirname, '..', m);
      const mod = require(modPath);
      expect(mod).toBeDefined();
      // Puede ser clase/función/objeto
      expect(typeof mod === 'function' || typeof mod === 'object').toBeTruthy();
    });
  });
});
