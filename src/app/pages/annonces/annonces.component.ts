import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnnoncesService, Annonce } from '../../shared/services/annonces/annonces.service';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.css',
})
export class AnnoncesComponent implements OnInit {

  annonces: Annonce[] = [];
  selectedAnnonce: Annonce | null = null;
  isModalOpen = false;
  isLoading = false;

  constructor(private annoncesService: AnnoncesService) {}

  formData: Annonce = {
    title: '',
    content: '',
    priority: 'normal',
    status: 'published',
    publish_date: '',
    created_at: ''
  };


  ngOnInit() {
    this.loadAnnonces();
  }

  loadAnnonces() {
    this.isLoading = true;
    console.log('🔵 Chargement des annonces...');

    this.annoncesService.getAnnonces().subscribe({
      next: (data) => {
        console.log('🟢 Annonces reçues:', data);
        console.log('🟢 Nombre:', data.length);

        this.annonces = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('🔴 Erreur:', error);
        this.isLoading = false;
        this.showToast('Erreur de chargement', 'error');
        this.annonces = [];
      }
    });
  }

  openModal() {
    this.resetForm();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
  this.selectedAnnonce = null;
  this.formData = {
    title: '',
    content: '',
    priority: 'normal',
    status: 'published',
    publish_date: new Date().toISOString().slice(0, 16),
    created_at: ''
  };
}

  editAnnonce(annonce: Annonce) {
    this.selectedAnnonce = annonce;
    this.formData = { ...annonce };
    this.isChecked = annonce.status === 'published';
    this.isModalOpen = true;
  }

  saveAnnonce() {
    if (!this.formData.title || !this.formData.content) {
    alert('Veuillez remplir tous les champs requis');
    return;
  }

  if (this.selectedAnnonce) {
    this.annoncesService.updateAnnonce(this.selectedAnnonce.id!, this.formData).subscribe({
      next: () => {
        this.loadAnnonces();
        this.showToast('Annonce mise à jour avec succès ✓');
        this.closeModal();
      },
      error: () => this.showToast('Erreur de mise à jour', 'error')
    });
  } else {
    this.annoncesService.createAnnonce(this.formData).subscribe({
      next: () => {
        this.loadAnnonces();
        this.showToast('Annonce créée avec succès ✓');
        this.closeModal();
      },
      error: () => this.showToast('Erreur de création', 'error')
    });
  }
}

deleteAnnonce(id?: number) {
  if (!id) return;
  if (confirm('Supprimer cette annonce ?')) {
    this.annoncesService.deleteAnnonce(id).subscribe({
      next: () => {
        this.loadAnnonces();
        this.showToast('Annonce supprimée');
      },
      error: () => this.showToast('Erreur de suppression', 'error')
    });
  }
}

  // saveAnnonce() {
  //   if (!this.formData.title || !this.formData.content) {
  //     alert('Veuillez remplir tous les champs requis');
  //     return;
  //   }

