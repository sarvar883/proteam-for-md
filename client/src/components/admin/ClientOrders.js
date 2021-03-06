import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';
import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';

import calculateStats from '../../utils/calcStats';
import calcMaterialConsumption from '../../utils/calcMatConsumption';


class ClientOrders extends Component {
  state = {
    orders: [],
  };

  componentDidMount() {
    if (
      this.props.admin.ordersOfClient &&
      this.props.admin.ordersOfClient.length > 0
    ) {
      this.setState({
        orders: this.props.admin.ordersOfClient
      });
    }
  }

  render() {
    // calculate statistics
    let {
      totalSum,
      totalScore,
      totalOrders,
      completed,
      confirmedOrders,
      rejected,
      averageAdminGrade,
      howManyOrdersHaveAdminGrades,
      failed,
      povtors,
    } = calculateStats(this.state.orders);

    // calculate total consumption of all orders in given period
    let totalConsumptionObject = calcMaterialConsumption(this.state.orders);

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));


    let renderOrders = this.state.orders.map((order, index) => (
      <div className="col-lg-4 col-md-6" key={index}>
        <div className="card order mt-2">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 list-unstyled">
              <RenderOrder
                order={order}
                shouldRenderIfOrderIsPovtor={true}
                shouldRenderIfOrderIsFailed={true}
                sholdRenderIfOrderIsReturned={false}
                shouldRenderDisinfector={true}
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

              <ClientNotSatisfiedButton order={order} shouldLoadOrder={true} />
            </ul>
          </div>
        </div>
      </div>
    ));


    return (
      <React.Fragment>
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h3 className="text-center">????????????</h3>
                <ul className="font-bold mb-0 list-unstyled">
                  <li>?????????? ???????????????? ??????????????: {totalOrders}</li>
                  <li>?????????????????? ??????????????: {completed}</li>
                  <li>?????????? ???????????????? ???????????? ???? {howManyOrdersHaveAdminGrades} ????????????(????)</li>
                  <li>???????????????????????? ??????????????: {confirmedOrders.length}</li>

                  <li className="pt-2">?????????? ??????????: {totalSum.toLocaleString()} UZS</li>
                  <li>?????????????? ????????: {(totalScore / confirmedOrders.length).toFixed(2)} (???? 5)</li>
                  <li className="pb-2">?????????????? ???????????? ????????????: {averageAdminGrade} (???? 10)</li>

                  <li>???????????????????? ??????????????: {rejected}</li>
                  <li>???????????????????????????? ????????????: {failed}</li>
                  <li>?????????????????? ????????????: {povtors}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">?????????? ???????????? ????????????????????:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalConsumption}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {this.state.orders.length > 0 && (
          <React.Fragment>
            <div className="row">
              <div className="col-12">
                <h2 className="text-center pl-3 pr-3">????????????</h2>
              </div>
            </div>

            <div className="row">
              {renderOrders}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(ClientOrders));