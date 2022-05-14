import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';
import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';

import calcMaterialConsumption from '../../utils/calcMatConsumption';
import calcFailedAndPovtorsPerDisinfector from '../../utils/calcFailedAndPovtorsPerDisinfector';
import analyzeMaterialsInFailedOrders from '../../utils/analyzeMaterialsInFailedOrders';


class ShowFails extends Component {
  state = {
    // некачественные и повторные заказы
    fails: [],
  };

  componentDidMount() {
    if (this.props.fail.fails && this.props.fail.fails.length > 0) {
      this.setState({
        fails: this.props.fail.fails
      });
    }
  }

  render() {
    // calculate total consumption of failed and repeated orders in given period
    let totalConsumptionObject = calcMaterialConsumption(this.state.fails);

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));


    let failedCount = 0;
    let povtorsCount = 0;

    let renderFailedOrders = this.state.fails.map((order, key) => {
      if (order.failed) {
        failedCount++;
      }

      if (order.hasOwnProperty('prevFailedOrder')) {
        povtorsCount++;
      }

      return (
        <div className="col-lg-4 col-md-6" key={key}>
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
                  shouldRenderMaterialConsumption={true}
                  shouldRenderPaymentMethod={true}
                  shouldRenderUserAcceptedOrder={false}
                  shouldRenderUserCreated={false}
                  shouldRenderCompletedAt={false}
                  shouldRenderAdminGaveGrade={true}
                />

                <ClientNotSatisfiedButton order={order} shouldLoadOrder={true} />
              </ul>
            </div>
          </div>
        </div>
      );
    });

    const users_failed_and_povtors_stats = calcFailedAndPovtorsPerDisinfector(this.state.fails);

    // ======================================
    const usersFailedOrdersStats = users_failed_and_povtors_stats.users_with_failed;

    let renderUsersWithFailedOrders = usersFailedOrdersStats.map((user, key) => (
      <li key={key}>{user.occupation} {user.name}: {user.failed}</li>
    ));

    // ======================================
    const usersWithPovtors = users_failed_and_povtors_stats.users_with_povtors;

    let renderUsersWithPovtors = usersWithPovtors.map((user, key) => (
      <li key={key}>{user.occupation} {user.name}: {user.povtors}</li>
    ));


    // ======================================
    // показать какие материалы чаще всего использовались в некачественных заказах
    const materialsInFailedOrdersArray = analyzeMaterialsInFailedOrders(this.state.fails);

    let renderMaterialsInFailedOrders = materialsInFailedOrdersArray.map((object, index) => (
      <li key={index}>{object.material}: {object.amount}</li>
    ));


    return (
      <React.Fragment>
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <ul className="font-bold mb-0 list-unstyled">
                  <li>Всего Некачественных Заказов: {failedCount}</li>
                  <li>Всего Повторных Заказов: {povtorsCount}</li>
                </ul>
              </div>
            </div>
          </div>

          {this.props.auth.user.occupation !== 'disinfector' && (
            <React.Fragment>
              <div className="col-lg-4 col-md-6">
                <div className="card order mt-2">
                  <div className="card-body p-0">
                    <h4 className="text-center">Некачественныe заказы пользователей</h4>
                    <ul className="font-bold mb-0 list-unstyled">
                      {renderUsersWithFailedOrders}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card order mt-2">
                  <div className="card-body p-0">
                    <h4 className="text-center">Повторные заказы пользователей</h4>
                    <ul className="font-bold mb-0 list-unstyled">
                      {renderUsersWithPovtors}
                    </ul>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Общий Расход Материалов на этих заказах</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalConsumption}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Материалы некачественных заказов</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderMaterialsInFailedOrders}
                </ul>

                <h6 className="mt-3">* Количество заказов, на которых был использован материал</h6>
              </div>
            </div>
          </div>
        </div>

        {this.state.fails.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <h2 className="text-center pl-3 pr-3">Некачественные и Повторные Заказы</h2>
            </div>
            {renderFailedOrders}
          </div>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  admin: state.admin,
  fail: state.fail,
  errors: state.errors,
});

export default connect(mapStateToProps)(withRouter(ShowFails));