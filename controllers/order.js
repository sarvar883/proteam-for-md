const mongoose = require('mongoose');
const User = require('../models/user');
const Order = require('../models/order');
const Client = require('../models/client');
const AddMaterial = require('../models/addMaterial');

const validateOrderInput = require('../validation/order');
const io = require('../socket');

const tgBot = require('../bot');
const { getTelegramChatIdOfUser } = require('../utils/getTgChat');
const { sendNotifToAdminOnMaterialDistrib } = require('../utils/sendNotifToAdmin');
const { convertDateToString } = require('../utils/convertDateToString');
const { generateOrderNumber } = require('../utils/generateOrderNumber');
const { formDate } = require('../utils/formDate');

const monthHelper = require('../utils/monthMinMax');
const weekHelper = require('../utils/weekMinMax');
const dayHelper = require('../utils/dayMinMax');


exports.createOrder = async (req, res) => {
  const { errors, isValid } = validateOrderInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  let orderObject = {
    _id: mongoose.Types.ObjectId(),
    disinfectorId: req.body.disinfectorId,
    clientType: req.body.clientType,
    client: req.body.client,
    filial: req.body.filial,

    address: req.body.address,
    address_v2: req.body.address_v2,

    dateFrom: formDate({ dateFrom: req.body.dateFrom, timeFrom: req.body.timeFrom, }),
    phone: req.body.phone,
    phone2: req.body.phone2,
    typeOfService: req.body.typeOfService,
    advertising: req.body.advertising,
    comment: req.body.comment,
    disinfectorComment: '',
    userCreated: req.body.userCreated,
    userAcceptedOrder: req.body.userAcceptedOrder,
    whoDealtWithClient: req.body.whoDealtWithClient,
    repeatedOrder: false,
  };

  if (req.body.clientType === 'corporate') {
    orderObject.clientId = req.body.clientId;
  }

  let orderNumber = '';
  if (req.body.clientType === 'individual') {
    orderNumber = await generateOrderNumber(orderObject.dateFrom);
  }
  // console.log('orderNumber', orderNumber);
  orderObject.orderNumber = orderNumber;

  // console.log('orderObject', orderObject);

  const order = new Order(orderObject);
  order.save()
    .then((savedOrder) => {

      if (req.body.tgChat && req.body.tgChat.length > 0) {
        // send telegram notification
        tgBot.telegram.sendMessage(req.body.tgChat, `
          У Вас новый заказ:
          -------
          Номер заявки: ${orderNumber || '--'}
          Дата: ${convertDateToString(orderObject.dateFrom)} 
          Адрес: ${orderObject.address}
          Тип Клиента: ${orderObject.clientType === 'individual' ? 'Физический' : 'Корпоративный'}
          Клиент: ${orderObject.client}
          Телефон Клиента: ${orderObject.phone}
          Тип Заказа: ${orderObject.typeOfService}
          -------
          Пожалуйста, проверьте приложение ProDez
        `);
      }


      if (req.body.clientType === 'corporate') {
        Client.findById(req.body.clientId)
          .then(client => {
            client.orders.push(savedOrder._id);
            client.save();
          });

      } else if (req.body.clientType === 'individual') {
        Client.findOne({ phone: req.body.phone })
          .then(client => {
            if (client) {
              // if we have a client with this phone number
              client.orders.push(savedOrder._id);
              client.save();

            } else {
              let array = [];
              array.push(savedOrder._id);

              const newClient = new Client({
                _id: mongoose.Types.ObjectId(),
                type: req.body.clientType,
                name: req.body.client,
                phone: req.body.phone,
                address: req.body.address,
                address_v2: req.body.address_v2,
                orders: array,
                createdAt: new Date()
              });

              newClient.save();
            }
          });
      }

      Order.findOne(order)
        .populate('disinfectorId userCreated userAcceptedOrder clientId')
        .exec()
        .then(savedOrder => {
          io.getIO().emit('createOrder', {
            disinfectorId: req.body.disinfectorId,
            order: savedOrder
          });
          return res.json(savedOrder);
        });
    })
    .catch(err => {
      console.log('createOrder ERROR', err);
      res.status(400).json(err);
    });
};


