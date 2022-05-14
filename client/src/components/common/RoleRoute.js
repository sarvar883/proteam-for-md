import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';


// roles is an array of strings - roles that can access this route
const RoleRoute = ({ component: Component, auth, roles, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (auth.isAuthenticated === false) {
        return <Redirect to="/login" />
      }
      if (roles.includes(auth.user.occupation)) {
        return <Component {...props} />
      } else {
        return <Redirect to={`/${auth.user.occupation}`} />
      }
    }}
  />
);

RoleRoute.defaultProps = {
  auth: {
    user: {},
  },
  roles: [],
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(RoleRoute);