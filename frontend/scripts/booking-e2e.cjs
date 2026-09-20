// Real local browser flow. Requires running frontend/backend and Playwright.
// Only uniquely named test records are created and removed in finally.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '../..');
const python = process.env.TEST_PYTHON || resolve(root, 'venv/Scripts/python.exe');
const origin = 'http://127.0.0.1:5173';
const api = 'http://127.0.0.1:8000/api';
const marker = `E2E-${randomUUID()}`;
const password = randomUUID();
const db = (code) => execFileSync(python, ['-B', 'manage.py', 'shell', '-c', code], {
  cwd: resolve(root, 'backend'), encoding: 'utf8', env: { ...process.env, E2E_MARKER: marker, E2E_PASSWORD: password },
});
const list = data => Array.isArray(data) ? data : data.results;
async function get(path) {
  const response = await fetch(api + path);
  assert.equal(response.status, 200, path);
  return response.json();
}

(async () => {
  let browser;
  try {
    db("import os; from django.contrib.auth import get_user_model; from apps.technicians.models import Technician; m=os.environ['E2E_MARKER']; get_user_model().objects.create_user(username=m,password=os.environ['E2E_PASSWORD'],is_staff=True,role='admin'); Technician.objects.create(name=m,working_days=['mon','tue','wed','thu','fri','sat','sun'])");
    const tech = list(await get('/technicians/')).find(t => t.name === marker);
    const services = list(await get('/services/')).slice(0, 2);
    assert.equal(services.length, 2, 'Need two existing services');
    const ids = services.map(s => s.id).join(',');
    let selectedDate, start, slotPath;
    for (let day = 1; day <= 21; day++) {
      const date = new Date(); date.setDate(date.getDate() + day);
      const value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const path = `/public/slots/?date=${value}&serviceIds=${ids}&technicianId=${tech.id}`;
      const data = await get(path);
      if (data.slots.length) { selectedDate = value; start = data.slots[0]; slotPath = path; break; }
    }
    assert.ok(start, 'Need an available date within 21 days');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ timezoneId: 'America/Edmonton' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    async function selectServicesAndTime() {
      await page.goto(origin + '/book');
      for (const service of services) await page.getByRole('heading', { name: service.name, exact: true }).click();
      await page.getByRole('button', { name: 'Continue to Date & Time' }).click();
      const target = new Date(selectedDate + 'T12:00:00');
      const caption = target.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      for (let i=0; i<3 && !(await page.locator('.rdp [aria-live="polite"]').innerText()).includes(caption); i++) {
        await page.getByRole('button', { name: 'Go to next month' }).click();
      }
      await page.locator('button[name="day"]:not(.day-outside)').filter({ hasText: new RegExp(`^${target.getDate()}$`) }).click();
      await page.getByRole('button', { name: new RegExp(marker) }).click();
      await page.getByRole('button', { name: new RegExp(start) }).first().waitFor();
    }
    await selectServicesAndTime();
    await page.getByRole('button', { name: new RegExp(start) }).first().click();
    await page.getByRole('button', { name: /Continue/ }).click();
    await page.getByLabel('Full Name').fill('X');
    await page.getByText('Name must be at least 2 characters', { exact: true }).waitFor();
    await page.getByLabel('Full Name').fill(marker);
    await page.getByLabel('Phone Number').fill('7805550100');
    await page.getByRole('button', { name: /Continue|Review/ }).click();
    await page.getByRole('button', { name: 'Confirm Appointment', exact: true }).click();
    const creation = page.waitForResponse(r => r.url().endsWith('/public/appointments/') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Yes, confirm' }).click();
    const response = await creation;
    assert.equal(response.status(), 201, await response.text());
    const appointment = await response.json();
    await page.waitForURL('**/book/success');
    assert.ok(!(await get(slotPath)).slots.includes(start), 'Booked time must be unavailable');
    console.log('PASS: multiple services selected, date/time selected, guest booking submitted, success page shown, slot occupied');

    const staff = await browser.newPage();
    staff.on('pageerror', e => errors.push(e.message));
    await staff.goto(origin + '/login');
    await staff.getByLabel('Username').fill(marker);
    await staff.getByLabel('Password', { exact: true }).fill(password);
    await staff.getByRole('button', { name: 'Sign in', exact: true }).click();
    await staff.waitForURL('**/admin');
    await staff.goto(origin + `/admin/appointments/${appointment.id}`);
    await staff.getByRole('heading', { name: `Appointment #${appointment.id}`, exact: true }).waitFor();
    assert.equal(await staff.locator('input').first().inputValue(), marker);
    await staff.getByRole('combobox').click();
    await staff.getByRole('option', { name: 'cancelled', exact: true }).click();
    const update = staff.waitForResponse(r => r.url().endsWith(`/admin/appointments/${appointment.id}/`) && r.request().method() === 'PATCH');
    await staff.getByRole('button', { name: 'Save changes' }).click();
    const updated = await update;
    assert.equal(updated.status(), 200, await updated.text());
    assert.equal((await updated.json()).status, 'cancelled');
    assert.ok((await get(slotPath)).slots.includes(start), 'Cancelled time must reopen');
    await selectServicesAndTime();
    assert.equal(await page.getByRole('button', { name: new RegExp(start) }).first().isEnabled(), true);
    // Exercise the actual frontend delete helper on our temporary technician only.
    await staff.evaluate(async id => {
      const { admin } = await import('/src/lib/api.ts');
      await admin.deleteTechnician(id);
    }, tech.id);
    assert.ok(!list(await get('/technicians/')).some(t => t.id === tech.id));
    assert.deepEqual(errors, [], 'No customer page JavaScript errors');
    console.log('PASS: staff login, appointment viewed, cancelled via UI, slot reopened in API and booking UI');
    console.log(JSON.stringify({ date: selectedDate, start, duration: services.reduce((n,s)=>n+s.duration,0), serviceCount: services.length }));
  } finally {
    if (browser) await browser.close();
    db("import os; from django.contrib.auth import get_user_model; from apps.technicians.models import Technician; from apps.appointments.models import Appointment; m=os.environ['E2E_MARKER']; Appointment.objects.filter(customer_name=m).delete(); Technician.objects.filter(name=m).delete(); get_user_model().objects.filter(username=m).delete()");
    console.log('Test appointment, test technician and temporary staff account removed.');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
