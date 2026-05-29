import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuizQuestion {
  id: number;
  type: 'qcm' | 'vrai-faux' | 'unique';
  question: string;
  options?: string[];
  correct: string;
  explanation: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  document_id?: number;
  document_title: string;
  questions: QuizQuestion[];
  score: number;
  total_questions: number;
  is_completed: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {

  private apiUrl = `${environment.apiBaseUrl}/quiz`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  generate(data: { title: string; text: string; document_id?: number; nb_questions?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, data, { headers: this.getHeaders() });
  }

  submitAnswers(id: number, answers: Record<number, string>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { answers }, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }


  // private apiUrl = `${environment.apiBaseUrl}/quiz`;

  // constructor(private http: HttpClient) {}

  // private getHeaders(): HttpHeaders {
  //   const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
  //   return new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   });
  // }

  // getAll(): Observable<any> {
  //   return this.http.get(this.apiUrl);
  // }

  // getById(id: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/${id}`);
  // }

  // generate(data: { title: string; text: string; document_id?: number; nb_questions?: number }): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/generate`, data, { headers: this.getHeaders() });
  // }

  // submitAnswers(id: number, answers: Record<number, string>): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, { answers }, { headers: this.getHeaders() });
  // }

  // delete(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  // }


}
