import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  date: string;
  rawDate?: string;
  duration?: string;
  playlistId?: string;
  playlistTitle?: string;
  category?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  itemCount: number;
  thumbnail?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private readonly API_URL = 'https://www.googleapis.com/youtube/v3';
  private readonly API_KEY = 'AIzaSyAs08E0gOHnxLwcurdSTcAepFr9X54fC_I';
  private readonly CHANNEL_ID = 'UC487WNhif0rsoIvfwoYE3oQ';

  private playlistsSignal = signal<YouTubePlaylist[]>([]);
  private allVideosSignal = signal<YouTubeVideo[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  public playlists = this.playlistsSignal.asReadonly();
  public allVideos = this.allVideosSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  fetchPlaylists(): Observable<YouTubePlaylist[]> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/playlists?part=snippet,contentDetails&channelId=${this.CHANNEL_ID}&maxResults=50&key=${this.API_KEY}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.items) return [];
        const playlists: YouTubePlaylist[] = response.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          itemCount: item.contentDetails.itemCount,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          description: item.snippet.description
        }));
        const filtered = playlists.filter(p => p.itemCount > 0);
        this.playlistsSignal.set(filtered);
        return filtered;
      }),
      catchError(err => {
        console.error('Erreur API Playlists:', err);
        this.isLoadingSignal.set(false);
        return of([]);
      })
    );
  }

  fetchAllVideos(): Observable<YouTubeVideo[]> {
    return this.playlistsSignal().length > 0 
      ? this.fetchVideosFromPlaylists(this.playlistsSignal()) 
      : this.fetchPlaylists().pipe(switchMap(playlists => this.fetchVideosFromPlaylists(playlists)));
  }

  private fetchVideosFromPlaylists(playlists: YouTubePlaylist[]): Observable<YouTubeVideo[]> {
    if (playlists.length === 0) {
      this.allVideosSignal.set([]);
      this.isLoadingSignal.set(false);
      return of([]);
    }

    const requests = playlists.map(p => this.getVideosForPlaylist(p.id, p.title));
    
    return forkJoin(requests).pipe(
      map(results => {
        const allVideos = results.flat().sort((a, b) => new Date(b.rawDate || b.date).getTime() - new Date(a.rawDate || a.date).getTime());
        this.allVideosSignal.set(allVideos);
        this.isLoadingSignal.set(false);
        return allVideos;
      }),
      catchError(err => {
        console.error('Erreur API AllVideos:', err);
        this.isLoadingSignal.set(false);
        return of([]);
      })
    );
  }

  getVideosForPlaylist(playlistId: string, playlistTitle: string): Observable<YouTubeVideo[]> {
    const url = `${this.API_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${this.API_KEY}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.items) return [];
        return response.items.map((item: any) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          date: new Date(item.snippet.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawDate: item.snippet.publishedAt,
          duration: '',
          playlistId: playlistId,
          playlistTitle: playlistTitle,
          category: this.getCategoryFromTitle(playlistTitle)
        }));
      }),
      catchError(err => {
        console.error('Erreur API PlaylistItems:', err);
        return of([]);
      })
    );
  }

  private getCategoryFromTitle(title: string): string {
    if (!title) return 'Vidéo';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('khutba') || lowerTitle.includes('prêche')) return 'Khutba';
    if (lowerTitle.includes('cours')) return 'Cours';
    if (lowerTitle.includes('conférence') || lowerTitle.includes('conference')) return 'Conférence';
    if (lowerTitle.includes('rappel')) return 'Rappel';
    if (lowerTitle.includes('événement') || lowerTitle.includes('evenement')) return 'Événement';
    return 'Vidéo';
  }
}
