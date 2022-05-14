const mongoose = require('mongoose');
const path = require('path');

const User = require('../models/user');
const Order = require('../models/order');
const Client = require('../models/client');
const AddMaterial = require('../models/addMaterial');
const ComingMaterial = require('../models/comingMaterial');
const CurrentMaterial = require('../models/currentMaterial');

// const materials = require('../client/src/components/common/materials');
const isEmpty = require('../validation/is-empty');

// telegram
const tgBot = require('../bot');
const { getTelegramChatIdOfUser } = require('../utils/getTgChat');
const { sendNotifToAdminOnMaterialDistrib } = require('../utils/sendNotifToAdmin');
const { convertDateToString } = require('../utils/convertDateToString');
const { getDateStringElements } = require('../utils/dateStringElements');

const monthHelper = require('../utils/monthMinMax');
const weekHelper = require('../utils/weekMinMax');
const dayHelper = require('../utils/dayMinMax');
const { generateExcelFile } = require('../utils/generateExcelFile');


exports.getSortedOrders = (req, res) => {
  const dateObject = getDateStringElements(req.body.date);

  const dateString = `${dateObject.year}-${dateObject.month}-${dateObject.day}`;
  const timeObject = dayHelper(dateString);

  Order.find({
    $and: [
      { dateFrom: { '$gte': timeObject.min } },
      { dateFrom: { '$lt': timeObject.max } }
    ]
  })
    .populate({
      path: 'disinfectorId',
      select: 'name occupation color'
    })
    .populate({
      path: 'clientId',
      select: 'name'
    })
    .exec()
    .then(orders => res.json(orders))
    .catch(err => {
      console.log('getSortedOrders ADMIN ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getOrderQueriesForAdmin = (req, res) => {
  Order.find({
    completed: true,
    adminDecidedReturn: false,
    adminDecided: false,
    $or: [
      { clientType: 'individual' },
      { paymentMethod: 'cash' }
    ]
  })
    .populate('disinfectorId userCreated clientId userAcceptedOrder disinfectors.user')
    .exec()
    .then(orderQueries => res.json(orderQueries))
    .catch(err => {
      console.log('getOrderQueriesForAdmin ERROR', err);
      return res.status(400).json(err);
    });
};


exports.confirmOrderQuery = (req, res) => {
  // req.body.object has structure:
  // object = {
  //   orderId: string,
  //   response: string,
  //   disinfectors: [
  //     { user: string, consumption: [ {amount: number, material: string, unit: string} ] }
  //     this "user" is the id of user
  //   ],
  // }

  Order.findById(req.body.object.orderId)
    .then(order => {
      if (req.body.object.response === 'back') {
        order.returnedBack = true;
        order.returnHandled = false;
        order.adminDecidedReturn = true;

        order.operatorDecided = false;
        order.operatorConfirmed = false;

        order.accountantDecided = false;
        order.accountantConfirmed = false;

        // return materials to disinfectors
        req.body.object.disinfectors.forEach(person => {
          User.findById(person.user)
            .then(user => {
              if (user) {
                user.returnMaterials(person.consumption);
              }
            });
        });

      } else {
        order.adminDecided = true;
        order.adminCheckedAt = new Date();

        if (req.body.object.response === 'true') {
          order.adminConfirmed = true;
        } else if (req.body.object.response === 'false') {
          order.adminConfirmed = false;
        }
      }
      return order.save();
    })
    .then(savedOrder => res.json(savedOrder))
    .catch(err => {
      console.log('confirmOrderQuery ERROR', err);
      return res.status(404).json(err);
    });
};


// админ ставит оценку на заказ
exports.adminGivesGradeToOrder = async (req, res) => {
  const { orderId, grade, comment } = req.body.object;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw { success: false, message: `Order with id ${orderId} not found` };
    }

    order.adminGrade = Number(grade);
    order.adminGaveGrade = true;
    order.adminGradeComment = comment;

    const savedOrder = await order.save();

    // send notification to disinfector
    const { disinfectorId } = order;

    const getTgChatResponse = await getTelegramChatIdOfUser(disinfectorId);

    if (getTgChatResponse.success) {
      tgBot.telegram.sendMessage(getTgChatResponse.tgChat, `
        Оценка Админа за Ваш Заказ:
        -------
        Номер заявки: ${order.orderNumber || '--'}
        Дата: ${convertDateToString(order.dateFrom)} 
        Адрес: ${order.address}
        Тип Клиента: ${order.clientType === 'individual' ? 'Физический' : 'Корпоративный'}
        Клиент: ${order.client}
        Телефон Клиента: ${order.phone}
        Тип Заказа: ${order.typeOfService}
        -------
        ОЦЕНКА АДМИНА: ${grade} (из 10)
        КОММЕНТАРИИ АДМИНА: ${comment || '--'}
      `);
    }

    return res.json(savedOrder);
  } catch (error) {
    console.log('adminGivesGradeToOrder ERROR', err);
    res.status(500).json(err);
  }
};


exports.addMaterialToDisinfector = async (req, res) => {
  // add materials to user
  User.findById(req.body.object.disinfector)
    .then(user => {
      req.body.object.materials.forEach(mat => {
        user.materials.forEach(item => {
          if (item.material === mat.material && item.unit === mat.unit) {
            item.amount += Number(mat.amount);
            return;
          }
        });
      });
      user.save();
    });


  // subtract materials from current materials
  CurrentMaterial.findOne()
    .then(currentMaterials => {
      currentMaterials.materials.forEach(item => {
        req.body.object.materials.forEach(element => {
          if (item.material === element.material && item.unit === element.unit) {
            item.amount -= element.amount;
            return;
          }
        });
      });
      currentMaterials.save();
    });


  const newObject = new AddMaterial({
    disinfector: req.body.object.disinfector,
    admin: req.body.object.admin,
    materials: req.body.object.materials,
    createdAt: new Date()
  });


  // user who gave materials (we will write this info in TG notification)
  const donor = await User.findById(req.body.object.admin, { name: 1, occupation: 1 });

  // get materials string to display in tg notification
  let materialsString = '';
  req.body.object.materials.forEach(item => {
    materialsString += `${item.material}: ${item.amount} ${item.unit}\n`;
  });
  // send telegram notification
  const getTgChatResponse = await getTelegramChatIdOfUser(req.body.object.disinfector);

  if (getTgChatResponse.success) {
    tgBot.telegram.sendMessage(getTgChatResponse.tgChat, `
      Вам добавлены материалы:
      -------
      Кто добавил: ${donor.occupation} ${donor.name}
      Дата и Время: ${convertDateToString(new Date())}
      Добавленные Материалы: 
      ${materialsString}
      -------
      Пожалуйста, проверьте приложение ProDez
    `);
  }


  // =======================================
  // send notification to admin
  const receiver = await User.findById(req.body.object.disinfector, { name: 1, occupation: 1 });

  const object_to_send_notif = {
    // TODO: send admin_id from frontend, and add name & occupation of admin
    sender: {
      name: 'Админ',
      occupation: 'Пользователь',
    },
    receiver,
    materials: req.body.object.materials,
  };
  sendNotifToAdminOnMaterialDistrib(object_to_send_notif);
  // =======================================


  newObject.save()
    .then(obj => res.json(obj))
    .catch(err => {
      console.log('addMaterialToDisinfector ERROR', err);
      return res.status(400).json(err);
    });
};


exports.addMaterialEvents = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  AddMaterial.find({
    $and: [
      { createdAt: { '$gte': timeObject.min } },
      { createdAt: { '$lt': timeObject.max } }
    ]
  })
    .populate({
      path: 'disinfector',
      select: 'name occupation'
    })
    .populate({
      path: 'admin',
      select: 'name occupation'
    })
    .exec()
    .then(events => res.json(events))
    .catch(err => {
      console.log('addMaterialEvents ERROR', err);
      res.status(404).json(err);
    });
};


