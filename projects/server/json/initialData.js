exports.initialData = [
  {
    name: 'Dictionary',
    values: [
      {
        _id: 'Subject',
        values: ['Charity', 'Deal', 'PropertyDeal']
      }
    ]
  },
  {
    name: 'DocumentType',
    values: [
      {
        _id: 'CONTRACT',
        attributes: [
          {
            kind: 'org_1_name',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_1_alias',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_1_type',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_2_name',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_2_alias',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_2_type',
            type: 'string',
            editable: false
          },
          {
            kind: 'subject',
            type: 'dictionary',
            dictionaryName: 'Subject',
            editable: true
          },
          {
            kind: 'value',
            type: 'number',
            editable: true
          },
          {
            kind: 'currency',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_1_alt_name',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_2_alt_name',
            type: 'string',
            editable: false
          },
          {
            kind: 'org_1_type_ext',
            type: 'string',
            editable: false
          }
        ]
      },
      {
        _id: 'SUPPLEMENTARY_AGREEMENT',
        attributes: []
      },
      {
        _id: 'UNKNOWN',
        attributes: []
      },
      {
        _id: 'ANNEX',
        attributes: []
      },
      {
        _id: 'CHARTER',
        attributes: []
      },
      {
        _id: 'PROTOCOL',
        attributes: [
          {
            kind: 'org_1_name',
            type: 'string',
            editable: true
          },
          {
            kind: 'org_1_type',
            type: 'string',
            editable: true
          },
          {
            kind: 'org_structural_level',
            type: 'string',
            editable: true
          }
        ]
      },
      {
        _id: 'REGULATION',
        attributes: []
      },
      {
        _id: 'CHARITY_POLICY',
        attributes: []
      },
      {
        _id: 'ORDER',
        attributes: []
      },
      {
        _id: 'WORK_PLAN',
        attributes: []
      }
    ]
  },
  {
    name: 'Role',
    values: [
      {
        _id: '1',
        name: 'RAudit',
        description: 'Role #1 - Audit',
        appPage: 'audit'
      },
      {
        _id: '2',
        name: 'RAnalyse',
        description: 'Role #2 - Analyse',
        appPage: 'analyse'
      },
      {
        _id: '3',
        name: 'RAdmin',
        description: 'Role #3 - Admin',
        appPage: 'admin'
      },
      {
        _id: '4',
        name: 'REvents',
        description: 'Role #4 - Events',
        appPage: 'event'
      }
    ]
  },
  {
    name: 'Subsidiary',
    values: [
      {
        name: 'АО «Арктика Медиа»'
      },
      {
        name: 'ООО "ИПП "Мастерская печати" '
      },
      {
        name: 'ООО "РИА "Город"'
      },
      {
        name: 'АО «Газпромнефть – Аэро»'
      },
      {
        name: 'ООО «Газпромнефть Марин Бункер»'
      },
      {
        name: 'ТОО «Газпромнефть – Битум Казахстан»'
      },
      {
        name: 'АО «Совхимтех»'
      },
      {
        name: 'ООО «Газпромнефть-СМ»'
      },
      {
        name: 'Газпромнефть Лубрикантс Италия'
      },
      {
        name: 'ООО "Газпромнефть Лубрикантс Украина"'
      },
      {
        name: 'АО "Газпромнефть-ОНПЗ"'
      },
      {
        name: 'ООО "Газпромнефть-Каталитические системы"'
      },
      {
        name: 'ООО "Газпромнефть-Энергосервис"'
      },
      {
        name: 'ООО «Газпромнефть-Логистика»'
      },
      {
        name: 'ООО «Газпромнефть-Битумные материалы»'
      },
      {
        name: 'ООО «Газпромнефть-Рязанский завод битумных материалов»'
      },
      {
        name: 'ООО «Газпромнефть-Тоталь ПМБ»'
      },
      {
        name: 'ООО «НОВА-БРИТ»'
      },
      {
        name: 'ООО «Транс-Реал»'
      },
      {
        name: 'АО «Газпромнефть-МНПЗ»'
      },
      {
        name: 'ООО "Нефтехимремонт"'
      },
      {
        name: 'ООО "РМЗ "ГПН-ОНПЗ"'
      },
      {
        name: 'ООО "Альянс-Ойл-Азия"'
      },
      {
        name: 'ООО "Моснефтепродукт"'
      },
      {
        name: 'ООО "Битумные Терминалы"'
      },
      {
        name: 'ООО "БСВ-ХИМ"'
      },
      {
        name: 'ООО "Полиэфир"'
      },
      {
        name: 'АО "МЗСМ"'
      },
      {
        name: 'ООО «ИТСК»'
      },
      {
        name: 'ООО «Ноябрьскнефтегазсвязь»'
      },
      {
        name: 'ООО "Комплекс Галерная 5"'
      },
      {
        name: 'ООО "Юнифэл"'
      },
      {
        name: 'АО "МФК Лахта Центр"'
      },
      {
        name: 'ООО «ГПН-Инвест»'
      },
      {
        name: 'ООО «ГПН-ЗС»'
      },
      {
        name: 'ООО "Алтайское Подворье"'
      },
      {
        name: 'ООО "ГПН-Финанс"'
      },
      {
        name: 'ООО "ГПН-Энерго"'
      },
      {
        name: 'ООО "Газпромнефть-Трейд  Оренбург"'
      },
      {
        name: 'ООО "ГПН-проект"'
      },
      {
        name: 'ООО "Клуб "Заречье"'
      },
      {
        name: 'ООО «Газпромнефть-Оренбург Союз»'
      },
      {
        name: 'АО «Южуралнефтегаз»'
      },
      {
        name: 'АО «Газпромнефть-ННГ»'
      },
      {
        name: 'ООО «Газпромнефть-ННГГФ»'
      },
      {
        name: 'ООО «Газпром нефть Оренбург»'
      },
      {
        name: 'ООО «Газпромнефть-Заполярье»'
      },
      {
        name: 'ООО «Газпромнефть-Нефтесервис»'
      },
      {
        name: 'ООО "Газпромнефть НТЦ"'
      },
      {
        name: 'ООО «НоябрьскНефтеГазАвтоматика»'
      },
      {
        name: 'ООО «Гарант Сервис»'
      },
      {
        name: 'ООО «Газпромнефть-Ангара»'
      },
      {
        name: 'ООО «Газпромнефть-ГЕО»'
      },
      {
        name: 'ООО "Карабашские 6" (бывшее ООО "Торг-72")'
      },
      {
        name: 'ООО «Энерком»'
      },
      {
        name: 'ООО «Газпромнефть-Аэро Брянск»'
      },
      {
        name: 'ООО «Газпромнефть-Восток»'
      },
      {
        name: 'ООО «ГПН-Развитие»'
      },
      {
        name: 'ООО «Газпромнефть-Хантос»'
      },
      {
        name: 'ООО «Южно-Приобский ГПЗ»'
      },
      {
        name: 'ООО «Технологический центра «Бажен»'
      },
      {
        name: 'ООО «Меретояханефтегаз»'
      },
      {
        name: 'НИС а.о. Нови Сад'
      },
      {
        name: 'ООО "Газпромнефть-Ямал"'
      },
      {
        name: 'ООО "Ноябрьсктеплонефть"'
      },
      {
        name: 'ООО "Ноябрьскэнергонефть"'
      },
      {
        name: 'АО «Морнефтегазпроект»'
      },
      {
        name: 'ООО «Газпром нефть шельф»'
      },
      {
        name: 'ООО «Газпромнефть-Приразломное»'
      },
      {
        name: 'ООО «ГПН-Сахалин»'
      },
      {
        name: 'ООО «Газпромнефть Бизнес-сервис»'
      },
      {
        name: 'ООО "Газпромнефть-Центр"'
      },
      {
        name: 'АО "Газпромнефть-Альтернативное топливо"'
      },
      {
        name: 'ООО "Газпромнефть-Лаборатория"'
      },
      {
        name: 'АО «Газпромнефть - Транспорт» '
      },
      {
        name: 'АО "Газпромнефть - Терминал"'
      },
      {
        name: 'ООО "Газпромнефть - Региональные продажи"'
      },
      {
        name: 'ООО  "Газпромнефть-Корпоративные продажи" '
      },
      {
        name: 'ИООО "Газпромнефть-Белнефтепродукт"'
      },
      {
        name: 'ТОО "Газпромнефть-Казахстан"'
      },
      {
        name: 'ООО "Газпромнефть-Таджикистан"'
      },
      {
        name: 'АО «Газпромнефть-Новосибирск»'
      },
      {
        name: 'АО «Газпромнефть-Урал»'
      },
      {
        name: 'АО "Газпромнефть - Ярославль"'
      },
      {
        name: 'АО "Газпромнефть-Северо-Запад"'
      },
      {
        name: 'ООО "Газпромнефть-Красноярск"'
      },
      {
        name: 'АО "Универсал нефть"'
      },
      {
        name: 'ЗАО «Мунай-Мырза»'
      },
      {
        name: 'АО "Газпромнефть-Мобильная карта"'
      },
      {
        name: 'ООО "Газпромнефть-Снабжение"'
      }
    ]
  }
];
