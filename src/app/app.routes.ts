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
import { VideosComponent } from './pages/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { PrayerTimesComponent } from './pages/prayer-times/prayer-times.component';

import { AnnoncesComponent } from './pages/annonces/annonces.component';
import { EventsComponent } from './pages/events/events.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { PrayerComponent } from './pages/prayer/prayer.component';
import { DonsComponent } from './pages/dons/dons.component';
import { UsersComponent } from './pages/users/users.component';
import { SettingsComponent } from './pages/settings/settings.component';


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
        path:'prayer-times',
        component:PrayerTimesComponent,
        title:'Horaires des Prières - Mosquée Cité Bel Aire'
      },
      {
        path:'events',
        component:EventsComponent,
        title:'Événements / Calendrier - Mosquée Cité Bel Aire'
      },
      {
        path:'documents',
        component:DocumentsComponent,
        title:'Documents - Mosquée Cité Bel Aire'
      },
      {
        path:'annonces',
        component:AnnoncesComponent,
        title:'Annonces - Mosquée Cité Bel Aire'
      },
      {
        path:'fideles',
        component:PrayerComponent,
        title:'Fidèles - Mosquée Cité Bel Aire'
      },
      {
        path:'donations',
        component:DonsComponent,
        title:'Donations - Mosquée Cité Bel Aire'
      },
      
      {
        path:'formations',
        component:BasicTablesComponent,
        title:'Formations - Mosquée Cité Bel Aire'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Vidéos - Mosquée Cité Bel Aire'
      },
      {
        path:'admins',
        component:UsersComponent,
        title:'Admins - Mosquée Cité Bel Aire'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Profil - Mosquée Cité Bel Aire'
      },
      {
        path:'settings',
        component:SettingsComponent,
        title:'Paramètres - Mosquée Cité Bel Aire'
      },
      // {
      //   path:'form-elements',
      //   component:FormElementsComponent,
      //   title:'Paramètres - Mosquée Cité Bel Aire'
      // },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