exports.editOrder = (req, res) => {
  const { order } = req.body;

  Order.findById(order._id)
    .then(orderForEdit => {
      orderForEdit.disinfectorId = order.disinfectorId;
      orderForEdit.userAcceptedOrder = order.userAcceptedOrder;
      orderForEdit.clientType = order.clientType;
      orderForEdit.client = order.client;
      orderForEdit.filial = order.filial;

      if (orderForEdit.clientType === 'corporate') {
        orderForEdit.clientId = order.clientId;
      }

      // validation: does this order have whoDealtWithClient field
      if (order.whoDealtWithClient && order.whoDealtWithClient.length > 0) {
        orderForEdit.whoDealtWithClient = order.whoDealtWithClient;
      }

      orderForEdit.address = order.address;
      orderForEdit.address_v2 = { ...order.address_v2 };

      orderForEdit.dateFrom = formDate({ dateFrom: order.dateFrom, timeFrom: order.timeFrom, });
      orderForEdit.phone = order.phone;
      orderForEdit.phone2 = order.phone2;
      orderForEdit.typeOfService = order.typeOfService;
      orderForEdit.advertising = order.advertising;
      orderForEdit.comment = order.comment;

      return orderForEdit.save();
    })
    .then(async (editedOrder) => {
      // TODO: change orderNumber if dateFrom is changed

      // send telegram notification to disinfector
      const getTgChatResponse = await getTelegramChatIdOfUser(order.disinfectorId);

      if (getTgChatResponse.success) {
        tgBot.telegram.sendMessage(getTgChatResponse.tgChat, `
          У Вас новый заказ (отредактированный заказ):
          -------
          Дата: ${convertDateToString(editedOrder.dateFrom)} 
          Адрес: ${editedOrder.address}
          Тип Клиента: ${editedOrder.clientType === 'individual' ? 'Физический' : 'Корпоративный'}
          Клиент: ${editedOrder.client}
          Телефон Клиента: ${editedOrder.phone}
          Тип Заказа: ${editedOrder.typeOfService}
          -------
          Пожалуйста, проверьте приложение ProDez
        `);
      }


      editedOrder.populate('disinfectorId userCreated userAcceptedOrder clientId')
        .execPopulate()
        .then(item => {
          io.getIO().emit('editOrder', {
            order: item
          });
          // console.log('editedOrder', item);
          // return res.json(editedOrder);
          return res.json(item);
        });
    })
    .catch(err => {
      console.log('editOrder ERROR', err);
      res.status(404).json(err);
    });
};


exports.deleteOrder_v2 = async (req, res) => {
  // req.body.object has the following structure
  // {
  //   id: String,
  // }

  const orderId = req.body.object.id;
  // console.log('orderId', orderId);

  const order = await Order.findById(orderId);

  if (!order) {
    let errorMessage = `Order with id ${orderId} is not found`;

    console.log('deleteOrder_v2 ERROR:', errorMessage);
    return res.status(400).json({ success: false, message: errorMessage });
  }

  // helpful variables
  let { clientType, clientId } = order;
  let clientPhone = order.phone;
  let orderDateFrom = order.dateFrom;

  try {
    // delete order
    await order.remove();

    io.getIO().emit('deleteOrder', {
      id: orderId,
      orderDateFrom: orderDateFrom
    });

    // delete orderId from order.nextOrdersAfterFailArray
    let previousFailedOrder = await Order.findOne({
      nextOrdersAfterFailArray: orderId
    });

    if (
      previousFailedOrder &&
      previousFailedOrder.nextOrdersAfterFailArray
    ) {
      previousFailedOrder.nextOrdersAfterFailArray = previousFailedOrder.nextOrdersAfterFailArray.filter(item => item.toString() !== orderId);

      // если после удаления, некачественный заказ не имеет повторных заказов,
      // то заказ НЕ является некачеcтвенным
      // и оператор и бухгалтер должны заново рассмотреть запрос
      if (previousFailedOrder.nextOrdersAfterFailArray.length === 0) {
        previousFailedOrder.failed = false;
        previousFailedOrder.operatorDecided = false;
        previousFailedOrder.accountantDecided = false;
      }

      await previousFailedOrder.save();
    }


    // delete orderId from client.orders array
    let clientQuery;

    if (clientType === 'corporate') {
      clientQuery = Client.findById(clientId);

    } else if (clientType === 'individual') {
      clientQuery = Client.findOne({ phone: clientPhone });
    }

    let client = await clientQuery;

    if (client && client.orders) {
      client.orders = client.orders.filter(item => item.toString() !== orderId);
      await client.save();
    }

    return res.json({
      success: true,
      message: 'Order is successfully removed',
    });

  } catch (err) {
    console.log('deleteOrder_v2 ERROR', err);
    res.status(404).json(err);
  }
};


