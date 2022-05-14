// эта функция считает, во скольких некачественных материалах использовались материалы

const analyzeMaterialsInFailedOrders = (orders = []) => {
  // object has structure
  // {
  //   [material_name]: number -- количество некач. заказов
  // }
  const object = {};

  for (let i = 0; i < orders.length; i++) {
    let currentOrder = orders[i];

    if (!currentOrder.failed) {
      continue;
    }

    // заказ некачественный
    currentOrder.disinfectors.forEach(user => {

      user.consumption.forEach(materialObject => {

        if (object.hasOwnProperty(materialObject.material)) {
          object[materialObject.material]++;

        } else {
          object[materialObject.material] = 1;
        }

      });

    });
  }

  // we return an array
  let array = [];

  Object.keys(object).forEach(key => {
    array.push({
      material: key,
      amount: object[key],
    });
  });

  // сортируем по убыванию количества заказов
  array = array.sort((a, b) => b.amount - a.amount);

  return array;
};

export default analyzeMaterialsInFailedOrders;