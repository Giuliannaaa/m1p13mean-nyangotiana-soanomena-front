import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchatAddComponent } from './achat-add.component';

describe('AchatAddComponent', () => {
  let component: AchatAddComponent;
  let fixture: ComponentFixture<AchatAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchatAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchatAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
