import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';


class CompleteOrdersInMonth extends Component {
  state = {
    orders: []
  };

  componentDidMount() {
    if (
      this.props.order.completeOrdersInMonth &&
      this.props.order.completeOrdersInMonth.length > 0
    ) {
      this.setState({
        orders: this.props.order.completeOrdersInMonth
      });
    }
  }

  render() {
    return (
      <div className="row">
        {this.props.searchMethod !== '' && this.state.orders.length === 0 ? (
          <div className="col-12">
            <h3 className="text-center">Нет Запросов</h3>
          </div>
        ) : (
          <React.Fragment>
            {this.state.orders.map((order, index) => (
              <div className="col-lg-4 col-md-6 mt-3" key={index}>
                <div className="card order">
                  <div className="card-body p-0">
                    <ul className="font-bold mb-0 list-unstyled">
                      <RenderOrder
                        order={order}
                        shouldRenderIfOrderIsPovtor={true}
                        shouldRenderIfOrderIsFailed={true}
                        sholdRenderIfOrderIsReturned={false}
                        shouldRenderDisinfector={false}
                        shouldRenderNextOrdersAfterFailArray={false}
                        shouldRenderPrevFailedOrderDate={false}
                        shouldRenderOperatorDecided={true}
                        shouldRenderAccountantDecided={true}
                        shouldRenderMaterialConsumption={true}
                        shouldRenderPaymentMethod={true}
                        shouldRenderUserAcceptedOrder={false}
                        shouldRenderUserCreated={false}
                        shouldRenderCompletedAt={true}
                        shouldRenderAdminGaveGrade={true}
                      />
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  operator: state.operator,
  errors: state.errors
});

export default connect(mapStateToProps)(withRouter(CompleteOrdersInMonth));