  //   if (this.selectedAnnonce) {
  //     // Mise à jour
  //     this.annoncesService.updateAnnonce(this.selectedAnnonce.id!, this.formData).subscribe({
  //       next: () => {
  //         this.loadAnnonces();
  //         this.closeModal();
  //       },
  //       error: (error) => console.error('Erreur:', error)
  //     });
  //   } else {
  //     // Création
  //     this.annoncesService.createAnnonce(this.formData).subscribe({
  //       next: () => {
  //         this.loadAnnonces();
  //         this.closeModal();
  //       },
  //       error: (error) => console.error('Erreur:', error)
  //     });
  //   }
  // }

//   saveAnnonce() {

//     console.log('🔍 VALEURS DU FORMULAIRE:', {
//       title: this.formData.title,
//       content: this.formData.content,
//       category: this.formData.category,
//       is_published: this.formData.is_published,
//       published_at: this.formData.published_at
//     });

//   if (!this.formData.title || !this.formData.content) {
//     alert('Veuillez remplir tous les champs requis');
//     return;
//   }

//   if (this.selectedAnnonce) {
//     // Mise à jour locale immédiate
//     this.annonces = this.annonces.map(a =>
//       a.id === this.selectedAnnonce!.id ? { ...this.formData, id: a.id } : a
//     );
//     this.showToast('Annonce mise à jour avec succès ✓');
//     this.closeModal();

//     // Sync backend en arrière-plan
//     this.annoncesService.updateAnnonce(this.selectedAnnonce.id!, this.formData).subscribe({
//       error: () => this.showToast('Erreur de synchronisation', 'error')
//     });

//   } else {
//     // Ajout local immédiat sans attendre le backend
//     const newAnnonce: Annonce = {
//       ...this.formData,
//       id: Date.now(), // ID temporaire
//       created_at: new Date().toISOString()
//     };
//     this.annonces = [newAnnonce, ...this.annonces];
//     this.showToast('Annonce créée avec succès ✓');
//     this.closeModal();

//     // Sync backend et remplace l'ID temporaire si succès
//     this.annoncesService.createAnnonce(this.formData).subscribe({
//       next: (created: Annonce) => {
//         if (created?.id) {
//           this.annonces = this.annonces.map(a =>
//             a.id === newAnnonce.id ? { ...a, id: created.id } : a
//           );
//         }
//       },
//       error: () => this.showToast('Erreur de synchronisation', 'error')
//     });
//   }
// }


  // deleteAnnonce(id?: number) {
  //   if (!id) return;
  //   if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
  //     this.annoncesService.deleteAnnonce(id).subscribe({
  //       next: () => this.loadAnnonces(),
  //       error: (error) => console.error('Erreur:', error)
  //     });
  //   }
  // }
  // deleteAnnonce(id?: number) {
  //   if (!id) return;
  //   if (confirm('Supprimer cette annonce ?')) {
  //     this.annonces = this.annonces.filter(a => a.id !== id); // immédiat
  //     this.showToast('Annonce supprimée');
  //     this.annoncesService.deleteAnnonce(id).subscribe({
  //       error: () => { this.loadAnnonces(); this.showToast('Erreur de suppression', 'error'); }
  //     });
  //   }
  // }

  // togglePublish(annonce: Annonce) {
  //   const updated = { ...annonce, is_published: !annonce.is_published };
  //   this.annoncesService.updateAnnonce(annonce.id!, updated).subscribe({
  //     next: () => this.loadAnnonces(),
  //     error: (error) => console.error('Erreur:', error)
  //   });
  // }
  // togglePublish(annonce: Annonce) {
  //   this.annonces = this.annonces.map(a =>
  //     a.id === annonce.id ? { ...a, is_published: !a.is_published } : a
  //   );
  //   const updated = { ...annonce, is_published: !annonce.is_published };
  //   this.annoncesService.updateAnnonce(annonce.id!, updated).subscribe({
  //     error: () => { this.loadAnnonces(); } // rollback si erreur
  //   });
  // }

  getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    urgent: '🔴 Urgent',
    important: '⚠️ Important',
    normal: '📢 Normal'
  };
  return labels[priority] || '📢 Normal';
}

getPriorityClass(priority: string): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700';
    case 'important': return 'bg-orange-100 text-orange-700';
    default: return 'bg-green-100 text-green-700';
  }
}

  // getCategoryLabel(category: string): string {
  //   const labels: Record<string, string> = {
  //     urgent: '🔴 Urgent',
  //     important: '⚠️ Important',
  //     normal: '📢 Normal'
  //   };
  //   return labels[category] || '📢 Normal';
  // }

  togglePublish(annonce: Annonce) {
  const newStatus = annonce.status === 'published' ? 'draft' : 'published';
  const updated = { ...annonce, status: newStatus };
  
  this.annoncesService.updateAnnonce(annonce.id!, updated).subscribe({
    next: () => this.loadAnnonces(),
    error: () => this.showToast('Erreur', 'error')
  });
}

isChecked: boolean = true;


  toast: { message: string; type: 'success' | 'error' } | null = null;
  
  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }

}
