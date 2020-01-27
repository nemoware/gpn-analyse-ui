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

        { id: 'BigDeal' },
        { id: 'InterestedPartyTransaction' },
        { id: 'RelatedTransactions' },
        { id: 'RelatedPartyTransaction' },
        { id: 'AssetTransaction' },
        { id: 'RealEstateTransaction' },
        { id: 'RealEstateLease' },
        { id: 'LeasingRealEstate' },
        { id: 'RefusalToLeaseLand' },
        { id: 'AgencyContract' },
        { id: 'Service' },
        { id: 'Insurance' },
        { id: 'GeneralContract' },
        { id: 'SecuritiesTransactions' },
        { id: 'PledgeEncumbrance' },
        { id: 'CashPayments' },
        { id: 'Credits' },
        { id: 'BankGuarantees' },
        { id: 'DecisionsForSubsidiary' },
        { id: 'RevisionCommission' },
        { id: 'ParticipationInOtherOrganizations' },
        { id: 'EmployeeContracts' },
        { id: 'RegisteredCapital' },

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
