import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YouTubeService, YouTubeVideo, YouTubePlaylist } from '../../shared/services/videos/youtube.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css',
})
export class VideosComponent implements OnInit {

  private youtubeService = inject(YouTubeService);

  // États publics
  playlists = this.youtubeService.playlists;
  isLoading = this.youtubeService.isLoading;
  error = this.youtubeService.error;
  allVideos = this.youtubeService.allVideos;

  // État local
  selectedCategoryId = signal<string>('all');
  filteredVideos = signal<YouTubeVideo[]>([]);
  currentPage = signal(0);
  pageSize = 12;

  // Vidéos paginées
  pagedVideos = computed(() => {
    const videos = this.filteredVideos();
    const start = this.currentPage() * this.pageSize;
    return videos.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredVideos().length / this.pageSize));

  ngOnInit() {
    this.loadPlaylists();
    this.loadAllVideos();
  }

  loadPlaylists() {
    this.youtubeService.fetchPlaylists().subscribe();
  }

  loadAllVideos() {
    this.youtubeService.fetchAllVideos().subscribe(videos => {
      if (this.selectedCategoryId() === 'all') {
        this.filteredVideos.set(videos);
      }
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(0);
    
    if (categoryId === 'all') {
      this.filteredVideos.set(this.allVideos());
    } else {
      const playlist = this.playlists().find(p => p.id === categoryId);
      if (playlist) {
        this.youtubeService.getVideosForPlaylist(playlist.id, playlist.title).subscribe(videos => {
          this.filteredVideos.set(videos);
        });
      }
    }
  }

  nextPage() {
    if (this.currentPage() + 1 < this.totalPages()) {
      this.currentPage.update(n => n + 1);
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(n => n - 1);
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getVideoCategory(video: YouTubeVideo): string {
    return video.category || 'Vidéo';
  }

  openVideo(video: YouTubeVideo) {
    window.open(video.videoUrl, '_blank');
  }

  refresh() {
    this.loadPlaylists();
    this.loadAllVideos();
    this.selectCategory('all');
  }
}
