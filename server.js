import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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

/* ==========================================================================
   AI CUSTOMER ASSISTANT BACKEND (/api/chat)
   Secure endpoint with rate-limiting, input validation, and verified knowledge grounding
   ========================================================================== */

// In-memory Rate Limiting (max 25 requests per IP every 5 minutes)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 25;

function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, clientData);
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  rateLimitMap.set(ip, clientData);
  return true;
}

// Clean up old rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// Verified HayClima System Prompt for Gemini
const HAYCLIMA_SYSTEM_PROMPT = `You are the official AI Climate Engineering Assistant for HayClima.am, Armenia's premier HVAC and climate systems service company.
Your role is to assist visitors in Armenian (hy), Russian (ru), or English (en) based on the visitor's query or chosen language.

VERIFIED COMPANY FACTS (STRICT SOURCE OF TRUTH - DO NOT INVENT):
- Company Name: HayClima.am (Director/Lead agency credit: Mkheyan Agency).
- Experience: 10+ years of professional engineering in Armenia.
- Verified Records: 12,000+ completed HVAC projects, 4,500+ happy clients.
- Service Locations: Yerevan (all districts: Kentron, Arabkir, Davtashen, Malatia-Sebastia, Shengavit, Nor Nork, Avan, Erebuni, etc.) and all regions of Armenia (Kotayk, Ararat, Armavir, etc.).
- Speed: Technician dispatch within 1-2 hours in Yerevan.
- Hours: 24/7 emergency support and scheduled service.
- Contact Details:
  * Primary Phone & WhatsApp: +374 41 790679
  * Secondary Phone: +374 94 314014
  * Email: info@hayclima.am
  * Socials: Instagram (@hayclima), Facebook (HayClimaArm), Telegram (@HayClimaAdmin), TikTok (@hayclima).

SERVICES & ACCURATE PRICING STANDARDS:
1. Deep Chemical Cleaning (Խորը Քիմիական Մաքրում):
   * Benchmark Price: 15,000 - 20,000 AMD.
   * Procedure: Complete disassembly of indoor & outdoor units, high-pressure hydro-cleaning with special waterproof protective hoods (walls & furniture stay 100% dry and clean), treatment with certified European/Swedish antibacterial agents (chlorine-free, safe for kids & pets), and 140°C hot steam disinfection. Eradicates 100% of mold, fungi, allergens, dust mites, and bad odors. Restores cooling airflow by up to 25%.
2. Installation & Mounting (Տեղադրում և Մոնտաժ):
   * Benchmark Price: 25,000 - 35,000 AMD for standard installations (depends on wall thickness/brackets).
   * Procedure: Dust-free diamond core drilling, thick-walled copper piping insulation, deep two-stage vacuum pump evacuation of air and moisture, vibration-absorbing bracket mounting, digital pressure test. Includes official written warranty up to 1 year.
3. Freon Refilling (Ֆրեոնի Լիցքավորում):
   * Benchmark Price: 12,000 - 25,000 AMD (depends on refrigerant type and weight).
   * Types: R32, R410A, and R22.
   * Procedure: Manifold pressure gauge diagnostics, leak localization and sealing, precision electronic scales charging to manufacturer specs.
4. Diagnostics & Repair (Վերանորոգում և Դիագնոստիկա):
   * Benchmark Price: Starting from 10,000 AMD.
   * Specialization: Inverter PCB control boards, compressors, sensor electronics, capacitors, drainage leak fix.

EQUIPMENT SALES & SELECTION GUIDANCE (BTU vs Room Area):
- 9,000 BTU (~2.6 kW): Up to 20 - 25 m² (Ultra silent 19 dB, A+++ inverter, R32).
- 12,000 BTU (~3.5 kW): 25 - 35 m² (Most popular residential choice, Wi-Fi smart control).
- 18,000 BTU (~5.3 kW): 36 - 55 m² (Spacious living rooms, studio apartments).
- 24,000 BTU (~7.0 kW): 56 - 80 m² (Commercial offices, large retail spaces).
- Multi-Split & Ducted HVAC: Single outdoor unit powering 2 to 5 separate indoor climate zones.

CRITICAL BEHAVIORAL RULES:
1. Grounding: Answer ONLY using the facts above. NEVER fabricate prices, fake discount promo codes, fake inventory quantities, or non-existent warranties.
2. Tone: Courteous, technically authoritative, engineering-focused, helpful, and concise.
3. Actionable: When the user asks for booking, dispatch, or customized pricing for unusual setups, provide the accurate benchmark and invite them to call +374 41 790679 or click the WhatsApp link for immediate dispatch.
4. Multilingual: If the user speaks Armenian, reply in pristine Armenian. If Russian, reply in natural Russian. If English, reply in clear English.`;

