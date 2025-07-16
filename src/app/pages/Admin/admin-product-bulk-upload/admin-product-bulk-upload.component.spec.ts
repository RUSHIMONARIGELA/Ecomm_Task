import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductBulkUploadComponent } from './admin-product-bulk-upload.component';

describe('AdminProductBulkUploadComponent', () => {
  let component: AdminProductBulkUploadComponent;
  let fixture: ComponentFixture<AdminProductBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductBulkUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
