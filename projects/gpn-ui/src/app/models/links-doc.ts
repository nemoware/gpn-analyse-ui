export class LinksDoc {
  private static typeDocs = [
    {
      type: 'CONTRACT',
      links: ['CHARTER', 'PROTOCOL', 'ANNEX']
    },
    {
      type: 'PROTOCOL',
      links: ['CONTRACT']
    },
    {
      type: 'CHARTER',
      links: ['CONTRACT']
    },
    {
      type: 'ANNEX',
      links: ['CONTRACT']
    },
    {
      type: 'SUPPLEMENTARY_AGREEMENT',
      links: []
    }
  ];

  static getLinksType(typeDoc: string) {
    return this.typeDocs.find(x => x.type === typeDoc);
  }
}