exports.getCurMat = (req, res) => {
  // let emptyArray = [];
  // materials.forEach(item => {
  //   emptyArray.push({
  //     material: item.material,
  //     amount: 0,
  //     unit: item.unit
  //   });
  // });

  // const cur = new CurrentMaterial({
  //   materials: emptyArray,
  //   lastUpdated: new Date()
  // });
  // cur.save();

  CurrentMaterial.findOne()
    .then(curMat => res.json(curMat))
    .catch(err => {
      console.log('getCurMat ERROR', err);
      res.status(404).json(err);
    });
};


exports.addMatComing = (req, res) => {
  const { object } = req.body;

  const newObject = new ComingMaterial({
    admin: object.admin,
    materials: object.materials,
    createdAt: new Date()
  });

  newObject.save();

  CurrentMaterial.findOne()
    .then(curMat => {
      let array = curMat.materials;

      object.materials.forEach(item => {
        array.forEach(element => {
          if (item.material === element.material && item.unit === element.unit) {
            element.amount += item.amount;
            return;
          }
        });
      });
      curMat.materials = array;
      curMat.lastUpdated = new Date();
      curMat.save();
      return res.json(curMat);
    })
    .catch(err => {
      console.log('addMatComing ERROR', err);
      res.status(400).json(err);
    });
};


