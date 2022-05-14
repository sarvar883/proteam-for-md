import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

import isValidDate from '../../utils/dateIsValid';
import {
  getOrders,
  addDisinfectorComment,
} from '../../actions/orderActions';
import { notifyUserForIncorrectDataInOrder, } from '../../actions/disinfectorActions';


class OrderInfo extends Component {
  state = {
    addComment: false,
    disinfectorComment: this.props.orderObject.disinfectorComment,
    errors: {},
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  toggleAddComment = (e) => {
    e.preventDefault();
    this.setState({
      addComment: !this.state.addComment
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const object = {
      id: this.props.orderObject._id,
      comment: this.state.disinfectorComment
    };
    this.props.addDisinfectorComment(object, this.props.history, this.props.auth.user.occupation);
    this.setState({
      addComment: !this.state.addComment
    })
  };

  notifyUserWhoCreated = ({ orderId, whoCreatedOrder }) => {
    const object = {
      orderId,
      // id of user who created this order
      whoCreatedOrder,
      // user who is sending this notification
      sender: {
        id: this.props.auth.user.id,
        name: this.props.auth.user.name,
        occupation: this.props.auth.user.occupation,
      },
      userComment: '',
    };
    // console.log('object', object);
    this.props.notifyUserForIncorrectDataInOrder(object);
  };

  render() {
    const { orderObject } = this.props;
    const { errors } = this.state;

    let currentTime = new Date();

    return (
      <div className="col-lg-4 col-md-6 mt-3">
        <div className="card order">
          <div className="card-body p-0">
            <ul className="font-bold list-unstyled">
              <RenderOrder
                order={orderObject}
                shouldRenderIfOrderIsPovtor={true}
                shouldRenderIfOrderIsFailed={false}
                sholdRenderIfOrderIsReturned={false}
                shouldRenderDisinfector={false}
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={false}
                shouldRenderAccountantDecided={false}
                dateRenderMethod={'dateFromOnly'}
                shouldRenderGuarantee={false}
                shouldRenderMaterialConsumption={false}
                shouldRenderPaymentMethod={false}
                shouldRenderUserAcceptedOrder={true}
                shouldRenderWhoDealtWithClient={true}
                shouldRenderUserCreated={true}
                shouldRenderCompletedAt={false}
              // shouldRenderAdminGaveGrade={false}
              />
            </ul>

            {this.state.addComment ? (
              <form onSubmit={this.onSubmit}>
                <TextAreaFieldGroup
                  name="disinfectorComment"
                  placeholder="Ваш комментарий"
                  value={this.state.disinfectorComment}
                  onChange={this.onChange}
                  error={errors.disinfectorComment}
                />
                <div className="btn-group">
                  <button type="submit" className="btn btn-success mr-3"><i className="fas fa-plus-circle"></i> Добавить</button>
                  <button type="button" className="btn btn-warning" onClick={this.toggleAddComment}><i className="fas fa-window-close"></i> Закрыть</button>
                </div>
              </form>
            ) : (
              <button type="button" className="btn btn-success d-block" onClick={this.toggleAddComment}><i className="fas fa-comment-dots"></i> Добавить Комментарий</button>
            )}

            {currentTime.getTime() > new Date(orderObject.dateFrom).getTime() ? (
              <Link
                to={`/order-complete-form/${orderObject._id}`}
                className="btn btn-primary mt-3"
              >
                <i className="fas fa-file-alt"></i> Форма О Выполнении
              </Link>
            ) : ''}

            {/* if date is invalid */}
            {!isValidDate(orderObject.dateFrom) && (
              <button
                className="btn btn-danger mt-3"
                onClick={() => this.notifyUserWhoCreated({
                  orderId: orderObject._id,
                  whoCreatedOrder: orderObject.userCreated._id
                })}
              >Попросить редактировать этот заказ</button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  subadmin: state.subadmin,
  errors: state.errors,
});

export default connect(mapStateToProps, { getOrders, addDisinfectorComment, notifyUserForIncorrectDataInOrder })(withRouter(OrderInfo));