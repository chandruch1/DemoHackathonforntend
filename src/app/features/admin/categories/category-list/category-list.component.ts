
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class CategoryListComponent {

  searchText = '';
  showForm = false;
  isEditMode = false;

  categories: AdminCategory[] = [
    {
      id: 1,
      name: 'Dairy',
      description: 'Milk, butter, cheese and dairy products',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Bakery',
      description: 'Bread, cakes and bakery products',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Grocery',
      description: 'Rice, pulses and daily groceries',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Beverages',
      description: 'Juices and other beverages',
      status: 'Active'
    }
  ];

  formCategory: AdminCategory = this.createEmptyCategory();

  get filteredCategories(): AdminCategory[] {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.categories;
    }

    return this.categories.filter(category =>
      category.name.toLowerCase().includes(search) ||
      category.description.toLowerCase().includes(search)
    );
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
    this.isEditMode = false;
    this.formCategory = this.createEmptyCategory();
    this.showForm = true;
  }

  openEditForm(category: AdminCategory): void {
    this.isEditMode = true;
    this.formCategory = { ...category };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveCategory(): void {
    const name = this.formCategory.name.trim();

    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    const duplicate = this.categories.some(category =>
      category.name.toLowerCase() === name.toLowerCase() &&
      category.id !== this.formCategory.id
    );

    if (duplicate) {
      alert('This category already exists.');
      return;
    }

    if (this.isEditMode) {
      this.categories = this.categories.map(category =>
        category.id === this.formCategory.id
          ? { ...this.formCategory, name }
          : category
      );
    } else {
      const newCategory: AdminCategory = {
        ...this.formCategory,
        id: Math.max(0, ...this.categories.map(c => c.id)) + 1,
        name
      };

      this.categories = [...this.categories, newCategory];
    }

    this.closeForm();
  }

  deleteCategory(category: AdminCategory): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${category.name}?`
    );

    if (confirmed) {
      this.categories = this.categories.filter(
        item => item.id !== category.id
      );
    }
  }
}