exports.getMaterialComingEvents = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  ComingMaterial.find({
    $and: [
      { createdAt: { '$gte': timeObject.min } },
      { createdAt: { '$lt': timeObject.max } }
    ]
  })
    .populate({
      path: 'admin',
      select: 'name occupation'
    })
    .exec()
    .then(comings => res.json(comings))
    .catch(err => {
      console.log('getMaterialComingEvents ERROR', err);
      res.status(404).json(err);
    });
};


exports.addClient = async (req, res) => {
  let errors = {};

  let clientQuery;

  try {

    if (req.body.object.type === 'corporate') {
      // case insensitive search
      clientQuery = Client.findOne({ name: new RegExp(`^${req.body.object.name}$`, 'i') });

    } else if (req.body.object.type === 'individual') {
      clientQuery = Client.findOne({ phone: req.body.object.phone });
    }

    const client = await clientQuery;

    // if client already exists in DB
    if (client) {
      if (req.body.object.type === 'corporate') {
        errors.name = 'Корпоративный Клиент с таким именем уже существует';
      }

      if (req.body.object.type === 'individual') {
        errors.phone = 'Физический Клиент с таким номером уже существует';
      }

      return res.status(400).json(errors);
    }

    // create new client with this object
    const object = {
      _id: mongoose.Types.ObjectId(),
      type: req.body.object.type,
      name: req.body.object.name,
      orders: [],
      createdAt: new Date(),
    };

    if (req.body.object.type === 'corporate') {
      object.inn = req.body.object.inn;
    }

    if (req.body.object.type === 'individual') {
      object.phone = req.body.object.phone;
      object.address = req.body.object.address;
      object.address_v2 = req.body.object.address_v2;
    }

    // console.log('object', object);
    const createdClient = await Client.create(object);

    return res.json(createdClient);

  } catch (err) {
    console.log('addClient ERROR', err);
    return res.status(400).json(err);
  }
};


exports.editClient = (req, res) => {
  const { object } = req.body;
  // console.log('editClient', object);

  Client.findById(object.id)
    .then(client => {
      client.name = object.name;

      if (object.type === 'corporate') {
        client.inn = object.inn;

      } else if (object.type === 'individual') {
        client.address = object.address;
        client.address_v2 = object.address_v2;
        client.phone = object.phone;
      }

      return client.save();
    })
    .then(editedClient => res.json(editedClient))
    .catch(err => {
      console.log('editClient ERROR', err);
      res.status(404).json(err);
    });
};


