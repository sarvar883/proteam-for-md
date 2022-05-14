import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import RenderOrder from '../common/RenderOrder';
// import TextFieldGroup from '../common/TextFieldGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';
import {
  getCompleteOrderById,
  confirmCompleteOrder,
} from '../../actions/operatorActions';

import { toast } from 'react-toastify';


class ConfirmOrder extends Component {
  state = {
    clientReview: '',
    score: '',
    errors: {},
  };

  componentDidMount() {
    this.props.getCompleteOrderById(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    if (this.state.clientReview === '') {
      return toast.error('Введите отзыв клиента');
    }

    // оператор больше не вводит балл за заказ при подтверждении
    const object = {
      orderId: this.props.operator.orderToConfirm._id,
      decision: 'confirm',
      clientReview: this.state.clientReview,
      score: this.state.score
    };
    // console.log('object', object);
    this.props.confirmCompleteOrder(object, this.props.history);
  }

  reject = () => {
    const object = {
      orderId: this.props.operator.orderToConfirm._id,
      decision: 'reject',
      clientReview: '',
      score: ''
    };
    this.props.confirmCompleteOrder(object, this.props.history);
  }

  render() {
    const completeOrder = this.props.operator.orderToConfirm;
    const { errors } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">

          <div className="col-lg-6 col-md-9 mx-auto">
            {this.props.operator.loadingCompleteOrders ? <Spinner /> : (
              <React.Fragment>
                <h3 className="text-center">Выполненный Заказ</h3>
                <div className="card order mt-2">
                  <div className="card-body p-0">
                    <ul className="font-bold mb-0 list-unstyled">
                      <RenderOrder
                        order={completeOrder}
                        shouldRenderIfOrderIsPovtor={true}
                        shouldRenderIfOrderIsFailed={true}
                        sholdRenderIfOrderIsReturned={false}
                        shouldRenderDisinfector={true}
                        shouldRenderNextOrdersAfterFailArray={true}
                        shouldRenderPrevFailedOrderDate={false}
                        shouldRenderOperatorDecided={false}
                        shouldRenderAccountantDecided={true}
                        shouldRenderMaterialConsumption={true}
                        shouldRenderPaymentMethod={true}
                        shouldRenderUserAcceptedOrder={true}
                        shouldRenderWhoDealtWithClient={true}
                        shouldRenderUserCreated={true}
                        shouldRenderCompletedAt={true}
                        shouldRenderAdminGaveGrade={false}
                      />
                    </ul>

                    {/* <div className="btn-group mt-3"> */}
                    <button
                      className="btn btn-danger mr-2 mt-3"
                      onClick={() => { if (window.confirm('Вы уверены отменить заказ?')) { this.reject() } }}
                    >
                      <i className="fas fa-ban"></i> Отменить Выполнение Заказа
                    </button>
                    {/* </div> */}

                    <ClientNotSatisfiedButton
                      order={completeOrder}
                      shouldLoadOrder={true}
                    />
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>


          <div className="col-lg-6 col-md-9 mx-auto">
            <div className="card mt-3 mb-3">
              <div className="card-body p-2">
                <h3 className="text-center">Форма Подтверждения Заказа</h3>
                <form onSubmit={this.onSubmit}>

                  {/* <TextFieldGroup
                    label="Полученный Балл за Выполнение Заказа (0-5):"
                    type="number"
                    name="score"
                    min="0"
                    max="5"
                    value={this.state.score}
                    onChange={this.onChange}
                    error={errors.score}
                    required={true}
                  /> */}

                  <TextAreaFieldGroup
                    name="clientReview"
                    placeholder="Отзыв Клиента"
                    value={this.state.clientReview}
                    onChange={this.onChange}
                    error={errors.clientReview}
                  />

                  <button type="submit" className="btn btn-success btn-block">
                    <i className="fas fa-check-square"></i> Подтвердить Выполнение Заказа
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  operator: state.operator,
  errors: state.errors,
});

export default connect(mapStateToProps, { getCompleteOrderById, confirmCompleteOrder })(withRouter(ConfirmOrder));