const Order = require('../models/order');
const User = require('../models/user');


const monthHelper = require('../utils/monthMinMax');
const weekHelper = require('../utils/weekMinMax');
const dayHelper = require('../utils/dayMinMax');


exports.getQueries = (req, res) => {
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
    adminDecidedReturn: false,
    adminDecided: false,
    accountantDecided: false,
    // clientType: 'corporate',
    // paymentMethod: 'notCash',
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
    .exec()
    .then(orders => res.json(orders))
    .catch(err => {
      console.log('Accountant getQueries ERROR', err);
      res.status(400).json(err);
    });
};


exports.getQueryById = (req, res) => {
  Order.findById(req.body.id)
    .populate({
      path: 'disinfectorId',
      select: 'name occupation'
    })
    .populate({
      path: 'clientId',
      select: 'name contracts'
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
    .populate({
      path: 'disinfectors.user',
      select: 'name occupation'
    })
    .populate({
      // populate field 'nextOrdersAfterFailArray' and field 'disinfectorId' inside it
      path: 'nextOrdersAfterFailArray',
      model: 'Order',
      // select only 2 fields
      select: 'dateFrom disinfectorId',
      populate: {
        path: 'disinfectorId',
        model: 'User',
        select: 'occupation name'
      }
    })
    .exec()
    .then(order => res.json(order))
    .catch(err => {
      console.log('Accountant getQueryById ERROR', err);
      res.status(400).json(err);
    });
};


exports.confirmQuery = (req, res) => {
  Order.findById(req.body.object.orderId)
    .then(order => {

      if (req.body.object.decision === 'back') {
        order.returnedBack = true;
        order.returnHandled = false;
        order.adminDecidedReturn = true;

        order.operatorDecided = false;
        order.operatorConfirmed = false;

        order.accountantDecided = false;
        order.accountantConfirmed = false;

        // return materials to disinfectors
        req.body.object.disinfectors.forEach(person => {
          User.findById(person.user._id)
            .then(user => {
              if (user) {
                user.returnMaterials(person.consumption);
              }
            });
        });

      } else {

        order.accountantDecided = true;
        order.accountantCheckedAt = new Date();

        if (req.body.object.decision === 'confirm') {
          order.accountantConfirmed = true;

          if (req.body.object.clientType === 'corporate' &&
            req.body.object.paymentMethod !== 'cash'
          ) {
            order.invoice = req.body.object.invoice;
            order.cost = req.body.object.cost;
          }

        } else if (req.body.object.decision === 'reject') {
          order.accountantConfirmed = false;
        }

      }

      return order.save();
    })
    .then(savedOrder => res.json(savedOrder))
    .catch(err => {
      console.log('Accountant confirmQuery ERROR', err);
      res.status(400).json(err);
    });
};


// accountant sees statistics
exports.getAccStats = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  Order.find({
    clientType: 'corporate',
    $and: [
      { dateFrom: { '$gte': timeObject.min } },
      { dateFrom: { '$lt': timeObject.max } }
    ],
    // из статистики корпоративных клиентов исключаем повторные и некачественные заказы
    // failed: false,
    // prevFailedOrder: { $exists: false },
  })
    .then(orders => {
      return res.json({
        method: req.body.object.type,
        orders: orders
      });
    })
    .catch(err => {
      console.log('Accountant getAccStats ERROR', err);
      res.status(400).json(err);
    });
};