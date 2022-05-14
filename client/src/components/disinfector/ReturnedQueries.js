import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import RenderOrder from '../common/RenderOrder';

import { getReturnedQueries } from '../../actions/disinfectorActions';


class ReturnedQueries extends Component {
  state = {
    queries: [],
    loading: false,
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.props.getReturnedQueries(this.props.auth.user.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disinfector.queries) {
      this.setState({
        queries: nextProps.disinfector.queries,
        loading: false
      });
    }
  }

  render() {
    const renderQueries = this.state.queries.map((order, index) => (
      <div className="col-lg-4 col-md-6 mt-3" key={index}>
        <div className="card order">
          <div className="card-body p-0">
            <ul className="font-bold mb-0 list-unstyled">
              <RenderOrder
                order={order}
                shouldRenderIfOrderIsPovtor={false}
                shouldRenderIfOrderIsFailed={false}
                sholdRenderIfOrderIsReturned={false}
                shouldRenderDisinfector={false}
                shouldRenderNextOrdersAfterFailArray={false}
                shouldRenderPrevFailedOrderDate={false}
                shouldRenderOperatorDecided={true}
                shouldRenderAccountantDecided={true}
                shouldRenderMaterialConsumption={false}
                shouldRenderPaymentMethod={true}
                shouldRenderUserAcceptedOrder={false}
                shouldRenderUserCreated={false}
                shouldRenderCompletedAt={true}
                shouldRenderAdminGaveGrade={false}
              />

              {/* 21.04.2021 disinfector and subadmin now should have the same order complete form - OrderComplete component */}
              <Link
                to={`/order-complete-form/${order._id}`}
                className="btn btn-primary mt-2"
              >
                <i className="fab fa-wpforms"></i> Заполнить форму выполнения заново
              </Link>
            </ul>
          </div>
        </div>
      </div>
    ));

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h3 className="text-center pl-3 pr-3">Ваши Запросы, которые админ отправил назад для повторного заполнения формы </h3>
          </div>
        </div>

        <div className="row">
          {this.state.loading ? (
            <div className="col-12">
              <Spinner />
            </div>
          ) : (
            <React.Fragment>
              {this.state.queries.length === 0 ? (
                <div className="col-12">
                  <h3 className="text-center pl-3 pr-3">Нет Запросов</h3>
                </div>
              ) : (
                renderQueries
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  disinfector: state.disinfector,
  errors: state.errors,
});

export default connect(mapStateToProps, { getReturnedQueries })(withRouter(ReturnedQueries));