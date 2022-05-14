import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import calculateStats from '../../utils/calcStats';
// import calculateDisinfScore from '../../utils/calcDisinfScore';
import calcFinalAdminGrade from '../../utils/calcFinalAdminGrade';
import calculateDisinfectorSalary from '../../utils/calcDisinfSalary';


class ShowDisinfStats extends Component {
  state = {
    orders: this.props.disinfector.stats.orders,
    acceptedOrders: this.props.disinfector.stats.acceptedOrders,
    addedMaterials: this.props.disinfector.stats.addedMaterials,
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
      // corporate,
      // corpSum,
      // indiv,
      // indivSum
    } = calculateStats(this.state.orders);


    // ========================================
    // ========================================
    // Calculate total consumption of materials of the disinfector

    // totalConsumptionObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }

    const totalConsumptionObject = {};

    // не считать расходы материалов у повторных и некачественных заказов (нужно учесть)
    // calculate total consumption of approved orders in given period of the logged in disinfector
    approvedOrders.forEach(order => {
      order.disinfectors.forEach(element => {
        if (element.user._id.toString() === this.props.auth.user.id) {
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
    });

    let renderTotalConsumption = Object.keys(totalConsumptionObject).map((key, index) => (
      <li key={index}>{key}: {totalConsumptionObject[key].amount.toLocaleString()} {totalConsumptionObject[key].unit}</li>
    ));


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

    // вычислим Общую сумму принятых заказов
    const acceptedOrderStatsObject = calculateStats(this.state.acceptedOrders);
    let totalSumOfAcceptedOrders = acceptedOrderStatsObject.totalSum;


    // ========================================
    // ========================================
    // Calculate total materials that disinfector received from admin in given period

    // totalReceivedMaterialsObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }

    const totalReceivedMaterialsObject = {};

    if (this.state.addedMaterials.length > 0) {
      this.state.addedMaterials.forEach(addEvent => {
        addEvent.materials.forEach(material => {

          if (totalReceivedMaterialsObject.hasOwnProperty(material.material)) {
            totalReceivedMaterialsObject[material.material].amount += material.amount;
          } else {
            totalReceivedMaterialsObject[material.material] = {
              amount: material.amount,
              unit: material.unit,
            };
          }

        });
      });
    }

    let renderTotalReceived = Object.keys(totalReceivedMaterialsObject).map((key, index) => (
      <li key={index}>{key}: {totalReceivedMaterialsObject[key].amount.toLocaleString()} {totalReceivedMaterialsObject[key].unit}</li>
    ));


    let receivedMaterials = this.state.addedMaterials.map((item, index) => {
      let listItems = item.materials.map((thing, number) => (
        <li key={number}>{thing.material}: {thing.amount.toLocaleString()} {thing.unit}</li>
      ));

      return (
        <div className="col-lg-4 col-md-6" key={index}>
          <div className="card order mt-2">
            <div className="card-body p-0">
              <ul className="font-bold mb-0 list-unstyled">
                {item.admin && (
                  <li>Кто раздал: {item.admin.occupation} {item.admin.name}</li>
                )}
                <li>Когда получено: <Moment format="DD/MM/YYYY HH:mm">{item.createdAt}</Moment></li>
                <li>Материалы:</li>
                <ul>
                  {listItems}
                </ul>
              </ul>
            </div>
          </div>
        </div>
      );
    });

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

                  <li>Отвергнуто заказов: {rejected}</li>
                  <li>Некачественные Заказы: {failed}</li>
                  <li>Повторные заказы: {povtors}</li>

                  <li className="pt-2">Общая Сумма: {totalSumForDisinfector.toLocaleString()} UZS</li>
                  <li className="pb-2">Средняя оценка админа: {finalAdminGrade} (из 10) (после учета некач. заказов)</li>

                  <li>Ваша Зарплата за этот период: {disinfectorSalary.toLocaleString()} UZS</li>

                  <li>Принятые заказы: {this.state.acceptedOrders.length}</li>
                  <li>Общая сумма принятых заказов: {totalSumOfAcceptedOrders.toLocaleString()} UZS</li>

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
                <h4 className="text-center">Общий Приход материалов за этот период:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalReceived}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Общий Расход Материалов за этот период:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotalConsumption}

                  <h6 className="mt-2">* Расход только подтвержденных заказов</h6>
                  {/* <h6 className="mt-2">* сюда не входят некачественные и повторные заказы</h6> */}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {this.state.addedMaterials.length > 0 && (
          <React.Fragment>
            <div className="row mt-3">
              <div className="col-12">
                <h2 className="text-center pl-3 pr-3">Ваши полученные материалы за этот период</h2>
              </div>
            </div>

            <div className="row mt-2">
              {receivedMaterials}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  disinfector: state.disinfector,
  errors: state.errors,
});

export default connect(mapStateToProps)(withRouter(ShowDisinfStats));