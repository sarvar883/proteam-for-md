const express = require('express');
const passport = require('passport');
const router = express.Router();

const accountantController = require('../controllers/accountant');
const { possibleRoles } = require('../middleware/possibleRoles');

router.post(
  '/get-queries',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['accountant']),
  accountantController.getQueries
);

router.post(
  '/get-query-by-id',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['accountant']),
  accountantController.getQueryById
);

router.post(
  '/confirm-query',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['accountant']),
  accountantController.confirmQuery
);

router.post(
  '/get-stats',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['accountant']),
  accountantController.getAccStats
);

module.exports = router;