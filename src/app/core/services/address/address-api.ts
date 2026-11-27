import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AddressDto,
  CreateAddressRequest
} from '../../models/address.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers/me/addresses`;

  getAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(this.apiUrl);
  }

  createAddress(request: CreateAddressRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  updateAddress(
    addressId: number,
    request: CreateAddressRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${addressId}`, request);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${addressId}`);
  }
}
