import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';
import { getCompleteOrders } from '../../actions/operatorActions';


class ShowOrderQueries extends Component {
  state = {
    completeOrders: [],
  };

  componentDidMount() {
    if (
      this.props.operator.completeOrders &&
      this.props.operator.completeOrders.length > 0
    ) {
      this.setState({
        completeOrders: this.props.operator.completeOrders
      });
    }
  }

  render() {
    let completeOrders = this.state.completeOrders.map((order, index) => (
      <div className="col-lg-4 col-md-6 mt-2" key={index}>
        <div className="card order mt-2">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 list-unstyled">
              <RenderOrder
                order={order}
                shouldRenderIfOrderIsPovtor={true}
                shouldRenderIfOrderIsFailed={true}
                sholdRenderIfOrderIsReturned={true}
                shouldRenderDisinfector={true}
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={false}
                shouldRenderAccountantDecided={false}
                shouldRenderMaterialConsumption={false}
                shouldRenderPaymentMethod={false}
                shouldRenderUserAcceptedOrder={false}
                shouldRenderUserCreated={false}
                shouldRenderCompletedAt={true}
                shouldRenderAdminGaveGrade={false}
              />
            </ul>

            <Link to={`/order-confirm/${order._id}`} className="btn btn-dark mt-2">
              <i className="fab fa-wpforms"></i> Форма Подтверждения
            </Link>
          </div>
        </div>
      </div>
    ));

    return (
      <div className="row">
        {completeOrders}
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

export default connect(mapStateToProps, { getCompleteOrders })(withRouter(ShowOrderQueries));