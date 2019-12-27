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
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@root/node_modules/@angular/animations';
import { Helper } from '@app/features/audit/helper';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';

@Component({
  selector: 'gpn-violations-audit',
  templateUrl: './violations-audit.component.html',
  styleUrls: ['./violations-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [state('expanded', style({ height: '*' }))])
  ]
})
export class ViolationsAuditComponent implements OnInit {
  col: string[] = [
    'document',
    'founding_document',
    'reference',
    'violation_type',
    'violation_reason'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;
  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private translate: TranslateService
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
      case 'violation_reason': {
        return data.reference ? data.reference.type : 'null';
      }
    }
  }

  ngOnInit() {
    this.auditservice.getViolations(this.idAudit).subscribe(data => {
      if (data) {
        this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
        this.dataSource.sort = this.sort;
        this.dataSource.data = data;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  getKindAttribute(key: string) {
    const atr = Helper.parseKind(key);
    return atr.kind;
  }

  getViolation(row) {
    if (
      Object.prototype.toString.call(row.violation_type) === '[object String]'
    )
      return this.translate.instant(row.violation_type);
    else {
      return this.translate.instant(row.violation_type.type);
      const type = this.translate.instant(row.violation_type.type);
      const org_structural_level = row.violation_type.org_structural_level
        ? this.translate.instant(row.violation_type.org_structural_level)
        : '';
      const subject = row.violation_type.subject
        ? this.translate.instant(row.violation_type.subject)
        : '';
    }
  }

  openDocument(id, attribute?) {
    window.open(
      window.location.origin +
        '/#/audit/view/' +
        id +
        (attribute ? '?attribute=' + attribute : ''),
      '_blank'
    );
  }
}
