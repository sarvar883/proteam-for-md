import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import classnames from 'classnames';
import { setAdminGradeToOrder } from '../../actions/adminActions';
import orderFullyProcessed from '../../utils/orderFullyProcessed';
import userIsSuperAdmin from '../../utils/userIsSuperAdmin';


class SetGradeToOrder extends Component {
  state = {
    order: {},
    grade: '',
    comment: '',

    errors: {},
  };

  componentDidMount() {
    this.setState({
      order: this.props.order
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onSubmit = (e) => {
    e.preventDefault();

    const object = {
      orderId: this.state.order._id,
      grade: Number(this.state.grade),
      comment: this.state.comment,
    };
    // console.log('onSubmit', object);
    this.props.setAdminGradeToOrder(object, this.props.history);
  }

  render() {
    return (
      <React.Fragment>
        {/* оценку может поставить только Temur Muhtorov */}
        {/* {orderFullyProcessed(this.state.order) && ( */}
        {orderFullyProcessed(this.state.order) && userIsSuperAdmin(this.props.auth.user) && (
          <React.Fragment>
            <div className="border-between-disinfectors mt-2"></div>
            <div className="border-between-disinfectors"></div>

            <h5>Поставьте оценку за заказ (0-10)</h5>

            <form onSubmit={this.onSubmit} className="mt-2">

              <div className="form-group">
                <input
                  type="number"
                  className={classnames('form-control', {
                    'is-invalid': this.state.errors.grade
                  })}
                  name="grade"
                  min={0} max={10} step={1}
                  onChange={this.onChange}
                  placeholder="Оценка"
                  required
                />
                {this.state.errors.grade && (
                  <div className="invalid-feedback">{this.state.errors.grade}</div>
                )}
              </div>

              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={2}
                  name="comment"
                  onChange={this.onChange}
                  placeholder="Комментарии (Необязательно)"
                />
              </div>

              <button type="submit" className="btn btn-success">
                <i className="fas fa-comments"></i> Сохранить оценку
              </button>
            </form>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors
});

export default connect(mapStateToProps, { setAdminGradeToOrder })(withRouter(SetGradeToOrder));