const path = require('path');
const content = require(path.join(__dirname, '..', 'src', 'dialogs', 'data', 'content.js'));

// Helper: mock TurnContext with sendActivity capturing messages
function createMockContext() {
  const messages = [];
  return {
    sendActivity: async (msg) => { messages.push(String(msg)); },
    _messages: messages
  };
}

// Minimal fake bot with navigation methods used by menus
function createMinimalBot() {
  return {
    navigateToMenu: async () => {},
    goBack: async () => {},
    conversationStateAccessor: {
      get: async () => ({})
    }
  };
}

describe('Menus - pruebas unitarias con mocks', () => {
  test('VacacionesMenu - opción 3 muestra procedimiento de licencia médica', async () => {
    const VacacionesMenu = require(path.join(__dirname, '..', 'src', 'dialogs', 'level1', 'VacacionesMenu.js'));
    const menu = new VacacionesMenu(createMinimalBot());
    const ctx = createMockContext();
    const conv = { employeeSedeId: 2, isInInfoDisplayState: false };

    const handled = await menu.handleInput(ctx, '3', conv, {});
    expect(handled).toBe(true);
    expect(ctx._messages.length).toBeGreaterThan(0);
    // message should match the content selected for sede 2 (or default fallback)
    const expected = content['procedimiento de licencia médica'][String(conv.employeeSedeId)] || content['procedimiento de licencia médica'].default;
    expect(ctx._messages[0]).toContain(expected.substring(0, 10));
  });

  test('BeneficiosMenu - opción 5 muestra descuentos corporativos (puede ser por sede)', async () => {
    const BeneficiosMenu = require(path.join(__dirname, '..', 'src', 'dialogs', 'level1', 'BeneficiosMenu.js'));
    const menu = new BeneficiosMenu(createMinimalBot());
    const ctx = createMockContext();
    const conv = { employeeSedeId: 3, isInInfoDisplayState: false };

    const handled = await menu.handleInput(ctx, '5', conv, {});
    expect(handled).toBe(true);
    expect(ctx._messages.length).toBeGreaterThan(0);
    const entry = content['descuentos corporativos'];
    const expected = typeof entry === 'object' ? (entry[String(conv.employeeSedeId)] || entry.default) : entry;
    expect(ctx._messages[0]).toContain(expected.substring(0, 10));
  });

  test('SaludSegurosMenu - opción 1 debe devolver reembolso médico/dental', async () => {
    const SaludSegurosMenu = require(path.join(__dirname, '..', 'src', 'dialogs', 'level1', 'SaludSegurosMenu.js'));
    const menu = new SaludSegurosMenu(createMinimalBot());
    const ctx = createMockContext();
    const conv = { employeeSedeId: 2, isInInfoDisplayState: false };

    const handled = await menu.handleInput(ctx, '1', conv, {});
    expect(handled).toBe(true);
    expect(ctx._messages.length).toBeGreaterThan(0);
    const entry = content['procedimiento de reembolso médico/dental'];
    const expected = typeof entry === 'object' ? (entry[String(conv.employeeSedeId)] || entry.default) : entry;
    expect(ctx._messages[0]).toContain(expected.substring(0, 10));
  });
});
