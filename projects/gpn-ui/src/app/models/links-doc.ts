export class LinksDoc {
  private static typeDocs = [
    {
      type: 'CONTRACT',
      links: ['CHARTER', 'PROTOCOL', 'ANNEX', 'SUPPLEMENTARY_AGREEMENT']
    },
    {
      type: 'PROTOCOL',
      links: ['CONTRACT']
    },
    {
      type: 'CHARTER',
      links: []
    },
    {
      type: 'ANNEX',
      links: ['CONTRACT', 'SUPPLEMENTARY_AGREEMENT']
    },
    {
      type: 'SUPPLEMENTARY_AGREEMENT',
      links: ['CONTRACT', 'ANNEX']
    }
  ];

  static getLinksType(typeDoc: string) {
    return this.typeDocs.find(x => x.type === typeDoc);
  }
}
