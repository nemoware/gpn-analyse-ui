import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAuditDetailComponent } from './pre-audit-detail.component';

describe('PreAuditDetailComponent', () => {
  let component: PreAuditDetailComponent;
  let fixture: ComponentFixture<PreAuditDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreAuditDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAuditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
