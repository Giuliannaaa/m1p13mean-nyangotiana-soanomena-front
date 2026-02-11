import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSuivisComponent } from './mes-suivis.component';

describe('MesSuivisComponent', () => {
  let component: MesSuivisComponent;
  let fixture: ComponentFixture<MesSuivisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesSuivisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesSuivisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