// Intelligent Local Verified Knowledge Engine for offline or fallback operation
function getLocalKnowledgeReply(message, lang) {
  const q = (message || '').toLowerCase();
  const isRu = lang === 'ru' || /[а-яё]/i.test(q);
  const isEn = lang === 'en' || (!isRu && /[a-z]/i.test(q) && !/[ա-ֆ]/i.test(q));
  const isHy = !isRu && !isEn;

  // 1. Cleaning / Sanitization
  if (q.includes('մաքր') || q.includes('քիմ') || q.includes('լվաց') || q.includes('чистк') || q.includes('мойк') || q.includes('clean') || q.includes('wash')) {
    if (isRu) {
      return "Химическая чистка кондиционера в HayClima стоит ориентировочно 15,000 - 20,000 ֏. Она включает полную разборку блоков, мойку аппаратом высокого давления со специальным защитным сервис-пакетом (стены остаются чистыми), обработку сертифицированными шведскими антибактериальными средствами и дезинфекцию горячим паром 140°C. Уничтожает 100% грибка, пыли и запахов!\n\nДля вызова мастера позвоните: +374 41 790679.";
    }
    if (isEn) {
      return "Deep chemical cleaning at HayClima costs approximately 15,000 - 20,000 AMD. It includes full disassembly of indoor/outdoor units, high-pressure hydro-washing using protective service bags (zero mess on walls), Swedish certified non-toxic antibacterial agents, and 140°C hot steam disinfection. It eliminates 100% of mold, bacteria, and odors!\n\nCall our technician directly: +374 41 790679.";
    }
    return "HayClima-ում օդորակիչի խորը քիմիական մաքրման արժեքն է 15,000 - 20,000 ֏: Այն ներառում է բլոկների ամբողջական քանդում, հատուկ պաշտպանիչ հիդրո-պարկով լվացում (պատերն ու կահույքը չեն կեղտոտվում), շվեդական հակաբակտերիալ էկո-նյութերով մշակում և 140°C տաք շոգեախտահանում: Վերացնում է բորբոսի, սնկերի և տհաճ հոտերի 100%-ը:\n\nՎարպետի կանչի համար զանգահարեք՝ +374 41 790679:";
  }

  // 2. Freon Refill
  if (q.includes('ֆրեոն') || q.includes('լիցք') || q.includes('գազ') || q.includes('фреон') || q.includes('заправк') || q.includes('freon') || q.includes('gas') || q.includes('refrigerant')) {
    if (isRu) {
      return "Мы заправляем оригинальными хладагентами R32, R410A и R22 по электронным весам с обязательной проверкой рабочего давления и поиском утечек. Стоимость заправки составляет в среднем 12,000 - 25,000 ֏ (в зависимости от типа газа и граммовки).\n\nЗаказать выезд мастера: +374 41 790679.";
    }
    if (isEn) {
      return "We refill systems with genuine R32, R410A, and R22 refrigerants using precision digital scales and pressure gauge leak diagnostics. The cost typically ranges from 12,000 to 25,000 AMD depending on refrigerant type and quantity.\n\nTo schedule freon service: +374 41 790679.";
    }
    return "Մենք լիցքավորում ենք օրիգինալ R32, R410A և R22 ֆրեոններով՝ էլեկտրոնային ճշգրիտ կշեռքով, մանոմետրով ճնշման դիագնոստիկայով և արտահոսքի ստուգմամբ: Արժեքը կազմում է 12,000 - 25,000 ֏ (կախված գազի տեսակից և քանակից):\n\nՎարպետի կանչ՝ +374 41 790679:";
  }

  // 3. Installation / Mounting
  if (q.includes('տեղադր') || q.includes('մոնտաժ') || q.includes('установк') || q.includes('монтаж') || q.includes('install') || q.includes('mount')) {
    if (isRu) {
      return "Стандартный монтаж сплит-системы стоит 25,000 - 35,000 ֏. Мы используем алмазное бурение с пылесосом, качественные толстостенные медные трубы, глубокое вакуумирование контура двухступенчатым насосом и выдаем официальную гарантию до 1 года!\n\nЗаказ монтажа: +374 41 790679.";
    }
    if (isEn) {
      return "Standard split AC installation costs 25,000 - 35,000 AMD. We perform dust-free diamond drilling, premium copper pipe insulation, two-stage deep vacuum evacuation, and issue an official warranty up to 1 year!\n\nBook an installation: +374 41 790679.";
    }
    return "Ստանդարտ սպլիտ համակարգի տեղադրումն արժե 25,000 - 35,000 ֏: Մենք կիրառում ենք պատերի ալմաստե հորատում փոշեկուլով, որակյալ պղնձե մայրուղի, խորը վակուումացում երկաստիճան պոմպով և տրամադրում ենք պաշտոնական երաշխիք մինչև 1 տարի:\n\nՊատվիրել մոնտաժ՝ +374 41 790679:";
  }

  // 4. Area / BTU / Capacity Sizing
  if (q.includes('մակերես') || q.includes('մ²') || q.includes('btu') || q.includes('քառակուսի') || q.includes('площад') || q.includes('кв.м') || q.includes('мощность') || q.includes('area') || q.includes('sq.m') || q.includes('size')) {
    if (isRu) {
      return "Подбор мощности кондиционера по площади помещения:\n• До 20-25 м²: 9,000 BTU (2.6 кВт)\n• 25-35 м²: 12,000 BTU (3.5 кВт) — самый популярный вариант\n• 36-55 м²: 18,000 BTU (5.3 кВт)\n• 56-80 м²: 24,000 BTU (7.0 кВт)\n• Для нескольких комнат: мульти-сплит система с одним внешним блоком.\n\nПозвоните нам для точного расчета: +374 41 790679.";
    }
    if (isEn) {
      return "Recommended AC cooling capacity based on room area:\n• Up to 20-25 sq.m: 9,000 BTU (2.6 kW)\n• 25-35 sq.m: 12,000 BTU (3.5 kW) — standard residential choice\n• 36-55 sq.m: 18,000 BTU (5.3 kW)\n• 56-80 sq.m: 24,000 BTU (7.0 kW)\n• Multiple rooms: Multi-Split system with 1 outdoor unit.\n\nCall our engineers for precise sizing: +374 41 790679.";
    }
    return "Օդորակիչի հզորության ընտրություն ըստ սենյակի մակերեսի:\n• Մինչև 20-25 մ²: 9,000 BTU (2.6 kW)\n• 25-35 մ²: 12,000 BTU (3.5 kW) — ամենապահանջված ստանդարտը\n• 36-55 մ²: 18,000 BTU (5.3 kW)\n• 56-80 մ²: 24,000 BTU (7.0 kW)\n• Մի քանի սենյակների համար: Multi-Split համակարգ մեկ արտաքին բլոկով:\n\nՃշգրիտ խորհրդատվության համար զանգահարեք՝ +374 41 790679:";
  }

  // 5. Warranty & Speed / Dispatch
  if (q.includes('երաշխիք') || q.includes('ժամ') || q.includes('գալիս') || q.includes('гаранти') || q.includes('выезд') || q.includes('скоро') || q.includes('warranty') || q.includes('speed') || q.includes('how fast')) {
    if (isRu) {
      return "Мастер HayClima приезжает в течение 1-2 часов после звонка (или в любое удобное вам фиксированное время) по всему Еревану. На все монтажные и ремонтные работы мы предоставляем официальный гарантийный талон сроком до 1 года!\n\nТелефон диспетчера: +374 41 790679.";
    }
    if (isEn) {
      return "A HayClima technician arrives within 1-2 hours after your call anywhere in Yerevan (or at any scheduled time you prefer). Following all installation and repair services, we issue an official written warranty certificate for up to 1 year!\n\nDispatcher hotline: +374 41 790679.";
    }
    return "HayClima-ի մասնագետը մոտենում է զանգից հետո 1-2 ժամվա ընթացքում ողջ Երևանում (կամ Ձեզ հարմար ֆիքսված ժամին): Բոլոր տեղադրման և սպասարկման աշխատանքներից հետո տրամադրում ենք պաշտոնական երաշխիքային թերթիկ մինչև 1 տարի ժամկետով:\n\nՇտապ կանչի հեռախոսահամար՝ +374 41 790679:";
  }

  // Default General Help
  if (isRu) {
    return "Компания HayClima.am предоставляет полный спектр климатических услуг в Ереване: продажа оборудования, профессиональный монтаж, химическая чистка с паром 140°C, заправка фреоном (R32, R410A) и ремонт с гарантией до 1 года.\n\nМастер приезжает за 1-2 часа. Позвоните нам: +374 41 790679 или напишите в WhatsApp!";
  }
  if (isEn) {
    return "HayClima.am delivers complete climate engineering services in Yerevan: equipment sales, professional mounting, deep chemical cleaning with 140°C steam, precision freon refilling (R32, R410A), and repairs with up to 1-year warranty.\n\nTechnicians arrive within 1-2 hours. Call us at +374 41 790679 or message on WhatsApp!";
  }
  return "HayClima.am-ը տրամադրում է օդորակման և օդափոխության ամբողջական սպասարկում Երևանում՝ սարքավորումների վաճառք, պրոֆեսիոնալ տեղադրում, խորը քիմիական մաքրում, ֆրեոնի լիցքավորում և վերանորոգում՝ մինչև 1 տարի երաշխիքով:\n\nՎարպետը մոտենում է 1-2 ժամում: Զանգահարեք՝ +374 41 790679 կամ գրեք WhatsApp-ով:";
}

