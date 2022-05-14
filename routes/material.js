const express = require('express');
const passport = require('passport');
const router = express.Router();

const materialController = require('../controllers/material');

router.post(
  '/test',
  // passport.authenticate('jwt', { session: false }),
  materialController.test
);

router.post(
  '/add-new',
  passport.authenticate('jwt', { session: false }),
  materialController.addNewMaterial
);

router.post(
  '/get-all',
  passport.authenticate('jwt', { session: false }),
  materialController.getAllMaterials
);

router.post(
  '/delete',
  passport.authenticate('jwt', { session: false }),
  materialController.deleteMaterialFromDB
);

module.exports = router;