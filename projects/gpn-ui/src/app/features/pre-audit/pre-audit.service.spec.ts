import { TestBed } from '@angular/core/testing';

import { PreAuditService } from './pre-audit.service';

describe('PreAuditService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreAuditService = TestBed.get(PreAuditService);
    expect(service).toBeTruthy();
  });
});
