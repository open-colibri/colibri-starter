#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { get } from 'node:http';
import { get as getHttps } from 'node:https';
import { gunzipSync } from 'node:zlib';

// axe-core is not a dependency of the repository: the pinned release is downloaded from the npm registry once,
// checked against its published integrity, and cached. AXE_CORE_PATH points at another axe.min.js.
const axeVersion = '4.13.0';
const axeIntegrity = 'sha512-UzGt8zg7Ny8djbYMhxl2zuEevVa7r2gJjYY5Lwr1xM7+XU2nd6CkIWFTVcCIbAP63vSz71NaVyyuSk9lHKcy0A==';

const colorSchemes = ['light', 'dark'];
const viewports = {
  desktop: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};
// WCAG 2.1 A and AA, plus the best-practice rules about landmarks and headings.
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const extraRules = [
  'region',
  'landmark-one-main',
  'landmark-unique',
  'landmark-no-duplicate-banner',
  'landmark-no-duplicate-contentinfo',
  'landmark-no-duplicate-main',
  'landmark-banner-is-top-level',
  'landmark-contentinfo-is-top-level',
  'landmark-main-is-top-level',
  'page-has-heading-one',
];
// Violations coming from Sylius core templates (not from the theme): reported apart, they do not fail the check.
const coreIssues = [
  { rule: 'landmark-one-main', reason: 'the Sylius shop layout (shared/layout/base.html.twig) has no <main> element' },
  { rule: 'region', reason: 'consequence of the missing <main>: page content outside of any landmark' },
  { rule: 'aria-required-parent', match: /#(register|login)-page-button/, reason: 'header visitor links have role="menuitem" without a menu parent (shared/layout/base/header/content/security/visitor)' },
  { rule: 'button-name', match: /data-live-action-param="removeItem"/, reason: 'the cart "remove item" button only holds an icon (cart/index/content/form/sections/general/items/body/remove.html.twig)' },
  { rule: 'color-contrast', match: /\.disabled > \.page-link/, reason: 'disabled pagination link: WCAG exempts inactive controls, but the Sylius pager renders it without aria-disabled' },
  { rule: 'label', match: /_quantity"/, reason: 'the cart quantity input is rendered with label: false (cart/index/content/form/sections/general/items/body/quantity.html.twig)' },
];
const defaultBaseUrl = `https://${storefrontDomain()}/en_US/`;
const preferredProductSlug = 'comet-pulse-t-shirt';

// A git worktree runs its own stack on <slug>.app.localhost, the main checkout on app.test.
// Keep in sync with slug() in .castor/worktree/tasks.php.
function storefrontDomain() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  // A linked worktree has a ".git" file, the main checkout a ".git" directory.
  if (!existsSync(join(root, '.git')) || !statSync(join(root, '.git')).isFile()) {
    return 'app.test';
  }

  const slug = basename(root).replace(/[^A-Za-z0-9]+/g, '-').toLowerCase().slice(0, 40).replace(/^-+|-+$/g, '');

  return slug === '' ? 'app.test' : `${slug}.app.localhost`;
}

function printUsage() {
  console.log(`Usage: node scripts/check-theme-accessibility.mjs [theme] [options]

Run axe-core ${axeVersion} (WCAG 2.1 A/AA, landmarks, headings) on the homepage, a category
page, a product page and the cart of the active storefront theme, at desktop
(${viewports.desktop.width}px) and mobile (${viewports.mobile.width}px) widths, in its light and dark color
schemes, and report the violations with their selectors (and contrast ratios for color-contrast).

The theme argument only labels the report: activate the theme first with
"castor sylius:theme:setup <theme>".

Options:
  --base-url <url>     Storefront base URL (default: ${defaultBaseUrl})
  --viewport <name>    Only check this viewport (desktop or mobile)
  --color-scheme <name>
                       Only check this color scheme (${colorSchemes.join(' or ')})
  --product <slug>     Check this product instead of discovering one
  --json <file>        Also write the full report as JSON
  --max-nodes <n>      Elements listed per violation (default: 8, 0 for all)
  --help               Show this help

Exits with code 1 when a theme violation is found. Violations from Sylius core
templates are listed apart and do not fail the check, nor do the elements
axe-core cannot decide (text over images or gradients), counted "to review".

Requires Node.js 22+ and Google Chrome or Chromium. Set CHROME_BIN to use a
specific browser executable.`);
}

function parseArguments(args) {
  const options = { theme: undefined, baseUrl: defaultBaseUrl, viewports: Object.keys(viewports), colorSchemes, productSlug: undefined, json: undefined, maxNodes: 8 };

  while (args.length > 0) {
    const argument = args.shift();
    if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    }

    if (['--base-url', '--viewport', '--color-scheme', '--product', '--json', '--max-nodes'].includes(argument)) {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      if (argument === '--base-url') options.baseUrl = value;
      else if (argument === '--color-scheme') {
        if (!colorSchemes.includes(value)) throw new Error(`Unknown color scheme "${value}" (${colorSchemes.join(', ')})`);
        options.colorSchemes = [value];
      }
      else if (argument === '--product') options.productSlug = value;
      else if (argument === '--json') options.json = resolve(value);
      else if (argument === '--max-nodes') options.maxNodes = Number.parseInt(value, 10);
      else {
        if (!viewports[value]) throw new Error(`Unknown viewport "${value}" (${Object.keys(viewports).join(', ')})`);
        options.viewports = [value];
      }
      continue;
    }

    if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`);
    if (options.theme) throw new Error(`Unexpected argument: ${argument}`);
    options.theme = argument;
  }

  if (options.productSlug !== undefined && !/^[a-zA-Z0-9_-]+$/.test(options.productSlug)) {
    throw new Error('The product slug may only contain letters, numbers, hyphens, and underscores');
  }
  if (!Number.isInteger(options.maxNodes) || options.maxNodes < 0) throw new Error('--max-nodes must be a positive integer');

  const baseUrl = new URL(options.baseUrl);
  if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('The base URL must use HTTP or HTTPS');
  baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, '')}/`;
  options.baseUrl = baseUrl;

  return options;
}

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;

  const candidates = process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
      ]
    : process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ]
      : ['google-chrome', 'chromium', 'chromium-browser'];

  if (process.platform !== 'win32' && process.platform !== 'darwin') {
    return candidates.find(candidate => {
      try {
        return spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0;
      } catch {
        return false;
      }
    });
  }

  return candidates.find(candidate => existsSync(candidate));
}

