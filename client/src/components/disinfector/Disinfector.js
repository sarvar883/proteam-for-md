import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import OrderInfo from './OrderInfo';
import removeZeros from '../../utils/removeZerosMat';

import { getOrders } from '../../actions/orderActions';
import { getDisinfectorMaterials } from '../../actions/disinfectorActions';


class Disinfector extends Component {
  state = {
    orders: [],
  };

  componentDidMount() {
    this.props.getDisinfectorMaterials(this.props.auth.user.id);
    this.props.getOrders(this.props.auth.user.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.order.orders) {
      this.setState({
        orders: nextProps.order.orders
      });
    }
  };

  render() {
    const orders = this.state.orders.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    let currentMaterials = removeZeros(this.props.auth.user.materials).map((item, index) =>
      <li key={index}>{item.material}: {item.amount.toLocaleString()} {item.unit}</li>
    );

    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-12 mt-2">
              <h3 className="text-center">Страница Дезинфектора {this.props.auth.user.name}</h3>
            </div>
          </div>

          {this.props.auth.loadingUser ? <Spinner /> : (
            <div className="row">
              <div className="col-12">
                <h3 className="text-center">Ваши имеющиеся материалы</h3>
              </div>

              <div className="col-lg-6 col-md-8 mx-auto mt-3">
                <div className="card order">
                  <div className="card-body p-0">
                    <ul className="font-bold mb-0 list-unstyled">
                      {currentMaterials}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="container-fluid">
          {this.props.order.loading ? <Spinner /> : (
            <React.Fragment>
              <div className="row">
                <div className="col-12">
                  <h2 className="text-center mt-3">Ваши Заказы</h2>
                </div>
              </div>

              <div className="row">
                {orders.map((order, index) => (
                  <OrderInfo orderObject={order} index={index} key={index} />
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  errors: state.errors
});

export default connect(mapStateToProps, { getOrders, getDisinfectorMaterials })(withRouter(Disinfector));