import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';
import { clearCurrentProfile } from './actions/profileActions';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import store from './store';

// import routes
import StartPage from './components/common/StartPage';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';

// Components
import Navbar from './components/layout/Navbar';
import About from './components/common/About';
import Footer from './components/layout/Footer';

import Admin from './components/admin/Admin';
import AdminStats from './components/admin/AdminStats';
import AdvStats from './components/admin/AdvStats';
import DisStats from './components/admin/DisStats';
import OperStats from './components/admin/OperStats';
import AdminQueries from './components/admin/AdminQueries';
import AdminMaterials from './components/admin/AdminMaterials';
import EditOrder from './components/common/EditOrder';
import MatComing from './components/admin/MatComing';
import MatComHistory from './components/admin/MatComHistory';
import MaterialHistory from './components/admin/MaterialHistory';
import AddClient from './components/admin/AddClient';
import EditClient from './components/common/EditClient';
import Users from './components/common/Users';
import EditUser from './components/common/EditUser';
import ClientList from './components/admin/ClientList';
import ClientId from './components/admin/ClientId';
import SetDisinfectorMaterials from './components/common/SetDisinfectorMaterials';
import SetCurrentMaterials from './components/admin/SetCurrentMaterials';
import SendMaterialsBtwDis from './components/subadmin/SendMaterialsBtwDis';

import MaterialList from './components/admin/MaterialList';
import NewMaterial from './components/admin/NewMaterial';
import Options from './components/common/Options';
import AlertContainer from './components/common/AlertContainer';

import Subadmin from './components/subadmin/Subadmin';
import SubadmOrders from './components/subadmin/SubadmOrders';
// import MaterialDistrib from './components/subadmin/MaterialDistrib';
import SubMatComHist from './components/subadmin/SubMatComHist';
import MatDistribHistory from './components/subadmin/MatDistribHistory';

import Disinfector from './components/disinfector/Disinfector';
import DisinfQueries from './components/disinfector/DisinfQueries';
import DisinfStats from './components/disinfector/DisinfStats';
import OrderComplete from './components/disinfector/OrderComplete';
import DisMaterials from './components/disinfector/DisMaterials';
import DisMatCom from './components/disinfector/DisMatCom';
import DisMatDistrib from './components/disinfector/DisMatDistrib';
import ReturnedQueries from "./components/disinfector/ReturnedQueries";

import Operator from './components/operator/Operator';
import CreateOrder from './components/operator/CreateOrder';
import OrderQueries from './components/operator/OrderQueries';
import ConfirmOrder from './components/operator/ConfirmOrder';
import RepeatOrders from './components/operator/RepeatOrders';
import CreateRepeatOrder from './components/operator/CreateRepeatOrder';
import OperatorStats from './components/operator/OperatorStats';

import Accountant from './components/accountant/Accountant';
import Queries from './components/accountant/Queries';
import ConfirmQueryForm from './components/accountant/ConfirmQueryForm';
import AccStats from './components/accountant/AccStats';

import OrderFullDetails from './components/common/OrderFullDetails';
import NotCompOrders from './components/operator/NotCompOrders';
import SearchOrders from './components/operator/SearchOrders';

import Register from './components/auth/Register';
import Login from './components/auth/Login';

// Fail Order Components
import FailAddNew from './components/fail/FailAddNew';
import SeeFails from './components/fail/SeeFails';

// Supplier Routes
import Supplier from './components/supplier/Supplier';

// import actions
import { getAllMaterials } from './actions/materialActions';

// CSS
import './App.css';
import './darkTheme.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


// Check for token
if (localStorage.jwtToken) {
  // Set auth token header auth
  setAuthToken(localStorage.jwtToken);
  // Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Clear current Profile
    store.dispatch(clearCurrentProfile());
    // Redirect to login
    window.location.href = '/login';
  }
}


class App extends Component {
  state = {
    theme: localStorage.getItem('proTeamTheme') || 'light'
  };