exports.createRepeatOrder = (req, res) => {
  const { errors, isValid } = validateOrderInput(req.body.order);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Order.findById(req.body.order.id)
    .then(async (order) => {
      order.disinfectorId = req.body.order.disinfectorId;
      order.clientType = req.body.order.clientType;
      order.client = req.body.order.client;
      order.filial = req.body.order.filial;

      order.address = req.body.order.address;
      order.address_v2 = req.body.order.address_v2 || {};

      order.dateFrom = formDate({ dateFrom: req.body.order.dateFrom, timeFrom: req.body.order.timeFrom, });
      order.phone = req.body.order.phone;
      order.phone2 = req.body.order.phone2;
      order.typeOfService = req.body.order.typeOfService;
      order.advertising = req.body.order.advertising;
      order.comment = req.body.order.comment;
      order.userAcceptedOrder = req.body.order.userAcceptedOrder;
      order.repeatedOrderDecided = true;
      order.repeatedOrderNeeded = true;

      if (req.body.order.clientType === 'corporate') {
        order.clientId = req.body.order.clientId;
      }

      let orderNumber = '';
      if (req.body.order.clientType === 'individual') {
        orderNumber = await generateOrderNumber(req.body.order.dateFrom);
      }
      // console.log('orderNumber', orderNumber);
      order.orderNumber = orderNumber;

      order.save()
        .then((savedOrder) => {

          if (req.body.order.clientType === 'corporate') {
            Client.findById(req.body.order.clientId)
              .then(client => {
                client.orders.push(savedOrder._id);
                client.save();
              });

          } else if (req.body.order.clientType === 'individual') {
            Client.findOne({ phone: req.body.order.phone })
              .then(client => {
                if (client) {
                  // if we have a client with this phone number
                  client.orders.push(savedOrder._id);
                  client.save();

                } else {
                  let array = [];
                  array.push(savedOrder._id);

                  const newClient = new Client({
                    _id: mongoose.Types.ObjectId(),
                    type: req.body.order.clientType,
                    name: req.body.order.client,
                    phone: req.body.order.phone,

                    address: req.body.order.address || '',
                    address_v2: req.body.order.address_v2 || {},

                    orders: array,
                    createdAt: new Date()
                  });

                  newClient.save();
                }
              });
          }

          Order.findOne(order)
            .populate('disinfectorId userCreated clientId userAcceptedOrder')
            .exec()
            .then(savedOrder => {
              io.getIO().emit('createOrder', {
                disinfectorId: req.body.disinfectorId,
                order: savedOrder
              });
              return res.json(savedOrder);
            });
        })
    })
    .catch(err => {
      console.log('createRepeatOrder ERROR', err);
      res.status(404).json(err);
    });
};


// get orders for logged in disinfector or subadmin (only not completed orders)
exports.getOrders = (req, res) => {
  Order.find({
    disinfectorId: req.body.userId,
    completed: false,
    $or: [
      { repeatedOrder: false },
      {
        $and: [
          { repeatedOrder: true },
          { repeatedOrderDecided: true },
          { repeatedOrderNeeded: true }
        ]
      }
    ]
  })
    .populate({
      path: 'clientId',
      select: 'name'
    })
    .populate({
      path: 'userCreated',
      select: 'name occupation'
    })
    .populate({
      path: 'userAcceptedOrder',
      select: 'name occupation'
    })
    .populate({
      path: 'whoDealtWithClient',
      select: 'name occupation'
    })
    .exec()
    .then(orders => res.json(orders))
    .catch(err => {
      console.log('getOrders ERROR', err);
      res.status(404).json(err);
    });
};


// add disinfector comment to order
exports.addDisinfectorComment = (req, res) => {
  Order.findById(req.body.id)
    .then(order => {
      order.disinfectorComment = req.body.comment;
      order.save();
      return res.json(order);
    })
    .catch(err => {
      console.log('getOrders ERROR', err);
      res.status(404).json(err);
    });
};


