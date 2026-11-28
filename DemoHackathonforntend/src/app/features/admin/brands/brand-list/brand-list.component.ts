import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandApiService } from '../../../../core/services/brand/brand-api';

interface AdminBrand {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.css'
})
export class BrandListComponent implements OnInit {
  private readonly brandApi = inject(BrandApiService);

  searchText = signal('');
  showForm = signal(false);
  isEditMode = signal(false);

  brands = signal<AdminBrand[]>([]);
  formBrand = signal<AdminBrand>(this.createEmptyBrand());
  filteredBrands = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const brands = this.brands();
    return search
      ? brands.filter(brand =>
          brand.name.toLowerCase().includes(search) ||
          brand.description.toLowerCase().includes(search))
      : brands;
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.brandApi.getAdminBrands().subscribe({
      next: data => {
        this.brands.set(data.map(b => ({
          id: b.brandId,
          name: b.name,
          description: b.description || '',
          status: b.isActive ? 'Active' : 'Inactive'
        })));
      }
    });
  }

  createEmptyBrand(): AdminBrand {
    return {
      id: 0,
      name: '',
      description: '',
      status: 'Active'
    };
  }

  openAddForm(): void {
    this.isEditMode.set(false);
    this.formBrand.set(this.createEmptyBrand());
    this.showForm.set(true);
  }

  openEditForm(brand: AdminBrand): void {
    this.isEditMode.set(true);
    this.formBrand.set({ ...brand });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  updateFormBrand(changes: Partial<AdminBrand>): void {
    this.formBrand.update(brand => ({ ...brand, ...changes }));
  }

  saveBrand(): void {
    const formBrand = this.formBrand();
    const name = formBrand.name.trim();

    if (!name) {
      alert('Please enter a brand name.');
      return;
    }

    const payload = {
      name,
      description: formBrand.description?.trim() || '',
      isActive: formBrand.status === 'Active'
    };

    if (this.isEditMode()) {
      this.brandApi.updateBrand(formBrand.id, payload).subscribe({
        next: () => {
          this.loadBrands();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to update brand.');
        }
      });
    } else {
      this.brandApi.createBrand(payload).subscribe({
        next: () => {
          this.loadBrands();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to create brand.');
        }
      });
    }
  }

  deleteBrand(brand: AdminBrand): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${brand.name}?`
    );

    if (confirmed) {
      this.brandApi.deleteBrand(brand.id).subscribe({
        next: () => {
          this.loadBrands();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to delete brand.');
        }
      });
    }
  }
}
