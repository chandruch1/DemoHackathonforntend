import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddressDto, CreateAddressRequest } from '../../../core/models/address.model';
import { AddressApiService } from '../../../core/services/address/address-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-management.html',
  styleUrl: './address-management.css'
})
export class AddressManagement implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressApi = inject(AddressApiService);

  addresses = signal<AddressDto[]>([]);
  formVisible = signal(false);
  editingAddressId = signal<number | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  deletingAddressId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  form = signal<CreateAddressRequest>(this.emptyForm());

  ngOnInit(): void {
    this.loadAddresses();
  }

  private emptyForm(): CreateAddressRequest {
    return {
      recipientName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false
    };
  }

  updateForm(changes: Partial<CreateAddressRequest>): void {
    this.form.update(form => ({ ...form, ...changes }));
  }

  openAddForm(): void {
    this.editingAddressId.set(null);
    this.form.set(this.emptyForm());
    this.formVisible.set(true);
  }

  editAddress(address: AddressDto): void {
    this.editingAddressId.set(address.addressId);
    this.form.set({
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    this.formVisible.set(true);
  }

  saveAddress(): void {
    if (this.isSaving()) return;
    const form = this.form();
    const editingAddressId = this.editingAddressId();
    if (!form.recipientName.trim() || !form.phone.trim() || !form.addressLine1.trim() ||
      !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
      this.errorMessage.set('Please fill in all required address fields.');
      return;
    }

    const request = {
      ...form,
      addressLine2: form.addressLine2?.trim() || undefined
    };
    const operation = editingAddressId === null
      ? this.addressApi.createAddress(request)
      : this.addressApi.updateAddress(editingAddressId, request);

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(editingAddressId === null ? 'Address added.' : 'Address updated.');
        this.cancelForm();
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not save this address. Please try again.'));
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (this.isSaving() || this.deletingAddressId() !== null ||
      !confirm('Are you sure you want to delete this address?')) return;

    this.deletingAddressId.set(addressId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.addressApi.deleteAddress(addressId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.deletingAddressId.set(null);
        this.successMessage.set('Address deleted.');
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.deletingAddressId.set(null);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not delete this address. Please try again.'));
      }
    });
  }

  setDefault(addressId: number): void {
    if (this.isSaving() || this.deletingAddressId() !== null) return;
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.addressApi.setDefaultAddress(addressId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Default address updated.');
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not update the default address. Please try again.'));
      }
    });
  }

  retry(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.addressApi.getAddresses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: addresses => {
        this.addresses.set(addresses);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.addresses.set([]);
        this.errorMessage.set(getApiErrorMessage(error, 'We could not load your addresses. Please try again.'));
        this.isLoading.set(false);
      }
    });
  }

  cancelForm(): void {
    this.formVisible.set(false);
    this.editingAddressId.set(null);
    this.form.set(this.emptyForm());
  }
}
