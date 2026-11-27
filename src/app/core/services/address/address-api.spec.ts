import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AddressDto, CreateAddressRequest } from '../../models/address.model';
import { environment } from '../../../../environments/environment';
import { AddressApiService } from './address-api';

describe('AddressApiService', () => {
  let service: AddressApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AddressApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the signed-in customer addresses from the configured API', () => {
    const addresses: AddressDto[] = [];

    service.getAddresses().subscribe(response => {
      expect(response).toEqual(addresses);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/customers/me/addresses`
    );
    expect(request.request.method).toBe('GET');
    request.flush(addresses);
  });

  it('creates, updates, and deletes addresses using the documented endpoints', () => {
    const address: CreateAddressRequest = {
      recipientName: 'Customer',
      phone: '9876543210',
      addressLine1: '12 Main Road',
      city: 'Madurai',
      state: 'Tamil Nadu',
      postalCode: '625001',
      isDefault: true
    };

    service.createAddress(address).subscribe();
    const createRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/customers/me/addresses`
    );
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual(address);
    createRequest.flush(null);

    service.updateAddress(6, address).subscribe();
    const updateRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/customers/me/addresses/6`
    );
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual(address);
    updateRequest.flush(null);

    service.deleteAddress(6).subscribe();
    const deleteRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/customers/me/addresses/6`
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });
});
