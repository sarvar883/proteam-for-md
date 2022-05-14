import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


class Accountant extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <h2>Страница Бухгалтера</h2>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  accountant: state.accountant,
  errors: state.errors
});

export default connect(mapStateToProps, {})(withRouter(Accountant));