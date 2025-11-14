const path = require('path');
const axios = require('axios');

// These tests are conditional: only run if env var RUN_INTEGRATION_TESTS is 'true'
const runIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';

describe('Integration tests (conditional)', () => {
  if (!runIntegration) {
    test('skipped: integration tests disabled', () => {
      expect(true).toBe(true);
    });
    return;
  }

  test('EmployeeService can connect and query (requires DB env vars)', async () => {
    const EmployeeService = require(path.join(__dirname, '..', 'src', 'bot', 'services', 'EmployeeService.js'));
    const svc = new EmployeeService();
    const testIdentifier = process.env.INTEGRATION_TEST_EMP_IDENTIFIER;
    expect(testIdentifier).toBeDefined();
    const res = await svc.getEmployeeByIdentifier(testIdentifier);
    // if no rows, that's acceptable; we assert the call succeeds
    expect(res === null || typeof res === 'object').toBeTruthy();
    await svc.disconnect();
  }, 30000);

  test('Power Automate flows respond (requires FLOW URLs in env)', async () => {
    const flowUrl = process.env.POWER_AUTOMATE_QNA_LOG_FLOW_URL;
    expect(flowUrl).toBeDefined();
    const payload = { test: true, timestamp: new Date().toISOString() };
    const resp = await axios.post(flowUrl, payload, { timeout: 10000 });
    expect(resp.status).toBeGreaterThanOrEqual(200);
    expect(resp.status).toBeLessThan(300);
  }, 20000);
});
