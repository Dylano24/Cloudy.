import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { componentHarness, elements, textContent } from './helpers/component-harness.mjs';

for (const provider of ['discord', 'google', 'email']) {
  test(`${provider} account keeps identity details only on My information`, () => {
    const user = { id: 'private-provider-12345', provider, email: 'player@example.test', name: 'Cloudy player' };
    const { AccountPanel } = loadTypeScript('components/account/account-panel.tsx', { imports: {
      '@/hooks/use-account': { useAccount: () => ({ user, pending: false }) },
      'next/navigation': { useSearchParams: () => new URLSearchParams() },
      './email-account-form': { EmailAccountForm() {} },
      './account-name-form': { AccountNameForm() {} },
    } });
    for (const section of ['account', 'create', 'orders', 'favorites', 'fidelity']) {
      const tree = AccountPanel({ section });
      const text = textContent(tree);
      assert.doesNotMatch(text, /private-provider-12345|player@example\.test|Discord ID|Google ID/);
      if (section === 'account') {
        assert.match(text, /Cloudy playerSuccessfully connected!/);
        const form = elements(tree, node => node.props.currentName === user.name)[0];
        assert.equal(form.props.provider, provider);
      }
    }
    const information = textContent(AccountPanel({ section: 'information' }));
    assert.match(information, provider === 'email' ? /Emailplayer@example\.test/ : new RegExp(`${provider === 'google' ? 'Google' : 'Discord'} IDprivate-provider-12345`));
    assert.doesNotMatch(information, /Successfully connected!/);
  });
}

for (const provider of ['discord', 'google', 'email', undefined]) {
  test(`${provider ?? 'legacy Discord'} display-name guidance uses the correct provider`, () => {
    const harness = componentHarness();
    const { AccountNameForm } = loadTypeScript('components/account/account-name-form.tsx', { imports: {
      react: harness.react,
      '@tanstack/react-query': { useQueryClient: () => ({}) },
    } });
    const tree = harness.mount(AccountNameForm, { currentName: 'Cloudy player', provider });
    const text = textContent(tree);
    const input = elements(tree, node => node.type === 'input')[0];
    if (provider === 'email') {
      assert.doesNotMatch(text, /Discord name|Google name/);
      assert.equal(input.props['aria-describedby'], undefined);
    } else {
      const expected = provider === 'google' ? 'Google' : 'Discord';
      assert.ok(text.includes(`Your ${expected} name is used by default, but you can customize it here.`));
      assert.equal(input.props['aria-describedby'], 'cloudy-account-name-help');
    }
    assert.equal(elements(tree, node => node.type === 'button')[0].props.disabled, true);
  });
}


test('account connection confirmation stays below the username on mobile and desktop', () => {
  const css = readFileSync(new URL('../components/account/account-auth.module.css', import.meta.url), 'utf8');
  assert.match(css, /\.accountIdentity\s*\{[^}]*flex-direction:\s*column;[^}]*align-items:\s*flex-start;/);
  assert.match(css, /\.accountIdentity \.connected\s*\{[^}]*align-self:\s*flex-start;/);
  assert.doesNotMatch(css, /\.accountIdentity \.connected\s*\{[^}]*order:\s*-1;/);
  assert.doesNotMatch(css, /\.accountIdentity \.connected\s*\{[^}]*align-self:\s*flex-end;/);
});
