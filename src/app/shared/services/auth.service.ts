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
  private readonly TOKEN_KEY = 'authToken';

  constructor(private readonly http: HttpClient) {}

  /**
   * Register a new user account
   * @param payload User registration data (username, email, password, etc.)
   * @returns Observable of the authentication response with token and user data
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiBaseUrl}/auth/register`,
      payload
    ).pipe(
      catchError((error) => {
        return throwError(() => this.normalizeAuthError(error));
      })
    );
  }

  /**
   * Authenticate user with email and password
   * @param payload Login credentials (email, password)
   * @returns Observable of the authentication response with token and user data
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiBaseUrl}/auth/login`,
      payload
    ).pipe(
      catchError((error) => {
        return throwError(() => this.normalizeAuthError(error));
      })
    );
  }

  /**
   * Save authentication token and user information to localStorage
   * @param response Server response containing token and user data
   * @throws Error if no token is found in the response
   */
  saveSession(response: AuthResponse): void {
    const token = this.extractToken(response);

    if (!token) {
      throw new Error('Le serveur n\'a pas retourné de token d\'authentification.');
    }

    const user = this.extractUser(response);

    this.setToken(token);
    localStorage.setItem('isAuthenticated', 'true');

    if (user?.email) {
      localStorage.setItem('userEmail', user.email);
    }

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Clear all authentication data from localStorage
   */
  clearSession(): void {
    this.removeToken();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentUser');
  }

  /**
   * Check if user is currently authenticated
   * @returns true if valid auth token exists, false otherwise
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Normalize HTTP errors to user-friendly error messages
   * @param error Raw HTTP error from HttpClient
   * @returns User-friendly Error object
   * @private
   */
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

    // Network error: backend is unreachable
    if (httpError?.status === 0) {
      return new Error(
        'Impossible de joindre l\'API. Vérifie que l\'URL de l\'API est correcte et que le backend est bien démarré.'
      );
    }

    // Server error message
    const serverMessage = httpError?.error?.message || httpError?.error?.detail || httpError?.message;

    if (serverMessage && serverMessage !== 'Http failure response') {
      return new Error(serverMessage);
    }

    // Generic HTTP status error
    if (httpError?.status) {
      return new Error(`Erreur serveur (${httpError.status}).`);
    }

    // Fallback error
    return new Error('Impossible de terminer l\'opération pour le moment.');
  }

  /**
   * Extract authentication token from various response formats
   * @param response Server response object
   * @returns Token string or null if not found
   * @private
   */
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

  /**
   * Extract user data from various response formats
   * @param response Server response object
   * @returns User object or null if not found
   * @private
   */
  private extractUser(response: AuthResponse): AuthUser | null {
    return (
      response?.user ||
      response?.data?.user ||
      null
    );
  }
}
