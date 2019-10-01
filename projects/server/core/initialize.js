exports.initializeData = async db => {
  let statuses = await db.AuditStatus.find();
  if (statuses.length === 0) {
    let statuses = [
      { name: 'Новый' },
      { name: 'В работе' },
      { name: 'Завершен' }
    ];
    db.AuditStatus.insertMany(statuses);
  }

  let subsidiaries = await db.Subsidiary.find();
  if (subsidiaries.length === 0) {
    let subsidiaries = [
      { name: 'Газпромнефть-Восток (ООО)' },
      { name: 'Многофункциональный комплекс Лахта центр (АО)' },
      { name: 'Газпромнефть-Аэро (АО)' },
      { name: 'Газпромнефть-Корпоративные продажи (ООО)' },
      { name: 'Научно-Технический Центр «Газпром нефти» (ООО)' }
    ];
    db.Subsidiary.insertMany(subsidiaries);
  }
};
