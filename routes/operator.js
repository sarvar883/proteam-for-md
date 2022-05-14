const express = require('express');
const passport = require('passport');
const router = express.Router();

const operatorController = require('../controllers/operator');
const { possibleRoles } = require('../middleware/possibleRoles');

router.post(
  '/get-sorted-orders',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.getSortedOrders
);

router.post(
  '/get-not-comp-orders',
  passport.authenticate('jwt', { session: false }),
  operatorController.getNotCompOrders
);

router.post(
  '/get-complete-orders',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.getCompleteOrders
);

router.post(
  '/get-complete-order-by-id/:id',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.getCompleteOrderById
);

router.post(
  '/confirm-complete-order',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.confirmCompleteOrder
);

router.post(
  '/get-repeat-orders',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.getRepeatOrders
);

router.post(
  '/repeat-order-form',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.repeatOrderForm
);

router.post(
  '/repeat-order-not-needed',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.repeatOrderNotNeeded
);

router.post(
  '/get-operator-stats',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'operator']),
  operatorController.getOperatorStats
);

module.exports = router;