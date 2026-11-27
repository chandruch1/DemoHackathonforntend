import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AddressDto,
  CreateAddressRequest
} from '../../../core/models/address.model';

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-management.html',
  styleUrl: './address-management.css'
})
export class AddressManagement {

  addresses: AddressDto[] = [
    {
      addressId: 1,
      recipientName: 'Customer Name',
      phone: '9876543210',
      addressLine1: '12, Main Road',
      addressLine2: 'Near Bus Stand',
      city: 'Madurai',
      state: 'Tamil Nadu',
      postalCode: '625001',
      isDefault: true
    }
  ];

  formVisible = false;
  editingAddressId: number | null = null;

  form: CreateAddressRequest = this.emptyForm();

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
    if (this.form.isDefault) {
      this.addresses.forEach(address => {
        address.isDefault = false;
      });
    }

    if (this.editingAddressId !== null) {
      this.addresses = this.addresses.map(address =>
        address.addressId === this.editingAddressId
          ? { ...this.form, addressId: address.addressId }
          : address
      );
    } else {
      const newAddress: AddressDto = {
        ...this.form,
        addressId: Math.max(0, ...this.addresses.map(a => a.addressId)) + 1
      };

      this.addresses.push(newAddress);
    }

    if (this.addresses.length === 1) {
      this.addresses[0].isDefault = true;
    }

    this.cancelForm();
  }

  deleteAddress(addressId: number): void {
    this.addresses = this.addresses.filter(
      address => address.addressId !== addressId
    );

    if (this.addresses.length > 0 &&
        !this.addresses.some(address => address.isDefault)) {
      this.addresses[0].isDefault = true;
    }
  }

  setDefault(addressId: number): void {
    this.addresses = this.addresses.map(address => ({
      ...address,
      isDefault: address.addressId === addressId
    }));
  }

  cancelForm(): void {
    this.formVisible = false;
    this.editingAddressId = null;
    this.form = this.emptyForm();
  }
}