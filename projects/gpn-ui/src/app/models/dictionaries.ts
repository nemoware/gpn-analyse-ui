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
        { id: 'AgencyContract' },
        { id: 'Renting' },
        { id: 'BankGuarantees' },
        { id: 'Charity' },
        { id: 'RelatedTransactions' },
        { id: 'GeneralContract' },
        { id: 'EmployeeContracts' },
        { id: 'Loans' },
        { id: 'PledgeEncumbrance' },
        { id: 'BigDeal' },
        { id: 'Liquidation' },
        { id: 'Service' },
        { id: 'CashPayments' },
        { id: 'RefusalToLeaseLand' },
        { id: 'DealGeneralBusiness' },
        { id: 'RevisionCommission' },
        { id: 'Reorganization' },
        { id: 'Deal' },
        { id: 'InterestedPartyTransaction' },
        { id: 'RelatedPartyTransaction' },
        { id: 'AssetTransactions' },
        { id: 'RealEstate' },
        { id: 'DealIntellectualProperty' },
        { id: 'RealEstateTransactions' },
        { id: 'SecuritiesTransactions' },
        { id: 'Insurance' },
        { id: 'RegisteredCapital' },
        { id: 'ParticipationInOtherOrganizations' },
        { id: 'DecisionsForSubsidiary' }
      ]
    },
    {
      id: 'Currency',
      values: [
        { id: 'RUB' },
        { id: 'EUR' },
        { id: 'USD' },
        { id: 'Percent' },
        { id: 'KZT' },
        { id: 'UAH' },
        { id: 'BYN' },
        { id: 'TJR' },
        { id: 'RSD' },
        { id: 'KGS' }
      ]
    },
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
