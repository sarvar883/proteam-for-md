import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';

import TextFieldGroup from '../common/TextFieldGroup';
import RenderOrder from '../common/RenderOrder';
import SetGradeToOrder from '../admin/SetGradeToOrder';
import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';

import { searchOrders } from '../../actions/orderActions';
import { adminConfirmsOrderQuery } from '../../actions/adminActions';

import orderFullyProcessed from '../../utils/orderFullyProcessed';
import userIsSuperAdmin from '../../utils/userIsSuperAdmin';


class SearchOrders extends Component {
  state = {
    phone: '',
    address: '',
    contractNumber: '',
    orderNumber: '',
    filial: '',
    method: '',
    headingText: '',
    orders: [],
  };

  componentDidMount() {
    if (this.props.order.orders && this.props.order.orders.length > 0) {
      this.setState({
        orders: this.props.order.orders,
        method: this.props.order.searchOrderMethod,
        headingText: this.props.order.searchOrderInput
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      orders: nextProps.order.orders
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  searchByAddress = (e) => {
    e.preventDefault();

    this.setState({
      method: 'address',
      headingText: this.state.address
    });
    const object = {
      method: 'address',
      payload: this.state.address
    };
    this.props.searchOrders(object);
  };

  searchByPhone = (e) => {
    e.preventDefault();

    this.setState({
      method: 'phone',
      headingText: this.state.phone
    });
    const object = {
      method: 'phone',
      payload: this.state.phone
    };
    this.props.searchOrders(object);
  };

  searchByContract = (e) => {
    e.preventDefault();

    this.setState({
      method: 'contract',
      headingText: this.state.contractNumber
    });
    const object = {
      method: 'contract',
      payload: this.state.contractNumber
    };
    this.props.searchOrders(object);
  };

  searchByOrderNumber = (e) => {
    e.preventDefault();

    this.setState({
      method: 'orderNumber',
      headingText: this.state.orderNumber
    });
    const object = {
      method: 'orderNumber',
      payload: this.state.orderNumber
    };
    this.props.searchOrders(object);
  };

  searchByFilial = (e) => {
    e.preventDefault();

    this.setState({
      method: 'filial',
      headingText: this.state.filial
    });
    const object = {
      method: 'filial',
      payload: this.state.filial
    };
    this.props.searchOrders(object);
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
    let renderOrders = this.state.orders.map((item, index) => {
      return (
        <div className="col-lg-4 col-md-6" key={index}>
          <div className="card order mt-2">
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
                  dateRenderMethod={item.completed ? "default" : "dateFromOnly"}
                  shouldRenderMaterialConsumption={false}
                  shouldRenderPaymentMethod={false}
                  shouldRenderUserAcceptedOrder={false}
                  shouldRenderUserCreated={false}
                  shouldRenderCompletedAt={false}
                  shouldRenderAdminGaveGrade={true}
                />


                {/* {item.adminGaveGrade ? (
                  <h4 className="text-primary">Оценка Админа: {item.adminGrade}</h4>
                ) : (
                  <SetGradeToOrder order={item} />
                )} */}

                {!item.adminGaveGrade && (
                  <React.Fragment>
                    <SetGradeToOrder order={item} />

                    {/* условия показа кнопки SetGradeToOrder и кнопки "Отправить Обратно" одинаковые */}
                    {orderFullyProcessed(item) && userIsSuperAdmin(this.props.auth.user) && (
                      <button className="btn btn-dark mt-3 mr-2" onClick={() => {
                        if (window.confirm('Вы уверены отправить заказ обратно дезинфектору?')) {
                          this.returnOrderBack({ orderId: item._id, disinfectors: item.disinfectors });
                        }
                      }}
                      >Отправить Обратно</button>
                    )}
                  </React.Fragment>
                )}


                {/* {item.repeatedOrder ? (
                  <React.Fragment>
                    <li className="mt-2">Это повторная продажа</li>
                    {item.repeatedOrderDecided ? (
                      <React.Fragment>
                        <li>Решение по проведению повторной работы принято</li>
                        {item.repeatedOrderNeeded ? (
                          <li>Повторная продажа будет проведена</li>
                        ) : (
                            <li>Повторная продажа не требуется</li>
                          )}
                      </React.Fragment>
                    ) : (
                        <li>Решение по проведению повторной продажи еще не принято</li>
                      )}
                  </React.Fragment>
                ) : ''} */}


                <Link
                  to={`/order-full-details/${item._id}`}
                  className="btn btn-primary mt-3 mr-2"
                >
                  <i className="fas fa-info"></i> Подробнее
                </Link>


                {this.props.auth.user.occupation === 'accountant' &&
                  item.completed &&
                  !item.accountantDecided &&
                  !item.adminDecided ? (
                  // item.clientType === 'corporate' && 
                  // item.paymentMethod === 'notCash' ? (
                  <Link
                    to={`/accountant/order-confirm/${item._id}`}
                    className="btn btn-dark mt-3 mr-2"
                  >
                    <i className="fab fa-wpforms"></i> Перейти на страницу подтверждения
                  </Link>
                ) : ''}


                {this.props.auth.user.occupation === 'operator' &&
                  item.completed && !item.operatorDecided ? (
                  <Link
                    to={`/order-confirm/${item._id}`}
                    className="btn btn-dark mt-3 mr-2"
                  >
                    <i className="fab fa-wpforms"></i> Перейти на страницу подтверждения
                  </Link>
                ) : ''}

                {/* show клиент недоволен button */}
                <ClientNotSatisfiedButton
                  order={item}
                  shouldLoadOrder={true}
                />

              </ul>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Поиск заказов</h2>
          </div>
        </div>

        <div className="row">

          <div className="col-lg-4 col-md-6 col-sm-6 mt-2">
            <form onSubmit={this.searchByAddress} className="form-bg p-1">
              <h4 className="text-center mb-0">Поиск по адресу <i className="fas fa-map-marker"></i></h4>
              <TextFieldGroup
                type="text"
                placeholder="Адрес"
                name="address"
                value={this.state.address}
                onChange={this.onChange}
                required
              />
              <button type="submit" className="btn btn-success">
                <i className="fas fa-search"></i> Искать
              </button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 mt-2">
            <form onSubmit={this.searchByPhone} className="form-bg p-1">
              <h4 className="text-center mb-0">Поиск по номеру телефона <i className="fas fa-phone"></i></h4>
              <TextFieldGroup
                type="text"
                placeholder="Номер Телефона"
                name="phone"
                value={this.state.phone}
                onChange={this.onChange}
                required
              />
              <button type="submit" className="btn btn-dark">
                <i className="fas fa-search"></i> Искать
              </button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 mt-2">
            <form onSubmit={this.searchByContract} className="form-bg p-1">
              <h4 className="text-center mb-0">Поиск по номеру договора <i className="fas fa-file-alt"></i></h4>
              <TextFieldGroup
                type="text"
                placeholder="Номер Договора"
                name="contractNumber"
                value={this.state.contractNumber}
                onChange={this.onChange}
                required
              />
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search"></i> Искать
              </button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 mt-2">
            <form onSubmit={this.searchByOrderNumber} className="form-bg p-1">
              <h4 className="text-center mb-0">Поиск по номеру заявки <i className="fas fa-list-ol"></i></h4>
              <TextFieldGroup
                type="text"
                placeholder="Номер Заявки"
                name="orderNumber"
                value={this.state.orderNumber}
                onChange={this.onChange}
                required
              />
              <button type="submit" className="btn btn-warning">
                <i className="fas fa-search"></i> Искать
              </button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 mt-2">
            <form onSubmit={this.searchByFilial} className="form-bg p-1">
              <h4 className="text-center mb-0">Поиск по филиалу <i className="fas fa-store-alt"></i></h4>
              <TextFieldGroup
                type="text"
                placeholder="Филиал"
                name="filial"
                value={this.state.filial}
                onChange={this.onChange}
                required
              />
              <button type="submit" className="btn btn-danger">
                <i className="fas fa-search"></i> Искать
              </button>
            </form>
          </div>

        </div>

        <div className="row mt-3">
          <div className="col-12">
            {this.state.method === 'phone' && (
              <h3 className="text-center">Результаты поиска заказов по номеру телефона "{this.state.headingText}"</h3>
            )}

            {this.state.method === 'address' && (
              <h3 className="text-center">Результаты поиска заказов по адресу "{this.state.headingText}"</h3>
            )}

            {this.state.method === 'contract' && (
              <h3 className="text-center">Результаты поиска заказов по номеру договора "{this.state.headingText}"</h3>
            )}

            {this.state.method === 'orderNumber' && (
              <h3 className="text-center">Результаты поиска заказов по номеру заявки "{this.state.headingText}"</h3>
            )}

            {this.state.method === 'filial' && (
              <h3 className="text-center">Результаты поиска заказов по филиалу "{this.state.headingText}"</h3>
            )}
          </div>
        </div>

        {this.props.order.loading ? (
          <div className="row mt-3">
            <div className="col-12">
              <Spinner />
            </div>
          </div>
        ) : (
          <div className="row mt-3">
            {this.state.headingText.length > 0 && this.props.order.orders.length === 0 ? (
              <h2 className="m-auto">Заказы не найдены</h2>
            ) : renderOrders}
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  subadmin: state.subadmin,
  accountant: state.accountant,
  operator: state.operator,
  order: state.order,
  errors: state.errors,
});

export default connect(mapStateToProps, { searchOrders, adminConfirmsOrderQuery })(withRouter(SearchOrders));