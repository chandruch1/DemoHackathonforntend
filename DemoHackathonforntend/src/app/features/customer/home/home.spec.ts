import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductApiService } from '../../../core/services/product/product-api';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let productApi: { getProducts: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    productApi = {
      getProducts: vi.fn().mockReturnValue(of({
        items: [{
          productId: 7,
          name: 'API product',
          categoryId: 3,
          categoryName: 'API category',
          price: 4.5,
          availableQuantity: 2,
          isAvailable: true
        }],
        page: 1,
        pageSize: 8,
        totalCount: 1,
        totalPages: 1
      }))
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: ProductApiService, useValue: productApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the featured catalogue from the product API', () => {
    expect(productApi.getProducts).toHaveBeenCalledWith(1, 8);
    expect(component.products()[0].name).toBe('API product');
    expect(component.categories()).toEqual([
      { categoryId: 3, categoryName: 'API category' }
    ]);
  });
});
