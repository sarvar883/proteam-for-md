import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


class RenderOrderInCalendar extends Component {
  render() {
    const { order } = this.props;

    return (
      <React.Fragment>
        {order.prevFailedOrder && (
          <h3><i className="fas fas fa-exclamation"></i> Повторный заказ <i className="fas fas fa-exclamation"></i></h3>
        )}

        {order.failed && (
          <h3><i className="fas fas fa-exclamation"></i> Некачественный заказ <i className="fas fas fa-exclamation"></i></h3>
        )}

        {order.adminGaveGrade && (
          <h4>Оценка Админа: {order.adminGrade}</h4>
        )}

        {order.orderNumber && (
          <li><u>Номер заявки: {order.orderNumber}</u></li>
        )}

        {order.clientType === 'corporate' && (
          <React.Fragment>
            {order.clientId ? (
              <li>Корпоративный клиент: {order.clientId.name}</li>
            ) : <li>Корпоративный клиент</li>}

            {order.filial && order.filial.length > 0 && (
              <li>Филиал: {order.filial}</li>
            )}
          </React.Fragment>
        )}

        {order.clientType === 'individual' && (
          <li>Физический Клиент: {order.client}</li>
        )}

        <li>Телефон: {order.phone}</li>
        <li>Адрес: {order.address}</li>
        <li>Тип Заказа: {order.typeOfService}</li>
      </React.Fragment>
    )
  }
}

RenderOrderInCalendar.defaultProps = {
  order: {
    clientId: {},
  },
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(RenderOrderInCalendar));