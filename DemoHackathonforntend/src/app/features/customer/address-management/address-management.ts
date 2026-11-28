<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
=======
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  AddressDto,
  CreateAddressRequest
} from '../../../core/models/address.model';
import { AddressApiService } from '../../../core/services/address/address-api';
<<<<<<< HEAD
=======
import { getApiErrorMessage } from '../../../core/utils/api-error-message';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-management.html',
  styleUrl: './address-management.css'
})
export class AddressManagement implements OnInit {
  private readonly addressApi = inject(AddressApiService);

<<<<<<< HEAD
  addresses = signal<AddressDto[]>([]);
  formVisible = signal(false);
  editingAddressId = signal<number | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  form = signal<CreateAddressRequest>(this.emptyForm());
=======
  addresses: AddressDto[] = [];

  formVisible = false;
  editingAddressId: number | null = null;
  isLoading = true;
  isSaving = false;
  deletingAddressId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading.set(true);
    this.addressApi.getAddresses().subscribe({
      next: data => {
        this.addresses.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load addresses.');
        this.isLoading.set(false);
      }
    });
  }

  private readonly destroyRef = inject(DestroyRef);
  private readonly addressApi = inject(AddressApiService);

  constructor() {
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

  updateForm(changes: Partial<CreateAddressRequest>): void {
    this.form.update(form => ({ ...form, ...changes }));
  }

  saveAddress(): void {
<<<<<<< HEAD
    const form = this.form();
    const editingAddressId = this.editingAddressId();
    if (
      !form.recipientName?.trim() ||
      !form.phone?.trim() ||
      !form.addressLine1?.trim() ||
      !form.city?.trim() ||
      !form.state?.trim() ||
      !form.postalCode?.trim()
    ) {
      alert('Please fill in all required address fields.');
      return;
    }

    if (editingAddressId !== null) {
      this.addressApi.updateAddress(editingAddressId, form).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to update address.');
        }
      });
    } else {
      this.addressApi.createAddress(form).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelForm();
        },
        error: err => {
          alert(err?.error?.message || 'Failed to save address.');
        }
      });
    }
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.addressApi.deleteAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: err => {
        alert(err?.error?.message || 'Failed to delete address.');
=======
    if (this.isSaving) {
      return;
    }

    const request: CreateAddressRequest = {
      ...this.form,
      addressLine2: this.form.addressLine2?.trim() || undefined
    };
    const editingAddressId = this.editingAddressId;
    const operation = editingAddressId === null
      ? this.addressApi.createAddress(request)
      : this.addressApi.updateAddress(editingAddressId, request);

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;
    operation.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = editingAddressId === null
          ? 'Address added.'
          : 'Address updated.';
        this.cancelForm();
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not save this address. Please try again.'
        );
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (
      this.isSaving ||
      this.deletingAddressId !== null ||
      !confirm('Are you sure you want to delete this address?')
    ) {
      return;
    }

    this.deletingAddressId = addressId;
    this.errorMessage = null;
    this.successMessage = null;
    this.addressApi.deleteAddress(addressId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.deletingAddressId = null;
        this.successMessage = 'Address deleted.';
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.deletingAddressId = null;
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not delete this address. Please try again.'
        );
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
      }
    });
  }

  setDefault(addressId: number): void {
<<<<<<< HEAD
    this.addressApi.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: err => {
        alert(err?.error?.message || 'Failed to set default address.');
=======
    const address = this.addresses.find(item => item.addressId === addressId);
    if (!address || this.isSaving || this.deletingAddressId !== null) {
      return;
    }

    const request: CreateAddressRequest = {
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: true
    };

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.addressApi.updateAddress(addressId, request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Default address updated.';
        this.loadAddresses();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not update the default address. Please try again.'
        );
      }
    });
  }

  retry(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.addressApi.getAddresses().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: addresses => {
        this.addresses = addresses;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.addresses = [];
        this.errorMessage = getApiErrorMessage(
          error,
          'We could not load your addresses. Please try again.'
        );
        this.isLoading = false;
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
      }
    });
  }

  cancelForm(): void {
    this.formVisible.set(false);
    this.editingAddressId.set(null);
    this.form.set(this.emptyForm());
  }
}
