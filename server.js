import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware for parsing JSON requests with sensible size limits
app.use(express.json({ limit: '64kb' }));

// Serve static assets with caching headers
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '7d'
}));

app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Clean Routes Mapping
const pageRoutes = {
  '/': 'index.html',
  '/about': 'about.html',
  '/services': 'services.html',
  '/services/installation': 'service-installation.html',
  '/services/cleaning': 'service-cleaning.html',
  '/services/freon': 'service-freon.html',
  '/services/repair': 'service-repair.html',
  '/service-installation': 'service-installation.html',
  '/service-cleaning': 'service-cleaning.html',
  '/service-freon': 'service-freon.html',
  '/service-repair': 'service-repair.html',
  '/products': 'products.html',
  '/projects': 'projects.html',
  '/contact': 'contact.html'
};

Object.entries(pageRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Real Contact & Dispatch API Route
app.post('/api/contact', (req, res) => {
  const { name, phone, service, message, language } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      error: 'Name and phone number are required.'
    });
  }

  // Log dispatch inquiry to server console
  const timestamp = new Date().toISOString();
  console.log(`[HayClima Dispatch] [${timestamp}] New request from ${name} (${phone}) - Service: ${service || 'General'} | Lang: ${language || 'hy'}`);
  if (message) console.log(`  Details: ${message}`);

  return res.status(200).json({
    success: true,
    message: 'Your service request has been registered. An engineer will contact you shortly.',
    dispatchHotline: '+374 41 790679',
    timestamp
  });
});



// Custom 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`HayClima Production Server running at http://${HOST}:${PORT}`);
});
