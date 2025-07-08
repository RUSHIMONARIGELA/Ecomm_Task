import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { CategoryDTO } from '../../../models/category-models';
import { CategoryService } from '../../../services/category.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-category',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.css'
})
export class AdminCategoryComponent {
categories: CategoryDTO[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Form properties
  newCategory: CategoryDTO = { name: '', description: '' };
  editingCategory: CategoryDTO | null = null; // Holds category being edited
  submitting = false; // To disable buttons during API calls

  private categoryService = inject(CategoryService);

  constructor() { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    this.categoryService.getAllCategories().subscribe({
      next: (data: CategoryDTO[]) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        console.error('AdminCategoryComponent: Error fetching categories:', err);
        if (err.error && typeof err.error === 'string') {
          this.error = `Failed to load categories: ${err.error}`;
        } else if (err.error && err.error.message) {
          this.error = `Failed to load categories: ${err.error.message}`;
        }
      }
    });
  }

  addCategory(): void {
    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    if (!this.newCategory.name.trim()) {
      this.error = 'Category name cannot be empty.';
      this.submitting = false;
      return;
    }

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (data: CategoryDTO) => {
        this.successMessage = `Category '${data.name}' added successfully!`;
        this.newCategory = { name: '', description: '' }; // Reset form
        this.loadCategories(); // Reload list
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to add category.';
        this.submitting = false;
        console.error('AdminCategoryComponent: Error adding category:', err);
        if (err.status === 400 && err.error && typeof err.error === 'string') {
          this.error = `Failed to add category: ${err.error}`; // Specific backend message
        } else if (err.error && err.error.message) {
          this.error = `Failed to add category: ${err.error.message}`;
        }
      }
    });
  }

  editCategory(category: CategoryDTO): void {
    // Create a copy to avoid direct modification of the list item
    this.editingCategory = { ...category };
    this.error = null;
    this.successMessage = null;
  }

  updateCategory(): void {
    if (!this.editingCategory || !this.editingCategory.id) {
      this.error = 'No category selected for update.';
      return;
    }
    if (!this.editingCategory.name.trim()) {
      this.error = 'Category name cannot be empty.';
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    this.categoryService.updateCategory(this.editingCategory.id, this.editingCategory).subscribe({
      next: (data: CategoryDTO) => {
        this.successMessage = `Category '${data.name}' updated successfully!`;
        this.editingCategory = null; // Exit edit mode
        this.loadCategories(); // Reload list
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to update category.';
        this.submitting = false;
        console.error('AdminCategoryComponent: Error updating category:', err);
        if (err.status === 400 && err.error && typeof err.error === 'string') {
          this.error = `Failed to update category: ${err.error}`;
        } else if (err.error && err.error.message) {
          this.error = `Failed to update category: ${err.error.message}`;
        }
      }
    });
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.error = null;
    this.successMessage = null;
  }

  deleteCategory(id: number | undefined): void {
    if (id === undefined) {
      console.error('Cannot delete category: ID is undefined.');
      this.error = 'Error deleting category: ID is missing.';
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This cannot be undone and may affect linked products.')) {
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully!';
        this.loadCategories(); // Reload list
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to delete category.';
        this.submitting = false;
        console.error('AdminCategoryComponent: Error deleting category:', err);
        if (err.status === 409) { // Conflict, likely due to linked products
          this.error = `Failed to delete category: It is currently linked to one or more products. Please reassign or delete linked products first.`;
        } else if (err.error && typeof err.error === 'string') {
          this.error = `Failed to delete category: ${err.error}`;
        } else if (err.error && err.error.message) {
          this.error = `Failed to delete category: ${err.error.message}`;
        }
      }
    });
  }
}
