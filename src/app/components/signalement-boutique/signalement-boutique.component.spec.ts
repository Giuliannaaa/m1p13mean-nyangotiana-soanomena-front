import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalementBoutiqueComponent } from './signalement-boutique.component';

describe('SignalementBoutiqueComponent', () => {
  let component: SignalementBoutiqueComponent;
  let fixture: ComponentFixture<SignalementBoutiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalementBoutiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalementBoutiqueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
