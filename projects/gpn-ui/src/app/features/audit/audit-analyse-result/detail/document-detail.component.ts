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


const cols_by_type = {
  'CONTRACT': ['date', 'number', 'value', 'org1', 'org2', 'contract_subject', 'analyze_state'],
  'CHARTER': ['shevron','date', 'org', 'analyze_state'],
  'PROTOCOL': ['date', 'number', 'org','org_level', 'analyze_state']
}


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
  dataSource: [];
  documentType: any;
  expandedElementId = '';
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  documentTypeName=null

  isExpansionDetailRow = (i: number, row: Object) => true;

  ngOnInit() {
    

    this.dataSource = this.documents.docs;
    this.documentTypeName=null
    if (this.documents.docs && this.documents.docs.length > 0) {
      this.documentTypeName = this.documents.docs[0].documentType
      this.col=cols_by_type[this.documentTypeName]
      this.documentType = ViewDetailDoc.getTypeDoc(
        this.documents.docs[0].documentType
      );
    }

  }

  getAttrValue(attrName:string, doc){
    const atr = doc.attributes.find(x => x.key === attrName);
    if (atr) return atr.value;
    return null;
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
