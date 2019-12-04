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
          key: 'viewDetail',
          name: '',
          values: []
        },
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
      ],
      children: {
        rowHead: [
          'ShareholdersGeneralMeeting',
          'BoardOfDirectors',
          'CEO',
          'AllMembers',
          'BoardOfCompany'
        ],
        rowChild: [
          'Charity',
          'Deal',
          'PropertyDeal',
          'Consulting',
          'Other',
          'Lawsuit',
          'RealEstate'
        ],
        getTreeAttributes(attributes): any[] {
          const tree = [];
          const parentNode = attributes.filter(x =>
            this.rowHead.includes(x.kind)
          );
          for (const p of parentNode) {
            let parent = tree.find(x => name === p.kind);
            if (!parent) {
              parent = { name: p.kind, children: [] };
              tree.push(parent);
            }
            const childNode = attributes.filter(
              x =>
                this.rowChild.includes(x.kind) && x.parent.includes(parent.name)
            );
            for (const c of childNode) {
              if (!parent.children.find(x => x.name === c.kind)) {
                parent.children.push({ name: c.kind, children: [] });
              }
            }
          }

          for (const p of tree) {
            for (const c of p.children) {
              let currency = null;
              const min = attributes.filter(
                x =>
                  x.parent &&
                  x.parent.includes(p.name) &&
                  x.parent.includes(c.name) &&
                  x.kind === 'constraint-min'
              );
              const max = attributes.filter(
                x =>
                  x.parent &&
                  x.parent.includes(p.name) &&
                  x.parent.includes(c.name) &&
                  x.kind === 'constraint-max'
              );
              if (min.length > 0) {
                const value = attributes.find(
                  x => x.parent && x.parent === min[0].key && x.kind === 'value'
                );
                currency = attributes.find(
                  x =>
                    x.parent && x.parent === min[0].key && x.kind === 'currency'
                );
                if (value) c.min = value.value;
              }

              if (max.length > 0) {
                const value = attributes.find(
                  x => x.parent && x.parent === max[0].key && x.kind === 'value'
                );
                currency = attributes.find(
                  x =>
                    x.parent && x.parent === max[0].key && x.kind === 'currency'
                );
                if (value) c.max = value.value;
              }
              if (currency) c.currency = currency.value;
            }
          }

          return tree;
        }
      }
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
