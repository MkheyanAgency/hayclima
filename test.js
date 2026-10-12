import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting HayClima.am Comprehensive Verification Suite...\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// 1. Check all HTML pages exist and contain critical SEO & Social metadata
const pages = [
  { file: 'index.html', canonical: 'https://hayclima.am/' },
  { file: 'about.html', canonical: 'https://hayclima.am/about' },
  { file: 'services.html', canonical: 'https://hayclima.am/services' },
  { file: 'service-installation.html', canonical: 'https://hayclima.am/services/installation' },
  { file: 'service-cleaning.html', canonical: 'https://hayclima.am/services/cleaning' },
  { file: 'service-freon.html', canonical: 'https://hayclima.am/services/freon' },
  { file: 'service-repair.html', canonical: 'https://hayclima.am/services/repair' },
  { file: 'products.html', canonical: 'https://hayclima.am/products' },
  { file: 'projects.html', canonical: 'https://hayclima.am/projects' },
  { file: 'contact.html', canonical: 'https://hayclima.am/contact' },
  { file: '404.html', canonical: null }
];

console.log('📋 1. Verifying HTML Pages & Open Graph / SEO Metadata:');
pages.forEach(({ file, canonical }) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  assert(exists, `${file} exists on disk`);

  if (exists) {
    const html = fs.readFileSync(filePath, 'utf8');

    // Title
    assert(html.includes('<title>') && html.includes('</title>'), `${file} has a <title> tag`);

    if (canonical) {
      assert(html.includes(`rel="canonical"`), `${file} has a canonical link`);
      assert(html.includes(`property="og:title"`), `${file} has og:title tag`);
      assert(html.includes(`property="og:description"`), `${file} has og:description tag`);
      assert(html.includes(`property="og:image"`), `${file} has og:image tag`);
      assert(html.includes(`property="og:url"`), `${file} has og:url tag`);
      assert(html.includes(`name="twitter:card"`), `${file} has twitter:card tag`);
      assert(html.includes(`name="twitter:image"`), `${file} has twitter:image tag`);
      assert(html.includes(`hreflang="hy"`), `${file} has hreflang="hy"`);
      assert(html.includes(`hreflang="ru"`), `${file} has hreflang="ru"`);
      assert(html.includes(`hreflang="en"`), `${file} has hreflang="en"`);
    }
  }
});

// 2. Verify Real Asset Images Exist
console.log('\n🖼️ 2. Verifying Real Images and Assets in /public/img:');
const requiredImages = [
  'public/img/og-brand.jpg',
  'public/img/logo.png',
  'public/img/service-install.jpg',
  'public/img/service-clean.jpg',
  'public/img/service-freon.jpg',
  'public/img/service-repair.jpg',
  'public/img/project-1.jpg',
  'public/img/project-2.jpg',
  'public/img/project-3.jpg',
  'public/img/project-4.jpg',
  'public/img/project-5.jpg'
];

requiredImages.forEach(imgRel => {
  const imgPath = path.join(__dirname, imgRel);
  const exists = fs.existsSync(imgPath);
  const stats = exists ? fs.statSync(imgPath) : null;
  assert(exists && stats && stats.size > 0, `${imgRel} exists and is valid (${stats ? (stats.size / 1024).toFixed(1) + ' KB' : '0'})`);
});

// 3. Verify Translations Engine
console.log('\n🌐 3. Verifying Translation Engine (hy, ru, en):');
try {
  const { translations } = await import('./js/translations.js');
  assert(!!translations.hy, 'Armenian translations defined');
  assert(!!translations.ru, 'Russian translations defined');
  assert(!!translations.en, 'English translations defined');

  const hyKeyCount = Object.keys(translations.hy).length;
  const ruKeyCount = Object.keys(translations.ru).length;
  const enKeyCount = Object.keys(translations.en).length;

  console.log(`    Keys: hy=${hyKeyCount}, ru=${ruKeyCount}, en=${enKeyCount}`);
  assert(hyKeyCount > 50 && ruKeyCount > 50 && enKeyCount > 50, 'Translation dictionaries have 50+ localized entries each');
} catch (err) {
  assert(false, `Translation engine load failed: ${err.message}`);
}

// 4. Verify Server Endpoints
console.log('\n🚀 4. Verifying Server HTTP Routes:');

function makeRequest(pathName, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: pathName,
        method: method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

try {
  const routesToTest = [
    '/',
    '/about',
    '/services',
    '/services/installation',
    '/services/cleaning',
    '/services/freon',
    '/services/repair',
    '/products',
    '/projects',
    '/contact',
    // Multilingual routes
    '/am',
    '/am/',
    '/am/about',
    '/am/services',
    '/am/products',
    '/am/projects',
    '/am/contact',
    '/ru',
    '/ru/',
    '/ru/about',
    '/ru/services',
    '/ru/products',
    '/ru/projects',
    '/ru/contact',
    '/en',
    '/en/',
    '/en/about',
    '/en/services',
    '/en/products',
    '/en/projects',
    '/en/contact',
    '/public/img/og-brand.jpg',
    '/sitemap.xml',
    '/robots.txt'
  ];

  for (const route of routesToTest) {
    const res = await makeRequest(route);
    assert(res.status === 200, `Route ${route} returned HTTP 200`);
  }

  // Test Contact API
  const contactRes = await makeRequest('/api/contact', 'POST', {
    name: 'Test Customer',
    phone: '+374 99 999999',
    service: 'Installation',
    message: 'Test automated dispatch'
  });
  assert(contactRes.status === 200, '/api/contact returns HTTP 200');
  const contactJson = JSON.parse(contactRes.body);
  assert(contactJson.success === true && contactJson.dispatchHotline === '+374 41 790679', '/api/contact provides dispatch confirmation and hotline');

} catch (err) {
  assert(false, `Server HTTP test failed: ${err.message}`);
}

console.log(`\n========================================`);
console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed.`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
