const Order = require('../models/order');

const monthHelper = require('../utils/monthMinMax');
const weekHelper = require('../utils/weekMinMax');
const dayHelper = require('../utils/dayMinMax');
const { getDateStringElements } = require('../utils/dateStringElements');

const validateConfirmedOrder = require('../validation/confirmOrder');


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
      console.log('getSortedOrders ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getNotCompOrders = (req, res) => {
  Order.find({
    completed: false,
    dateFrom: { '$lt': new Date() }
  }, {
    disinfectorId: 1,
    clientId: 1,
    clientType: 1,
    client: 1,
    filial: 1,
    dateFrom: 1,
    phone: 1,
    phone2: 1,
    address: 1,
    address_v2: 1,
    typeOfService: 1,
    advertising: 1
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
      console.log('getNotCompOrders ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getCompleteOrders = (req, res) => {
  // req.body.object has structure:
  // {
  //   operatorId: String,
  //   type: String, in this case 'day' | 'week'
  //   days?: array of dates, array has length 7
  //   day?: string
  // }

  let timeObject;
  if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  Order.find({
    completed: true,
    operatorDecided: false,
    adminDecidedReturn: false,
    $and: [
      { dateFrom: { '$gte': timeObject.min } },
      { dateFrom: { '$lt': timeObject.max } }
    ],
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
    .then(completeOrders => res.json(completeOrders))
    .catch(err => {
      console.log('getCompleteOrders ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getCompleteOrderById = (req, res) => {
  Order.findById(req.params.id)
    .populate({
      path: 'disinfectorId',
      select: 'name occupation'
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
      console.log('getCompleteOrderById ERROR', err);
      return res.status(404).json(err);
    });
};


exports.confirmCompleteOrder = (req, res) => {
  if (req.body.object.decision === 'confirm') {
    const { errors, isValid } = validateConfirmedOrder(req.body.object);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
  }

  Order
    .findById(req.body.object.orderId)
    .then(foundOrder => {
      foundOrder.operatorDecided = true;
      foundOrder.operatorCheckedAt = new Date();

      if (req.body.object.decision === 'confirm') {
        foundOrder.operatorConfirmed = true;
        foundOrder.clientReview = req.body.object.clientReview;
        foundOrder.score = req.body.object.score;

      } else if (req.body.object.decision === 'reject') {
        foundOrder.operatorConfirmed = false;
      }

      return foundOrder.save();
    })
    .then(confirmedOrder => res.json(confirmedOrder))
    .catch(err => {
      console.log('confirmCompleteOrder ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getRepeatOrders = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  // We should keep only ongoing repeated orders
  Order.find({
    repeatedOrder: true,
    repeatedOrderDecided: false,
    $and: [
      { timeOfRepeat: { '$gte': timeObject.min } },
      { timeOfRepeat: { '$lt': timeObject.max } }
    ],
    previousOrder: { $exists: true },
  })
    .populate({
      path: 'disinfectors.user',
      select: 'name occupation'
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
      path: 'previousOrder',
      model: 'Order',
      populate: [
        {
          path: 'disinfectors.user',
          select: 'name occupation',
          model: 'User'
        },
        {
          path: 'disinfectorId',
          select: 'name occupation',
          model: 'User'
        },
        {
          path: 'clientId',
          select: 'name',
          model: 'Client'
        },
        {
          path: 'userCreated',
          select: 'name occupation',
          model: 'User'
        },
        {
          path: 'userAcceptedOrder',
          select: 'name occupation',
          model: 'User'
        },
        {
          path: 'whoDealtWithClient',
          select: 'name occupation',
          model: 'User'
        }
      ]
    })
    .sort({ timeOfRepeat: 'ascending' })
    .exec()
    .then(orders => {
      // some orders seem to have previousOrder of null. Possibly this is because the previous order is created and later deleted. In order to avoid bugs we filter out orders which have previousOrder field equal to null
      // orders = orders.filter(item => item.previousOrder !== null);

      // orders = orders.sort((a, b) => new Date(a.timeOfRepeat) - new Date(b.timeOfRepeat));

      return res.json(orders);
    })
    .catch(err => {
      console.log('getRepeatOrders ERROR', err);
      return res.status(400).json(err);
    });
};


exports.repeatOrderForm = (req, res) => {
  Order.findById(req.body.id)
    .populate('previousOrder')
    .populate({
      path: 'disinfectorId',
      select: 'name occupation'
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
    .then(order => res.json(order))
    .catch(err => {
      console.log('repeatOrderForm ERROR', err);
      return res.status(400).json(err);
    });
};


exports.repeatOrderNotNeeded = (req, res) => {
  Order.findById(req.body.id)
    .then(order => {
      order.repeatedOrderDecided = true;
      order.repeatedOrderNeeded = false;
      return order.save();
    })
    .then(savedOrder => res.json(savedOrder))
    .catch(err => {
      console.log('repeatOrderNotNeeded ERROR', err);
      return res.status(400).json(err);
    });
};


// operator sees his own statistics
exports.getOperatorStats = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  } else if (req.body.object.type === 'day') {
    timeObject = dayHelper(req.body.object.day);
  }

  Order.find({
    // userAcceptedOrder: req.body.object.operatorId,
    $or: [
      { userAcceptedOrder: req.body.object.operatorId },
      { whoDealtWithClient: req.body.object.operatorId }
    ],
    $and: [
      { dateFrom: { '$gte': timeObject.min } },
      { dateFrom: { '$lt': timeObject.max } }
    ],

    // из статистики оператора исключаем повторные и некачественные заказы
    // failed: false,
    // prevFailedOrder: { $exists: false },
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
    .exec()
    .then(orders => {
      return res.json({
        method: req.body.object.type,
        sortedOrders: orders
      });
    })
    .catch(err => {
      console.log('getOperatorStats ERROR', err);
      res.status(404).json(err);
    });
};