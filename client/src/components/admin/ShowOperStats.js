import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';

import calculateDisinfScore from '../../utils/calcDisinfScore';
import calculateStats from '../../utils/calcStats';
import calcMaterialConsumption from '../../utils/calcMatConsumption';


class ShowOperStats extends Component {
  state = {
    orders: this.props.admin.stats.orders,
    showOrders: false,
  };

  toggleShowOrders = (param) => {
    this.setState({
      showOrders: param
    });
  };

  render() {
    const { orders } = this.state;

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
    } = calculateStats(orders);

    // не считать расходы материалов у повторных и некачественных заказов (нужно учесть)
    // заказ, который не является некачественным и не является повторным
    let approvedOrders = this.state.orders.filter(order =>
      order.completed &&
      !order.failed &&
      !order.hasOwnProperty('prevFailedOrder')
    );

    // calculate total consumption of all orders in given period
    // let totalConsumption = calcMaterialConsumption(orders);
    let totalConsumptionObject = calcMaterialConsumption(approvedOrders);

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));

    // calculate average score
    let averageScore = calculateDisinfScore({
      totalScore: totalScore,
      totalOrders: confirmedOrders.length,
      failedOrders: failed
    }) || 0;

    let renderOrders = orders.map((item, key) => (
      <div className="col-lg-4 col-md-6" key={key}>
        <div className="card order mt-3">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 list-unstyled">
              <RenderOrder
                order={item}
                shouldRenderIfOrderIsPovtor={true}
                shouldRenderIfOrderIsFailed={true}
                sholdRenderIfOrderIsReturned={false}
                shouldRenderDisinfector={true}
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={true}
                shouldRenderAccountantDecided={true}
                dateRenderMethod={item.completed ? 'default' : 'dateFromOnly'}
                shouldRenderMaterialConsumption={true}
                shouldRenderPaymentMethod={true}
                shouldRenderUserAcceptedOrder={false}
                shouldRenderUserCreated={false}
                shouldRenderCompletedAt={false}
                shouldRenderAdminGaveGrade={true}
              />
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
                <ul className="font-bold mb-0 list-unstyled">
                  {/* <li>Всего Пользователь принял Заказов: {totalOrders}</li> */}
                  <li>Пользователь принял Заказов: {confirmedOrders.length + failed} (подтвержденные + некачественные заказы)</li>

                  {/* здесь выполнено заказов = подтвержденные заказы + некачественные заказы + повторные заказы */}
                  <li>Выполнено Заказов: {completed}</li>

                  <li>Админ поставил оценку на {howManyOrdersHaveAdminGrades} заказа(ов)</li>
                  <li>Подтверждено Заказов: {confirmedOrders.length} (из них Консультации и Осмотры: {consultAndOsmotrConfirmed})</li>

                  <li className="pt-2">Общая Сумма: {totalSum.toLocaleString()} UZS</li>
                  <li>Средний балл: {averageScore.toFixed(2)} (из 5)</li>
                  <li className="pb-2">Средняя оценка админа: {averageAdminGrade} (из 10)</li>

                  <li>Отвергнуто Заказов: {rejected}</li>
                  <li>Некачественные заказы: {failed}</li>
                  <li>Повторные заказы: {povtors}</li>

                  {/* <h6 className="mt-2">* некачественные и повторные заказы не входят в подтвержденные заказы и общую сумму</h6> */}
                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
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

                  {/* <h6 className="mt-2">* Суммы только подтвержденных заказов</h6> */}
                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">На этих заказах расходовано материалов:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalConsumption}

                  <h6 className="mt-2">* Расход только подтвержденных заказов</h6>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {this.state.showOrders ? (
          <React.Fragment>
            <div className="row mt-2">
              <div className="col-12">
                <button className="btn btn-dark" onClick={this.toggleShowOrders.bind(this, false)}>
                  <i className="fas fa-eye-slash"></i> Скрыть заказы
                </button>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12">
                <h2 className="text-center pl-3 pr-3">Заказы, которые принял Пользователь</h2>
              </div>
              {orders.length > 0 ? (renderOrders) : <h2>Нет заказов</h2>}
            </div>
          </React.Fragment>
        ) : (
          <button className="btn btn-dark mt-2" onClick={this.toggleShowOrders.bind(this, true)}>
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

export default connect(mapStateToProps)(withRouter(ShowOperStats));