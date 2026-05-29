import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'Mosquée Firdaws Cité Bel Aire du Banco | Tableau de bord';

  private readonly MIN_LOADER_MS = 25000; // 25 secondes minimum
  private readonly startTime = Date.now();
  private loaderHidden = false;

  constructor(private router: Router) {}

   ngOnInit(): void {
    // Attendre la fin de la navigation initiale
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // On ne fait plus rien ici car la détection se fait dans index.html
      // Mais on garde pour être sûr
      setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('fade-out')) {
          // Le loader disparaîtra via le script
        }
      }, 100);
    });
  }


  // ngOnInit(): void {
  //   // Détecter la fin du premier chargement de route
  //   this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd)
  //   ).subscribe(() => {
  //     // this.hideLoader();
  //     this.hideLoaderWhenReady();
  //   });
  // }

  ngAfterViewInit(): void {}

   private hideLoaderWhenReady(): void {
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.MIN_LOADER_MS - elapsed);
    setTimeout(() => this.hideLoader(), remaining);
  }

  // private hideLoader(): void {
  //   const preloader = document.getElementById('preloader');
  //   if (preloader && !preloader.classList.contains('fade-out')) {
  //     preloader.classList.add('fade-out');
  //     setTimeout(() => {
  //       if (preloader.parentNode) {
  //         preloader.remove();
  //       }
  //     }, 800);
  //   }
  // }

  private hideLoader(): void {
    if (this.loaderHidden) return;
    this.loaderHidden = true;

    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader?.remove(), 800);
    }
  }

}
