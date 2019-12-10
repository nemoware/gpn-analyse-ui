export class LinksDoc {
  private static typeDocs = [
    {
      type: 'CONTRACT',
      links: ['CHARTER', 'PROTOCOL']
    },
    {
      type: 'PROTOCOL',
      links: ['CONTRACT']
    },
    {
      type: 'CHARTER',
      links: ['CONTRACT']
    }
  ];

  static getLinksType(typeDoc: string) {
    return this.typeDocs.find(x => x.type === typeDoc);
  }
}
