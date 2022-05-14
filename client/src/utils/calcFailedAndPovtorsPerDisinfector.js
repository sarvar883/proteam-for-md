// this function loops through the array of orders
// and calculates how many failed orders do users have

// in order for this function to work, "disinfectors.user" field must be populated !!!

const calcFailedAndPovtorsPerDisinfector = (orders = []) => {
  // this object has structure: 
  // {
  //   [user_id]: {
  //     name: string -- name of user
  //     occupation: string -- role
  //     failed: number -- number of failed orders of this user
  //   }
  // }
  const users_with_failed_orders_map = {};


  // this object has structure: 
  // {
  //   [user_id]: {
  //     name: string -- name of user
  //     occupation: string -- role
  //     povtors: number -- number of povtors of this user
  //   }
  // }
  const users_with_povtors_map = {};

  for (let i = 0; i < orders.length; i++) {
    let currentOrder = orders[i];

    let orderStatus = '';

    if (currentOrder.failed) {
      orderStatus = 'failed';
    }

    if (currentOrder.hasOwnProperty('prevFailedOrder')) {
      orderStatus = 'povtor';
    }

    currentOrder.disinfectors.forEach(disinfector => {
      if (orderStatus === 'failed') {

        if (users_with_failed_orders_map.hasOwnProperty(disinfector.user._id)) {
          users_with_failed_orders_map[disinfector.user._id].failed++;

        } else {
          users_with_failed_orders_map[disinfector.user._id] = {
            name: disinfector.user.name,
            occupation: disinfector.user.occupation,
            failed: 1,
          };
        }

      }

      if (orderStatus === 'povtor') {

        if (users_with_povtors_map.hasOwnProperty(disinfector.user._id)) {
          users_with_povtors_map[disinfector.user._id].povtors++;

        } else {
          users_with_povtors_map[disinfector.user._id] = {
            name: disinfector.user.name,
            occupation: disinfector.user.occupation,
            povtors: 1,
          };
        }

      }

    });
  }

  // =============================
  // array of users -- created from "users_with_failed_orders_map" object
  let users_with_failed = [];

  Object.keys(users_with_failed_orders_map).forEach(key => {
    users_with_failed.push(users_with_failed_orders_map[key]);
  });

  // сортируем массив по убыванию количества некачественных заказов
  users_with_failed = users_with_failed.sort((a, b) => b.failed - a.failed);


  // =============================
  // array of users -- created from "users_with_povtors_map" object
  let users_with_povtors = [];

  Object.keys(users_with_povtors_map).forEach(key => {
    users_with_povtors.push(users_with_povtors_map[key]);
  });

  // сортируем массив по убыванию количества некачественных заказов
  users_with_povtors = users_with_povtors.sort((a, b) => b.povtors - a.povtors);


  return { users_with_failed, users_with_povtors };
};

export default calcFailedAndPovtorsPerDisinfector;