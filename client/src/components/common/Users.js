import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';

import userRoles from '../common/userRoles';
import { getAllUsers } from '../../actions/orderActions';
import {
  changePassword,
  disableUser,
  setUserById,
} from '../../actions/adminActions';

import { toast } from 'react-toastify';


class Users extends Component {
  state = {
    // all users
    users: [],

    // initially show admin users
    roleToFilter: 'admin',
    filteredUsers: [],

    userId: '',
    password1: '',
    password2: '',
  };

  // componentDidMount() {
  //   if (this.props.admin.users && this.props.admin.users.length > 0) {
  //     this.setState({
  //       users: this.props.admin.users
  //     });
  //   } else {
  //     this.props.getAllUsers();
  //   }
  // }

  componentDidMount() {
    this.props.getAllUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.admin.users && nextProps.admin.users.length) {
      this.setState({
        // sort users alphabetically by occupation
        users: nextProps.admin.users.sort((x, y) => x.occupation.localeCompare(y.occupation)),
        filteredUsers: nextProps.admin.users.filter(user => user.occupation === this.state.roleToFilter),
      });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  clearState = (e) => {
    this.setState({
      userId: '',
      password1: '',
      password2: ''
    });
  };

  changePassword = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    let notMatch = false;
    let invalidLength = false;

    if (this.state.password1 !== this.state.password2) {
      notMatch = true;
    }
    if (this.state.password1.length < 6 || this.state.password1.length > 30) {
      invalidLength = true;
    }
    if (this.state.password2.length < 6 || this.state.password2.length > 30) {
      invalidLength = true;
    }

    if (notMatch) {
      return toast.error('???????????? ???? ??????????????????');
    }

    if (invalidLength) {
      return toast.error('?????????? ???????????? ???????????? ???????? ???? ?????????? 6 ???????????????? ?? ???? ?????????? 30 ????????????????');
    }

    // input data validation is successfull

    const object = {
      userId: this.state.userId,
      password1: this.state.password1,
      password2: this.state.password2
    };
    this.props.changePassword(object, this.props.history);
    window.location.reload();
  };

  deleteUser = (id) => {
    const object = {
      id: id
    };

    this.props.disableUser(object, this.props.history);
  };

  changeMaterials = (user) => {
    this.props.setUserById(user);
    this.props.history.push(`/admin/set-disinfector-materials/${user._id}`);
  };

  filterUsers = (role) => {
    this.setState({
      roleToFilter: role,
      filteredUsers: this.state.users.filter(user => user.occupation === role),
    });
  };


