function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function isLocalHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(normalized);
}

function resolveApiUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5000';
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('githubpreview.dev')) {
    return normalizeBaseUrl(`https://${window.location.host}`);
  }

  if (hostname.includes('github.dev')) {
    const workspace = hostname.replace(/\.github\.dev$/i, '');
    return normalizeBaseUrl(`https://${workspace}-5000.githubpreview.dev`);
  }

  if (isLocalHost(hostname)) {
    return 'http://127.0.0.1:5000';
  }

  return 'http://127.0.0.1:5000';
}

const runtimeApiUrl = typeof window !== 'undefined'
  ? (window as Window & { __APP_CONFIG__?: { apiUrl?: string } }).__APP_CONFIG__?.apiUrl
  : undefined;

const apiUrl = normalizeBaseUrl(runtimeApiUrl || resolveApiUrl());
const apiBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export const environment = {
  production: false,
  apiUrl,
  apiBaseUrl,

  // Backend local pour le développement (SANS slash final pour éviter les doubles slashes)
  youtubeApiUrl: 'https://www.googleapis.com/youtube/v3',
  // IMPORTANT: Remplacez par votre vraie clé API YouTube obtenue depuis:
  // https://console.cloud.google.com/
  // 1. Créer un projet "Firdaws Mosque"
  // 2. Activer l'API "YouTube Data API v3"
  // 3. Créer une clé API (type: Public)
  youtubeApiKey: 'AIzaSyAs08E0gOHnxLwcurdSTcAepFr9X54fC_I',
  // L'ID de la chaîne YouTube officiel Firdaws
  youtubeChannelId: 'UC487WNhif0rsoIvfwoYE3oQ',

  // ========== CONTACT ==========
  contactEmail: 'contact@firdaws-mosque.ci',
  contactPhone: '+225 07 XX XX XX XX', // À ajouter si disponible
  contactAddress: 'Abidjan, Côte d\'Ivoire',

  // ========== CONFIGURATIONS IA ==========
  // Google Gemini API (gratuit - 60 requêtes/minute)
  geminiApiKey: 'VOTRE_CLE_API_GEMINI', // À remplacer par votre vraie clé
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  geminiVisionApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent',

  // Criterion API (Open Source - Islamique)
  criterionApiUrl: 'https://criterion.life/api',

  // Configuration des limites IA
  aiConfig: {
    maxQuizQuestions: 20,
    defaultQuizQuestions: 10,
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30000, // 30 secondes
    enableFallback: true // Utiliser des quiz statiques si l'API échoue
  },

  // Configuration des quiz par défaut (fallback)
  fallbackQuiz: {
    enabled: true,
    questionsPath: 'assets/data/fallback-quiz.json'
  }
};
