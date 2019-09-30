exports.initializeData = async db => {
  let statuses = await db.AuditStatus.find();
  if (statuses.length === 0) {
    let auditStatuses = [
      { name: 'Новый' },
      { name: 'В работе' },
      { name: 'Завершен' }
    ];
    db.AuditStatus.insertMany(auditStatuses);
  }
};
