import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { ViolationModel } from '@app/models/violation-model';

@Component({
  selector: 'gpn-violations-audit',
  templateUrl: './violations-audit.component.html',
  styleUrls: ['./violations-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViolationsAuditComponent implements OnInit {
  col: string[] = [
    'document',
    'founding_document',
    'item',
    'violation_type',
    'base'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;
  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    return this.getAttrValue(sortHeaderId, data);
  };

  getAttrValue(attr, data) {
    switch (attr) {
      case 'violation_type': {
        return data.violation_type;
      }
      case 'document': {
        return data.document.type;
      }
      case 'founding_document': {
        return data.founding_document ? data.founding_document.type : 'null';
      }
      case 'base': {
        return data.reference ? data.reference.type : 'null';
      }
    }
  }

  ngOnInit() {
    this.auditservice.getViolations(this.idAudit).subscribe(data => {
      this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
      this.dataSource.sort = this.sort;
      this.dataSource.data = data;
      this.changeDetectorRefs.detectChanges();
    });
  }
}
