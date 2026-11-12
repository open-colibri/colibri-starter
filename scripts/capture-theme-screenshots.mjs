#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { get } from 'node:http';
import { get as getHttps } from 'node:https';

// Named screen sizes, each one saved as <theme>-<page>-<name>.webp. "wide" tells
// full-width layouts from centered containers, "mobile" emulates a phone.
const viewportPresets = {
  normal: { width: 1440, height: 900 },
  wide: { width: 2560, height: 1080 },
  mobile: {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};
// Chrome cannot encode a WebP image taller or wider than this.
const maxWebpSize = 16383;
const webpQuality = 85;
const defaultBaseUrl = `https://${storefrontDomain()}/en_US/`;
// Data fixtures differ from one install to another: the product is discovered on
// the storefront. This one is only preferred when it exists and can be bought,
// so that screenshots stay comparable between themes.
const preferredProductSlug = 'comet-pulse-t-shirt';
const maxEvaluatedProducts = 24;
// Every theme ships both schemes: each one is captured through the visitor's
// system preference (the switcher's "Auto" mode) and saved with its own suffix.
const colorSchemes = ['light', 'dark'];
const themeSelectors = {
  canvas: '.canvas-logo',
  prompt: '.prompt-logo',
  blush: '.blush-logo',
  volt: '.volt-logo',
  lagoon: '.lagoon-logo',
  aurora: '.aurora-logo',
  tech: '.tech-logo',
  retro_gaming: '.rg-logo',
  drive: '.drive-logo',
  cellar: '.cellar-logo',
  roastery: '.roastery-logo',
  teahouse: '.teahouse-logo',
  summit: '.summit-logo',
  groove: '.groove-logo',
  arena: '.arena-logo',
  hearth: '.hearth-logo',
  bloom: '.bloom-logo',
  paws: '.paws-logo',
  culture: '.culture-logo',
  depot: '.depot-logo',
  torque: '.torque-logo',
};

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
  console.log(`Usage: node scripts/capture-theme-screenshots.mjs <theme> [options]

Capture full-page screenshots of the homepage and of a product page, for each
screen size and color scheme. Screenshots are saved as
docs/images/<theme>-<page>-<viewport>-<scheme>.webp, for example
docs/images/canvas-homepage-mobile-dark.webp.

Screen sizes: ${Object.entries(viewportPresets).map(([name, { width, height }]) => `${name} (${width}x${height})`).join(', ')}.
Color schemes: ${colorSchemes.join(', ')}.

The product is chosen among the products listed on the storefront (homepage,
then category pages): the first one that is in stock, has an add-to-cart button
and a real image is used, the "${preferredProductSlug}" product being preferred
when it qualifies.

Options:
  --include-cart       Add the selected product and capture the cart page
  --product <slug>     Use this product instead of discovering one
  --base-url <url>    Storefront base URL (default: ${defaultBaseUrl})
  --output-dir <dir>  Screenshot output directory (default: docs/images)
  --viewports <list>  Comma-separated screen sizes (default: ${Object.keys(viewportPresets).join(',')})
  --width <px>        Capture a single desktop viewport of this width instead,
                      saved with a <width>x<height> suffix
  --height <px>       Height of that viewport (default: ${viewportPresets.normal.height})
  --color-schemes <list>
                      Comma-separated color schemes (default: ${colorSchemes.join(',')})
  --help              Show this help

Requires Node.js 22+ and Google Chrome or Chromium. Set CHROME_BIN to use a
specific browser executable.`);
}