app.post('/api/chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Rate Limiting Check
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Չափազանց շատ հարցումներ: Խնդրում ենք փորձել մի փոքր ուշ կամ զանգահարել +374 41 790679:'
    });
  }

  const { message, language = 'hy', history = [] } = req.body || {};

  // Input Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be text.'
    });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0 || trimmedMessage.length > 600) {
    return res.status(400).json({
      success: false,
      error: 'Message length must be between 1 and 600 characters.'
    });
  }

  // Attempt using Gemini API if key is present in environment
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({});

      // Format clean conversation contents (max 4 turns to conserve tokens)
      const formattedContents = [];
      const safeHistory = Array.isArray(history) ? history.slice(-4) : [];

      for (const turn of safeHistory) {
        if (turn.role === 'user' && typeof turn.text === 'string') {
          formattedContents.push({ role: 'user', parts: [{ text: turn.text.slice(0, 400) }] });
        } else if (turn.role === 'model' && typeof turn.text === 'string') {
          formattedContents.push({ role: 'model', parts: [{ text: turn.text.slice(0, 400) }] });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: `User Language preference: ${language}. User question: ${trimmedMessage}` }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: HAYCLIMA_SYSTEM_PROMPT,
          maxOutputTokens: 450,
          temperature: 0.25
        }
      });

      const replyText = response.text || '';
      if (replyText.trim().length > 0) {
        return res.status(200).json({
          success: true,
          reply: replyText.trim(),
          provider: 'gemini'
        });
      }
    } catch (apiError) {
      console.warn('[HayClima AI Server] Gemini API error, falling back to verified knowledge base:', apiError.message);
      // Fallback seamlessly to local verified knowledge engine below
    }
  }

  // Grounded Local Knowledge Base Response
  const localReply = getLocalKnowledgeReply(trimmedMessage, language);
  return res.status(200).json({
    success: true,
    reply: localReply,
    provider: 'verified_knowledge_base'
  });
});

// Custom 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`HayClima Production Server running at http://${HOST}:${PORT}`);
});
