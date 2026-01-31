import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueAddComponent } from './boutique-add.component';

describe('BoutiqueAddComponent', () => {
  let component: BoutiqueAddComponent;
  let fixture: ComponentFixture<BoutiqueAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
