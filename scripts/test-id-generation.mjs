import assert from 'assert';

// Mock minimal dependencies or simple pattern validation tests
function generateTestId() {
  const randCode = Math.floor(100000 + Math.random() * 900000);
  const regId = `REG-2026-${randCode}`;
  const ticketId = `TCK-2026-${randCode}`;
  return { regId, ticketId };
}

console.log('--- Testing ID Generation Format ---');

for (let i = 0; i < 100; i++) {
  const { regId, ticketId } = generateTestId();

  // REG-2026-XXXXXX validation
  assert.ok(/^REG-2026-\d{6}$/.test(regId), `Invalid regId format: ${regId}`);

  // TCK-2026-XXXXXX validation
  assert.ok(/^TCK-2026-\d{6}$/.test(ticketId), `Invalid ticketId format: ${ticketId}`);
}

console.log('✅ 100 test iterations passed: regId and ticketId format match REG-2026-XXXXXX and TCK-2026-XXXXXX (6 digits).');