exports.getOrderById = async (req, res) => {
  Order.findById(req.body.id)
    .populate('disinfectorId userCreated clientId userAcceptedOrder whoDealtWithClient disinfectors.user')
    // получаем заказ когда дезинфектор заполняет форму о выполнении заказа (OrderComplete),
    // то мы должны получить поле 'prevFailedOrder', так как у некачественных и повторных заказов 
    // сумма заказа не вводится
    .populate({
      path: 'prevFailedOrder',
      model: 'Order',
      // we should select all fields !! (24.11.2021)
      // select: 'dateFrom disinfectorId',
      // populate: {
      //   path: 'disinfectorId',
      //   model: 'User',
      //   select: 'occupation name'
      // },

      // populate: {
      //   path: 'disinfectorId userCreated clientId userAcceptedOrder disinfectors.user',
      // },
      populate: [{
        path: 'nextOrdersAfterFailArray',
        model: 'Order',
        populate: {
          path: 'disinfectorId',
          model: 'User',
          select: 'name occupation'
        }
      },
      {
        path: 'disinfectorId',
        model: 'User',
        select: 'name occupation'
      },
      {
        path: 'userCreated',
        model: 'User',
        select: 'name occupation'
      },
      {
        path: 'userAcceptedOrder',
        model: 'User',
        select: 'name occupation'
      },
      {
        path: 'whoDealtWithClient',
        model: 'User',
        select: 'name occupation'
      },
      {
        path: 'disinfectors.user',
        model: 'User',
        select: 'name occupation'
      },
      {
        path: 'clientId',
        model: 'Client',
        select: 'type name phone address'
      },
      ]
    })
    .populate({
      // populate field 'nextOrdersAfterFailArray' and field 'disinfectorId' inside it
      path: 'nextOrdersAfterFailArray',
      model: 'Order',
      // select only 2 fields
      // select: 'dateFrom disinfectorId',
      // we should select all fields !! (24.11.2021)

      // populate all fields for each order in nextOrdersAfterFailArray
      populate: {
        path: 'disinfectorId userCreated clientId userAcceptedOrder whoDealtWithClient disinfectors.user'
      },
    })
    .exec()
    .then(order => res.json(order))
    .catch(err => {
      console.log('getOrderById ERROR', err);
      res.status(404).json(err);
    });

  // const order = Order.findById(req.body.id)
  //   .populate('disinfectorId userCreated clientId userAcceptedOrder disinfectors.user')
  //   .exec();

  // if (!order) {
  //   return res.json({})
  // }

  // return res.json(order);
};


exports.searchOrders = async (req, res) => {
  let query;

  if (req.body.object.method === 'phone') {

    query = Order.find({
      $or: [
        { "phone": req.body.object.payload },
        { "phone": { "$regex": req.body.object.payload, "$options": "i" } },
        { "phone2": req.body.object.payload },
        { "phone2": { "$regex": req.body.object.payload, "$options": "i" } },
      ],
      dateFrom: { $exists: true }
    });

  } else if (req.body.object.method === 'contract') {

    query = Order.find({
      clientType: 'corporate',
      $or: [
        { "contractNumber": req.body.object.payload },
        { "contractNumber": { "$regex": req.body.object.payload, "$options": "i" } }
      ],
      dateFrom: { $exists: true }
    });

  } else if (req.body.object.method === 'address') {

    query = Order.find({
      $or: [
        { "address": req.body.object.payload },
        { "address": { "$regex": req.body.object.payload, "$options": "i" } }
      ],
      dateFrom: { $exists: true }
    });

  } else if (req.body.object.method === 'orderNumber') {

    query = Order.find({
      $or: [
        { "orderNumber": req.body.object.payload },
        { "orderNumber": { "$regex": req.body.object.payload, "$options": "i" } }
      ],
      dateFrom: { $exists: true }
    });

  } else if (req.body.object.method === 'filial') {

    query = Order.find({
      clientType: 'corporate',
      $or: [
        { "filial": req.body.object.payload },
        { "filial": { "$regex": req.body.object.payload, "$options": "i" } }
      ],
      dateFrom: { $exists: true }
    });

  } else {
    // get first 5 orders
    query = Order.find().limit(5);
  }

  try {
    let orders = await query
      // .populate('disinfectorId userCreated clientId userAcceptedOrder disinfectors.user')
      .populate({
        path: 'disinfectorId',
        select: 'name occupation'
      })
      .populate({
        path: 'clientId',
        select: 'name'
      })
      .exec() || [];

    return res.json(orders);
  } catch (err) {
    console.log('searchOrders ERROR', err);
    res.status(404).json(err);
  }
};