exports.changeContractNumbers = (req, res) => {
  const { id, method, contract } = req.body.object;

  Client.findById(id)
    .then(client => {
      let contractsArray = [...client.contracts];

      if (method === 'add') {
        contractsArray.push(contract);

      } else if (method === 'delete') {
        contractsArray = contractsArray.filter(item => item !== contract);
      }

      client.contracts = contractsArray;
      return client.save();
    })
    .then(editedClient => res.json(editedClient))
    .catch(err => {
      console.log('changeContractNumbers ERROR', err);
      res.status(404).json(err);
    });
};


exports.searchClients = async (req, res) => {
  let query;

  // do not load these fields
  const searchObject = {
    orders: 0,
    contracts: 0,
    createdAt: 0
  };

  if (req.body.object.method === 'phone') {
    query = Client.find({
      type: "individual",
      $or: [
        { "phone": req.body.object.payload },
        { "phone": { "$regex": req.body.object.payload, "$options": "i" } }
      ]
    }, searchObject);

  } else if (req.body.object.method === 'inn') {
    query = Client.find({
      type: "corporate",
      $or: [
        { "inn": req.body.object.payload },
        { "inn": { "$regex": req.body.object.payload, "$options": "i" } }
      ]
    }, searchObject);

  } else if (req.body.object.method === 'address') {
    query = Client.find({
      type: "individual",
      $or: [
        { "address": req.body.object.payload },
        { "address": { "$regex": req.body.object.payload, "$options": "i" } }
      ]
    }, searchObject);

  } else if (req.body.object.method === 'name') {

    query = Client.find({
      $or: [
        { "name": req.body.object.payload },
        { "name": { "$regex": req.body.object.payload, "$options": "i" } }
      ]
    }, searchObject);

  } else if (req.body.object.method === 'corporate') {
    query = Client.find({
      type: "corporate"
    }, searchObject);

  } else {
    // } else if (req.body.object.method === 'all') {
    query = Client.find();
  }

  try {
    let clients = await query || [];


    // ДОБАВЛЕНИЕ ПОЛЯ nextOrdersAfterFailArray (МАССИВ) КО ВСЕМ НЕКАЧЕСТВЕННЫМ ЗАКАЗАМ (26.05.2021)
    // Order
    //   .find({
    //     nextOrderAfterFail: { $exists: true },
    //     failed: true
    //   })
    //   .then(orders => {
    //     console.log('length', orders.length);
    //     orders.forEach(order => {
    //       console.log('nextOrdersAfterFailArray', order.nextOrdersAfterFailArray);

    //         let previous = order.nextOrderAfterFail;

    //         let array = [];
    //         array.push(previous);
    //         order.nextOrdersAfterFailArray = array;
    //         order.save();
    //     });
    //   });


    return res.json(clients);
  } catch (err) {
    console.log('searchClients ERROR', err);
    res.status(404).json(err);
  }
};


exports.clientById = async (req, res) => {
  let populateOrders = false;

  // check the amount of orders to populate
  let testClient = await Client.findById(req.body.id);

  if (testClient.orders && testClient.orders.length < 200) {
    populateOrders = true;
  }

  let query;

  try {
    if (populateOrders) {
      query = Client.findById(req.body.id)
        .populate({
          path: 'orders',
          model: 'Order'
          // populate: {
          //   path: 'disinfectorId userCreated userAcceptedOrder disinfectors.user',
          //   model: 'User'
          // }
        });
    } else {
      query = Client.findById(req.body.id);
    }

    let clientToSend = await query;

    // delete empty orders that cannot be populated
    clientToSend.orders = clientToSend.orders.filter(item => !isEmpty(item));

    return res.json(clientToSend);
  } catch (err) {
    console.log('clientById ERROR', err);
    res.status(404).json(err);
  };
};


