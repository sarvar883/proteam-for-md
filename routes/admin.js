const express = require('express');
const passport = require('passport');
const router = express.Router();

const adminController = require('../controllers/admin');
const { possibleRoles } = require('../middleware/possibleRoles');

router.post(
  '/get-sorted-orders',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  adminController.getSortedOrders
);

router.post(
  '/get-order-queries-for-admin',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  adminController.getOrderQueriesForAdmin
);

router.post(
  '/admin-confirms-order-query',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  adminController.confirmOrderQuery
);

router.post(
  '/admin-gives-grade-to-order',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  adminController.adminGivesGradeToOrder
);


router.post(
  '/add-materials-to-disinfector',
  passport.authenticate('jwt', { session: false }),
  adminController.addMaterialToDisinfector
);


router.post(
  '/get-add-material-events',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'supplier']),
  adminController.addMaterialEvents
);

router.post(
  '/get-current-materials',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin', 'supplier']),
  adminController.getCurMat
);

router.post(
  '/add-mat-coming',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'subadmin', 'supplier']),
  adminController.addMatComing
);


router.post(
  '/get-mat-coming',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin', 'supplier']),
  adminController.getMaterialComingEvents
);

router.post(
  '/add-client',
  passport.authenticate('jwt', { session: false }),
  adminController.addClient
);

router.post(
  '/edit-client',
  passport.authenticate('jwt', { session: false }),
  adminController.editClient
);

router.post(
  '/change-contract-numbers',
  passport.authenticate('jwt', { session: false }),
  adminController.changeContractNumbers
);

router.post(
  '/search-clients',
  passport.authenticate('jwt', { session: false }),
  adminController.searchClients
);

router.post(
  '/client-by-id',
  passport.authenticate('jwt', { session: false }),
  adminController.clientById
);

router.post(
  '/get-orders-of-client',
  passport.authenticate('jwt', { session: false }),
  adminController.getOrdersOfClient
);

router.post(
  '/set-disinfector-materials',
  passport.authenticate('jwt', { session: false }),
  adminController.setDisinfectorMaterials
);

router.post(
  '/set-current-materials',
  passport.authenticate('jwt', { session: false }),
  adminController.setCurrentMaterials
);

router.get(
  '/corporate-clients-excel',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  adminController.sendExcelFileOfCorporateClients
);

module.exports = router;