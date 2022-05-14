const Order = require('../models/order');

const dayHelper = require('../utils/dayMinMax');
const { getDateStringElements } = require('../utils/dateStringElements');

// this function generates orderNumber and returns it 
// daystring - string with format "YYYY-MM-DD"
exports.generateOrderNumber = async (dayString) => {
  // console.log('dayString', dayString);
  const timeObject = dayHelper(dayString);
  // console.log('timeObject', timeObject);

  try {
    // сколько заказов имеется в этом дне
    const orderCount = await Order
      .countDocuments({
        $and: [
          { dateFrom: { '$gte': timeObject.min } },
          { dateFrom: { '$lt': timeObject.max } }
        ],
        // не считаем повторные заказы
        prevFailedOrder: { $exists: false },

        // ?? нужно ли учитывать заказы корпоративных клиентов ??
      }).exec();

    // console.log('orderCount', orderCount);
    let formattedOrderCount = orderCount <= 8 ? `0${orderCount + 1}` : orderCount + 1;

    const stringElementsObject = getDateStringElements(dayString);

    // we get the last 2 characters in year. getDateStringElements return year as 2021, we get last 2 digits, 21
    const orderNumber = `${formattedOrderCount}-${stringElementsObject.day}.${stringElementsObject.month}.${stringElementsObject.year.slice(-2)}`;

    return orderNumber;

  } catch (err) {
    console.log('generateOrderNumber ERROR', err);
    return '';
  }
};