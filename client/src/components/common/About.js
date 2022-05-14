import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


class About extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-12">
            <h3 className="text-center">О приложении ProDez</h3>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-lg-6 col-md-8 m-auto">
            <div className="jumbotron">
              <h5><i className="fas fa-briefcase"></i> Компания: OOO Prof-Team</h5>
              <h5><i className="fas fa-code-branch"></i> Версия приложения: 5.1.10</h5>
              <h5><i className="fas fa-copyright"></i> {new Date().getFullYear()}</h5>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(About));