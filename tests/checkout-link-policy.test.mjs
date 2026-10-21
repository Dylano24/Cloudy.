import test from 'node:test';
import assert from 'node:assert/strict';
let policy;
try { policy = await import('../lib/checkout-link-policy.ts'); } catch {}

test('game checkout requires a Cloudy login and verified links, never client supplied IDs', () => {
  assert.ok(policy, 'checkout link policy is missing');
  assert.equal(policy.checkLinks(null,[],{}).ok,false);
  const user={id:'google-sub',provider:'google',name:'Player'};
  assert.equal(policy.checkLinks(user,['steam_id'],{}).ok,false);
  assert.equal(policy.checkLinks(user,['steam_id'],{steam_id:'76561198000000001'}).ok,true);
  assert.equal(policy.checkLinks(user,['discord_id'],{}).ok,false);
  assert.equal(policy.checkLinks({...user,id:'123456789012345678',provider:'discord'},['discord_id'],{}).ok,true);
  assert.equal(policy.checkLinks(user,['minecraft_uuid'],{}).ok,true);
  assert.equal(policy.checkLinks({...user,id:'123456789012345678',provider:'discord'},['discord_id'],{discord_id:'987654321098765432'}).verified.discord_id,'987654321098765432');
});
