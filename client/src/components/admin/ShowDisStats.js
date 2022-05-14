import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import RenderOrder from '../common/RenderOrder';

// import calculateDisinfScore from '../../utils/calcDisinfScore';
import calculateStats from '../../utils/calcStats';
import calcFinalAdminGrade from '../../utils/calcFinalAdminGrade';
import calculateDisinfectorSalary from '../../utils/calcDisinfSalary';


class ShowDisStats extends Component {
  state = {
    // заказы, которые дезинфектор исполнил
    orders: this.props.admin.stats.orders,
    // заказы, которые дезинфектор принял
    acceptedOrders: this.props.admin.stats.acceptedOrders,
    showOrders: false,
  };


  renderOrders = (orders) => {
    return orders.map((order, key) => (
      <div className="col-lg-4 col-md-6" key={key}>
        <div className="card order mt-2">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 list-unstyled">
              <RenderOrder
                order={order}
                shouldRenderIfOrderIsPovtor={true}
                shouldRenderIfOrderIsFailed={true}
                sholdRenderIfOrderIsReturned={false}
                // TODO: render info if order is repeat
                shouldRenderDisinfector={false}
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
            </ul>
          </div>
        </div>
      </div>
    ));
  };


  toggleShowOrders = (param) => {
    this.setState({
      showOrders: param
    });
  };

  render() {
    // "успешные заказы", т. е. заказы, которые не являются некачественными и не являются повторными
    // и заказы, которые этот дезинфектор выполнил
    let approvedOrders = this.state.orders.filter(order =>
      order.completed &&
      !order.failed &&
      !order.hasOwnProperty('prevFailedOrder')
    );

    // calculate statistics
    let {
      // totalSum,
      // totalScore,
      totalOrders,
      completed,
      confirmedOrders,
      rejected,
      averageAdminGrade,
      howManyOrdersHaveAdminGrades,
      consultAndOsmotrConfirmed,

      // сумма заказов для дезинфектора (она равна сумме заказа / количество дезинфекторов, выполнивших заказ)
      totalSumForDisinfector,

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


    // calculate total consumption of all orders of disinfector in given period
    // calcMaterialConsumption function will not work because we are calculating consumption of specific user

    const totalConsumptionObject = {};

    // не считать расходы материалов у повторных и некачественных заказов (нужно учесть)
    approvedOrders.forEach(order => {
      // this.state.orders.forEach(order => {

      if (order.completed && order.disinfectors) {

        order.disinfectors.forEach(element => {
          // we dont populate disinfectors.user field, this is why we write element.user === ..
          if (element.user._id === this.props.admin.stats.disinfectorId) {
            // if (element.user === this.props.admin.stats.disinfectorId) {
            element.consumption.forEach(object => {

              if (totalConsumptionObject.hasOwnProperty(object.material)) {
                totalConsumptionObject[object.material].amount += object.amount;
              } else {
                totalConsumptionObject[object.material] = {
                  amount: object.amount,
                  unit: object.unit,
                };
              }

            });
          }
        });

      }

    });

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));


    // вычислим Общую сумму принятых заказов
    const acceptedOrderStatsObject = calculateStats(this.state.acceptedOrders);
    let totalSumOfAcceptedOrders = acceptedOrderStatsObject.totalSum;

    // calculate average score
    // let averageScore = calculateDisinfScore({
    //   totalScore: totalScore,
    //   totalOrders: confirmedOrders.length,
    //   failedOrders: failed
    // }) || 0;

    // от средней оценки админа нужно отнять проценты за некачественные заказы
    const finalAdminGrade = calcFinalAdminGrade({
      average_admin_grade: averageAdminGrade,
      failedOrdersCount: failed,
    }) || 0;

    const disinfectorSalary = calculateDisinfectorSalary({
      totalSum: totalSumForDisinfector,
      finalAdminGrade
    });

    let renderAllOrders = this.renderOrders(this.state.orders);

    let renderAcceptedOrders = this.renderOrders(this.state.acceptedOrders);

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
                  <li>Некачественные Заказы: {failed}</li>
                  <li>Повторные заказы: {povtors}</li>

                  <li className="pt-2">Общая Сумма: {totalSumForDisinfector.toLocaleString()} UZS</li>
                  {/* <li>Средний балл: {averageScore.toFixed(2)} (из 5)</li> */}
                  <li className="pb-2">Средняя оценка админа: {finalAdminGrade} (из 10) (после учета некач. заказов)</li>

                  <li>Зарплата за этот период: {disinfectorSalary.toLocaleString()} UZS</li>

                  {/* <h6 className="mt-2">* некачественные и повторные заказы не входят в подтвержденные заказы и общую сумму</h6> */}
                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
                  <h6 className="mt-2">* за каждый некачественный заказ отнимается 5% от средней оценки админа</h6>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <ul className="font-bold mb-0 list-unstyled">
                  <li>Пользователь принял заказов: {this.state.acceptedOrders.length}</li>
                  <li>Общая сумма принятых заказов: {totalSumOfAcceptedOrders.toLocaleString()} UZS</li>

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
                <h4 className="text-center">Расход Материалов:</h4>
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
                <button className="btn btn-dark" onClick={this.toggleShowOrders.bind(this, false)}>
                  <i className="fas fa-eye-slash"></i> Скрыть заказы
                </button>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12">
                <h2 className="text-center pl-3 pr-3">Заказы Пользователя</h2>
              </div>
              {this.state.orders.length > 0 ? (renderAllOrders) : <h2>Нет заказов</h2>}
            </div>

            <div className="row mt-2">
              <div className="col-12">
                <h2 className="text-center pl-3 pr-3">Принятые Заказы Пользователя</h2>
              </div>
              {this.state.acceptedOrders.length > 0 ? (renderAcceptedOrders) : <h2>Нет заказов</h2>}
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

export default connect(mapStateToProps)(withRouter(ShowDisStats));