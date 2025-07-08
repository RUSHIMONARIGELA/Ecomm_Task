import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicProductsListComponent } from './public-products-list.component';

describe('PublicProductsListComponent', () => {
  let component: PublicProductsListComponent;
  let fixture: ComponentFixture<PublicProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProductsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
