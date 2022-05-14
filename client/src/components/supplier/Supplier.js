import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


class Supplier extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <h2>Страница Снабженца</h2>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(Supplier));