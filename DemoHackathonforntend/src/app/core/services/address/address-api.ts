import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressDto, CreateAddressRequest } from '../../models/address.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/customers/me/addresses`;

  getAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(this.baseUrl);
  }

  createAddress(request: CreateAddressRequest): Observable<AddressDto> {
    return this.http.post<AddressDto>(this.baseUrl, request);
  }

  updateAddress(addressId: number, request: CreateAddressRequest): Observable<AddressDto> {
    return this.http.put<AddressDto>(`${this.baseUrl}/${addressId}`, request);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${addressId}`);
  }

  setDefaultAddress(addressId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${addressId}/default`, {});
  }
}