function download(url) {
  return new Promise((resolvePromise, reject) => {
    const request = (url.startsWith('https:') ? getHttps : get)(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(new URL(response.headers.location, url).href).then(resolvePromise, reject);
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`${url} returned HTTP ${response.statusCode}`));
          return;
        }
        resolvePromise(Buffer.concat(chunks));
      });
    });
    request.setTimeout(30_000, () => request.destroy(new Error(`Timed out downloading ${url}`)));
    request.on('error', reject);
  });
}

// Returns one file of a .tgz archive (the npm package format).
function extractFromTarball(archive, wantedPath) {
  const tar = gunzipSync(archive);
  for (let offset = 0; offset + 512 <= tar.length;) {
    const name = tar.toString('utf8', offset, offset + 100).replace(/\0.*$/s, '');
    if (name === '') break;
    const size = Number.parseInt(tar.toString('utf8', offset + 124, offset + 136).replace(/\0.*$/s, '').trim() || '0', 8);
    if (name === wantedPath) return tar.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error(`${wantedPath} not found in the archive`);
}

async function loadAxeSource() {
  if (process.env.AXE_CORE_PATH) return readFileSync(process.env.AXE_CORE_PATH, 'utf8');

  try {
    const require = createRequire(import.meta.url);
    const path = require.resolve('axe-core/axe.min.js');
    if (JSON.parse(readFileSync(join(dirname(path), 'package.json'), 'utf8')).version === axeVersion) {
      return readFileSync(path, 'utf8');
    }
  } catch {
    // Not installed: use the cached download.
  }

  const cacheDir = join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'colibri-starter');
  const cached = join(cacheDir, `axe-core-${axeVersion}.min.js`);
  if (existsSync(cached)) return readFileSync(cached, 'utf8');

  const url = `https://registry.npmjs.org/axe-core/-/axe-core-${axeVersion}.tgz`;
  console.log(`Downloading axe-core ${axeVersion} from ${url}`);
  const archive = await download(url);
  const [algorithm, expected] = axeIntegrity.split('-');
  if (createHash(algorithm).update(archive).digest('base64') !== expected) {
    throw new Error(`The axe-core ${axeVersion} archive does not match its published integrity`);
  }
  const source = extractFromTarball(archive, 'package/axe.min.js');
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cached, source);

  return source.toString('utf8');
}

