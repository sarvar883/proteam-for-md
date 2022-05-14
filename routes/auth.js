const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/auth');
const { possibleRoles } = require('../middleware/possibleRoles');

router.post(
  '/login',
  authController.loginUser
);

router.post(
  '/register',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  authController.registerUser
);

router.post(
  '/auth/get-disinfector-materials',
  passport.authenticate('jwt', { session: false }),
  authController.getDisinfectorMaterials
);

// Return current user
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  authController.currentUser
);

router.post(
  '/change-password',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  authController.changePassword
);

router.post(
  '/get-user-by-id',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  authController.getUserById
);


// new universal endpoint
router.post(
  '/get-users',
  passport.authenticate('jwt', { session: false }),
  authController.getUsers
);


router.post(
  '/edit-user',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  authController.editUser
);

router.post(
  '/disable-user',
  passport.authenticate('jwt', { session: false }),
  possibleRoles(['admin']),
  authController.disableUser
);

module.exports = router;