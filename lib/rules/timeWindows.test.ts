import { getWindowState } from './timeWindows';

// Helper: create a Date with fixed local hours/minutes on a Monday (non-holiday)
function monday(h: number, m: number): Date {
  // 2026-06-01 is a Monday
  const d = new Date(2026, 5, 1, h, m, 0, 0); // month is 0-indexed
  return d;
}

function saturday(h: number, m: number): Date {
  // 2026-06-06 is a Saturday
  return new Date(2026, 5, 6, h, m, 0, 0);
}

type TestCase = {
  label: string;
  date: Date;
  expectWindowId: string | null;
  expectLight: 'green' | 'yellow' | 'red';
  expectBuckets?: string[];
};

const cases: TestCase[] = [
  {
    label: 'Mo 09:30 → eu-morning / green',
    date: monday(9, 30),
    expectWindowId: 'eu-morning',
    expectLight: 'green',
    expectBuckets: ['eu'],
  },
  {
    label: 'Mo 14:00 → eu-lunch / yellow (onlyStrong)',
    date: monday(14, 0),
    expectWindowId: 'eu-lunch',
    expectLight: 'yellow',
    expectBuckets: ['eu'],
  },
  {
    label: 'Mo 16:00 → overlap / green',
    date: monday(16, 0),
    expectWindowId: 'overlap',
    expectLight: 'green',
    expectBuckets: ['eu', 'us'],
  },
  {
    label: 'Mo 21:00 → us-pm / green',
    date: monday(21, 0),
    expectWindowId: 'us-pm',
    expectLight: 'green',
    expectBuckets: ['us'],
  },
  {
    label: 'Mo 23:30 → crypto / yellow (niedrig)',
    date: monday(23, 30),
    expectWindowId: 'crypto',
    expectLight: 'yellow',
    expectBuckets: ['crypto'],
  },
  {
    label: 'Sa 11:00 → crypto (only bucket) / yellow',
    date: saturday(11, 0),
    expectWindowId: 'crypto',
    expectLight: 'yellow',
    expectBuckets: ['crypto'],
  },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const ws = getWindowState(tc.date);
  const actualId = ws.activeWindow?.id ?? null;
  const errors: string[] = [];

  if (actualId !== tc.expectWindowId) {
    errors.push(`window: expected "${tc.expectWindowId}", got "${actualId}"`);
  }
  if (ws.trafficLight !== tc.expectLight) {
    errors.push(`light: expected "${tc.expectLight}", got "${ws.trafficLight}"`);
  }
  if (tc.expectBuckets) {
    const bStr = JSON.stringify(ws.activeBuckets.sort());
    const eStr = JSON.stringify([...tc.expectBuckets].sort());
    if (bStr !== eStr) {
      errors.push(`buckets: expected ${eStr}, got ${bStr}`);
    }
  }

  if (errors.length === 0) {
    console.log(`✅  ${tc.label}`);
    passed++;
  } else {
    console.log(`❌  ${tc.label}`);
    for (const e of errors) console.log(`     ${e}`);
    failed++;
  }
}

console.log(`\n${passed}/${passed + failed} tests passed`);
if (failed > 0) process.exit(1);