function getJson(url) {
  return download(url).then(body => JSON.parse(body.toString('utf8')));
}

function waitForEvent(events, method) {
  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for Chrome DevTools event ${method}`)), 45_000);
    if (!events.has(method)) events.set(method, []);
    events.get(method).push(params => {
      clearTimeout(timeout);
      resolvePromise(params);
    });
  });
}

// Runs in the page (serialized, so it must not use anything from this module): settles animations and
// scroll-triggered reveals, then runs axe-core.
async function auditPage(tags, rules) {
  // Reveal effects often wait for the element to be scrolled into view.
  for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(200, innerHeight / 2)) {
    scrollTo(0, y);
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 300));
  // Check the final state of entrance animations, not a frame in the middle of a fade, and the resting state of
  // endless ones (a blinking cursor would otherwise be caught at its dimmest).
  for (const animation of document.getAnimations()) {
    try {
      const timing = animation.effect?.getComputedTiming();
      if (timing && Number.isFinite(timing.endTime)) animation.finish();
      else animation.cancel();
    } catch {}
  }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const results = await axe.run({ exclude: [['.sf-toolbar'], ['[id^="sfwdt"]'], ['.sf-minitoolbar']] }, {
    runOnly: { type: 'tag', values: tags },
    rules: Object.fromEntries(rules.map(rule => [rule, { enabled: true }])),
    resultTypes: ['violations', 'incomplete'],
  });

  // axe-core gives up on text over a gradient or next to a pseudo-element background: estimate the worst contrast
  // against every gradient stop (and the solid colors below), ignoring pseudo-elements and background images.
  const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const toRgba = value => {
    canvas.fillStyle = '#000';
    canvas.fillStyle = value;
    const color = canvas.fillStyle;
    if (color.startsWith('#')) return [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)).concat(1);
    if (/^rgba?\(/.test(color)) {
      const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number);
      return [r, g, b, a];
    }
    // Other notations (oklch(), color(display-p3 …)) are read back through a pixel.
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (top, bottom) => [0, 1, 2].map(i => top[i] * top[3] + bottom[i] * (1 - top[3])).concat(1);
  const luminance = color => {
    const [r, g, b] = color.slice(0, 3).map(channel => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
  };
  const hex = color => '#' + color.slice(0, 3).map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
  const estimate = element => {
    // Text filled with the gradient itself (background-clip: text) has no background to compare with.
    if (toRgba(getComputedStyle(element).color)[3] === 0) return undefined;
    const layers = [];
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage.includes('gradient') && style.backgroundClip !== 'text') {
        const stops = (style.backgroundImage.match(/(rgba?|hsla?|oklab|oklch|lab|lch|color)\([^()]*\)|#[0-9a-f]{3,8}\b|transparent/gi) ?? []).map(toRgba);
        if (stops.length > 0) layers.push(stops);
        if (stops.length > 0 && stops.every(stop => stop[3] === 1)) break;
      }
      const color = toRgba(style.backgroundColor);
      if (color[3] > 0) {
        layers.push([color]);
        if (color[3] === 1) break;
      }
    }
    let backgrounds = [[255, 255, 255, 1]];
    for (const stops of layers.reverse()) {
      backgrounds = backgrounds.flatMap(background => stops.map(stop => over(stop, background))).slice(0, 64);
    }
    const style = getComputedStyle(element);
    const size = parseFloat(style.fontSize);
    const expected = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5;
    let worst;
    for (const background of backgrounds) {
      const foreground = over(toRgba(style.color), background);
      const value = ratio(foreground, background);
      if (!worst || value < worst.ratio) worst = { ratio: Math.round(value * 100) / 100, expected, fg: hex(foreground), bg: hex(background) };
    }
    return worst;
  };

  const summarize = rule => ({
    id: rule.id,
    impact: rule.impact,
    help: rule.help,
    helpUrl: rule.helpUrl,
    nodes: rule.nodes.map(node => {
      const element = document.querySelector(node.target.flat().at(-1));
      const data = node.any.find(check => check.data?.contrastRatio > 0)?.data;
      const reasons = node.any.map(check => check.message).join(' ');
      return {
        target: node.target.flat().join(' '),
        html: node.html.replace(/\s+/g, ' ').slice(0, 160),
        text: (element?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
        contrast: data ? { fg: data.fgColor, bg: data.bgColor, ratio: data.contrastRatio, expected: data.expectedContrastRatio, fontSize: data.fontSize, fontWeight: data.fontWeight } : undefined,
        summary: node.failureSummary,
        reason: node.any.concat(node.all, node.none).map(check => check.message).filter(Boolean)[0],
        estimate: rule.id === 'color-contrast' && !data && element && /gradient|pseudo/.test(reasons) ? estimate(element) : undefined,
      };
    }),
  });

  return {
    violations: results.violations.map(summarize),
    incomplete: results.incomplete.map(summarize),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const axeSource = await loadAxeSource();
  const chrome = findChrome();
  if (!chrome) throw new Error('Could not find Chrome or Chromium; set CHROME_BIN to its executable');

  const profileDir = mkdtempSync(join(tmpdir(), 'theme-a11y-'));
  const child = spawn(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--ignore-certificate-errors',
    `--window-size=${viewports.desktop.width},${viewports.desktop.height}`,
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  let launchError;
  child.on('error', error => launchError = error);
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => stderr += chunk);

  let ws;
  try {
    let port;
    for (let attempt = 0; attempt < 150 && !port; attempt++) {
      if (launchError) throw new Error(`Could not start Chrome: ${launchError.message}`);
      if (child.exitCode !== null) throw new Error(`Chrome exited before starting: ${stderr}`);
      port = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//)?.[1];
      if (!port) await delay(100);
    }
    if (!port) throw new Error(`Chrome DevTools did not start: ${stderr}`);

    const target = (await getJson(`http://127.0.0.1:${port}/json`)).find(item => item.type === 'page');
    if (!target) throw new Error('Chrome did not expose a page target');

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out connecting to the Chrome DevTools page')), 10_000);
      ws.addEventListener('open', () => {
        clearTimeout(timeout);
        resolvePromise();
      }, { once: true });
      ws.addEventListener('error', error => {
        clearTimeout(timeout);
        reject(error);
      }, { once: true });
    });

    let nextId = 0;
    const pending = new Map();
    const events = new Map();
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const callbacks = pending.get(message.id);
        pending.delete(message.id);
        message.error ? callbacks.reject(new Error(message.error.message)) : callbacks.resolve(message.result);
      }
      if (message.method) {
        for (const resolvePromise of events.get(message.method) || []) resolvePromise(message.params);
        events.delete(message.method);
      }
    });
    ws.addEventListener('close', () => {
      for (const callbacks of pending.values()) callbacks.reject(new Error('Chrome DevTools connection closed'));
      pending.clear();
    });

    const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve: resolvePromise, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evaluate = async (expression, { awaitPromise = false } = {}) => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      }
      return result.result.value;
    };

    const navigate = async url => {
      const loaded = waitForEvent(events, 'Page.loadEventFired');
      const navigation = await send('Page.navigate', { url: url.href });
      if (navigation.errorText) throw new Error(`Could not open ${url.href}: ${navigation.errorText}`);
      await loaded;
      // Hide the Symfony web debug toolbar (dev env).
      await evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>[id^="sfwdt"], .sf-toolbar, .sf-minitoolbar { display: none !important; }</style>')`);
      await evaluate('document.fonts.ready', { awaitPromise: true });
      await delay(500);
    };

    await send('Page.enable');
    await send('Runtime.enable');

    // Pages to check: the homepage, the first category, a product that can be bought, and the cart with it.
    const homepageUrl = new URL('./', options.baseUrl);
    await navigate(homepageUrl);
    const links = await evaluate(`[...new Set([...document.querySelectorAll('a[href]')]
      .map(link => new URL(link.getAttribute('href'), document.baseURI))
      .filter(url => url.origin === location.origin)
      .map(url => url.origin + url.pathname))]`);
    const taxonUrl = links.find(link => link.split('/').includes('taxons'));
    if (!taxonUrl) throw new Error(`No category link was found on ${homepageUrl.href}`);

    let productUrls = options.productSlug
      ? [new URL(`./products/${options.productSlug}`, options.baseUrl).href]
      : links.filter(link => link.split('/').filter(Boolean).at(-2) === 'products');
    if (!options.productSlug) {
      await navigate(new URL(taxonUrl));
      const categoryProducts = await evaluate(`[...document.querySelectorAll('a[href]')]
        .map(link => new URL(link.getAttribute('href'), document.baseURI))
        .filter(url => url.pathname.split('/').filter(Boolean).at(-2) === 'products')
        .map(url => url.origin + url.pathname)`);
      productUrls = [...new Set([...productUrls, ...categoryProducts])];
      productUrls.sort((a, b) => Number(b.endsWith(`/products/${preferredProductSlug}`)) - Number(a.endsWith(`/products/${preferredProductSlug}`)));
    }

    let productUrl;
    for (const candidate of productUrls.slice(0, 24)) {
      const purchasable = await evaluate(`fetch(${JSON.stringify(candidate)}, { credentials: 'same-origin' })
        .then(response => response.ok ? response.text() : '')
        .then(html => { const button = new DOMParser().parseFromString(html, 'text/html').querySelector('#add-to-cart-button'); return !!button && !button.disabled; })`, { awaitPromise: true });
      if (purchasable) {
        productUrl = candidate;
        break;
      }
    }
    if (!productUrl) throw new Error('No product that can be added to the cart was found; load the data fixtures or pass --product <slug>');

    // Fill the cart of this isolated browser profile.
    await navigate(new URL(productUrl));
    await evaluate(`document.querySelector('#add-to-cart-button').click()`);
    const cartUrl = new URL('cart/', options.baseUrl);
    let cartFilled = false;
    for (let attempt = 0; attempt < 30 && !cartFilled; attempt++) {
      try {
        cartFilled = await evaluate(`fetch(${JSON.stringify(cartUrl.href)}, { credentials: 'same-origin' })
          .then(response => response.text())
          .then(html => new DOMParser().parseFromString(html, 'text/html').querySelector('[name^="sylius_shop_cart[items]"]') !== null)`, { awaitPromise: true }) === true;
      } catch {
        // The add-to-cart redirect destroyed the evaluated context: retry on the new document.
      }
      if (!cartFilled) await delay(500);
    }
    if (!cartFilled) throw new Error(`The product ${productUrl} could not be added to the cart`);

    const pages = [
      { name: 'homepage', url: homepageUrl },
      { name: 'category', url: new URL(taxonUrl) },
      { name: 'product', url: new URL(productUrl) },
      { name: 'cart', url: cartUrl },
    ];

    const report = { theme: options.theme ?? null, axeVersion, baseUrl: options.baseUrl.href, pages: [] };
    // Every theme ships both color schemes: the system preference picks one, the switcher staying in "Auto" mode.
    for (const colorScheme of options.colorSchemes) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: colorScheme }] });
      for (const viewportName of options.viewports) {
        const viewport = viewports[viewportName];
        await send('Emulation.setDeviceMetricsOverride', viewport);
        await send('Emulation.setTouchEmulationEnabled', { enabled: viewport.mobile });
        for (const page of pages) {
          await navigate(page.url);
          await evaluate(axeSource);
          const result = await evaluate(`(${auditPage})(${JSON.stringify(axeTags)}, ${JSON.stringify(extraRules)})`, { awaitPromise: true });
          report.pages.push({ page: page.name, viewport: `${viewportName}, ${colorScheme}`, url: page.url.href, ...splitCoreIssues(result) });
        }
      }
    }

    printReport(report, options.maxNodes);
    if (options.json) {
      mkdirSync(dirname(options.json), { recursive: true });
      writeFileSync(options.json, `${JSON.stringify(report, null, 2)}\n`);
      console.log(`\nFull report: ${options.json}`);
    }

    const violations = report.pages.reduce((total, page) => total + page.violations.reduce((sum, rule) => sum + rule.nodes.length, 0), 0);
    process.exitCode = violations > 0 ? 1 : 0;
  } finally {
    ws?.close();
    if (child.pid && child.exitCode === null) {
      const exited = new Promise(resolvePromise => child.once('exit', resolvePromise));
      child.kill('SIGTERM');
      await exited;
    }
    rmSync(profileDir, { recursive: true, force: true });
  }
}

