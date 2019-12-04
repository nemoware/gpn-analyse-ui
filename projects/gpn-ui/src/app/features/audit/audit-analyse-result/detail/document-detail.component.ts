import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { Document } from '@app/models/document.model';
import { ViewDetailDoc } from '@app/models/view.detail.doc';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { DatePipe } from '@root/node_modules/@angular/common';
import { Router } from '@root/node_modules/@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@root/node_modules/@angular/animations';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'gpn-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('100ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class DocumentDetailComponent implements OnInit {
  @Input() documents: any;
  header: string;
  constructor(
    private translate: TranslateService,
    public datepipe: DatePipe,
    private router: Router
  ) {}
  col: string[] = [];
  columns: any[] = [];
  dataSource: [];
  documentType: any;
  expandedElementId = '';
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  isExpansionDetailRow = (i: number, row: Object) => true;

  ngOnInit() {
    this.dataSource = this.documents.docs;
    if (this.documents.docs && this.documents.docs.length > 0) {
      this.documentType = ViewDetailDoc.getTypeDoc(
        this.documents.docs[0].documentType
      );
      for (const h of this.documentType.columns) {
        this.columns.push(h);
        this.col.push(h.key);
      }
    }
  }

  getValue(col, element) {
    let result = null;
    for (const v of col.values) {
      let value = null;
      if (v.attribute) {
        const atr = element.attributes.find(x => x.key === v.key);
        if (atr) value = atr.value;
      } else {
        let atr = null;
        if (v.key === 'documentNumber') atr = element.documentNumber;
        else if (v.key === 'documentDate') atr = element.documentDate;
        if (atr) value = atr;
      }
      if (value) {
        if (v.dateformat) {
          value = this.datepipe.transform(value, v.dateformat);
        } else value = this.translate.instant(value.toString());
        result = result != null ? result + ' ' + value : value;
      }
    }
    return result;
  }

  openDocument(element) {
    this.router.navigate(['audit/view/', element._id]);
  }

  selectedRow(value, event) {
    this.expandedElementId =
      value._id !== this.expandedElementId ? value._id : '-1';
    event.stopPropagation();
  }
}
