import test from 'node:test';
import assert from 'node:assert/strict';
import { configureAnalytics, track, GA_ID } from './analytics.ts';

test('analytics loads only after consent, queues interactions once, and stops after withdrawal', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const scripts = [];
  const events = [];
  globalThis.window = { dispatchEvent: (event) => events.push(event) };
  globalThis.document = { createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } };
  try {
    configureAnalytics(false);
    track('whatsapp_click', { location: 'footer' });
    assert.equal(scripts.length, 0);
    assert.equal(window.dataLayer, undefined);
    configureAnalytics(true);
    configureAnalytics(true);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-S7JNWFEMBM');
    assert.deepEqual(Array.from(window.dataLayer[0]).slice(0, 2), ['consent', 'default']);
    assert.equal(window.dataLayer[0][2].ad_storage, 'denied');
    assert.equal(window.dataLayer.filter((entry) => entry[0] === 'config').length, 1);
    track('whatsapp_click', { location: 'footer' });
    assert.deepEqual(Array.from(window.dataLayer.at(-1)), ['event', 'whatsapp_click', { location: 'footer' }]);
    const count = window.dataLayer.length;
    track('generate_lead', { estimate_usd: 200 });
    assert.equal(window.dataLayer.length, count);
    configureAnalytics(false);
    track('whatsapp_click', { location: 'footer' });
    assert.equal(window[`ga-disable-${GA_ID}`], true);
    assert.equal(window.dataLayer.length, count);
    configureAnalytics(true);
    track('widget_service_select', { service: 'multi-day' });
    assert.equal(scripts.length, 1);
    assert.equal(window.dataLayer.length, count + 1);
    assert.equal(events.length, 5);
  } finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
  }
});
