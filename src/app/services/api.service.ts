import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_URL = 'https://spendwise-backend.runasp.net';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    if (typeof window === 'undefined') return new HttpHeaders();
    const token = sessionStorage.getItem('sw_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v) httpParams = httpParams.set(k, v); });
    return this.http.get<T>(`${API_URL}${path}`, { headers: this.getHeaders(), params: httpParams });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body, { headers: this.getHeaders() });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${API_URL}${path}`, body, { headers: this.getHeaders() });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${API_URL}${path}`, body, { headers: this.getHeaders() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`, { headers: this.getHeaders() });
  }
}
