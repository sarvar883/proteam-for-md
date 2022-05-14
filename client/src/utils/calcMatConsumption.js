// this function calculates total material consumption
const calcMaterialConsumption = (orders) => {
  // this consumptionObject has structure:
  // {
  //   name_of_material: {
  //     amount: Number,
  //     unit: String,
  //   }
  // }
  const consumptionObject = {};

  orders.forEach(order => {
    if (order.completed && order.disinfectors) {
      order.disinfectors.forEach(element => {
        element.consumption.forEach(object => {

          if (consumptionObject.hasOwnProperty(object.material)) {
            consumptionObject[object.material].amount += object.amount;
          } else {
            consumptionObject[object.material] = {
              amount: object.amount,
              unit: object.unit,
            };
          }

        });
      });
    }
  });

  // console.log('consumptionObject', consumptionObject);
  return consumptionObject;
};

export default calcMaterialConsumption;