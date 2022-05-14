import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';

import RenderOrder from '../common/RenderOrder';
import orderTypes from '../common/orderTypes';
import TextFieldGroup from '../common/TextFieldGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

import {
  getFailOrderById,
  setFailedOrder,
  createOrderAfterFail,
} from '../../actions/failActions';
import { getAllUsers } from '../../actions/orderActions';

import { toast } from 'react-toastify';


class FailAddNew extends Component {
  state = {
    date: '',
    timeFrom: '',
    disinfectorId: '',
    typeOfService: [],
    comment: '',
    errors: {},

    submitButtonRef: React.createRef(),
  };

  componentDidMount() {
    this.props.getAllUsers();
    window.scrollTo({ top: 0 });

    // console.log('fail', this.props.location.state);

    // in some cases, we should load order because the fields userCreated, userAcceptedOrder, disinfectors.user should be populated
    // if we come to this page from /search-orders, these fields would not be populated
    if (this.props.location.state && !this.props.location.state.state.shouldLoadOrder) {
      this.props.setFailedOrder(this.props.location.state.state.order);
    } else {
      this.props.getFailOrderById(this.props.match.params.id);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let array = [];
    orderTypes.forEach(object => {
      array.push({
        type: object.value,
        selected: false,
        translation: object.translation || ''
      });
    });

    if (nextProps.fail.failedOrder) {
      // service type array. typeOfService options should be preselected
      let arraySelectedItems = [];
      if (nextProps.fail.failedOrder.typeOfService) {
        arraySelectedItems = nextProps.fail.failedOrder.typeOfService.split(',');
      }

      array.forEach(item => {
        arraySelectedItems.forEach(element => {
          if (item.type === element.trim()) {
            item.selected = true;
          }
        });
      });

      // set typeOfService and comment
      this.setState({
        comment: nextProps.fail.failedOrder.comment,
        typeOfService: array
      });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onChangeTypes = (e) => {
    let array = [...this.state.typeOfService];
    array.forEach(item => {
      if (item.type === e.target.value) {
        item.selected = e.target.checked;
      }
    });

    this.setState({
      typeOfService: array
    });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    let serviceTypeString = '';
    let selectedItems = 0;
    this.state.typeOfService.forEach(item => {
      if (item.selected) {
        selectedItems++;
        if (selectedItems === 1) {
          serviceTypeString = serviceTypeString + item.type;
        } else {
          serviceTypeString = serviceTypeString + ', ' + item.type;
        }
      }
    });

    // check if prderTypes are selected
    if (selectedItems === 0) {
      return toast.error('Выберите тип заказа');
    }

    // input data validation is successful

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    const object = {
      // who is filling this form
      userOccupation: this.props.auth.user.occupation,

      // previous failed order
      failedOrder: this.props.fail.failedOrder,

      // new order details
      newOrder: {
        disinfectorId: this.state.disinfectorId,
        dateFrom: this.state.date,
        timeFrom: this.state.timeFrom,
        typeOfService: serviceTypeString,
        comment: this.state.comment.trim(),
        userCreated: this.props.auth.user.id
      }
    };
    // console.log('object', object);
    this.props.createOrderAfterFail(object, this.props.history, this.props.auth.user.occupation);
  }

  render() {
    const { errors } = this.state;

    const order = this.props.fail.failedOrder;

    // console.log('ORDER', order);

    // all users
    let users = this.props.order.loading ? [] : this.props.order.allUsers;

    // get disinfectors and subadmins
    let disinfectors = users.filter(user => user.occupation === 'disinfector' || user.occupation === 'subadmin');

    const disinfectorOptions = [
      { label: '-- Выберите ответственного дезинфектора --', value: '' }
    ];
    disinfectors.forEach(worker => disinfectorOptions.push({
      label: `${worker.name}, ${worker.occupation}`, value: worker._id
    }));

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Клиент недоволен. Добавить новый заказ</h2>
          </div>
        </div>

        {this.props.fail.loading ? <Spinner /> : (
          <div className="row mt-2">
            <div className="col-md-6 col-sm-10 mt-3">
              <div className="card order">
                <div className="card-body p-0">
                  <ul className="font-bold mb-0 list-unstyled">
                    <RenderOrder
                      order={order}
                      shouldRenderIfOrderIsPovtor={true}
                      shouldRenderIfOrderIsFailed={true}
                      sholdRenderIfOrderIsReturned={false}
                      shouldRenderDisinfector={true}
                      shouldRenderNextOrdersAfterFailArray={true}
                      shouldRenderPrevFailedOrderDate={true}
                      shouldRenderOperatorDecided={true}
                      shouldRenderAccountantDecided={true}
                      shouldRenderMaterialConsumption={true}
                      shouldRenderPaymentMethod={true}
                      shouldRenderUserAcceptedOrder={false}
                      shouldRenderUserCreated={false}
                      shouldRenderCompletedAt={true}
                      shouldRenderAdminGaveGrade={true}
                    />
                  </ul>
                </div>
              </div>
            </div>


            <div className="col-md-6 col-sm-10 mt-3">
              <div className="card">
                <div className="card-body py-1">
                  <h3 className="text-center mt-3">Создать Новый Заказ</h3>

                  <form onSubmit={this.onSubmit}>

                    {this.props.order.loading ? (
                      <p>Дезинфекторы загружаются...</p>
                    ) : (
                      <div className="form-group">
                        <label htmlFor="disinfectorId">Выберите Дезинфектора:</label>
                        <select
                          className="form-control"
                          name="disinfectorId"
                          value={this.state.disinfectorId}
                          onChange={this.onChange}
                          required
                        >
                          {disinfectorOptions.map((item, index) =>
                            <option key={index} value={item.value}>{item.label}</option>
                          )}
                        </select>
                      </div>
                    )}

                    <TextFieldGroup
                      label="Дата выполнения заказа"
                      name="date"
                      type="date"
                      value={this.state.date}
                      onChange={this.onChange}
                      error={errors.date}
                      required
                    />
                    <TextFieldGroup
                      label="Время (часы:минуты:AM/PM)"
                      name="timeFrom"
                      type="time"
                      value={this.state.timeFrom}
                      onChange={this.onChange}
                      error={errors.timeFrom}
                      required
                    />

                    <div className="border-bottom"></div>
                    <label htmlFor="typeOfService">Выберите тип заказа (можно выбрать несколько):</label>
                    {this.state.typeOfService.map((item, key) => (
                      <div className="form-check" key={key}>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={this.onChangeTypes}
                            value={item.type}
                            checked={item.selected}
                          /> {item.type} {item.translation && ` - ${item.translation}`}
                        </label>
                      </div>
                    ))}
                    <div className="border-bottom"></div>


                    <label htmlFor="comment">Введите Комментарии (это поле необязательное):</label>
                    <TextAreaFieldGroup
                      name="comment"
                      placeholder="Комментарии (Это поле не обязательное)"
                      value={this.state.comment}
                      onChange={this.onChange}
                      error={errors.comment}
                    />

                    <button type="submit" className="btn btn-success mb-2" ref={this.state.submitButtonRef}>
                      <i className="fas fa-plus-circle"></i> Создать
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  admin: state.admin,
  fail: state.fail,
  errors: state.errors,
});

export default connect(mapStateToProps, { getAllUsers, getFailOrderById, setFailedOrder, createOrderAfterFail })(withRouter(FailAddNew));