  render() {
    // const userRoles = [
    //   { role: 'admin', tab_name: '????????????' },
    //   { role: 'subadmin', tab_name: '??????????????????' },
    //   { role: 'accountant', tab_name: '????????????????????' },
    //   { role: 'operator', tab_name: '??????????????????' },
    //   { role: 'disinfector', tab_name: '????????????????????????' },
    // ];

    let userOptions = [{
      label: '- ???????????????? ???????????????????????? -- ', value: ''
    }];

    this.state.users.forEach((user) => {
      userOptions.push({
        label: `${user.occupation} ${user.name}`, value: user._id
      });
    });


    let renderUsers = this.state.filteredUsers.map((user, key) => (
      <div className="col-lg-4 col-md-6 mt-3" key={key}>
        <div className="card order">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 pl-0 list-unstyled">
              <li>??????: {user.name}</li>
              <li>E-mail: {user.email}</li>
              <li>??????????????: {user.phone}</li>
              <li>??????????????????: {user.occupation}</li>
              <li>???????? (?? ??????????????????): {user.color || '--'}</li>
            </ul>

            <Link
              to={`/admin/edit-user/${user._id}`}
              className="btn btn-dark mt-2 mr-2"
            >
              <i className="fas fa-user-edit"></i> ??????????????????????????
            </Link>

            {['subadmin', 'disinfector'].includes(user.occupation) && (
              <button
                className="btn btn-primary mt-2 mr-2"
                onClick={() => this.changeMaterials(user)}
              >
                <i className="fas fa-syringe"></i> ???????????????? ??????????????????
              </button>
            )}

            <button
              className="btn btn-danger mt-2 mr-2"
              onClick={() => {
                if (window.confirm(`???? ?????????????? ?????????????? ???????????????????????? ${user.occupation} ${user.name}?`)) {
                  this.deleteUser(user._id)
                }
              }}
            >
              <i className="fas fa-trash-alt"></i> ??????????????
            </button>

          </div>
        </div>
      </div>
    ));

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">?????? ????????????????????????</h2>
          </div>
        </div>

        {this.props.admin.loadingUsers ? <Spinner /> : (
          <React.Fragment>

            <div className="row mt-1">
              <div className="col-12">
                <button type="button" className="btn btn-primary mt-2" data-toggle="modal" data-target='#changePassword'><i className="fas fa-key"></i> ???????????????? ???????????? ????????????????????????</button>

                <div className="modal fade" id='changePassword'>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" onClick={this.clearState.bind(this)} data-dismiss="modal">&times;</button>
                      </div>

                      <div className="modal-body">
                        <h4 className="modal-title"><i className="fas fa-key"></i> ???????????????? ???????????? ????????????????????????</h4>
                        <form onSubmit={this.changePassword}>
                          <div className="form-group">
                            <select
                              className="form-control"
                              name="userId"
                              onChange={this.onChange}
                              value={this.state.userId}
                              required
                            >
                              {userOptions.map((user, key) =>
                                <option key={key} value={user.value}>{user.label}</option>
                              )}
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="password1">?????????????? ?????????? ????????????:</label>
                            <input
                              type="password"
                              name="password1"
                              className="form-control"
                              onChange={this.onChange}
                              value={this.state.password1}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="password2">?????????????????? ????????????:</label>
                            <input
                              type="password"
                              name="password2"
                              className="form-control"
                              onChange={this.onChange}
                              value={this.state.password2}
                              required
                            />
                          </div>

                          <button type="submit" className="btn btn-success">
                            <i className="fas fa-copyright"></i> ???????????????? ????????????
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <h4 className="mb-0">?????????? ??????????????????????????: {this.state.users.length}</h4>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">

                <ul className="nav nav-tabs">
                  {/* Render Tabs */}
                  {/* Link to the tabs code */}
                  {/* https://www.w3schools.com/bootstrap/tryit.asp?filename=trybs_tabs_dynamic&stacked=h */}
                  {userRoles.map((object, index) =>
                    <li className="nav-item" key={index}>
                      <Link
                        to={`#${object.value}`}
                        // to={`#${object.role}`}
                        className={index === 0 ? 'nav-link active' : 'nav-link'}
                        data-toggle="tab"
                        onClick={() => this.filterUsers(object.value)}
                      // onClick={() => this.filterUsers(object.role)}
                      >
                        {object.label}
                        {/* {object.tab_name} */}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>


            <div className="row mt-3 tab-row">
              <div className="col-12">
                <h4 className="mb-0">??????????
                  {this.state.roleToFilter === 'admin' && ' ??????????????'}
                  {this.state.roleToFilter === 'subadmin' && ' ????????????????????'}
                  {this.state.roleToFilter === 'accountant' && ' ??????????????????????'}
                  {this.state.roleToFilter === 'operator' && ' ????????????????????'}
                  {this.state.roleToFilter === 'disinfector' && ' ??????????????????????????'}
                  : {this.state.filteredUsers.length}
                </h4>
              </div>

              {renderUsers}
            </div>

            {/* <div className="row mt-2">
              {renderUsers}
            </div> */}
          </React.Fragment>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors
});

export default connect(mapStateToProps, { getAllUsers, changePassword, disableUser, setUserById })(withRouter(Users));