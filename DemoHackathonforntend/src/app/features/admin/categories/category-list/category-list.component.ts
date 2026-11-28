import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryApiService } from '../../../../core/services/category/category-api';

interface AdminCategory {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  private readonly categoryApi = inject(CategoryApiService);

  searchText = signal('');
  showForm = signal(false);
  isEditMode = signal(false);

  categories = signal<AdminCategory[]>([]);
  formCategory = signal<AdminCategory>(this.createEmptyCategory());
  filteredCategories = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const categories = this.categories();
    return search
      ? categories.filter(category =>
          category.name.toLowerCase().includes(search) ||
          category.description.toLowerCase().includes(search))
      : categories;
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryApi.getAdminCategories().subscribe({
      next: data => {
        this.categories.set(data.map(c => ({
          id: c.categoryId,
          name: c.name,
          description: c.description || '',
          status: c.isActive ? 'Active' : 'Inactive'
        })));
      }
    });
  }

  createEmptyCategory(): AdminCategory {
    return {
      id: 0,
      name: '',
      description: '',
      status: 'Active'
    };
  }

  openAddForm(): void {
    this.isEditMode.set(false);
    this.formCategory.set(this.createEmptyCategory());
    this.showForm.set(true);
  }

  openEditForm(category: AdminCategory): void {
    this.isEditMode.set(true);
    this.formCategory.set({ ...category });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  updateFormCategory(changes: Partial<AdminCategory>): void {
    this.formCategory.update(category => ({ ...category, ...changes }));
  }

  saveCategory(): void {
    const formCategory = this.formCategory();
    const name = formCategory.name.trim();

    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    const payload = {
      name,
      description: formCategory.description?.trim() || '',
      isActive: formCategory.status === 'Active'
    };

    if (this.isEditMode()) {
      this.categoryApi.updateCategory(formCategory.id, payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to update category.');
        }
      });
    } else {
      this.categoryApi.createCategory(payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to create category.');
        }
      });
    }
  }

  deleteCategory(category: AdminCategory): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${category.name}?`
    );

    if (confirmed) {
      this.categoryApi.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to delete category.');
        }
      });
    }
  }
}
