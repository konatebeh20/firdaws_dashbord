import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  access_token?: string;
  jwt?: string;
  accessToken?: string;
  refresh_token?: string;
  user?: AuthUser;
  data?: {
    user?: AuthUser;
    token?: string;
    access_token?: string;
    jwt?: string;
    accessToken?: string;
    refresh_token?: string;
  };
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.requestWithFallback<AuthResponse>(
      [
        `${this.apiBaseUrl}/auth/register`,
        `${this.apiBaseUrl}/auth/signup`,
        `${this.apiBaseUrl}/auth/sign_up`,
        `${this.apiBaseUrl}/auth/create_user`
      ],
      payload
    ).pipe(
      catchError((error) => {
        return throwError(() => this.normalizeAuthError(error));
      })
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.requestWithFallback<AuthResponse>(
      [
        `${this.apiBaseUrl}/auth/login`,
        `${this.apiBaseUrl}/auth/signin`,
        `${this.apiBaseUrl}/auth/sign_in`
      ],
      payload
    ).pipe(
      catchError((error) => {
        return throwError(() => this.normalizeAuthError(error));
      })
    );
  }

  saveSession(response: AuthResponse): void {
    const token = this.extractToken(response);

    if (!token) {
      throw new Error('Le serveur n’a pas retourné de token d’authentification.');
    }

    const user = this.extractUser(response);

    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');

    if (user?.email) {
      localStorage.setItem('userEmail', user.email);
    }

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private normalizeAuthError(error: unknown): Error {
    const httpError = error as {
      status?: number;
      statusText?: string;
      message?: string;
      url?: string;
      error?: {
        message?: string;
        detail?: string;
      };
    };

    if (httpError?.status === 0) {
      return new Error(
        'Impossible de joindre l’API. Vérifie que l’URL de l’API est correcte et que le backend est bien démarré.'
      );
    }

    const serverMessage = httpError?.error?.message || httpError?.error?.detail || httpError?.message;

    if (serverMessage && serverMessage !== 'Http failure response') {
      return new Error(serverMessage);
    }

    if (httpError?.status) {
      return new Error(`Erreur serveur (${httpError.status}).`);
    }

    return new Error('Impossible de terminer l’opération pour le moment.');
  }

  private requestWithFallback<T>(urls: string[], body: unknown): Observable<T> {
    const [firstUrl, ...restUrls] = urls;

    if (!firstUrl) {
      return throwError(() => new Error('Aucune URL d’authentification disponible.'));
    }

    return this.http.post<T>(firstUrl, body).pipe(
      catchError((error: unknown) => {
        if (restUrls.length === 0) {
          return throwError(() => error);
        }

        return this.requestWithFallback<T>(restUrls, body);
      })
    );
  }

  private extractToken(response: AuthResponse): string | null {
    return (
      response?.token ||
      response?.access_token ||
      response?.jwt ||
      response?.accessToken ||
      response?.refresh_token ||
      response?.data?.token ||
      response?.data?.access_token ||
      response?.data?.jwt ||
      response?.data?.accessToken ||
      response?.data?.refresh_token ||
      null
    );
  }

  private extractUser(response: AuthResponse): AuthUser | null {
    return (
      response?.user ||
      response?.data?.user ||
      null
    );
  }
}
