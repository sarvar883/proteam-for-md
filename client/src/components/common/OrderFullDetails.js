import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import RenderOrder from '../common/RenderOrder';

import {
  getOrderById,
  clearOrderById,
} from '../../actions/orderActions';


class OrderFullDetails extends Component {
  componentDidMount() {
    this.props.getOrderById(this.props.match.params.id);
  }

  componentWillUnmount() {
    // to avoid bugs (in some cases, EditOrder component cannot be accessed after we go to this page)
    // becase both OrderFullDetails and EditOrder components refer to the same this.props.order.orderById 
    this.props.clearOrderById();
  }

  render() {
    const order = this.props.order.orderById;
    // console.log('order', order);
    return (
      <div className="container-fluid">
        {this.props.order.loading ? <Spinner /> : (
          <React.Fragment>
            <div className="row">
              <div className="col-12">
                <h3 className="text-center">Детали Заказа</h3>
              </div>

              <div className="col-lg-6 col-md-9 m-auto">
                <div className="card order mt-2">
                  <div className="card-body p-0">
                    <ul className="font-bold mb-0 list-unstyled">
                      <RenderOrder
                        order={order}
                        shouldRenderIfOrderIsPovtor={true}
                        shouldRenderIfOrderIsFailed={true}
                        sholdRenderIfOrderIsReturned={false}
                        shouldRenderDisinfector={true}
                        shouldRenderNextOrdersAfterFailArray={true}
                        shouldRenderPrevFailedOrderDate={true}
                        shouldRenderOperatorDecided={true}
                        shouldRenderAccountantDecided={true}
                        dateRenderMethod={order.completed ? "default" : "dateFromOnly"}
                        shouldRenderGuarantee={order.completed}
                        shouldRenderMaterialConsumption={true}
                        shouldRenderPaymentMethod={order.completed}
                        shouldRenderUserAcceptedOrder={true}
                        shouldRenderWhoDealtWithClient={true}
                        shouldRenderUserCreated={true}
                        shouldRenderCompletedAt={true}
                        shouldRenderAdminGaveGrade={true}
                      />
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {order.prevFailedOrder && (
              <div className="row mt-4">
                <div className="col-12">
                  <h3 className="text-center">Некачественный Заказ</h3>
                </div>

                <div className="col-lg-6 col-md-9 m-auto">
                  <div className="card order mt-2">
                    <div className="card-body p-0">
                      <ul className="font-bold mb-0 list-unstyled">
                        <RenderOrder
                          order={order.prevFailedOrder}
                          shouldRenderIfOrderIsPovtor={true}
                          shouldRenderIfOrderIsFailed={true}
                          sholdRenderIfOrderIsReturned={false}
                          shouldRenderDisinfector={true}
                          shouldRenderNextOrdersAfterFailArray={true}
                          shouldRenderPrevFailedOrderDate={true}
                          shouldRenderOperatorDecided={true}
                          shouldRenderAccountantDecided={true}
                          dateRenderMethod={"default"}
                          shouldRenderGuarantee={true}
                          shouldRenderMaterialConsumption={true}
                          shouldRenderPaymentMethod={true}
                          shouldRenderUserAcceptedOrder={true}
                          shouldRenderWhoDealtWithClient={true}
                          shouldRenderUserCreated={true}
                          shouldRenderCompletedAt={true}
                          shouldRenderAdminGaveGrade={true}
                        />
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row mt-4">
              {order.nextOrdersAfterFailArray && order.nextOrdersAfterFailArray.length > 0 && (
                <React.Fragment>
                  <div className="col-12">
                    <h3 className="text-center">Повторные Заказы</h3>
                  </div>

                  {order.nextOrdersAfterFailArray.map((item, index) => {
                    // we dont want to show the "order" 2 times
                    if (item._id !== order._id) {
                      return (
                        <div className="col-lg-4 col-md-6" key={index}>
                          <div className="card order mt-2">
                            <div className="card-body p-0">
                              <ul className="font-bold mb-0 list-unstyled">
                                <RenderOrder
                                  order={item}
                                  shouldRenderIfOrderIsPovtor={true}
                                  shouldRenderIfOrderIsFailed={true}
                                  sholdRenderIfOrderIsReturned={false}
                                  shouldRenderDisinfector={true}
                                  shouldRenderNextOrdersAfterFailArray={true}
                                  shouldRenderPrevFailedOrderDate={true}
                                  shouldRenderOperatorDecided={true}
                                  shouldRenderAccountantDecided={true}
                                  dateRenderMethod={"default"}
                                  shouldRenderGuarantee={true}
                                  shouldRenderMaterialConsumption={true}
                                  shouldRenderPaymentMethod={true}
                                  shouldRenderUserAcceptedOrder={true}
                                  shouldRenderWhoDealtWithClient={true}
                                  shouldRenderUserCreated={true}
                                  shouldRenderCompletedAt={true}
                                  shouldRenderAdminGaveGrade={true}
                                />
                              </ul>
                            </div>
                          </div>
                        </div>
                      )

                    } else {
                      return '';
                    }
                  })}
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  errors: state.errors,
});

export default connect(mapStateToProps, { getOrderById, clearOrderById })(withRouter(OrderFullDetails));