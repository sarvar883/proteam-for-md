import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';

import RenderOrder from '../common/RenderOrder';
import { getNotCompOrders } from '../../actions/operatorActions'
import { deleteOrder_v2 } from '../../actions/orderActions';


class NotCompOrders extends Component {
  state = {
    notCompOrders: [],
  };

  componentDidMount() {
    this.props.getNotCompOrders();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.operator.notCompleteOrders) {
  //     this.setState({
  //       notCompOrders: nextProps.operator.notCompleteOrders.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom))
  //     });
  //   }
  // }

  // deleteOrderFunc = (order) => {
  //   let clientId = '';

  //   if (order.clientType === 'corporate') {
  //     if (order.clientId) {
  //       clientId = order.clientId._id;
  //     }
  //   }

  //   const object = {
  //     id: order._id,
  //     clientType: order.clientType,
  //     clientPhone: order.phone,
  //     clientId: clientId,
  //     orderDateFrom: order.dateFrom
  //   };
  //   this.props.deleteOrder(object, this.props.history, 'not-completed-orders');
  // };

  onDeleteOrder = (id) => {
    const object = {
      id: id,
    };
    // console.log('deleteOrder_v2', object);
    this.props.deleteOrder_v2(object, this.props.history, this.props.auth.user.occupation);
  }

  render() {
    let orders = this.props.operator.notCompleteOrders.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    let renderOrders = orders.map((order, index) => (
      <div className="col-lg-4 col-md-6 col-sm-6 mt-2" key={index}>
        <div className="card order mt-2">
          <div className="card-body p-0">
            <ul className="font-bold list-unstyled mb-0">
              <RenderOrder
                order={order}
                shouldRenderIfOrderIsPovtor={false}
                shouldRenderIfOrderIsFailed={false}
                sholdRenderIfOrderIsReturned={false}
                shouldRenderDisinfector={true}
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={false}
                shouldRenderAccountantDecided={false}
                dateRenderMethod={'dateFromOnly'}
                shouldRenderGuarantee={false}
                shouldRenderMaterialConsumption={false}
                shouldRenderPaymentMethod={false}
                shouldRenderUserAcceptedOrder={false}
                shouldRenderUserCreated={false}
                shouldRenderCompletedAt={false}
                shouldRenderAdminGaveGrade={false}
              />

              <div className="btn-group">
                <button className="btn btn-danger mt-1" onClick={() => {
                  if (window.confirm('Вы уверены?')) {
                    this.onDeleteOrder(order._id);
                  }
                }}><i className="fas fa-trash-alt"></i> Удалить</button>
              </div>
            </ul>
          </div>
        </div>
      </div>
    ));

    return (
      <div className="container-fluid">
        <div className="row m-0">
          <div className="col-12">
            <h2 className="text-center">Невыполненные заказы</h2>
          </div>
        </div>

        {this.props.operator.loadingSortedOrders ? <Spinner /> : (
          <div className="row">
            <div className="col-12">
              <div className="row">
                {renderOrders}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  operator: state.operator,
  errors: state.errors,
});

export default connect(mapStateToProps, { getNotCompOrders, deleteOrder_v2 })(withRouter(NotCompOrders));