import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environments/environment';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  is_favorite: boolean;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css',
})
export class VideosComponent implements OnInit {
  videos: VideoItem[] = [];
  isLoading = false;
  searchQuery = '';
  selectedVideo: VideoItem | null = null;
  playerUrl: SafeResourceUrl | null = null;
  showFavoritesOnly = false;

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.isLoading = true;
    const { youtubeApiUrl, youtubeApiKey, youtubeChannelId } = environment;

    const url = `${youtubeApiUrl}/search?part=snippet&channelId=${youtubeChannelId}&maxResults=50&order=date&type=video&key=${youtubeApiKey}`;

    this.http.get<{ items?: Array<{ id: { videoId: string }; snippet: { title: string; description: string; thumbnails: { high?: { url: string }; medium?: { url: string } }; publishedAt: string } }> }>(url)
      .subscribe({
        next: (res) => {
          const savedFavorites = this.getSavedFavorites();
          this.videos = (res.items || []).map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
            publishedAt: item.snippet.publishedAt,
            is_favorite: savedFavorites.includes(item.id.videoId)
          }));
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  get filteredVideos(): VideoItem[] {
    let vids = this.showFavoritesOnly ? this.videos.filter(v => v.is_favorite) : this.videos;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      vids = vids.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return vids;
  }

  openVideo(video: VideoItem) {
    this.selectedVideo = video;
    this.playerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`
    );
  }

  closePlayer() {
    this.selectedVideo = null;
    this.playerUrl = null;
  }

  toggleFavorite(video: VideoItem, event: Event) {
    event.stopPropagation();
    video.is_favorite = !video.is_favorite;
    this.saveFavorites();
  }

  private getSavedFavorites(): string[] {
    const stored = localStorage.getItem('videoFavorites');
    if (!stored) return [];
    try {
      return JSON.parse(stored) as string[];
    } catch {
      return [];
    }
  }

  private saveFavorites() {
    const favIds = this.videos.filter(v => v.is_favorite).map(v => v.id);
    localStorage.setItem('videoFavorites', JSON.stringify(favIds));
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}