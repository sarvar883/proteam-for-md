import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import calculateStats from '../../utils/calcStats';
import calcMaterialConsumption from '../../utils/calcMatConsumption';


class ShowAccStats extends Component {
  state = {
    // orders of only corporate clients
    orders: this.props.accountant.stats.orders,
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
    } = calculateStats(this.state.orders);

    // не считать расходы материалов у повторных и некачественных заказов (нужно учесть)
    // заказ, который не является некачественным и не является повторным
    let approvedOrders = this.state.orders.filter(order =>
      order.completed &&
      !order.failed &&
      !order.hasOwnProperty('prevFailedOrder')
    );

    // calculate total consumption of all orders accepted by operator in given period
    // let totalConsumption = calcMaterialConsumption(this.state.orders);
    let totalConsumptionObject = calcMaterialConsumption(approvedOrders);

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));

    return (
      <div className="row">
        <div className="col-lg-4 col-md-6">
          <div className="card order mt-2">
            <div className="card-body p-0">
              <h4 className="text-center">Заказы корпоративных клиентов</h4>
              <ul className="font-bold mb-0 list-unstyled">
                <li>Всего Получено Заказов: {totalOrders}</li>
                <li>Выполнено Заказов: {completed}</li>
                <li>Админ поставил оценку на {howManyOrdersHaveAdminGrades} заказа(ов)</li>
                <li>Подтверждено Заказов: {confirmedOrders.length} (из них Консультации и Осмотры: {consultAndOsmotrConfirmed})</li>

                <li>Отвергнутые заказы: {rejected}</li>
                <li>Некачественные заказы: {failed}</li>
                <li>Повторные заказы: {povtors}</li>

                <li className="pt-2">Общая Сумма: {totalSum.toLocaleString()} UZS</li>
                {/* <li >Средний балл: {(totalScore / confirmedOrders.length).toFixed(2)} (из 5)</li> */}
                <li className="pb-2">Средняя оценка админа: {averageAdminGrade} (из 10)</li>

                {/* <h6 className="mt-2">* некачественные и повторные заказы не входят в подтвержденные заказы и общую сумму</h6> */}
                {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card order mt-2">
            <div className="card-body p-0">
              <h4 className="text-center">Общий Расход Материалов Этих Заказов</h4>
              <ul className="font-bold mb-0 list-unstyled">
                {renderTotalConsumption}

                <h6 className="mt-2">* Расход только подтвержденных заказов</h6>
                {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  accountant: state.accountant,
  errors: state.errors,
});

export default connect(mapStateToProps)(withRouter(ShowAccStats));