// roles is an array of strings - roles that can access this route
exports.possibleRoles = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.occupation)) {
      return res.status(401).send({ error: `Role ${req.user.occupation} is not authorized to access this route`, });
    }

    next();
  };
};