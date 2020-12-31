import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { AttributeModel } from '@app/models/attribute-model';

// const dummy = [
//   {
//     code: 'org_name_not_found'
//   },
//   {
//     code: 'org_type_not_found'
//   },
//   {
//     code: 'org_struct_level_not_found'
//   },
//   {
//     code: 'date_not_found'
//   },
//   {
//     code: 'number_not_found'
//   },
//   {
//     code: 'value_section_not_found'
//   },
//   {
//     code: 'contract_value_not_found'
//   },
//   {
//     code: 'subject_section_not_found'
//   },
//   {
//     code: 'contract_subject_not_found'
//   },
//   {
//     code: 'protocol_agenda_not_found'
//   },
//   {
//     code: 'boring_agenda_questions'
//   },
//   {
//     code: 'contract_subject_section_not_found'
//   },
//   {
//     code: 'doc_too_big'
//   },
// ]

const codes_by_type = {
  CONTRACT: [
    'org_name_not_found',
    'org_type_not_found',
    'date_not_found',
    'number_not_found',
    'value_section_not_found',
    'contract_value_not_found',
    'contract_subject_not_found',
    'doc_too_big'
  ],
  CHARTER: [
    'org_name_not_found',
    'org_type_not_found',
    'date_not_found',
    'doc_too_big'
  ],
  PROTOCOL: [
    'org_name_not_found',
    'org_type_not_found',
    'date_not_found',
    'protocol_agenda_not_found',
    'boring_agenda_questions',
    'org_struct_level_not_found'
  ],
  ANNEX: [],
  SUPPLEMENTARY_AGREEMENT: [
    'org_name_not_found',
    'org_type_not_found',
    'date_not_found',
    'number_not_found',
    'value_section_not_found',
    'contract_value_not_found',
    'contract_subject_not_found',
    'doc_too_big'
  ]
};

@Component({
  selector: 'gpn-document-warnings',
  templateUrl: './document-warnings.component.html',
  styleUrls: ['./document-warnings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentWarningsComponent implements OnInit {
  @Input()
  documentType: string;
  @Input()
  analysisWarnings: any[];
  @Input()
  attributes: Array<AttributeModel>;
  @Input()
  showIcon = false;
  warnings: any[];

  constructor() {}

  ngOnInit() {}

  hasWarnings(): boolean {
    this.warnings = [];
    this.analysisWarnings.forEach(warning => {
      if (codes_by_type[this.documentType].includes(warning.code)) {
        switch (warning.code) {
          case 'org_name_not_found':
            const org_name = this.getAttrValue('org-1-name');
            if (!org_name) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'org_type_not_found':
            const org_type = this.getAttrValue('org-1-type');
            if (!org_type) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'org_struct_level_not_found':
            const org_struct = this.getAttrValue('org_structural_level');
            if (!org_struct) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'date_not_found':
            const date = this.getAttrValue('date');
            if (!date) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'number_not_found':
            const number = this.getAttrValue('number');
            if (!number) {
              this.warnings.push({ code: warning.code });
            }
            break;
          // case 'value_section_not_found':
          //   const value_section = this.getAttrValue('sign_value_currency');
          //   if (!value_section){
          //     this.warnings.push({code: warning.code});
          //   }
          //   break;
          case 'contract_value_not_found':
            const value = this.getAttrValue('sign_value_currency/value');
            if (!value) {
              this.warnings.push({ code: warning.code });
            }
            break;
          // case 'subject_section_not_found':
          //   const subject_section = this.getAttrValue('subject');
          //   if (!subject_section){
          //     this.warnings.push(warning.code);
          //   }
          //   break;
          case 'contract_subject_not_found':
            const contract_subject = this.getAttrValue('subject');
            if (!contract_subject) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'protocol_agenda_not_found':
            const agenda = this.getAttrValue('agenda_item');
            console.log(agenda);
            if (!agenda) {
              this.warnings.push({ code: warning.code });
            }
            break;
          case 'boring_agenda_questions':
            this.warnings.push({ code: warning.code });
            break;
          // case 'contract_subject_section_not_found':
          //   const contract_subject_section = this.getAttrValue('subject');
          //   if (!contract_subject_section){
          //     this.warnings.push(warning.code);
          //   }
          //   break;
          case 'doc_too_big':
            this.warnings.push({ code: warning.code });
            break;
        }
      }
    });
    return this.warnings && this.warnings.length > 0;
  }

  getAttrValue(attrName: string, default_value = null) {
    if (this.attributes) {
      if (attrName === 'agenda_item') {
        const agenda = this.attributes.find(x => x.kind === attrName);
        if (agenda) {
          return true;
        }
      }
      const atr = this.attributes.find(x => x.key === attrName);
      if (atr) return atr.value;
    }
    return default_value;
  }
}
