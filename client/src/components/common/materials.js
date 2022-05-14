// This file is no longer needed because we are fetching materials from DB

const materialsArray = [
  // ЛЕКАРСТВА 
  { material: 'Pro', unit: 'пак', category: 'drugs' },
  { material: 'МАЛ', unit: 'гр', category: 'drugs' },
  { material: 'ТЯ', unit: 'гр', category: 'drugs' },
  // { material: 'Гр Таб', unit: 'шт' },
  { material: 'Гр Гран', unit: 'гр', category: 'drugs' },
  { material: 'Титан', unit: 'гр', category: 'drugs' },
  { material: 'Prodez', unit: 'гр', category: 'drugs' },

  { material: 'Гель Тр', unit: 'шт', category: 'drugs' },
  // { material: 'Agita', unit: 'гр' },

  // 2k was deleted from DB (in Spring 2021), added again 11.09.2021
  { material: '2k', unit: 'мл', category: 'drugs' },

  { material: 'Progreen', unit: 'мл', category: 'drugs' },
  { material: 'QB', unit: 'гр', category: 'drugs' },

  // agita и micron добавлены 11.05.2021
  { material: 'Agita kr', unit: 'гр', category: 'drugs' },
  { material: 'Micron', unit: 'мл', category: 'drugs' },
  { material: 'Липучка копкан', unit: 'шт', category: 'drugs' },
  { material: 'Кемирувчи контейнер', unit: 'шт', category: 'drugs' },
  // =============================


  { material: 'Лего', unit: 'мл', category: 'other' }, // added on 11.09.2021


  // ИНВЕНТАРЬ
  { material: 'Рубашка', unit: 'шт', category: 'inventory' },
  { material: 'Респиратор 3м polomsk', unit: 'шт', category: 'inventory' },
  { material: 'Респиратор fullmask', unit: 'шт', category: 'inventory' },
  { material: 'Электронные Весы', unit: 'шт', category: 'inventory' },
  { material: 'Униформа Халат', unit: 'шт', category: 'inventory' },
  { material: 'Разовая Перчатка', unit: 'шт', category: 'inventory' },
  { material: 'Разовый Респиратор', unit: 'шт', category: 'inventory' },
  { material: 'Coldfogger', unit: 'шт', category: 'inventory' },
  { material: 'Thermalfogger', unit: 'шт', category: 'inventory' },

  { material: 'Sprayer Gloria T405 Metall', unit: 'шт', category: 'inventory' },

  // { material: 'Sprayer 5l', unit: 'шт' }, 
  // this was renamed to Sprayer Gloria Prima5 (26.02.2021)
  { material: 'Sprayer Gloria Prima5', unit: 'шт', category: 'inventory' },

  { material: 'Фонарик', unit: 'шт', category: 'inventory' },


  // =============================

  // ДОКУМЕНТЫ
  { material: 'Договор', unit: 'шт', category: 'documents' },
  { material: 'Акт Счет-Фак', unit: 'шт', category: 'documents' },
  { material: 'Лицен. Гувохнома', unit: 'шт', category: 'documents' },

  // { material: 'Хлор', unit: 'шт' },
];

module.exports = materialsArray;