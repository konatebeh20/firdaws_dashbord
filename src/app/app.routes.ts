import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent as UIVideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { PrayerTimesComponent } from './pages/prayer-times/prayer-times.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { EventsComponent } from './pages/events/events.component';
import { VideosComponent } from './pages/videos/videos.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { SupportComponent } from './pages/support/support.component';
import { DonationsComponent } from './pages/donations/donations.component';
import { AnnoncesComponent } from './pages/annonces/annonces.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path:'',
    canActivate: [authGuard],
    component:AppLayoutComponent,
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Tableau de bord - Mosquée Cité Bel Aire',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Calendrier - Mosquée Cité Bel Aire'
      },
      {
        path:'prayer-times',
        component:PrayerTimesComponent,
        title:'Horaires des Prières - Mosquée Cité Bel Aire'
      },
      {
        path:'events',
        component:EventsComponent,
        title:'Événements - Mosquée Cité Bel Aire'
      },
      {
        path:'annonces',
        component:AnnoncesComponent,
        title:'Annonces - Mosquée Cité Bel Aire'
      },
      {
        path:'fideles',
        component:ProfileComponent,
        title:'Fidèles - Mosquée Cité Bel Aire'
      },
      {
        path:'donations',
        component:DonationsComponent,
        title:'Donations - Mosquée Cité Bel Aire'
      },
      {
        path:'documents',
        component:DocumentsComponent,
        title:'Documents - Mosquée Cité Bel Aire'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Vidéos - Mosquée Cité Bel Aire'
      },
      {
        path:'quiz',
        component:QuizComponent,
        title:'Quiz Islamique - Mosquée Cité Bel Aire'
      },
      {
        path:'support',
        component:SupportComponent,
        title:'Support & Aide - Mosquée Cité Bel Aire'
      },
      {
        path:'admins',
        component:ProfileComponent,
        title:'Admins - Mosquée Cité Bel Aire'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Profil - Mosquée Cité Bel Aire'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Paramètres - Mosquée Cité Bel Aire'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Tables - Mosquée Cité Bel Aire'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Page vide - Mosquée Cité Bel Aire'
      },
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Factures - Mosquée Cité Bel Aire'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Graphique linéaire - Mosquée Cité Bel Aire'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Graphique en barres - Mosquée Cité Bel Aire'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Alertes - Mosquée Cité Bel Aire'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Avatars - Mosquée Cité Bel Aire'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Badges - Mosquée Cité Bel Aire'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Boutons - Mosquée Cité Bel Aire'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Images - Mosquée Cité Bel Aire'
      },
      {
        path:'ui-videos',
        component:UIVideosComponent,
        title:'Vidéos UI - Mosquée Cité Bel Aire'
      },
    ]
  },
  {
    path:'signin',
    component:SignInComponent,
    title:'Connexion - Mosquée Cité Bel Aire'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Inscription - Mosquée Cité Bel Aire'
  },
  {
    path:'**',
    component:NotFoundComponent,
    title:'Page non trouvée - Mosquée Cité Bel Aire'
  },
];
