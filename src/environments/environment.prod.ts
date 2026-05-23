export const environment = {
  production: true,
  // Backend de production de la mosquée Firdaws
  // À remplacer par votre vrai domaine/API en production
  apiUrl: 'https://api.firdaws-mosque.fr',
  apiBaseUrl: 'https://api.firdaws-mosque.fr/api',
  youtubeApiUrl: 'https://www.googleapis.com/youtube/v3',
  // Utilisez la même clé API YouTube que le développement
  // ou créez-en une dédiée à la production si besoin
  youtubeApiKey: 'AIzaSyAs08E0gOHnxLwcurdSTcAepFr9X54fC_I',
  // À remplacer par l'ID du canal officiel Firdaws en production
  youtubeChannelId: 'UC487WNhif0rsoIvfwoYE3oQ',

  // ========== CONTACT ==========
  contactEmail: 'contact@firdaws-mosque.ci',
  contactPhone: '+225 07 XX XX XX XX', // À ajouter si disponible
  contactAddress: 'Abidjan, Côte d\'Ivoire',

  // ========== CONFIGURATIONS IA ==========
  // Google Gemini API (Production)
  // À remplacer par une clé API dédiée à la production
  geminiApiKey: 'AIzaSyVotreCleIci',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  geminiVisionApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent',

  // Criterion API (Production)
  criterionApiUrl: 'https://criterion.life/api',

  // Configuration des limites IA (Production - plus strictes)
  aiConfig: {
    maxQuizQuestions: 30,
    defaultQuizQuestions: 10,
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 20000, // 20 secondes en production
    enableFallback: true,
    enableCaching: true // Mettre en cache les réponses pour réduire les appels API
  },

  // Configuration des quiz par défaut (fallback)
  fallbackQuiz: {
    enabled: true,
    questionsPath: 'assets/data/fallback-quiz.json'
  }
};
