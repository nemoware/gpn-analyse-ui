export class ViewDetailDoc {
  private static typeDocs = [
    {
      type: 'CONTRACT',
      columns: [
        {
          key: 'documentNumber',
          name: '№',
          values: [{ key: 'documentNumber', attribute: false }]
        },
        {
          key: 'documentDate',
          name: 'Дата',
          values: [
            { key: 'documentDate', attribute: false, dateformat: 'dd.MM.yyyy' }
          ]
        },
        {
          key: 'type_name',
          name: 'Наименование',
          values: [
            { key: 'org-1-type', attribute: true },
            { key: 'org-1-name', attribute: true }
          ],
          attribute: true
        },
        {
          key: 'subject',
          name: 'Предмет',
          values: [{ key: 'subject', attribute: true }],
          attribute: true
        },
        {
          key: 'value_currency',
          name: 'Сумма',
          values: [
            { key: 'sign_value_currency/value', attribute: true },
            { key: 'sign_value_currency/currency', attribute: true }
          ],
          attribute: true
        }
      ]
    },
    {
      type: 'CHARTER',
      columns: [
        {
          key: 'documentNumber',
          name: '№',
          values: [{ key: 'documentNumber', attribute: false }]
        },
        {
          key: 'documentDate',
          name: 'Дата',
          values: [
            { key: 'documentDate', attribute: false, dateformat: 'dd.MM.yyyy' }
          ]
        },
        {
          key: 'type_name',
          name: 'Наименование',
          values: [
            { key: 'org-1-type', attribute: true },
            { key: 'org-1-name', attribute: true }
          ],
          attribute: true
        }
      ]
    },
    {
      type: 'PROTOCOL',
      columns: [
        {
          key: 'documentNumber',
          name: '№',
          values: [{ key: 'documentNumber', attribute: false }]
        },
        {
          key: 'documentDate',
          name: 'Дата',
          values: [
            { key: 'documentDate', attribute: false, dateformat: 'dd.MM.yyyy' }
          ]
        },
        {
          key: 'type_name',
          name: 'Наименование',
          values: [
            { key: 'org-1-type', attribute: true },
            { key: 'org-1-name', attribute: true }
          ],
          attribute: true
        }
      ]
    }
  ];

  public static getTypeDoc(type: string) {
    return this.typeDocs.find(x => x.type === type);
  }
}
