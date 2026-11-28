import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AddressApiService } from '../../../core/services/address/address-api';
import { AddressManagement } from './address-management';

describe('AddressManagement', () => {
  let component: AddressManagement;
  let fixture: ComponentFixture<AddressManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressManagement],
      providers: [{
        provide: AddressApiService,
        useValue: { getAddresses: () => of([]) }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
