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
  'CHARTER': ['shevron', 'date', 'org', 'analyze_state'],
  'PROTOCOL': ['date', 'org', 'org_level', 'analyze_state']
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
  col: string[] = [];
  dataSource: [];
  documentType: any;
  expandedElementId = '';
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  documentTypeName = null
  
  constructor(
    private translate: TranslateService,
    public datepipe: DatePipe,
    private router: Router
  ) { }
  

  isExpansionDetailRow = (i: number, row: Object) => true;

  ngOnInit() {

    const docs = this.documents.docs;// shortcut
    this.dataSource = docs;
    this.documentTypeName = null
    if (docs && docs.length > 0) {
      this.documentTypeName = docs[0].documentType

      this.col = cols_by_type[this.documentTypeName].map(x => x)
      this.documentType = ViewDetailDoc.getTypeDoc(
        docs[0].documentType
      );

      if (this._isAllOrgsSame(docs, 'org-1-name')) {
        let index = this.col.indexOf('org1', 0);
        if (index > -1) {
          this.col.splice(index, 1);
        }

        index = this.col.indexOf('org', 0);
        if (index > -1) {
          this.col.splice(index, 1);
        }
      }
    }

  }

  _isAllOrgsSame(docs, keyname: string): boolean {    
    const val0 = this.getAttrValue(keyname, docs[0]) //TODO: replace with audit subsidiary name
    for (const doc of docs) {
      if (val0 !== this.getAttrValue(keyname, doc)) {
        return false;
      }
    }
    return true;
  }

  getAttrValue(attrName: string, doc, default_value = null) {
    const atr = doc.attributes.find(x => x.key === attrName);
    if (atr) return atr.value;
    return default_value;
  }

  getDocStateClass(doc) {
    return 'state state-' + doc.state
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
