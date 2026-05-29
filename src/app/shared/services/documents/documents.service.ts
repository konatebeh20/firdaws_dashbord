import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface DocumentInfo {
  id: number;
  title: string;
  description?: string;
  author?: string;
  date?: string;
  type: string;
  size?: string;
  icon?: string;
  file_size?: string;
  file_url?: string;
  archived?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {

  private apiUrl = `${environment.apiBaseUrl}/documents`;
  private filesUrl = `${environment.apiBaseUrl}/files`;

  constructor(
    private http: HttpClient
  ) {}

  // ── GET tous les documents (bibliothèque publique) ──
  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // ── GET documents admin (avec archivés) ──
  getAllAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`, {
    });
  }

  // ── GET un document ──
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // ── POST créer un document ──
  create(data: Partial<DocumentInfo>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // ── PUT modifier un document ──
  update(id: number, data: Partial<DocumentInfo>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // ── PUT archiver ──
  archive(id: number, archived: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/archive/${id}`, { archived });
  }

  // ── DELETE supprimer ──
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ── POST upload fichier ──
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.filesUrl}/upload`, formData);
  }
  
}

