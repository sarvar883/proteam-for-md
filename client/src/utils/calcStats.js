// import calculateDisinfScore from './calcDisinfScore';

// после 1 сентября 2021 года заказы учитываются в статистике только после того, как админ (Temur Muhktorov) поставит оценку за заказ !!!!

// 8 - September (months are zero-based). This is September 1, 2021, 00:00
const ADMIN_GRADE_START_DATE = new Date(2021, 8, 1);
// console.log('ADMIN_GRADE_START_DATE', ADMIN_GRADE_START_DATE);

// this function calculates stats from array of orders
const calculateStats = (arr) => {
  let object = {
    totalSum: 0,
    totalScore: 0,
    totalOrders: arr.length,
    completed: 0,
    confirmedOrders: [],
    rejected: 0,

    // средняя оценка админа
    averageAdminGrade: 0,
    // количество заказов, на которые админ поставил оценку
    howManyOrdersHaveAdminGrades: 0,

    // сумма заказов для дезинфектора (она равна сумме заказа / количество дезинфекторов, выполнивших заказ)
    totalSumForDisinfector: 0,

    // тип заказа: Консультация
    // consultationConfirmed: 0,

    // тип заказа: Осмотр
    // osmotrConfirmed: 0,

    // тип заказа: Консультации + Осмотры (из подтвержденных заказов)
    consultAndOsmotrConfirmed: 0,

    // некачественные заказы
    failed: 0,

    // повторные заказы (если имеется атрибут prevFailedOrder)
    povtors: 0,


    corporate: 0,
    // процент корпоративных заказов от общего количества заказов
    corporatePercent: 0,
    corpSum: 0,
    // процент суммы корпоративных заказов от общей суммы заказов
    corpSumPercent: 0,


    indiv: 0,
    indivPercent: 0,
    indivSum: 0,
    indivSumPercent: 0,
  };

  arr.forEach(order => {

    if (order.hasOwnProperty('prevFailedOrder')) {
      object.povtors++;
    }


    if (order.completed) {
      object.completed++;

      // считаем среднюю оценку админа
      // если админ поставил оценку за заказ
      if (order.adminGaveGrade) {
        object.averageAdminGrade += order.adminGrade;
        object.howManyOrdersHaveAdminGrades++;
      }

      // calculate main parameters
      if (
        // =======================================
        // для заказов до 1 сентября 2021 года, подсчет статистики не изменился
        // для заказов после 1 сентября 2021 года (включительно), заказы учитываются в статистике только после того, как админ (Temur Muhktorov) поставит оценку за заказ
        (
          new Date(order.dateFrom) < ADMIN_GRADE_START_DATE ||
          (new Date(order.dateFrom) > ADMIN_GRADE_START_DATE && order.adminGaveGrade)
        )
        // =======================================
      ) {
        if (order.cost) {
          object.totalSum += order.cost;
        }

        // totalScore is no longer used
        if (order.score) {
          object.totalScore += order.score;
        }


        // сумма, которая достанется каждому дезинфектору
        if (order.cost && order.disinfectors && order.disinfectors.length > 0) {
          object.totalSumForDisinfector = object.totalSumForDisinfector + order.cost / order.disinfectors.length;
        }


        if (order.clientType === 'corporate') {
          object.corporate++;
          object.corpSum += order.cost;

        } else if (order.clientType === 'individual') {
          object.indiv++;
          object.indivSum += order.cost;

        }
      }

      // if order was confirmed
      if (
        !order.failed &&
        // исключаем некачественные и повторные заказы
        !order.hasOwnProperty('prevFailedOrder') &&
        order.operatorConfirmed &&
        (order.accountantConfirmed || order.adminConfirmed) &&

        // =======================================
        // для заказов до 1 сентября 2021 года, подсчет статистики не изменился
        // для заказов после 1 сентября 2021 года (включительно), заказы учитываются в статистике только после того, как админ (Temur Muhktorov) поставит оценку за заказ
        (
          new Date(order.dateFrom) < ADMIN_GRADE_START_DATE ||
          (new Date(order.dateFrom) > ADMIN_GRADE_START_DATE && order.adminGaveGrade)
        )
        // =======================================
      ) {
        object.confirmedOrders.push(order);
        // object.totalSum += order.cost;
        // object.totalScore += order.score;


        // сумма, которая достанется каждому дезинфектору
        // if (order.disinfectors && order.disinfectors.length > 0) {
        //   object.totalSumForDisinfector = object.totalSumForDisinfector + order.cost / order.disinfectors.length;
        // }


        // if (order.clientType === 'corporate') {
        //   object.corporate++;
        //   object.corpSum += order.cost;

        // } else if (order.clientType === 'individual') {
        //   object.indiv++;
        //   object.indivSum += order.cost;

        // }

        // тип заказа: Консультация или Осмотр
        if (
          order.typeOfService.includes('Консультация') ||
          order.typeOfService.includes('Осмотр') ||
          order.typeOfService.includes('Осмотр и консультации')
        ) {
          object.consultAndOsmotrConfirmed++;
        }
        // if (order.typeOfService.includes('Осмотр')) {
        // object.osmotrConfirmed++;
        // }
      }


      // if order was rejected
      if (
        (order.operatorDecided && !order.operatorConfirmed) ||
        (order.accountantDecided && !order.accountantConfirmed) ||
        (order.adminDecided && !order.adminConfirmed)
      ) {
        object.rejected++;
      }


      // if order was failed
      if (order.failed) {
        object.failed++;
      }
    }
  });

  object.corporatePercent = (object.corporate * 100 / object.howManyOrdersHaveAdminGrades).toFixed(1);
  object.indivPercent = (object.indiv * 100 / object.howManyOrdersHaveAdminGrades).toFixed(1);

  object.corpSumPercent = (object.corpSum * 100 / object.totalSum).toFixed(1);
  object.indivSumPercent = (object.indivSum * 100 / object.totalSum).toFixed(1);

  object.averageAdminGrade = (object.averageAdminGrade / object.howManyOrdersHaveAdminGrades).toFixed(1);

  // TODO: reduce admin grade by 5% (or so) if order is failed 
  // object.averageAdminGrade = calculateDisinfScore({
  //   totalScore: object.averageAdminGrade,
  //   totalOrders: object.totalOrders,
  //   failedOrders: object.failed,
  // });

  return object;
};

export default calculateStats;