  componentDidMount() {
    this.props.getAllMaterials();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.options.theme !== this.state.theme) {
      this.setState({ theme: nextProps.options.theme });
    }
  }

  render() {
    if (this.state.theme === 'dark') {
      document.body.style.background = '#232326';
    } else {
      document.body.style.background = 'white';
    }

    return (
      <div className={`App ${this.state.theme}`}>
        <AlertContainer />

        <Navbar />
        <Route exact path="/login" component={Login} />

        <Switch>
          <PrivateRoute exact path="/about" component={About} />
        </Switch>

        <Switch>
          <StartPage exact path="/" />
        </Switch>

        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator']}
            exact path="/not-completed-orders" component={NotCompOrders}
          />
        </Switch>

        <Switch>
          <PrivateRoute exact path="/order-full-details/:id" component={OrderFullDetails} />
        </Switch>


        {/* Admin Routes */}
        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin" component={Admin} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin']} exact path="/register" component={Register} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin']} exact path="/admin/stats" component={AdminStats} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin']} exact path="/admin/adv-stats" component={AdvStats} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin']} exact path="/admin/disinf-stats" component={DisStats} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin']} exact path="/admin/operator-stats" component={OperStats} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin/order-queries" component={AdminQueries} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin', 'supplier']} exact path="/admin/materials" component={AdminMaterials} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin', 'supplier']} exact path="/admin/material-coming" component={MatComing} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'supplier']} exact path="/admin/material-coming-history" component={MatComHistory} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'supplier']} exact path="/admin/material-history" component={MaterialHistory} />
        </Switch>
        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator', 'accountant']}
            exact path="/edit-order/:orderId" component={EditOrder}
          />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin/users" component={Users} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin/edit-user/:userId" component={EditUser} />
        </Switch>

        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator', 'accountant']}
            exact path="/add-client" component={AddClient}
          />
        </Switch>

        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator', 'accountant']}
            exact path="/edit-client/:id" component={EditClient}
          />
        </Switch>

        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator', 'accountant']}
            exact path="/clients" component={ClientList}
          />
        </Switch>
        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'operator', 'accountant']}
            exact path="/client/:clientId" component={ClientId}
          />
        </Switch>


        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin/material-list" component={MaterialList} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin']} exact path="/admin/new/mat" component={NewMaterial} />
        </Switch>
        <Switch>
          <PrivateRoute exact path="/options" component={Options} />
        </Switch>

        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'supplier']}
            exact path="/admin/set-disinfector-materials/:id" component={SetDisinfectorMaterials}
          />
        </Switch>
        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'supplier']}
            exact path="/admin/set-current-materials" component={SetCurrentMaterials}
          />
        </Switch>


        {/* Subadmin Routes */}
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin" component={Subadmin} />
        </Switch>
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin/orders" component={SubadmOrders} />
        </Switch>
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin/queries" component={DisinfQueries} />
        </Switch>
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin/stats" component={DisinfStats} />
        </Switch>
        {/* <Switch>
              <RoleRoute roles={['subadmin']} exact path="/subadmin/materials" component={MaterialDistrib} />
            </Switch> */}
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin/material-coming-history" component={SubMatComHist} />
        </Switch>
        <Switch>
          <RoleRoute roles={['subadmin']} exact path="/subadmin/material-distrib-history" component={MatDistribHistory} />
        </Switch>
        <Switch>
          <RoleRoute
            roles={['admin', 'subadmin', 'supplier']}
            exact path="/subadmin/send-materials-between-disinfectors" component={SendMaterialsBtwDis}
          />
        </Switch>


        {/* DisinfectorRoutes */}
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector" component={Disinfector} />
        </Switch>
        <Switch>
          <PrivateRoute exact path="/order-complete-form/:id" component={OrderComplete} />
        </Switch>
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector/queries" component={DisinfQueries} />
        </Switch>
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector/stats" component={DisinfStats} />
        </Switch>
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector/distrib-materials" component={DisMaterials} />
        </Switch>
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector/mat-com-history" component={DisMatCom} />
        </Switch>
        <Switch>
          <RoleRoute roles={['disinfector']} exact path="/disinfector/mat-distrib-history" component={DisMatDistrib} />
        </Switch>
        <Switch>
          <RoleRoute roles={['subadmin', 'disinfector']} exact path="/returned-queries" component={ReturnedQueries} />
        </Switch>


        {/* OperatorRoutes */}
        <Switch>
          <RoleRoute roles={['operator']} exact path="/operator" component={Operator} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin', 'operator']} exact path="/create-order" component={CreateOrder} />
        </Switch>
        <Switch>
          <RoleRoute roles={['operator']} exact path="/operator/order-queries" component={OrderQueries} />
        </Switch>
        <Switch>
          <RoleRoute roles={['operator']} exact path="/order-confirm/:id" component={ConfirmOrder} />
        </Switch>
        <Switch>
          <RoleRoute roles={['operator']} exact path="/operator/repeat-orders" component={RepeatOrders} />
        </Switch>
        <Switch>
          <RoleRoute roles={['admin', 'subadmin', 'operator']} exact path="/create-repeat-order-form/:orderId" component={CreateRepeatOrder} />
        </Switch>
        <Switch>
          <PrivateRoute exact path="/search-orders" component={SearchOrders} />
        </Switch>
        <Switch>
          <RoleRoute roles={['operator']} exact path="/operator/stats" component={OperatorStats} />
        </Switch>


        {/* Accountant Routes */}
        <Switch>
          <RoleRoute roles={['accountant']} exact path="/accountant" component={Accountant} />
        </Switch>
        <Switch>
          <RoleRoute roles={['accountant']} exact path="/accountant/queries" component={Queries} />
        </Switch>
        <Switch>
          <RoleRoute roles={['accountant']} exact path="/accountant/order-confirm/:id" component={ConfirmQueryForm} />
        </Switch>
        <Switch>
          <RoleRoute roles={['accountant']} exact path="/accountant/stats" component={AccStats} />
        </Switch>


        {/* Fail Order Routes */}
        <Switch>
          <PrivateRoute exact path="/fail/add-new/:id" component={FailAddNew} />
        </Switch>
        <Switch>
          <PrivateRoute exact path="/fail/see" component={SeeFails} />
        </Switch>


        {/* Supplier Routes */}
        <Switch>
          <RoleRoute roles={['supplier']} exact path="/supplier" component={Supplier} />
        </Switch>

        {/* Footer */}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  material: state.material,
  options: state.options,
  errors: state.errors,
});

export default connect(mapStateToProps, { getAllMaterials })(withRouter(App));