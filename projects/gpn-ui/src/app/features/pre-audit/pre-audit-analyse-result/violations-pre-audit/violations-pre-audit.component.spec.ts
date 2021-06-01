import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationsPreAuditComponent } from './violations-pre-audit.component';

describe('ViolationsPreAuditComponent', () => {
  let component: ViolationsPreAuditComponent;
  let fixture: ComponentFixture<ViolationsPreAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViolationsPreAuditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationsPreAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
