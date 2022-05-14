const express = require('express');
const passport = require('passport');
const router = express.Router();

const subadminController = require('../controllers/subadmin');
const { possibleRoles } = require('../middleware/possibleRoles');

router.post(
  '/get-sorted-orders',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin']),
  subadminController.getSortedOrders
);

router.post(
  '/get-subadmin-materials',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin']),
  subadminController.getSubadminMaterials
);

// subadmin adds material to disinfector
router.post(
  '/add-material-to-disinfector',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin', 'supplier']),
  subadminController.addMaterialToDisinfector
);

router.post(
  '/get-material-coming-history',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin']),
  subadminController.getMatComHistory
);

router.post(
  '/get-material-distrib-history',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin']),
  subadminController.getMatDistribHistory
);

module.exports = router;