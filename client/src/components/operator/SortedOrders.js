import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { getSortedOrders } from '../../actions/operatorActions';
import { deleteOrder_v2 } from '../../actions/orderActions';
import orderFullyProcessed from '../../utils/orderFullyProcessed';
import getDateStringElements from '../../utils/dateStringElements';

import RenderOrderInCalendar from '../common/RenderOrderInCalendar';
import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';

// socket.io
import openSocket from 'socket.io-client';
import socketLink from '../common/socketLink';


class SortedOrders extends Component {
  _isMounted = false;

  state = {
    sortedOrders: this.props.operator.sortedOrders
  };

  componentDidMount() {
    this._isMounted = true;

    const socket = openSocket(socketLink);

    socket.on('createOrder', data => {
      // check if today
      if (
        new Date(data.order.dateFrom).getDate() === new Date(this.props.date).getDate() &&
        new Date(data.order.dateFrom).getMonth() === new Date(this.props.date).getMonth() &&
        new Date(data.order.dateFrom).getFullYear() === new Date(this.props.date).getFullYear()
      ) {
        this.addOrderToDOM(data.order);
      }
    });

    socket.on('editOrder', data => {
      // check if today
      // if (
      //   new Date(data.order.dateFrom).getDate() === new Date(this.props.date).getDate() &&
      //   new Date(data.order.dateFrom).getMonth() === new Date(this.props.date).getMonth() &&
      //   new Date(data.order.dateFrom).getFullYear() === new Date(this.props.date).getFullYear()
      // ) {
      //   this.editOrderOnDOM(data.order);
      // }
      this.editOrderOnDOM(data.order);
    });

    socket.on('deleteOrder', data => {
      // check if today
      if (
        new Date(data.orderDateFrom).getDate() === new Date(this.props.date).getDate() &&
        new Date(data.orderDateFrom).getMonth() === new Date(this.props.date).getMonth() &&
        new Date(data.orderDateFrom).getFullYear() === new Date(this.props.date).getFullYear()
      ) {
        this.removeOrderFromDOM(data.id);
      }
    });
  }

  addOrderToDOM = (order) => {
    if (this._isMounted) {
      this.setState(prevState => {
        const updatedOrders = [...prevState.sortedOrders];
        updatedOrders.push(order);
        return {
          sortedOrders: updatedOrders
        };
      });
    }
  }

  editOrderOnDOM = (order) => {
    if (this._isMounted) {
      let ordersInState = [...this.state.sortedOrders];
      for (let i = 0; i < ordersInState.length; i++) {
        if (ordersInState[i]._id.toString() === order._id.toString()) {
          ordersInState[i].disinfectorId = order.disinfectorId;
          ordersInState[i].userCreated = order.userCreated;
          ordersInState[i].userAcceptedOrder = order.userAcceptedOrder;
          ordersInState[i].clientType = order.clientType;
          ordersInState[i].client = order.client;
          ordersInState[i].clientId = order.clientId;
          ordersInState[i].address = order.address;
          ordersInState[i].dateFrom = order.dateFrom;
          ordersInState[i].phone = order.phone;
          ordersInState[i].typeOfService = order.typeOfService;
          ordersInState[i].advertising = order.advertising;
          ordersInState[i].comment = order.comment;
        }
      }
      this.setState({
        sortedOrders: ordersInState
      });
    }
  }

  removeOrderFromDOM = (id) => {
    if (this._isMounted) {
      let ordersInState = [...this.state.sortedOrders];
      ordersInState = ordersInState.filter(item => item._id.toString() !== id);
      this.setState({
        sortedOrders: ordersInState
      });
    }
  }

  onClick = (hour, date) => {
    const object = getDateStringElements(date);

    const defaultDateString = `${object.year}-${object.month}-${object.day}`;

    let defaultHourString = '';
    if (hour < 10) {
      defaultHourString = `0${hour}:00`;
    } else {
      defaultHourString = `${hour}:00`;
    }

    this.props.history.push('/create-order', {
      pathname: '/create-order',
      state: { hour: defaultHourString, date: defaultDateString }
    });
  };

  onDeleteOrder = (id) => {
    const object = {
      id: id,
    };
    // console.log('deleteOrder_v2', object);
    this.props.deleteOrder_v2(object, this.props.history, this.props.auth.user.occupation);

    setTimeout(() => {
      this.props.getSortedOrders(this.props.date);
    }, 800);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    let array = [];
    for (let i = 0; i <= 23; i++) {
      array.push({ hour: i, elements: [] });
    }

    this.state.sortedOrders.forEach(order => {
      array[new Date(order.dateFrom).getHours()].elements.push(order);
    });

    let renderOrders, colnumber = 6;

    let everythingToRender = array.map((object, index) => {

      renderOrders = object.elements.map((element, i) =>
        <div className={`col-md-${colnumber} pr-0`} key={i}>
          <div className={`card mt-2 mr-2 order order-bg-${element.disinfectorId.color}`}>
            <div className="card-body p-0">
              <ul className="font-bold mb-0 list-unstyled">
                <RenderOrderInCalendar order={element} />
              </ul>

              {/* если заказ полностью закрыт */}
              {orderFullyProcessed(element) ? (
                <React.Fragment>
                  <Link
                    to={`/order-full-details/${element._id}`}
                    className="btn btn-primary mr-1 mt-3"
                  >
                    <i className="fas fa-info"></i> Подробнее
                  </Link>

                  <ClientNotSatisfiedButton order={element} shouldLoadOrder={true} />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {/* если заказ еще не закрыт */}
                  <Link
                    to={`/order-full-details/${element._id}`}
                    className="btn btn-primary mr-1 mt-2"
                  >
                    <i className="fas fa-info"></i> Подробнее
                  </Link>

                  <Link
                    to={`/edit-order/${element._id}`}
                    className="btn btn-warning mr-1 mt-2"
                  >
                    <i className="fas fa-edit"></i> Редактировать
                  </Link>

                  {this.props.date > new Date().setHours(0, 0, 0, 0) ? (
                    <button className="btn btn-danger mt-2" onClick={() => {
                      if (window.confirm('Вы уверены?')) {
                        this.onDeleteOrder(element._id);
                      }
                    }}><i className="fas fa-trash-alt"></i> Удалить</button>
                  ) : ''}
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      );

      return (
        <div className="hours" key={index}>
          <div className="help row mt-3" id={`hour-${object.hour}`}>
            <button
              to="/create-order"
              className="btn btn-success mr-3"
              onClick={this.onClick.bind(this, object.hour, this.props.operator.date)}
            >
              <i className="fas fa-plus"></i>
            </button>
            <h1 className="d-inline mb-0">{`${object.hour}:00`}</h1>
          </div>
          <div className="row">
            {renderOrders.length > 0 ? (renderOrders) : ''}
          </div>
        </div>
      )
    });

    return (
      everythingToRender
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  operator: state.operator,
  errors: state.errors,
});

export default connect(mapStateToProps, { getSortedOrders, deleteOrder_v2 })(withRouter(SortedOrders));