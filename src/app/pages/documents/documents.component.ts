import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { DocumentsService, DocumentInfo } from '../../shared/services/documents/documents.service';
import { QuizService, Quiz, QuizQuestion } from '../../shared/services/quiz/quiz.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent implements OnInit {
  
  activeTab: 'mes-documents' | 'bibliotheque' | 'quiz' = 'mes-documents';

  filterType = '';
  documentTypes = ['PDF', 'DOC', 'DOCX', 'XLS', 'PPT', 'ZIP', 'IMAGE', 'TXT'];

  bibliotheque: DocumentInfo[] = [];
  mesDocuments: DocumentInfo[] = [];

  isLoading = true;
  isModalOpen = false;
  isEditMode = false;
  selectedDocument: DocumentInfo | null = null;
  isDragging = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;
  
  // Quiz
  isGeneratingQuiz: number | null = null;
  mesQuiz: Quiz[] = [];
  activeQuiz: Quiz | null = null;
  currentQuestionIndex = 0;
  userAnswers: Record<number, string> = {};
  quizFinished = false;

  // Formulaire document
  formData: DocumentInfo & { file?: File } = {
    id: 0, 
    title: '', 
    description: '', 
    author: '',
    type: 'PDF', 
    size: '', 
    file_url: '', 
    file: undefined,
  };

  constructor(
    private documentsService: DocumentsService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadQuizzes();
  }

  // ── Chargement des Données ──
  loadDocuments() {
    this.isLoading = true;
    this.documentsService.getAll().subscribe({
      next: (res) => {
        const docs = res.data || [];
        this.bibliotheque = docs.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          author: d.author,
          type: d.type || 'PDF',
          size: d.file_size,
          file_url: d.file_url,
          url: d.file_url,
          icon: d.icon,
          date: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '',
        }));
        this.mesDocuments = [...this.bibliotheque];
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Erreur de chargement des documents', 'error');
        this.isLoading = false;
      }
    });
  }

  loadQuizzes() {
    this.quizService.getAll().subscribe({
      next: (res) => {
        this.mesQuiz = res.data || [];
      },
      error: () => {
        const saved = localStorage.getItem('firdaws_quizzes');
        if (saved) {
          this.mesQuiz = JSON.parse(saved);
        }
      }
    });
  }

  saveQuizzesToStorage() {
    localStorage.setItem('firdaws_quizzes', JSON.stringify(this.mesQuiz));
  }

  // ── Getters & Filtres ──
  get filteredBibliotheque(): DocumentInfo[] {
    if (!this.filterType) return this.bibliotheque;
    return this.bibliotheque.filter(d => d.type === this.filterType);
  }

  getBiblioByType(type: string): DocumentInfo[] {
    return this.bibliotheque.filter(d => d.type === type);
  }

  getDocumentsByType(type: string): DocumentInfo[] {
    return this.mesDocuments.filter(d => d.type === type);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'PDF': 'bi-file-earmark-pdf-fill',
      'DOC': 'bi-file-earmark-word-fill',
      'DOCX': 'bi-file-earmark-word-fill',
      'XLS': 'bi-file-earmark-excel-fill',
      'XLSX': 'bi-file-earmark-excel-fill',
      'PPT': 'bi-file-earmark-slides-fill',
      'PPTX': 'bi-file-earmark-slides-fill',
      'ZIP': 'bi-file-earmark-zip-fill',
      'IMAGE': 'bi-file-earmark-image-fill',
      'TXT': 'bi-file-earmark-text-fill',
    };
    return icons[type] || 'bi-file-earmark-fill';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'PDF': 'red', 'DOC': 'blue', 'DOCX': 'blue',
      'XLS': 'green', 'XLSX': 'green',
      'PPT': 'orange', 'PPTX': 'orange',
      'ZIP': 'yellow', 'IMAGE': 'purple', 'TXT': 'gray',
    };
    return colors[type] || 'gray';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ── Drag & Drop ──
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.isDragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }
  
  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  handleFile(file: File) {
    let docType = 'PDF';
    if (file.type.includes('word')) docType = 'DOCX';
    else if (file.type.includes('excel') || file.type.includes('spreadsheet')) docType = 'XLS';
    else if (file.type.includes('presentation')) docType = 'PPT';
    else if (file.type.includes('image')) docType = 'IMAGE';
    else if (file.type.includes('zip')) docType = 'ZIP';
    else if (file.type.includes('text')) docType = 'TXT';

    this.formData.file = file;
    this.formData.title = this.formData.title || file.name.replace(/\.[^/.]+$/, '');
    this.formData.type = docType;
    this.formData.size = this.formatFileSize(file.size);
    
    this.showToast(`Fichier "${file.name}" sélectionné`, 'success');
  }

  // ── Gestion des Modals ──
  openModal() {
    this.isEditMode = false;
    this.selectedDocument = null;
    this.formData = {
      id: 0, title: '', description: '', author: '',
      type: 'PDF', size: '', file_url: '', file: undefined,
    };
    this.isModalOpen = true;
  }

  editDocument(doc: DocumentInfo) {
    this.isEditMode = true;
    this.selectedDocument = doc;
    this.formData = { ...doc };
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.isDragging = false; 
  }

  // ── CRUD Documents ──
  saveDocument() {
    if (!this.formData.title) {
      this.showToast('Veuillez entrer un titre', 'error');
      return;
    }

    const payload = {
      title: this.formData.title,
      description: this.formData.description || '',
      author: this.formData.author || 'Administrateur',
      type: this.formData.type,
      file_size: this.formData.size || '0 KB',
      file_url: this.formData.file_url || '#',
    };

    if (this.isEditMode && this.selectedDocument) {
      this.documentsService.update(this.selectedDocument.id, payload).subscribe({
        next: () => {
          this.showToast('Document mis à jour ✓', 'success');
          this.loadDocuments();
          this.closeModal();
        },
        error: () => this.showToast('Erreur lors de la mise à jour', 'error')
      });
    } else {
      if (this.formData.file) {
        this.documentsService.uploadFile(this.formData.file).subscribe({
          next: (uploadRes) => {
            const fileUrl = uploadRes.data?.file_url || uploadRes.file_url;
            payload.file_url = fileUrl;
            this.createDocument(payload);
          },
          error: () => {
            this.createDocument(payload);
          }
        });
      } else {
        this.createDocument(payload);
      }
    }
  }

  private createDocument(payload: any) {
    this.documentsService.create(payload).subscribe({
      next: () => {
        this.showToast('Document ajouté ✓', 'success');
        this.loadDocuments();
        this.closeModal();
      },
      error: () => this.showToast("Erreur lors de l'ajout", 'error')
    });
  }

  deleteDocument(id: number) {
    if (confirm('Supprimer ce document ?')) {
      this.documentsService.delete(id).subscribe({
        next: () => {
          this.showToast('Document supprimé ✓', 'success');
          this.loadDocuments();
        },
        error: () => this.showToast('Erreur lors de la suppression', 'error')
      });
    }
  }

  downloadDocument(doc: DocumentInfo) {
    const fileUrl = doc.file_url;
    if (fileUrl && fileUrl !== '#') {
      window.open(fileUrl, '_blank');
    } else {
      this.showToast(`Aucun fichier disponible pour "${doc.title}"`, 'error');
    }
  }

  // ── Moteur de Quiz (Génération & Actions) ──
  generateQuiz(doc: DocumentInfo) {
    this.isGeneratingQuiz = doc.id;

    const payload = {
      title: doc.title,
      text: doc.description || doc.title,
      document_id: doc.id,
      nb_questions: 5
    };

    this.quizService.generate(payload).subscribe({
      next: (res) => {
        const generatedQuiz: Quiz = {
          id: res.data?.id || res.id || Date.now(),
          title: res.data?.title || res.quiz_title || `Quiz — ${doc.title}`,
          description: res.data?.description || `Quiz sur ${doc.title}`,
          document_id: doc.id,
          document_title: doc.title,
          questions: res.data?.questions || res.questions || this.generateFallbackQuestions(doc.title),
          score: res.data?.score || 0,
          total_questions: res.data?.total_questions || (res.questions?.length || 3),
          is_completed: res.data?.is_completed || false,
          created_at: res.data?.created_at || new Date().toISOString()
        };

        this.mesQuiz = [generatedQuiz, ...this.mesQuiz];
        this.saveQuizzesToStorage();
        this.activeTab = 'quiz';
        this.showToast(`Quiz "${generatedQuiz.title}" généré ✓`, 'success');
      },
      error: (err) => {
        console.error('Erreur génération quiz, bascule sur mode hors-ligne:', err);
        
        // Fallback hors-ligne local
        const fallbackQuiz: Quiz = {
          id: Date.now(),
          title: `Quiz sur ${doc.title} (Hors-ligne)`,
          description: `Généré localement suite à une erreur réseau.`,
          document_id: doc.id,
          document_title: doc.title,
          questions: this.generateFallbackQuestions(doc.title),
          score: 0,
          total_questions: 3,
          is_completed: false,
          created_at: new Date().toISOString()
        };
        
        this.mesQuiz = [fallbackQuiz, ...this.mesQuiz];
        this.saveQuizzesToStorage();
        this.activeTab = 'quiz';
        this.showToast('Quiz généré (mode hors-ligne)', 'success');
      },
      complete: () => {
        this.isGeneratingQuiz = null;
      }
    });
  }

  startQuiz(quiz: Quiz) {
    this.activeQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.quizFinished = false;
  }

  answerQuestion(selectedOption: string) {
    if (!this.activeQuiz || !this.activeQuiz.questions) return;

    this.userAnswers[this.currentQuestionIndex] = selectedOption;

    if (this.currentQuestionIndex < this.activeQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    if (!this.activeQuiz || !this.activeQuiz.questions) return;

    let correctCount = 0;
    this.activeQuiz.questions.forEach((q: any, index: number) => {
      if (this.userAnswers[index] === q.correct) {
        correctCount++;
      }
    });

    const rawScore = Math.round((correctCount / this.activeQuiz.questions.length) * 100);
    this.activeQuiz.score = rawScore;
    this.activeQuiz.is_completed = true;
    this.quizFinished = true;

    const index = this.mesQuiz.findIndex(q => q.id === this.activeQuiz!.id);

    if (index !== -1) {
      this.mesQuiz[index].score = rawScore;
      this.mesQuiz[index].is_completed = true;
    }
    
      this.saveQuizzesToStorage();
    }

  resetQuiz() {
    this.activeQuiz = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.quizFinished = false;
    this.loadQuizzes();
  }

  deleteQuiz(id: number) {
  if (!confirm('Supprimer ce quiz ?')) return;

  // Suppression locale
  this.mesQuiz = this.mesQuiz.filter(q => q.id !== id);

  // Sauvegarde localStorage
  this.saveQuizzesToStorage();

  // Reset si quiz actif
  if (this.activeQuiz?.id === id) {
    this.resetQuiz();
  }

  // Optionnel : suppression API
  if (this.quizService.delete) {
    this.quizService.delete(id).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  this.showToast('Quiz supprimé ✓', 'success');
}

  private generateFallbackQuestions(title: string): QuizQuestion[] {
    return [
      {
        id: 1,
        type: 'qcm',
        question: `Quel est le thème principal du document "${title}" ?`,
        options: ['A. Le thème principal', 'B. Un sujet secondaire', 'C. Une introduction', 'D. Une conclusion'],
        correct: 'A',
        explanation: 'Le thème principal est généralement le sujet central du document.'
      },
      {
        id: 2,
        type: 'qcm',
        question: `D'après ce document, quel est le message important ?`,
        options: ['A. Message A', 'B. Message B', 'C. Message C', 'D. Message D'],
        correct: 'A',
        explanation: 'Le message important est celui qui est le plus mis en avant.'
      },
      {
        id: 3,
        type: 'vrai-faux',
        question: `Ce document contient des informations importantes.`,
        options: ['Vrai', 'Faux'],
        correct: 'Vrai',
        explanation: 'Les documents contiennent des informations importantes pour la communauté.'
      }
    ];
  }

  // ── Notifications ──
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 4000);
  }
}