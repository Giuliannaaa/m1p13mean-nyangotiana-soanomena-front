import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitAddComponent } from './produit-add.component';

describe('ProduitAddComponent', () => {
  let component: ProduitAddComponent;
  let fixture: ComponentFixture<ProduitAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
