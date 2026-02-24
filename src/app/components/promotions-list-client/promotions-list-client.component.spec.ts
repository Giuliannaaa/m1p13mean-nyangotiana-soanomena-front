import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionsListClientComponent } from './promotions-list-client.component';

describe('PromotionsListClientComponent', () => {
  let component: PromotionsListClientComponent;
  let fixture: ComponentFixture<PromotionsListClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionsListClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionsListClientComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