function parseArguments(args) {
  let theme;
  let includeCart = false;
  let productSlug;
  let baseUrl = defaultBaseUrl;
  let outputDir = 'docs/images';
  let viewportNames;
  let width;
  let height;
  let schemes = colorSchemes;

  while (args.length > 0) {
    const argument = args.shift();
    if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    }

    if (argument === '--include-cart') {
      includeCart = true;
      continue;
    }

    if (argument === '--width' || argument === '--height') {
      const value = args.shift();
      if (!value || !/^[1-9][0-9]*$/.test(value)) {
        throw new Error(`${argument} requires a positive number of pixels`);
      }
      if (argument === '--width') width = Number(value);
      else height = Number(value);
      continue;
    }

    if (argument === '--viewports') {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error('--viewports requires a value');
      viewportNames = [...new Set(value.split(',').map(name => name.trim()).filter(Boolean))];
      const unknown = viewportNames.filter(name => !Object.hasOwn(viewportPresets, name));
      if (unknown.length > 0 || viewportNames.length === 0) {
        throw new Error(`Unknown viewport(s): ${unknown.join(', ')}. Available: ${Object.keys(viewportPresets).join(', ')}`);
      }
      continue;
    }

    if (argument === '--color-schemes') {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error('--color-schemes requires a value');
      schemes = [...new Set(value.split(',').map(name => name.trim()).filter(Boolean))];
      const unknown = schemes.filter(name => !colorSchemes.includes(name));
      if (unknown.length > 0 || schemes.length === 0) {
        throw new Error(`Unknown color scheme(s): ${unknown.join(', ')}. Available: ${colorSchemes.join(', ')}`);
      }
      continue;
    }

    if (argument === '--base-url' || argument === '--output-dir' || argument === '--product') {
      const value = args.shift();
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value`);
      }
      if (argument === '--base-url') baseUrl = value;
      else if (argument === '--product') productSlug = value;
      else outputDir = value;
      continue;
    }

    if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`);
    if (theme) throw new Error(`Unexpected argument: ${argument}`);
    theme = argument;
  }

  if (!theme) throw new Error('A theme name is required');
  if (!/^[a-zA-Z0-9_-]+$/.test(theme)) throw new Error('The theme name may only contain letters, numbers, hyphens, and underscores');
  if (productSlug !== undefined && !/^[a-zA-Z0-9_-]+$/.test(productSlug)) throw new Error('The product slug may only contain letters, numbers, hyphens, and underscores');

  if ((width || height) && viewportNames) throw new Error('--viewports cannot be combined with --width or --height');
  let viewports;
  if (width || height) {
    const custom = { width: width ?? viewportPresets.normal.width, height: height ?? viewportPresets.normal.height };
    viewports = [{ name: `${custom.width}x${custom.height}`, ...custom }];
  } else {
    viewports = (viewportNames ?? Object.keys(viewportPresets)).map(name => ({ name, ...viewportPresets[name] }));
  }

  const parsedBaseUrl = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw new Error('The base URL must use HTTP or HTTPS');
  }
  parsedBaseUrl.pathname = `${parsedBaseUrl.pathname.replace(/\/+$/, '')}/`;

  return { theme, includeCart, productSlug, baseUrl: parsedBaseUrl, outputDir: resolve(outputDir), viewports, schemes };
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
        const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
        return result.status === 0;
      } catch {
        return false;
      }
    });
  }

  return candidates.find(candidate => existsSync(candidate));
}

function getJson(url) {
  return new Promise((resolvePromise, reject) => {
    const request = (url.startsWith('https:') ? getHttps : get)(url, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Chrome DevTools returned HTTP ${response.statusCode}`));
          return;
        }
        try {
          resolvePromise(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.setTimeout(5000, () => request.destroy(new Error('Timed out connecting to Chrome DevTools')));
    request.on('error', reject);
  });
}

async function waitForEvent(events, method) {
  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for Chrome DevTools event ${method}`));
    }, 45_000);
    if (!events.has(method)) events.set(method, []);
    events.get(method).push(params => {
      clearTimeout(timeout);
      resolvePromise(params);
    });
  });
}

