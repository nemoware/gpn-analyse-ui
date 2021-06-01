import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAuditAnalyseResultComponent } from './pre-audit-analyse-result.component';

describe('PreAuditAnalyseResultComponent', () => {
  let component: PreAuditAnalyseResultComponent;
  let fixture: ComponentFixture<PreAuditAnalyseResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreAuditAnalyseResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAuditAnalyseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
