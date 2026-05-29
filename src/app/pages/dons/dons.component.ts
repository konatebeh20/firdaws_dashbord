import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonationsService, Don } from '../../shared/services/donations/donations.service';

@Component({
  selector: 'app-dons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dons.component.html',
  styleUrl: './dons.component.css',
})
export class DonsComponent implements OnInit {

  donsList: Don[] = [];
  showModal: boolean = false;

  globalTotal: number = 0;

  isLoading: boolean = true;
  // isSaving: boolean = false;

  skeletons         = Array(5);
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Objet modèle lié aux champs du formulaire d'ajout
  newDon: Don = {
    donateur: '',
    type: 'Sadaqah',
    canal: 'Physique', // Forcé en physique car enregistré depuis le dashboard admin
    montant: 0
  };

  constructor(
    private donationsService: DonationsService
  ) {}

  ngOnInit(): void {this.loadDons();}

  // Charger la liste depuis l'API Flask
  loadDons(): void {
    this.isLoading = true;
    this.donationsService.getDons().subscribe({
      next: (data) => {
        console.log('✅ Dons chargés:', data);
        this.donsList = data || [];
        this.calculateGlobalTotal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dons', err);
        this.isLoading = false;
        this.donsList = [];
      }
    });
  }

  // Calculer la trésorerie générale
  calculateGlobalTotal(): void {
    this.globalTotal = this.donsList.reduce((sum, don) => sum + Number(don.montant), 0);
  }

  // Calculer dynamiquement le total par type pour les boîtes de statistiques
  getDonTotalByType(type: string): number {
    return this.donsList
      .filter(don => don.type.toLowerCase() === type.toLowerCase())
      .reduce((sum, don) => sum + Number(don.montant), 0);
  }

  // Attribuer des couleurs CSS personnalisées aux badges selon la catégorie
  getTypeClass(type: string): string {
    switch (type) {
      case 'Sadaqah': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'Zakat': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Projet': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400';
      case 'Fitr': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  }

  // --- Gestion du Modal ---
  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newDon = {
      donateur: '',
      type: 'Sadaqah',
      canal: 'Physique',
      montant: 0
    };
  }

  // POST : Sauvegarder le don vers l'API
  saveDon(): void {
    console.log('🔵 Tentative de sauvegarde:', this.newDon);

    if (!this.newDon.montant || this.newDon.montant <= 0) {
      alert('Veuillez entrer un montant valide.');
      return;
    }

    // Si le nom est vide, on laisse le backend ou l'affichage gérer l'anonymat
    if (!this.newDon.donateur.trim()) {
      this.newDon.donateur = '';
    }

    this.donationsService.createDon(this.newDon).subscribe({
      next: (savedDon) => {
        console.log('✅ Don sauvegardé:', savedDon);

        // Optionnel : Recharger tout depuis la DB pour être sûr des dates/ID, 
        // ou pousser simplement la réponse dans le tableau local :
        this.donsList.unshift(savedDon); // Ajout en haut de liste
        this.calculateGlobalTotal();
        this.closeModal();
        alert('Don enregistré avec succès !');
      },
      error: (err) => {
        console.error("Erreur lors de l'enregistrement du don", err);
        const errorMsg = err.error?.error_description || err.message || 'Erreur inconnue';
        alert("Impossible d'enregistrer le don" + errorMsg);
      }
    });
  }

}
