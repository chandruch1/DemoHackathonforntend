import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryApiService } from '../../../../core/services/category/category-api';
import { ProductApiService } from '../../../../core/services/product/product-api';
import { ProductList } from './product-list';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let productApi: { getProducts: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    productApi = {
      getProducts: vi.fn().mockReturnValue(of({
        items: [],
        page: 1,
        pageSize: 6,
        totalCount: 0,
        totalPages: 0
      }))
    };

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        { provide: ProductApiService, useValue: productApi },
        { provide: CategoryApiService, useValue: { getCategories: vi.fn().mockReturnValue(of([])) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the initial page from the product API', () => {
    expect(productApi.getProducts).toHaveBeenCalledWith(1, 9, '', undefined);
  });
});