exports.submitCompleteOrder = (req, res) => {
  const { order } = req.body;

  Order.findById(order.orderId)
    .then(foundOrder => {
      foundOrder.completed = true;

      if (foundOrder.returnedBack && !foundOrder.returnHandled) {
        foundOrder.returnHandled = true;
        foundOrder.adminDecidedReturn = false;
      }

      let newArray = [];
      order.disinfectors.forEach(item => {
        newArray.push({
          user: item.disinfectorId,
          consumption: item.consumption
        });
      });

      foundOrder.disinfectors = newArray;

      foundOrder.guarantee = Number(order.guarantee);
      foundOrder.guarantee_v2 = order.guarantee_v2;

      foundOrder.paymentMethod = order.paymentMethod;
      foundOrder.disinfectorComment = order.disinfectorComment;

      if (order.clientType === 'corporate') {
        if (order.paymentMethod === 'cash') {
          foundOrder.contractNumber = '';
          foundOrder.cost = Number(order.cost);
        } else if (order.paymentMethod === 'notCash') {
          foundOrder.contractNumber = order.contractNumber;
        }
      } else if (order.clientType === 'individual') {
        foundOrder.cost = Number(order.cost);
      }

      // if (order.paymentMethod === 'Безналичный') {
      //   foundOrder.invoice = order.invoice;
      // } else {
      //   foundOrder.invoice = -1;
      // }

      foundOrder.completedAt = new Date();
      return foundOrder.save();
    })
    .then(newCompleteOrder => {
      // subtract materials from disinfectors
      order.disinfectors.forEach(item => {
        User.findById(item.disinfectorId)
          .then(user => {
            user.subtractConsumptionMaterials(item.consumption);
          });
      });

      let date = new Date(newCompleteOrder.dateFrom);

      // if the query has been previously returned, it means that repeat order has already been created
      if (newCompleteOrder.returnedBack) {
        Order.findOne({ previousOrder: newCompleteOrder._id })
          .then(repOrder => {
            if (repOrder) {
              // add several months to date
              repOrder.timeOfRepeat = new Date(date.setMonth(date.getMonth() + newCompleteOrder.guarantee));
              repOrder.save();
            }
          });

      } else {
        const newOrderObject = {
          disinfectorId: newCompleteOrder.disinfectorId,
          clientType: newCompleteOrder.clientType,
          client: newCompleteOrder.client,
          clientId: newCompleteOrder.clientId,
          filial: newCompleteOrder.filial,

          address: newCompleteOrder.address,
          address_v2: newCompleteOrder.address_v2 || {},

          phone: newCompleteOrder.phone,
          phone2: newCompleteOrder.phone2,
          typeOfService: newCompleteOrder.typeOfService,
          advertising: newCompleteOrder.advertising,
          userCreated: newCompleteOrder.userCreated,
          userAcceptedOrder: newCompleteOrder.userAcceptedOrder,
          repeatedOrder: true,
          // add several months to date
          timeOfRepeat: new Date(date.setMonth(date.getMonth() + newCompleteOrder.guarantee)),
          previousOrder: newCompleteOrder._id,
        };

        if (newCompleteOrder.whoDealtWithClient) {
          newOrderObject.whoDealtWithClient = newCompleteOrder.whoDealtWithClient;
        }

        const repeatOrder = new Order(newOrderObject);

        repeatOrder.save();
      }

      io.getIO().emit('submitCompleteOrder', {
        completeOrder: newCompleteOrder
      });
      return res.json(newCompleteOrder);
    })
    .catch(err => {
      console.log('submitCompleteOrder ERROR', err);
      res.status(400).json(err);
    });
};


