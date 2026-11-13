import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const { setupSteps } = loadTypeScript('lib/bot-dashboard/setup.ts');
const GUILD = '111111111111111111';
const CHANNEL = '555555555555555555';
const plan = status => ({ status, canSave: true, until: null, priceEur: 13 });
const base = { guildId: GUILD, missingPermissions: [], inviteUrl: 'https://discord.com/oauth2/authorize?client_id=1', logging: {}, welcome: {}, plan: plan('new') };

test('a fresh server shows what is left to set up, with a link for each step', () => {
  const steps = setupSteps(base);
  assert.deepEqual(steps.map(step => [step.id, step.done]), [['invite', true], ['permissions', true], ['logs', false], ['welcome', false], ['plan', false]]);
  assert.equal(steps.find(step => step.id === 'logs').href, `/bot/${GUILD}/logging`);
  assert.equal(steps.find(step => step.id === 'plan').href, `/bot/${GUILD}/plan`);
});

test('steps are done only when Cloudy reports real settings', () => {
  const steps = setupSteps({ ...base, logging: { 'logging.channels.reports': CHANNEL }, welcome: { enabled: true, channelId: CHANNEL }, plan: plan('premium') });
  assert.equal(steps.every(step => step.done), true);
  assert.equal(setupSteps({ ...base, welcome: { enabled: false, channelId: CHANNEL } })[3].done, false, 'a welcome channel that is switched off is not done');
  assert.equal(setupSteps({ ...base, logging: null, welcome: null })[2].done, false, 'a module Cloudy could not read is never shown as done');
  assert.equal(setupSteps({ ...base, plan: plan('expired') })[4].done, false);
  assert.equal(setupSteps({ ...base, plan: plan('trial') })[4].done, false, 'old access that runs out is not Premium');
  assert.doesNotMatch(JSON.stringify(setupSteps(base)), /trial/i);
});

test('missing permissions point to a fresh invite that updates Cloudy\'s role', () => {
  const step = setupSteps({ ...base, missingPermissions: ['ManageRoles', 'BanMembers'] })[1];
  assert.equal(step.done, false);
  assert.match(step.text, /ManageRoles, BanMembers/);
  assert.equal(step.external, true);
  assert.equal(step.href, base.inviteUrl);
});

test('the dashboard demo exists only on previews and a developer machine, never in production', () => {
  const { demoAllowed, demoValues, DEMO_GUILD } = loadTypeScript('lib/bot-dashboard/demo.ts');
  assert.equal(demoAllowed({ VERCEL_ENV: 'preview' }), true);
  assert.equal(demoAllowed({ VERCEL_ENV: 'production' }), false);
  assert.equal(demoAllowed({ VERCEL_ENV: 'production', CLOUDY_DASHBOARD_DEMO: '1', NODE_ENV: 'development' }), false);
  assert.equal(demoAllowed({ NODE_ENV: 'development' }), true);
  assert.equal(demoAllowed({}), false);
  assert.equal(DEMO_GUILD.name, 'Demo server');
  const { MODULES } = loadTypeScript('lib/bot-dashboard/modules.ts');
  for (const module of MODULES.filter(entry => entry.kind === 'settings')) {
    const values = demoValues(module);
    for (const section of module.sections) for (const field of section.fields) assert.ok(field.path in values, `${module.id}: ${field.path}`);
  }
});
