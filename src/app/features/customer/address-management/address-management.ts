import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  AddressDto,
  CreateAddressRequest
} from '../../../core/models/address.model';
import { AddressApiService } from '../../../core/services/address/address-api';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-management.html',
  styleUrl: './address-management.css'
})
export class AddressManagement {

  addresses: AddressDto[] = [];

  formVisible = false;
  editingAddressId: number | null = null;
  isLoading = true;
  isSaving = false;
  deletingAddressId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  form: CreateAddressRequest = this.emptyForm();

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
    this.editingAddressId = null;
    this.form = this.emptyForm();
    this.formVisible = true;
  }

  editAddress(address: AddressDto): void {
    this.editingAddressId = address.addressId;

    this.form = {
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    };

    this.formVisible = true;
  }

  saveAddress(): void {
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
      }
    });
  }

  setDefault(addressId: number): void {
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
      }
    });
  }

  cancelForm(): void {
    this.formVisible = false;
    this.editingAddressId = null;
    this.form = this.emptyForm();
  }
}