exports.getOrdersOfClient = async (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  let query;
  if (req.body.object.client.type === 'corporate') {
    query = Order.find({
      clientType: 'corporate',
      clientId: req.body.object.client.id,
      $and: [
        { dateFrom: { '$gte': timeObject.min } },
        { dateFrom: { '$lt': timeObject.max } }
      ]
    })
      .populate({
        path: 'disinfectorId',
        select: 'name occupation'
      })
      .populate({
        path: 'clientId',
        select: 'name'
      })
      .populate({
        path: 'disinfectors.user',
        select: 'name occupation'
      })
      .exec();

  } else if (req.body.object.client.type === 'individual') {
    query = Order.find({
      clientType: 'individual',
      $or: [
        { "phone": req.body.object.client.phone },
        { "phone": { "$regex": req.body.object.client.phone, "$options": "i" } }
      ],
      $and: [
        { dateFrom: { '$gte': timeObject.min } },
        { dateFrom: { '$lt': timeObject.max } }
      ]
    })
      .populate({
        path: 'disinfectorId',
        select: 'name occupation'
      })
      .populate({
        path: 'clientId',
        select: 'name'
      })
      .populate({
        path: 'disinfectors.user',
        select: 'name occupation'
      })
      .exec();
  }

  let orders = await query;

  return res.json(orders);
};


// exports.deleteMaterialFromDB = (req, res) => {
//   const { object } = req.body;

//   // name of the material to delete
//   const materialToDelete = object.material;

//   // console.log('materialToDelete', materialToDelete);


//   // delete material from CurrentMaterial
//   CurrentMaterial.findOne()
//     .then(curMat => {
//       let materials = [...curMat.materials];

//       materials = materials.filter(item => item.material !== materialToDelete);

//       // console.log('CurrentMaterial materials', materials);

//       curMat.materials = [...materials];
//       curMat.save()
//     });


//   // delete material from users ('materials' array in User object)
//   User.find()
//     .then(users => {
//       let materials = [];

//       users.forEach(user => {
//         materials = [...user.materials];

//         materials = materials.filter(item => item.material !== materialToDelete);

//         // console.log('user materials', materials);

//         user.materials = [...materials];
//         user.save();
//       });
//     });

//   // console.log('deleteMaterialFromDB done');

//   return res.json(object);
// };


exports.setDisinfectorMaterials = async (req, res) => {
  const { userId, materials } = req.body.object;

  const user = await User.findById(userId);

  let newMaterialsArray = [...user.materials];

  materials.forEach(item => {

    newMaterialsArray.forEach(element => {
      if (item.material === element.material && item.unit === element.unit) {
        element.amount = Number(item.amount);
      }
    });

  });

  // console.log('newMaterialsArray', newMaterialsArray);

  user.materials = [...newMaterialsArray];
  user.save();

  return res.json(user);
};


exports.setCurrentMaterials = async (req, res) => {
  // materials to change (coming from client)
  const { materials } = req.body.object;

  // console.log('setCurrentMaterials', materials);

  const curMat = await CurrentMaterial.findOne();

  let currentMaterialsArray = [...curMat.materials];

  materials.forEach(item => {

    currentMaterialsArray.forEach(element => {
      if (item.material === element.material && item.unit === element.unit) {
        element.amount = Number(item.amount);
      }
    });

  });

  curMat.materials = [...currentMaterialsArray];
  curMat.lastUpdated = new Date();
  curMat.save();

  return res.json(currentMaterialsArray);
};


exports.sendExcelFileOfCorporateClients = async (req, res) => {
  const clients = await Client.find({
    type: 'corporate',
  }, {
    name: 1,
    inn: 1,
    orders: 1
  })
    .sort({ name: 1 });

  const fileName = 'corp.xlsx';
  const workSheetColumnNames = [
    "#",
    "Имя",
    "ИНН",
    "Поступило заказов",
  ];

  // data to write into excel file
  // data should be array of arrays !!!
  const data = clients.map((client, index) => {
    return [index + 1, client.name, client.inn, client.orders.length];
  });

  // excel file options
  const options = {
    workSheetColumnNames,
    filePath: `./${fileName}`,
    workSheetName: 'Корпоративные клиенты',
  };

  const result = generateExcelFile(data, options);

  // if there was some error while generating excel file
  if (!result.success) {
    return res.json(result);
  }

  res.sendFile(path.join(__dirname, "../", fileName));
};