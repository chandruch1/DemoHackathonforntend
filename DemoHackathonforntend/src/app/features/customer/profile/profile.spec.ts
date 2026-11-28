import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserSummaryDto } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/auth/auth';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  const user: UserSummaryDto = {
    userId: 'customer-1',
    fullName: 'Test Customer',
    email: 'customer@example.com',
    phone: '9876543210',
    role: 'Customer'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{
        provide: AuthService,
        useValue: {
          currentUser: () => user,
          getCurrentUser: vi.fn().mockReturnValue(of(user))
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