function coreIssueOf(rule, node) {
  return coreIssues.find(issue => issue.rule === rule.id && (!issue.match || issue.match.test(`${node.target} ${node.html}`)));
}

function splitCoreIssues({ violations, incomplete }) {
  const theme = [];
  const core = [];
  for (const rule of violations) {
    const themeNodes = rule.nodes.filter(node => !coreIssueOf(rule, node));
    const coreNodes = rule.nodes.filter(node => coreIssueOf(rule, node));
    if (themeNodes.length > 0) theme.push({ ...rule, nodes: themeNodes });
    if (coreNodes.length > 0) core.push({ ...rule, nodes: coreNodes, reason: coreIssueOf(rule, coreNodes[0]).reason });
  }

  // Estimated contrasts below the threshold, for the text axe-core could not decide.
  const estimated = (incomplete.find(rule => rule.id === 'color-contrast')?.nodes ?? [])
    .filter(node => node.estimate && node.estimate.ratio < node.estimate.expected);

  return { violations: theme, coreViolations: core, estimated, incomplete };
}

function printReport(report, maxNodes) {
  const label = report.theme ? `"${report.theme}" theme` : 'active theme';
  console.log(`Accessibility check of the ${label} (axe-core ${report.axeVersion}, WCAG 2.1 AA) on ${report.baseUrl}`);

  let total = 0;
  for (const page of report.pages) {
    const count = page.violations.reduce((sum, rule) => sum + rule.nodes.length, 0);
    const toReview = page.incomplete.find(rule => rule.id === 'color-contrast')?.nodes.length ?? 0;
    total += count;
    const review = toReview > 0 ? `, ${toReview} contrast(s) to review by hand` : '';
    console.log(`\n${count === 0 ? '✔' : '✘'} ${page.page} (${page.viewport}) ${page.url} — ${count} violation(s)${review}`);
    for (const rule of page.violations) {
      console.log(`  [${rule.impact}] ${rule.id}: ${rule.help} (${rule.nodes.length})`);
      const nodes = maxNodes === 0 ? rule.nodes : rule.nodes.slice(0, maxNodes);
      for (const node of nodes) {
        const text = node.text ? ` "${node.text}"` : '';
        if (node.contrast) {
          const { fg, bg, ratio, expected, fontSize, fontWeight } = node.contrast;
          console.log(`    - ${node.target}${text}: ${ratio}:1 (needs ${expected}), ${fg} on ${bg}, ${fontSize} ${fontWeight}`);
        } else {
          console.log(`    - ${node.target}${text}: ${node.reason ?? node.html}`);
        }
      }
      if (nodes.length < rule.nodes.length) console.log(`    … and ${rule.nodes.length - nodes.length} more`);
    }
    if (page.estimated.length > 0) {
      console.log(`  [warning] estimated contrast over a gradient or a pseudo-element, check it by hand (${page.estimated.length})`);
      const nodes = maxNodes === 0 ? page.estimated : page.estimated.slice(0, maxNodes);
      for (const node of nodes) {
        const { fg, bg, ratio, expected } = node.estimate;
        console.log(`    - ${node.target}${node.text ? ` "${node.text}"` : ''}: down to ${ratio}:1 (needs ${expected}:1), ${fg} on ${bg}`);
      }
      if (nodes.length < page.estimated.length) console.log(`    … and ${page.estimated.length - nodes.length} more`);
    }
  }

  const core = new Map();
  for (const page of report.pages) {
    for (const rule of page.coreViolations) {
      const entry = core.get(rule.reason) ?? { rule: rule.id, pages: new Set() };
      entry.pages.add(`${page.page} (${page.viewport})`);
      core.set(rule.reason, entry);
    }
  }
  if (core.size > 0) {
    console.log('\nIgnored (Sylius core templates, not the theme, or false positives):');
    for (const [reason, entry] of core) console.log(`  - ${entry.rule}: ${reason} — ${[...entry.pages].join(', ')}`);
  }

  console.log(total === 0 ? '\nNo theme violation found.' : `\n${total} theme violation(s) found.`);
}

main().catch(error => {
  console.error(`Accessibility check failed: ${error.message}`);
  process.exitCode = 2;
});
