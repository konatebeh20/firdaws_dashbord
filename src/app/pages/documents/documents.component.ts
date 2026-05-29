import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface DocumentItem {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
  created_at: string;
  is_favorite: boolean;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent implements OnInit {
  activeTab: 'mes-documents' | 'bibliotheque' | 'quiz' = 'mes-documents';
  documents: DocumentItem[] = [];
  libraryDocs: DocumentItem[] = [];
  isLoading = false;
  searchQuery = '';

  selectedDoc: DocumentItem | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  showUploadModal = false;

  uploadForm = {
    title: '',
    description: '',
    category: 'general',
    file: null as File | null
  };

  private readonly apiBase = environment.apiBaseUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadDocuments() {
    this.isLoading = true;
    this.http.get<{ documents?: DocumentItem[]; data?: DocumentItem[] }>(
      `${this.apiBase}/documents`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const docs = res.documents || res.data || [];
        this.documents = docs.filter(d => d.category !== 'library');
        this.libraryDocs = docs.filter(d => d.category === 'library');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredDocuments(): DocumentItem[] {
    const docs = this.activeTab === 'bibliotheque' ? this.libraryDocs : this.documents;
    if (!this.searchQuery.trim()) return docs;
    const q = this.searchQuery.toLowerCase();
    return docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }

  setTab(tab: 'mes-documents' | 'bibliotheque' | 'quiz') {
    this.activeTab = tab;
  }

  openDocument(doc: DocumentItem) {
    this.selectedDoc = doc;
    if (doc.file_url) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.file_url);
    }
  }

  closeReader() {
    this.selectedDoc = null;
    this.pdfUrl = null;
  }

  toggleFavorite(doc: DocumentItem) {
    doc.is_favorite = !doc.is_favorite;
  }

  openUploadModal() {
    this.showUploadModal = true;
    this.uploadForm = { title: '', description: '', category: 'general', file: null };
  }

  closeUploadModal() {
    this.showUploadModal = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadForm.file = input.files[0];
    }
  }

  uploadDocument() {
    if (!this.uploadForm.file || !this.uploadForm.title) return;

    const formData = new FormData();
    formData.append('file', this.uploadForm.file);
    formData.append('title', this.uploadForm.title);
    formData.append('description', this.uploadForm.description);
    formData.append('category', this.uploadForm.category);

    this.http.post(`${this.apiBase}/documents`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      })
    }).subscribe({
      next: () => {
        this.closeUploadModal();
        this.loadDocuments();
      },
      error: () => {}
    });
  }

  getFileIcon(fileType: string): string {
    if (fileType?.includes('pdf')) return 'bi-file-earmark-pdf-fill text-red-500';
    if (fileType?.includes('word') || fileType?.includes('doc')) return 'bi-file-earmark-word-fill text-blue-500';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'bi-file-earmark-excel-fill text-green-500';
    if (fileType?.includes('image') || fileType?.includes('png') || fileType?.includes('jpg')) return 'bi-file-earmark-image-fill text-purple-500';
    return 'bi-file-earmark-fill text-gray-500';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}