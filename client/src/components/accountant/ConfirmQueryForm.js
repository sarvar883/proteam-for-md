import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import TextFieldGroup from '../common/TextFieldGroup';

import RenderOrder from '../common/RenderOrder';
import ClientNotSatisfiedButton from '../common/ClientNotSatisfiedButton';
import {
  getCompleteOrderById,
  accountantConfirmQuery,
} from '../../actions/accountantActions';

import { toast } from 'react-toastify';


class ConfirmQueryForm extends Component {
  state = {
    query: {
      disinfectorId: {},
      userCreated: {},
      clientId: {
        contracts: []
      },
      userAcceptedOrder: {},
      whoDealtWithClient: {},
      disinfectors: [],
      prevFailedOrder: {},
      nextOrdersAfterFailArray: [],


      // we no longer use this field
      nextOrderAfterFail: {},
    },
    invoice: '',
    cost: '',
  };

  componentDidMount() {
    this.props.getCompleteOrderById(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.accountant.queryById) {
      this.setState({
        query: nextProps.accountant.queryById
      });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  confirmQueryFromCorporateClient = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    if (Number(this.state.cost) <= 0) {
      return toast.error('Сумма заказа не может быть нулем или отрицательным числом');
    }

    const object = {
      decision: 'confirm',
      clientType: this.state.query.clientType,
      paymentMethod: this.state.query.paymentMethod,
      orderId: this.state.query._id,
      invoice: this.state.invoice,
      cost: Number(this.state.cost),
      disinfectors: this.state.query.disinfectors
    };
    // console.log('corporate client', object);
    this.props.accountantConfirmQuery(object, this.props.history);
  }

  confirmQueryFromIndividualClient = () => {
    const object = {
      clientType: this.state.query.clientType,
      paymentMethod: this.state.query.paymentMethod,
      orderId: this.state.query._id,
      decision: 'confirm'
    };
    // console.log('indiv client', object);
    this.props.accountantConfirmQuery(object, this.props.history);
  };

  reject = () => {
    const object = {
      decision: 'reject',
      clientType: this.state.query.clientType,
      paymentMethod: this.state.query.paymentMethod,
      orderId: this.state.query._id,
      disinfectors: this.state.query.disinfectors
    };
    this.props.accountantConfirmQuery(object, this.props.history);
  }

  returnBack = () => {
    const object = {
      decision: 'back',
      clientType: this.state.query.clientType,
      paymentMethod: this.state.query.paymentMethod,
      orderId: this.state.query._id,
      disinfectors: this.state.query.disinfectors
    };
    // console.log('returnBack', object);
    this.props.accountantConfirmQuery(object, this.props.history);
  }

  render() {
    const { query } = this.state;

    return (
      <div className="container-fluid">
        <div className="row m-0">
          <div className="col-12 p-0">
            <div className="row">
              <div className="col-lg-6 col-md-7">
                {this.props.accountant.loadingQueries ? <Spinner /> : (
                  <div className="card order mt-2">
                    <div className="card-body p-0">
                      <ul className="font-bold mb-0 list-unstyled">
                        <RenderOrder
                          order={query}
                          shouldRenderIfOrderIsPovtor={true}
                          shouldRenderIfOrderIsFailed={true}
                          shouldRenderNextOrdersAfterFailArray={true}
                          shouldRenderDisinfector={true}
                          shouldRenderOperatorDecided={true}
                          shouldRenderAccountantDecided={false}
                          shouldRenderMaterialConsumption={true}
                          shouldRenderPaymentMethod={true}
                          shouldRenderUserAcceptedOrder={true}
                          shouldRenderWhoDealtWithClient={true}
                          shouldRenderUserCreated={true}
                          shouldRenderCompletedAt={true}
                        />
                      </ul>

                      {query.clientType === 'individual' || query.paymentMethod === 'cash' ? (
                        <div className="btn-group mt-3">
                          <button className="btn btn-success mr-2" onClick={() => { if (window.confirm('Вы уверены подтвердить заказ?')) { this.confirmQueryFromIndividualClient() } }}>
                            <i className="fas fa-check-square"></i> Подтвердить
                          </button>
                        </div>
                      ) : ''}

                      <div className="btn-group mt-3">
                        <button
                          className="btn btn-danger mr-2"
                          onClick={() => { if (window.confirm('Вы уверены отменить заказ?')) { this.reject() } }}
                        >
                          <i className="fas fa-ban"></i> Отменить Выполнение Заказа
                        </button>
                      </div>

                      <div className="btn-group mt-3">
                        <button
                          className="btn btn-dark mr-2"
                          onClick={() => { if (window.confirm('Вы уверены отправить заказ обратно дезинфектору?')) { this.returnBack() } }}
                        >
                          <i className="fas fa-undo"></i> Отправить Обратно
                        </button>
                      </div>

                      <ClientNotSatisfiedButton order={query} shouldLoadOrder={true} />
                    </div>
                  </div>
                )}
              </div>


              {query.clientType === 'corporate' && query.paymentMethod !== 'cash' && (
                <div className="col-lg-6 col-md-5 mx-auto">
                  <div className="card mt-3 mb-3">
                    <div className="card-body p-2">
                      <h3 className="text-center">Форма Подтверждения Заказа</h3>
                      <form onSubmit={this.confirmQueryFromCorporateClient}>
                        <TextFieldGroup
                          label="Введите Счет-Фактуру:"
                          type="text"
                          name="invoice"
                          value={this.state.invoice}
                          onChange={this.onChange}
                          placeholder='Счет-Фактура'
                          required
                        />

                        <TextFieldGroup
                          label="Введите сумму заказа (в сумах):"
                          type="number"
                          step="1"
                          name="cost"
                          value={this.state.cost}
                          onChange={this.onChange}
                          placeholder='Сумма'
                          required
                        />

                        <button className="btn btn-success btn-block">
                          <i className="fas fa-check-square"></i> Подтвердить Выполнение Заказа
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

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

export default connect(mapStateToProps, { getCompleteOrderById, accountantConfirmQuery })(withRouter(ConfirmQueryForm));