async function main() {
  const { theme, includeCart, productSlug, baseUrl, outputDir, viewports, schemes } = parseArguments(process.argv.slice(2));
  const chrome = findChrome();
  if (!chrome) throw new Error('Could not find Chrome or Chromium; set CHROME_BIN to its executable');

  const profileDir = mkdtempSync(join(tmpdir(), 'theme-screenshots-'));
  const child = spawn(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--ignore-certificate-errors',
    // The page viewport is emulated for each screen size, the window only needs to hold the largest one.
    `--window-size=${Math.max(...viewports.map(viewport => viewport.width))},${Math.max(...viewports.map(viewport => viewport.height))}`,
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

    const targets = await getJson(`http://127.0.0.1:${port}/json`);
    const target = targets.find(item => item.type === 'page');
    if (!target) throw new Error('Chrome did not expose a page target');

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out connecting to the Chrome DevTools page'));
      }, 10_000);
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
      // Hide the Symfony web debug toolbar (dev env), including the space it reserves at the bottom of the page.
      await evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>[id^="sfwdt"], .sf-toolbar, .sf-minitoolbar { display: none !important; }</style>')`);
      await evaluate('document.fonts.ready', { awaitPromise: true });
      await delay(1000);

      if (themeSelectors[theme] && !await evaluate(`document.querySelector(${JSON.stringify(themeSelectors[theme])}) !== null`)) {
        throw new Error(`Expected ${theme} theme marker ${themeSelectors[theme]} was not found at ${url.href}`);
      }
      const activeScheme = await evaluate('document.documentElement.dataset.bsTheme ?? null');
      if (activeScheme !== scheme) {
        throw new Error(`Expected the ${scheme} color scheme at ${url.href}, got ${activeScheme ?? 'none'}: is the color scheme switcher installed?`);
      }
    };

    // The switcher stays in "Auto" mode (fresh profile): the system preference picks the scheme.
    let scheme;
    const useScheme = async next => {
      scheme = next;
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    };

    let defaultUserAgent;
    let viewport;
    const useViewport = async next => {
      viewport = next;
      defaultUserAgent ??= (await send('Browser.getVersion')).userAgent.replace('HeadlessChrome', 'Chrome');
      await send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
        mobile: viewport.mobile ?? false,
      });
      await send('Emulation.setTouchEmulationEnabled', { enabled: viewport.mobile ?? false, maxTouchPoints: 5 });
      await send('Emulation.setUserAgentOverride', { userAgent: viewport.userAgent ?? defaultUserAgent });
    };

    const outputTheme = theme.replace(/_/g, '-');
    const capture = async (url, name) => {
      const metrics = await send('Page.getLayoutMetrics');
      const size = metrics.cssContentSize;
      const pixelRatio = viewport.deviceScaleFactor ?? 1;
      // Very long pages are scaled down to fit the WebP size limit.
      const scale = Math.min(1, maxWebpSize / (Math.max(size.width, size.height) * pixelRatio));
      const screenshot = await send('Page.captureScreenshot', {
        format: 'webp',
        quality: webpQuality,
        captureBeyondViewport: true,
        fromSurface: true,
        clip: { x: 0, y: 0, width: size.width, height: size.height, scale },
      });
      const path = join(outputDir, `${outputTheme}-${name}-${viewport.name}-${scheme}.webp`);
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(path, Buffer.from(screenshot.data, 'base64'));
      const pixels = `${Math.round(size.width * pixelRatio * scale)}x${Math.round(size.height * pixelRatio * scale)}`;
      console.log(`${url.href} -> ${path} (${pixels})`);
    };

    // Product links of the current page, as absolute URLs, without duplicates.
    const productLinksExpression = `[...new Set([...document.querySelectorAll('a[href]')]
      .map(link => new URL(link.getAttribute('href'), document.baseURI))
      .filter(url => url.origin === location.origin && url.pathname.split('/').filter(Boolean).at(-2) === 'products')
      .map(url => url.origin + url.pathname))]`;

    // Fetches a product page and reports whether it makes a good screenshot.
    const evaluateProduct = productUrl => evaluate(`fetch(${JSON.stringify(productUrl)}, { credentials: 'same-origin' })
      .then(async response => {
        if (!response.ok) return { url: ${JSON.stringify(productUrl)}, usable: false, reason: 'HTTP ' + response.status };
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        // Themes may put headings in the header or in off-canvas menus: the product
        // name is the first page heading outside of them.
        const heading = [...doc.querySelectorAll('h1')]
          .find(h1 => !h1.closest('header, nav, .offcanvas, [class*="offcanvas-"]'));
        const name = heading?.textContent.trim() ?? '';
        const button = doc.querySelector('#add-to-cart-button');
        // Real product pictures are served by LiipImagine from /media/, placeholders are not.
        const images = [...doc.querySelectorAll('img')]
          .map(image => image.getAttribute('src') ?? '')
          .filter(src => src.includes('/media/'));
        const reasons = [];
        if (!name) reasons.push('no product name');
        if (!button) reasons.push('no add-to-cart button (out of stock or not purchasable)');
        else if (button.disabled) reasons.push('add-to-cart button disabled');
        if (images.length === 0) reasons.push('no product image');
        return { url: ${JSON.stringify(productUrl)}, name, images: images.length, usable: reasons.length === 0, reason: reasons.join(', ') };
      })`, { awaitPromise: true });

    await send('Page.enable');
    await send('Runtime.enable');

    await useScheme(schemes[0]);
    await useViewport(viewports[0]);
    const homepageUrl = new URL('./', baseUrl);
    await navigate(homepageUrl);

    let candidates;
    if (productSlug) {
      candidates = [new URL(`./products/${productSlug}`, baseUrl).href];
    } else {
      candidates = await evaluate(productLinksExpression);
      if (candidates.length === 0) {
        // The theme may hide product lists on the homepage: look into the categories.
        const taxonUrls = await evaluate(`[...new Set([...document.querySelectorAll('a[href]')]
          .map(link => new URL(link.getAttribute('href'), document.baseURI))
          .filter(url => url.origin === location.origin && url.pathname.split('/').includes('taxons'))
          .map(url => url.href))].slice(0, 5)`);
        for (const taxonUrl of taxonUrls) {
          const links = await evaluate(`fetch(${JSON.stringify(taxonUrl)}, { credentials: 'same-origin' })
            .then(response => response.text())
            .then(html => { const doc = new DOMParser().parseFromString(html, 'text/html');
              return [...doc.querySelectorAll('a[href]')]
                .map(link => new URL(link.getAttribute('href'), ${JSON.stringify(taxonUrl)}))
                .filter(url => url.pathname.split('/').filter(Boolean).at(-2) === 'products')
                .map(url => url.origin + url.pathname); })`, { awaitPromise: true });
          candidates = [...new Set([...candidates, ...links])];
        }
      }
      candidates.sort((a, b) => Number(b.endsWith(`/products/${preferredProductSlug}`)) - Number(a.endsWith(`/products/${preferredProductSlug}`)));
      candidates = candidates.slice(0, maxEvaluatedProducts);
    }
    if (candidates.length === 0) {
      throw new Error(`No product link was found on ${homepageUrl.href}; load the data fixtures or pass --product <slug>`);
    }

    let product;
    const rejected = [];
    for (const candidate of candidates) {
      const evaluation = await evaluateProduct(candidate);
      if (evaluation.usable) {
        product = evaluation;
        break;
      }
      rejected.push(evaluation);
    }
    if (!product) {
      const details = rejected.map(item => `  - ${item.url}: ${item.reason}`).join('\n');
      throw new Error(`None of the ${candidates.length} evaluated products can be used:\n${details}`);
    }
    for (const item of rejected) console.log(`Skipped ${item.url}: ${item.reason}`);
    console.log(`Selected product: ${product.name} (${product.url})`);

    const productUrl = new URL(product.url);
    const productName = JSON.stringify(product.name);
    const cartUrl = new URL('cart/', baseUrl);

    // The homepage and product page are captured with an empty cart.
    for (const nextScheme of schemes) {
      await useScheme(nextScheme);
      for (const next of viewports) {
        await useViewport(next);
        await navigate(homepageUrl);
        await capture(homepageUrl, 'homepage');
        await navigate(productUrl);
        await capture(productUrl, 'product');
      }
    }

    if (includeCart) {
      await useViewport(viewports[0]);
      await navigate(productUrl);
      await evaluate(`(() => {
        const button = document.querySelector('#add-to-cart-button');
        if (!button) throw new Error('The add-to-cart button was not found for ' + ${productName});
        button.click();
        return true;
      })()`);

      let cartHasProduct = false;
      for (let attempt = 0; attempt < 30 && !cartHasProduct; attempt++) {
        try {
          cartHasProduct = await evaluate(`fetch(new URL('cart/', ${JSON.stringify(baseUrl.href)}), { credentials: 'same-origin' })
            .then(response => response.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html').body.textContent.includes(${productName}))`, { awaitPromise: true }) === true;
        } catch {
          // Adding to cart redirects to the cart page, which destroys the
          // context being evaluated: retry once the new document is loaded.
          await delay(1000);
          continue;
        }
        if (!cartHasProduct) await delay(500);
      }
      if (!cartHasProduct) throw new Error(`${product.name} did not appear in the cart after adding it`);

      for (const nextScheme of schemes) {
        await useScheme(nextScheme);
        for (const next of viewports) {
          await useViewport(next);
          await navigate(cartUrl);
          if (!await evaluate(`document.body.innerText.includes(${productName})`)) {
            throw new Error(`The cart page did not render ${product.name}`);
          }
          await capture(cartUrl, 'cart');
        }
      }
    }
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

main().catch(error => {
  console.error(`Screenshot capture failed: ${error.message}`);
  process.exitCode = 1;
});
