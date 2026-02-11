import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSignalementsComponent } from './mes-signalements.component';

describe('MesSignalementsComponent', () => {
  let component: MesSignalementsComponent;
  let fixture: ComponentFixture<MesSignalementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesSignalementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesSignalementsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
