import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';
import SetGradeToOrder from './SetGradeToOrder';

import { adminConfirmsOrderQuery } from '../../actions/adminActions';

// import calculateDisinfScore from '../../utils/calcDisinfScore';
import calculateStats from '../../utils/calcStats';
import calcMaterialConsumption from '../../utils/calcMatConsumption';
import orderFullyProcessed from '../../utils/orderFullyProcessed';
import userIsSuperAdmin from '../../utils/userIsSuperAdmin';


class ShowAdminStats extends Component {
  state = {
    orders: this.props.admin.stats.orders,
    showOrders: false,
  };

  toggleShowOrders = (param) => {
    this.setState({
      showOrders: param
    });
  };

  returnOrderBack = ({ orderId, disinfectors }) => {
    const object = {
      response: 'back',
      orderId,
      disinfectors,
    };
    // console.log('returnOrderBack', object);
    this.props.adminConfirmsOrderQuery(object, this.props.history);
  };

  render() {
    // calculate statistics
    let {
      totalSum,
      // totalScore,
      totalOrders,
      completed,
      confirmedOrders,
      rejected,
      averageAdminGrade,
      howManyOrdersHaveAdminGrades,
      consultAndOsmotrConfirmed,

      failed,
      povtors,

      corporate,
      corporatePercent,
      corpSum,
      corpSumPercent,

      indiv,
      indivPercent,
      indivSum,
      indivSumPercent
    } = calculateStats(this.state.orders);

    // не считать расходы материалов у повторных и некачественных заказов (++)
    // заказ, который не является некачественным и не является повторным
    let approvedOrders = this.state.orders.filter(order =>
      order.completed &&
      !order.failed &&
      !order.hasOwnProperty('prevFailedOrder')
    );

    // calculate total consumption of all orders in given period
    let totalConsumptionObject = calcMaterialConsumption(approvedOrders);

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));

    // calculate average score
    // let averageScore = calculateDisinfScore({
    //   totalScore: totalScore,
    //   totalOrders: confirmedOrders.length,
    //   failedOrders: failed
    // }) || 0;

    let renderAllOrders = this.state.orders.map((order, key) => (
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
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={true}
                shouldRenderAccountantDecided={true}
                dateRenderMethod={order.completed ? 'default' : 'dateFromOnly'}
                shouldRenderMaterialConsumption={true}
                shouldRenderPaymentMethod={true}
                shouldRenderUserAcceptedOrder={false}
                shouldRenderUserCreated={false}
                shouldRenderCompletedAt={false}
                shouldRenderAdminGaveGrade={true}
              />

              {/* {order.adminGaveGrade ? (
                  <h4 className="text-primary">Оценка Админа: {order.adminGrade}</h4>
                ) : (
                <SetGradeToOrder order={order} />
                )} */}

              {!order.adminGaveGrade && (
                <React.Fragment>
                  <SetGradeToOrder order={order} />

                  {/* условия показа кнопки SetGradeToOrder и кнопки "Отправить Обратно" одинаковые */}
                  {orderFullyProcessed(order) && userIsSuperAdmin(this.props.auth.user) && (
                    <button className="btn btn-dark mt-2" onClick={() => {
                      if (window.confirm('Вы уверены отправить заказ обратно дезинфектору?')) {
                        this.returnOrderBack({ orderId: order._id, disinfectors: order.disinfectors });
                      }
                    }}
                    >Отправить Обратно</button>
                  )}
                </React.Fragment>
              )}
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
                <h4 className="text-center">Заказы</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  <li>Всего Получено Заказов: {totalOrders}</li>
                  <li>Выполнено Заказов: {completed}</li>
                  <li>Админ поставил оценку на {howManyOrdersHaveAdminGrades} заказа(ов)</li>
                  <li>Подтверждено Заказов: {confirmedOrders.length} (из них Консультации и Осмотры: {consultAndOsmotrConfirmed})</li>

                  <li>Отвергнуто Заказов: {rejected}</li>
                  <li>Некачественные заказы: {failed}</li>
                  <li>Повторные заказы: {povtors}</li>

                  <li className="pt-2">Общая Сумма: {totalSum.toLocaleString()} UZS (только подтвержденных заказов)</li>
                  {/* <li>Средний балл: {averageScore.toFixed(2)} (из 5)</li> */}
                  <li className="pb-2">Средняя оценка админа: {averageAdminGrade} (из 10)</li>

                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
                  {/* <h6>** сюда входят заказы, на которые админ поставил оценку</h6> */}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <ul className="font-bold mb-0 list-unstyled">

                  <h4 className="text-center">Корпоративные клиенты</h4>
                  <li>Подтвержденные заказы: {corporate} ({corporatePercent} %)</li>
                  <li>На общую сумму: {corpSum.toLocaleString()} UZS  ({corpSumPercent} %)</li>

                  <h4 className="text-center">Физические клиенты</h4>
                  <li>Подтвержденные заказы: {indiv} ({indivPercent} %)</li>
                  <li>На общую сумму: {indivSum.toLocaleString()} UZS ({indivSumPercent} %)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Общий Расход Материалов:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalConsumption}

                  <h6 className="mt-2">* Расход только подтвержденных заказов</h6>
                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {this.state.showOrders ? (
          <React.Fragment>
            <div className="row mt-2">
              <div className="col-12">
                <button className="btn btn-dark" onClick={() => this.toggleShowOrders(false)}>
                  <i className="fas fa-eye-slash"></i> Скрыть заказы
                </button>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12">
                {/* <h2 className="text-center pl-3 pr-3">Подтвержденные Заказы</h2> */}
                <h2 className="text-center pl-3 pr-3">Все Заказы</h2>
              </div>

              {/* {confirmedOrders.length > 0 ? (renderConfirmedOrders) : <h2>Нет подтвержденных заказов</h2>} */}
              {this.state.orders.length > 0 ? (renderAllOrders) : <h2>Нет заказов</h2>}
            </div>
          </React.Fragment>
        ) : (
          <button className="btn btn-dark mt-2" onClick={() => this.toggleShowOrders(true)}>
            <i className="fas fa-eye"></i> Показать заказы
          </button>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, { adminConfirmsOrderQuery })(withRouter(ShowAdminStats));