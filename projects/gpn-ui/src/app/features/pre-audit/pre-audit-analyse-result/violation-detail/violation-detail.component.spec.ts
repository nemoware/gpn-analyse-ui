import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationDetailComponent } from './violation-detail.component';

describe('ViolationDetailComponent', () => {
  let component: ViolationDetailComponent;
  let fixture: ComponentFixture<ViolationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViolationDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
