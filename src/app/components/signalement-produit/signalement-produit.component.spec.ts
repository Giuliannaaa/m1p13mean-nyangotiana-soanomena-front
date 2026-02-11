import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalementProduitComponent } from './signalement-produit.component';

describe('SignalementProduitComponent', () => {
  let component: SignalementProduitComponent;
  let fixture: ComponentFixture<SignalementProduitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalementProduitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalementProduitComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
