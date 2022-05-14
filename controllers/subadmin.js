const User = require('../models/user');
const Order = require('../models/order');
const AddMaterial = require('../models/addMaterial');

const tgBot = require('../bot');
const { getTelegramChatIdOfUser } = require('../utils/getTgChat');
const { sendNotifToAdminOnMaterialDistrib } = require('../utils/sendNotifToAdmin');
const { convertDateToString } = require('../utils/convertDateToString');
const { getDateStringElements } = require('../utils/dateStringElements');

const monthHelper = require('../utils/monthMinMax');
const weekHelper = require('../utils/weekMinMax');
const dayHelper = require('../utils/dayMinMax');


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
      console.log('getSortedOrders SUBADMIN ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getSubadminMaterials = (req, res) => {
  User.findById(req.body.id)
    .then(user => res.json(user))
    .catch(err => {
      console.log('getSubadminMaterials ERROR', err);
      return res.status(400).json(err);
    });
};


// subadmin adds material to disinfector
exports.addMaterialToDisinfector = async (req, res) => {
  // inputs
  const disinfectorId = req.body.object.disinfector;
  const subadminId = req.body.object.subadmin;
  const materialsToProcess = req.body.object.materials;

  // add materials to disinfector
  const disinfector = await User.findById(disinfectorId);

  materialsToProcess.forEach(mat => {
    disinfector.materials.forEach(item => {
      if (item.material === mat.material && item.unit === mat.unit) {
        item.amount += Number(mat.amount);
      }
    });
  });
  // console.log('disinf materails after', disinfector.materials);
  await disinfector.save();

  //  ========================
  //  =======================

  // subtract materials from subadmin
  const subadmin = await User.findById(subadminId);

  materialsToProcess.forEach(mat => {
    subadmin.materials.forEach(item => {
      if (item.material === mat.material && item.unit === mat.unit) {
        item.amount -= Number(mat.amount);
      }
    });
  });

  await subadmin.save();

  // User.findById(req.body.object.disinfector)
  //   .then(user => {
  //     req.body.object.materials.forEach(mat => {
  //       user.materials.forEach(item => {
  //         if (item.material === mat.material && item.unit === mat.unit) {
  //           item.amount += Number(mat.amount);
  //           // return;
  //         }
  //       });
  //     });
  //     user.save();
  //   });

  // User.findById(req.body.object.subadmin)
  //   .then(subadmin => {
  //     subadmin.materials.forEach(item => {
  //       req.body.object.materials.forEach(mat => {
  //         if (item.material === mat.material && item.unit === mat.unit) {
  //           item.amount -= mat.amount;
  //           // return;
  //         }
  //       });
  //     });
  //     subadmin.save();
  //   });

  const newObject = new AddMaterial({
    disinfector: req.body.object.disinfector,
    admin: req.body.object.subadmin,
    materials: req.body.object.materials,
    createdAt: new Date()
  });

  // user who gave materials (we will write this info in TG notification)
  const donor = await User.findById(req.body.object.subadmin, { name: 1, occupation: 1 });

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
  const object_to_send_notif = {
    sender: subadmin,
    receiver: disinfector,
    materials: materialsToProcess,
  };
  sendNotifToAdminOnMaterialDistrib(object_to_send_notif);
  // =======================================


  newObject.save()
    .then(obj => res.json(obj))
    .catch(err => {
      console.log('addMaterialToDisinfector SUBADMIN ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getMatComHistory = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  }

  AddMaterial.find({
    disinfector: req.body.object.subadmin,
    $and: [
      { createdAt: { '$gte': timeObject.min } },
      { createdAt: { '$lt': timeObject.max } }
    ]
  })
    .populate({
      path: 'admin',
      select: 'name occupation'
    })
    .populate({
      path: 'disinfector',
      select: 'name occupation'
    })
    .exec()
    .then(events => {
      return res.json({
        method: req.body.object.type,
        events: events
      });
    })
    .catch(err => {
      console.log('getMatComHistory SUBADMIN ERROR', err);
      return res.status(400).json(err);
    });
};


exports.getMatDistribHistory = (req, res) => {
  let timeObject;
  if (req.body.object.type === 'month') {
    timeObject = monthHelper(req.body.object.month, req.body.object.year);
  } else if (req.body.object.type === 'week') {
    timeObject = weekHelper(req.body.object.days);
  }

  AddMaterial.find({
    admin: req.body.object.subadmin,
    $and: [
      { createdAt: { '$gte': timeObject.min } },
      { createdAt: { '$lt': timeObject.max } }
    ]
  })
    .populate({
      path: 'admin',
      select: 'name occupation'
    })
    .populate({
      path: 'disinfector',
      select: 'name occupation'
    })
    .exec()
    .then(events => {
      return res.json({
        method: req.body.object.type,
        events: events
      });
    })
    .catch(err => {
      console.log('getMatDistribHistory SUBADMIN ERROR', err);
      return res.status(400).json(err);
    });
};