// this function gets disinfector queries (his completed orders)
// not only in given month but also in week and day
exports.getCompleteOrdersInMonth = (req, res) => {
  const { disinfectorId } = req.body.object;

  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  Order.find({
    completed: true,
    $and: [
      { dateFrom: { '$gte': timeObject.min } },
      { dateFrom: { '$lt': timeObject.max } }
    ],
    $or: [
      { disinfectorId: disinfectorId },
      { "disinfectors.user": disinfectorId }
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
    .exec()
    .then(orders => {

      // NOT SURE TO DELETE THIS PIECE OF CODE
      orders = orders.filter(item => {
        let amongDisinfectors = 0;
        item.disinfectors.forEach(element => {
          if (element.user._id.toString() === disinfectorId) amongDisinfectors++;
        });
        if (item.disinfectorId._id.toString() === disinfectorId || amongDisinfectors > 0) {
          return true;
        } else {
          return false;
        }
      });
      // -----------

      return res.json(orders);
    })
    .catch(err => {
      console.log('getCompleteOrdersInMonth ERROR', err);
      res.status(400).json(err);
    });
};


exports.getAddMaterialsEvents = (req, res) => {
  const id = req.body.id;

  AddMaterial
    .find({ disinfector: id })
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
      console.log('getAddMaterialsEvents ERROR', err);
      res.status(400).json(err);
    });
};


exports.disAddMatToOtherDis = async (req, res) => {
  // add material to recipient
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

  // subtract material from donor
  User.findById(req.body.object.admin)
    .then(user => {
      user.subtractConsumptionMaterials(req.body.object.materials);
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
  // send telegram notification to disinfector (who received materials)
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
  const sender = await User.findById(req.body.object.admin, { name: 1, occupation: 1 });
  const receiver = await User.findById(req.body.object.disinfector, { name: 1, occupation: 1 });

  const object_to_send_notif = {
    sender,
    receiver,
    materials: req.body.object.materials,
  };
  sendNotifToAdminOnMaterialDistrib(object_to_send_notif);
  // =======================================


  newObject.save()
    .then(obj => res.json(obj))
    .catch(err => {
      console.log('disAddMatToOtherDis ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getReturnedQueries = (req, res) => {
  Order.find({
    disinfectorId: req.body.id,
    completed: true,
    returnedBack: true,
    returnHandled: false,
    // $or: [
    //   { adminDecided: false },
    //   { accountantDecided: false }
    // ]
  })
    .populate({
      path: 'clientId',
      select: 'name'
    })
    .exec()
    .then(queries => res.json(queries))
    .catch(err => {
      console.log('getReturnedQueries ERROR', err);
      return res.status(400).json(err);
    });
};


// disinfector sends notification via TG bot to user who created order
exports.notifyForIncorrectDataInOrder = async (req, res) => {
  // expected input format. req.body.object
  // {
  //   orderId: String,
  //   sender: {
  //     id: String,
  //     name: String,
  //     occupation: String,
  //   },
  //   whoCreatedOrder: String,
  // } 

  const { object } = req.body;

  // id of order with some incorrect data (usually that is invalid date)
  const { orderId, sender } = object;
  // id of user who added the order to Pro Team
  const userIdWhoCreatedOrder = object.whoCreatedOrder;

  try {
    const order = await Order.findById(orderId, {
      dateFrom: 1,
      address: 1,
      clientType: 1,
      client: 1,
      phone: 1,
      typeOfService: 1,
    });

    const userWhoCreatedOrder = await User.findById(userIdWhoCreatedOrder, { name: 1, occupation: 1 });

    // tg chat to send notification to
    const getTgChatResponse = await getTelegramChatIdOfUser(userIdWhoCreatedOrder);

    // url to the edit-order page of the web app
    // const fullUrl = req.protocol + '://' + req.get('host');
    const fullUrl = `https://pro-team.eu-4.evennode.com/edit-order/${orderId}`;
    // console.log('fullUrl', fullUrl);

    if (getTgChatResponse.success) {
      // tgBot.telegram.sendMessage('116975384', `
      tgBot.telegram.sendMessage(getTgChatResponse.tgChat, `
        ${sender.occupation} ${sender.name} просит Вас отредактировать заказ:
        -------
        Номер заявки: ${order.orderNumber || '--'}
        Дата: ${order.dateFrom || 'Invalid Date'} 
        Адрес: ${order.address}
        Тип Клиента: ${order.clientType}
        Клиент: ${order.client}
        Телефон Клиента: ${order.phone}
        Тип Заказа: ${order.typeOfService}
        -------
        Возможная причина: Invalid Date - дата заказа указана неправильно.
        Пожалуйста, перейдите по этой ссылке и отредактируйте заказ:
        ${fullUrl}
      `);

      res.json({
        success: true,
        message: `Уведомление отправлено через ТГ бот пользователю ${userWhoCreatedOrder.occupation} ${userWhoCreatedOrder.name}`,
      });
    } else {
      res.json({ success: false, message: `TG chatId of user ${userIdWhoCreatedOrder} is not found` });
    }
  } catch (err) {
    console.log('notifyForIncorrectDataInOrder ERROR', err);
    return res.status(400).json({ success: true, message: '', error: err });
  }
};