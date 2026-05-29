import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizTheme {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  themes: QuizTheme[] = [
    { id: 'fiqh', name: 'Fiqh', icon: 'bi-book', color: 'bg-blue-500', description: 'Jurisprudence islamique' },
    { id: 'quran', name: 'Coran', icon: 'bi-journal-bookmark', color: 'bg-emerald-500', description: 'Sciences du Coran' },
    { id: 'hadith', name: 'Hadith', icon: 'bi-chat-quote', color: 'bg-purple-500', description: 'Traditions prophétiques' },
    { id: 'histoire', name: 'Histoire', icon: 'bi-clock-history', color: 'bg-orange-500', description: 'Histoire de l\'Islam' },
    { id: 'jurisprudence', name: 'Jurisprudence', icon: 'bi-mortarboard', color: 'bg-indigo-500', description: 'Droit islamique avancé' }
  ];

  state: 'selection' | 'playing' | 'results' = 'selection';
  selectedTheme: QuizTheme | null = null;
  selectedDuration: 10 | 30 = 10;
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  answers: (number | null)[] = [];
  timeLeft = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  isLoading = false;
  pastScores: Array<{ theme: string; score: number; total: number; date: string }> = [];

  private readonly apiBase = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.loadPastScores();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  loadPastScores() {
    const stored = localStorage.getItem('quizScores');
    if (stored) {
      try {
        this.pastScores = JSON.parse(stored);
      } catch {
        this.pastScores = [];
      }
    }
  }

  selectTheme(theme: QuizTheme) {
    this.selectedTheme = theme;
  }

  startQuiz() {
    if (!this.selectedTheme) return;

    this.isLoading = true;
    this.questions = this.generateFallbackQuestions(this.selectedTheme.id);
    this.state = 'playing';
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.answers = [];
    this.timeLeft = this.selectedDuration * 60;
    this.isLoading = false;
    this.startTimer();
  }

  private startTimer() {
    this.clearTimer();
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.finishQuiz();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  get currentQuestion(): QuizQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progressPercent(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  selectOption(index: number) {
    if (this.selectedAnswer !== null) return;
    this.selectedAnswer = index;
    this.answers.push(index);
    if (index === this.currentQuestion?.correctIndex) {
      this.score++;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    this.clearTimer();
    this.state = 'results';

    const scoreEntry = {
      theme: this.selectedTheme?.name || '',
      score: this.score,
      total: this.questions.length,
      date: new Date().toISOString()
    };
    this.pastScores.unshift(scoreEntry);
    localStorage.setItem('quizScores', JSON.stringify(this.pastScores.slice(0, 50)));

    const token = localStorage.getItem('authToken');
    if (token) {
      this.http.post(`${this.apiBase}/quiz`, {
        theme: this.selectedTheme?.id,
        score: this.score,
        total: this.questions.length,
        duration: this.selectedDuration
      }, {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      }).subscribe({ error: () => {} });
    }
  }

  resetQuiz() {
    this.state = 'selection';
    this.selectedTheme = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.answers = [];
    this.clearTimer();
  }

  get scorePercent(): number {
    return this.questions.length > 0 ? Math.round((this.score / this.questions.length) * 100) : 0;
  }

  get scoreLabel(): string {
    if (this.scorePercent >= 80) return 'Excellent !';
    if (this.scorePercent >= 60) return 'Bien !';
    if (this.scorePercent >= 40) return 'Peut mieux faire';
    return 'Continuez vos efforts';
  }

  private generateFallbackQuestions(theme: string): QuizQuestion[] {
    const bank: Record<string, QuizQuestion[]> = {
      fiqh: [
        { question: 'Combien de piliers compte l\'Islam ?', options: ['3', '4', '5', '6'], correctIndex: 2 },
        { question: 'Quel est le premier pilier de l\'Islam ?', options: ['La prière', 'Le jeûne', 'La Shahada', 'Le pèlerinage'], correctIndex: 2 },
        { question: 'Combien de Rak\'at comporte la prière du Fajr ?', options: ['2', '3', '4', '1'], correctIndex: 0 },
        { question: 'Quel mois est consacré au jeûne ?', options: ['Shawwal', 'Ramadan', 'Rajab', 'Muharram'], correctIndex: 1 },
        { question: 'Quel est le pourcentage de la Zakat sur les économies ?', options: ['1%', '2.5%', '5%', '10%'], correctIndex: 1 },
        { question: 'Combien de prières obligatoires par jour ?', options: ['3', '4', '5', '7'], correctIndex: 2 },
        { question: 'Quelle est la direction de la prière ?', options: ['Jérusalem', 'Médine', 'La Mecque', 'Le soleil'], correctIndex: 2 },
        { question: 'Quel est le nom de la prière du vendredi ?', options: ['Salat al-Jumu\'a', 'Salat al-Istikhara', 'Salat al-Witr', 'Salat at-Tahajjud'], correctIndex: 0 },
        { question: 'Qu\'est-ce que le Wudu ?', options: ['Le jeûne', 'L\'aumône', 'Les ablutions', 'La prière'], correctIndex: 2 },
        { question: 'Quel acte annule le jeûne ?', options: ['Dormir', 'Manger intentionnellement', 'Prier', 'Lire le Coran'], correctIndex: 1 }
      ],
      quran: [
        { question: 'Combien de sourates contient le Coran ?', options: ['100', '110', '114', '120'], correctIndex: 2 },
        { question: 'Quelle est la plus longue sourate ?', options: ['Al-Imran', 'Al-Baqara', 'An-Nisa', 'Al-Ma\'ida'], correctIndex: 1 },
        { question: 'Quelle est la plus courte sourate ?', options: ['Al-Ikhlas', 'Al-Kawthar', 'Al-Asr', 'An-Nasr'], correctIndex: 1 },
        { question: 'En combien de parties (Juz) est divisé le Coran ?', options: ['20', '25', '30', '40'], correctIndex: 2 },
        { question: 'Quelle est la première sourate révélée ?', options: ['Al-Fatiha', 'Al-Alaq', 'Al-Baqara', 'Al-Ikhlas'], correctIndex: 1 },
        { question: 'Sur combien d\'années le Coran a-t-il été révélé ?', options: ['10', '15', '20', '23'], correctIndex: 3 },
        { question: 'Quel est le verset le plus long du Coran ?', options: ['Ayat al-Kursi', 'Al-Baqara 282', 'Al-Baqara 255', 'Al-Imran 26'], correctIndex: 1 },
        { question: 'Quel prophète est le plus mentionné dans le Coran ?', options: ['Ibrahim', 'Issa', 'Muhammad', 'Moussa'], correctIndex: 3 },
        { question: 'Quel est le nom de la sourate 36 ?', options: ['Ar-Rahman', 'Ya-Sin', 'Al-Waqi\'a', 'Al-Mulk'], correctIndex: 1 },
        { question: 'Combien de versets contient la sourate Al-Fatiha ?', options: ['5', '6', '7', '8'], correctIndex: 2 }
      ],
      hadith: [
        { question: 'Qui a compilé Sahih al-Bukhari ?', options: ['Muslim ibn al-Hajjaj', 'Muhammad al-Bukhari', 'Abu Dawud', 'At-Tirmidhi'], correctIndex: 1 },
        { question: 'Combien de hadiths contient Sahih al-Bukhari (sans répétitions) ?', options: ['1500', '2602', '5000', '7275'], correctIndex: 1 },
        { question: 'Quel est le premier hadith de Sahih al-Bukhari ?', options: ['Sur la foi', 'Sur les actes', 'Sur l\'intention (Niyya)', 'Sur la prière'], correctIndex: 2 },
        { question: 'Que signifie "hadith mutawatir" ?', options: ['Hadith faible', 'Hadith à chaîne unique', 'Hadith rapporté par de nombreuses personnes', 'Hadith inventé'], correctIndex: 2 },
        { question: 'Combien de livres dans les "Six Recueils" (Kutub as-Sitta) ?', options: ['4', '5', '6', '8'], correctIndex: 2 },
        { question: 'Qui a compilé Sahih Muslim ?', options: ['Al-Bukhari', 'Muslim ibn al-Hajjaj', 'An-Nasa\'i', 'Ibn Majah'], correctIndex: 1 },
        { question: 'Qu\'est-ce qu\'un hadith "sahih" ?', options: ['Un hadith faible', 'Un hadith authentique', 'Un hadith inventé', 'Un hadith oublié'], correctIndex: 1 },
        { question: 'Qu\'est-ce que l\'Isnad ?', options: ['Le texte du hadith', 'La chaîne de transmission', 'Le livre de hadiths', 'Le narrateur'], correctIndex: 1 },
        { question: 'Qu\'est-ce qu\'un hadith Qudsi ?', options: ['Parole du Prophète', 'Parole d\'Allah rapportée par le Prophète', 'Verset du Coran', 'Opinion d\'un savant'], correctIndex: 1 },
        { question: 'Le hadith "les actes ne valent que par les intentions" est dans :', options: ['Sahih Muslim uniquement', 'Sahih al-Bukhari uniquement', 'Les deux Sahih', 'Sunan Abu Dawud'], correctIndex: 2 }
      ],
      histoire: [
        { question: 'En quelle année a eu lieu l\'Hégire ?', options: ['610', '622', '630', '632'], correctIndex: 1 },
        { question: 'Quelle a été la première bataille de l\'Islam ?', options: ['Uhud', 'Badr', 'Khandaq', 'Hunayn'], correctIndex: 1 },
        { question: 'Qui fut le premier calife ?', options: ['Omar', 'Uthman', 'Ali', 'Abu Bakr'], correctIndex: 3 },
        { question: 'En quelle année La Mecque a-t-elle été conquise ?', options: ['625', '628', '630', '632'], correctIndex: 2 },
        { question: 'Qui a construit la Kaaba selon la tradition ?', options: ['Moussa', 'Ibrahim et Ismaïl', 'Muhammad', 'Nouh'], correctIndex: 1 },
        { question: 'Combien de temps a duré le califat des Rashidun ?', options: ['20 ans', '30 ans', '50 ans', '100 ans'], correctIndex: 1 },
        { question: 'Quel calife a compilé le Coran en un seul livre ?', options: ['Abu Bakr', 'Omar', 'Uthman', 'Ali'], correctIndex: 2 },
        { question: 'Où le Prophète est-il né ?', options: ['Médine', 'Jérusalem', 'La Mecque', 'Taïf'], correctIndex: 2 },
        { question: 'Quel est le nom de la mère du Prophète ?', options: ['Khadija', 'Amina', 'Aisha', 'Fatima'], correctIndex: 1 },
        { question: 'Quel événement marque le début du calendrier islamique ?', options: ['La naissance du Prophète', 'La révélation du Coran', 'L\'Hégire', 'La conquête de La Mecque'], correctIndex: 2 }
      ],
      jurisprudence: [
        { question: 'Combien d\'écoles juridiques (madhab) principales ?', options: ['2', '3', '4', '5'], correctIndex: 2 },
        { question: 'Quel imam a fondé l\'école Hanafite ?', options: ['Malik ibn Anas', 'Abu Hanifa', 'Ash-Shafi\'i', 'Ahmad ibn Hanbal'], correctIndex: 1 },
        { question: 'Quelle est la source première du droit islamique ?', options: ['Le Coran', 'La Sunna', 'L\'Ijma', 'Le Qiyas'], correctIndex: 0 },
        { question: 'Que signifie "Ijma" ?', options: ['Analogie', 'Consensus des savants', 'Intérêt public', 'Coutume'], correctIndex: 1 },
        { question: 'Que signifie "Qiyas" ?', options: ['Consensus', 'Raisonnement analogique', 'Préférence', 'Nécessité'], correctIndex: 1 },
        { question: 'Quel est le statut de la prière en groupe pour les hommes ?', options: ['Obligatoire', 'Fortement recommandée', 'Optionnelle', 'Interdite'], correctIndex: 1 },
        { question: 'Quelle est la base de l\'école Malikite ?', options: ['La pratique des gens de Médine', 'Le Qiyas strict', 'L\'opinion personnelle', 'Les hadiths faibles'], correctIndex: 0 },
        { question: 'L\'Ijtihad signifie :', options: ['Imitation', 'Effort d\'interprétation', 'Consensus', 'Tradition'], correctIndex: 1 },
        { question: 'Que signifie "Haram" ?', options: ['Recommandé', 'Permis', 'Interdit', 'Détesté'], correctIndex: 2 },
        { question: 'Que signifie "Makruh" ?', options: ['Obligatoire', 'Permis', 'Interdit', 'Détesté/déconseillé'], correctIndex: 3 }
      ]
    };

    return bank[theme] || bank['fiqh'];
  }
}
