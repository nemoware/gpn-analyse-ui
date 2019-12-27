export class Dictionaries {
  private static dictionaries = [
    {
      id: 'Sign',
      values: [
        { id: '-1', name: 'Less' },
        { id: '0', name: 'Equally' },
        { id: '1', name: 'More' }
      ]
    },
    {
      id: 'Subject',
      values: [
        { id: 'Charity' },
        { id: 'Deal' },
        { id: 'RealEstate' },
        { id: 'Lawsuit' },
        { id: 'Other' }
      ]
    },
    { id: 'Currency', values: [{ id: 'RUB' }, { id: 'EUR' }, { id: 'USD' }] },
    {
      id: 'StructuralLevel',
      values: [
        { id: 'BoardOfCompany' },
        { id: 'CEO' },
        { id: 'BoardOfDirectors' },
        { id: 'ShareholdersGeneralMeeting' },
        { id: 'AllMembers' }
      ]
    }
  ];

  public static getDictionary(id: string) {
    const newDictionary = [];
    const dictionary = this.dictionaries.find(x => x.id === id);
    dictionary.values.forEach(x =>
      newDictionary.push({ id: x.id, value: x.name ? x.name : x.id })
    );
    return newDictionary;
  }
}
