import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import AddressFormFields from '../common/AddressFormFields';
import TextFieldGroup from '../common/TextFieldGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

import isEmpty from '../../validation/is-empty';
import getDateStringElements from '../../utils/dateStringElements';
import validatePhoneNumber from '../../utils/validatePhone';
import getAddressString from '../../utils/getAddressString';
import orderFullyProcessed from '../../utils/orderFullyProcessed';

import advertisements from '../common/advertisements';
import orderTypes from '../common/orderTypes';
import clientTypes from '../common/clientTypes';

import {
  getDisinfectors,
  getAllUsers,
  getCorporateClients,
  getOrderForEdit,
  editOrder,
  clearOrderById,
} from '../../actions/orderActions';

import { toast } from 'react-toastify';


class EditOrder extends Component {
  state = {
    _id: '',
    disinfectorId: '',
    userAcceptedOrder: '',
    clientType: '',
    client: '',
    clientId: '',
    filial: '',

    address: '',
    address_v2: {
      region: '',  // город / регион
      district: '', // район
      block_or_street: '', // квартал / махалля / улица
      houseNumber: '',  // номер дома
      apartmentNumber: '', // номер квартиры (необязательно)
      floor: '', // этаж (необязательно)
      referencePoint: '', // ориентир 
    },

    date: '',
    timeFrom: '',
    phone: '',
    hasSecondPhone: false,
    phone2: '',
    typeOfService: [],
    advertising: '',

    hasParameterWhoDealtWithClient: false,
    whoDealtWithClient: '',

    comment: '',

    submitButtonRef: React.createRef(),
  }

  componentDidMount() {
    // close previous toasts
    toast.dismiss();

    this.props.getOrderForEdit(this.props.match.params.orderId);
    this.props.getDisinfectors();
    this.props.getCorporateClients();
    this.props.getAllUsers();
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.order) {
    //   this.setState({
    //     order: nextProps.order
    //   });
    // }

    // если заказ уже выполнен и обработан, то его нельзя редактировать
    if (nextProps.order.orderById && orderFullyProcessed(nextProps.order.orderById)) {
      toast.error('Этот заказ не может быть редактирован');
      this.props.history.push(`/${this.props.auth.user.occupation}`);
    }

    if (nextProps.order.orderById) {
      let orderForEdit = nextProps.order.orderById;

      orderForEdit.disinfectorId = !isEmpty(orderForEdit.disinfectorId) ? orderForEdit.disinfectorId : '';

      // orderForEdit.userAcceptedOrder = orderForEdit.userAcceptedOrder ? orderForEdit.userAcceptedOrder : '';
      orderForEdit.whoDealtWithClient = orderForEdit.whoDealtWithClient ? orderForEdit.whoDealtWithClient : '';

      orderForEdit.clientType = !isEmpty(orderForEdit.clientType) ? orderForEdit.clientType : '';
      orderForEdit.clientId = !isEmpty(orderForEdit.clientId) ? orderForEdit.clientId : '';

      orderForEdit.client = !isEmpty(orderForEdit.client) ? orderForEdit.client : '';
      orderForEdit.filial = !isEmpty(orderForEdit.filial) ? orderForEdit.filial : '';

      // old address
      orderForEdit.address = !isEmpty(orderForEdit.address) ? orderForEdit.address : '';
      // new address
      orderForEdit.address_v2 = !isEmpty(orderForEdit.address_v2) ? orderForEdit.address_v2 : {};

      orderForEdit.phone = !isEmpty(orderForEdit.phone) ? orderForEdit.phone : '';
      orderForEdit.typeOfService = !isEmpty(orderForEdit.typeOfService) ? orderForEdit.typeOfService : '';
      orderForEdit.advertising = !isEmpty(orderForEdit.advertising) ? orderForEdit.advertising : '';

      orderForEdit.comment = !isEmpty(orderForEdit.comment) ? orderForEdit.comment : '';

      if (isEmpty(orderForEdit.phone2)) {
        this.setState({
          hasSecondPhone: false
        });
        orderForEdit.phone2 = '';
      } else {
        this.setState({
          hasSecondPhone: true
        });
      }

      const date = !isEmpty(orderForEdit.dateFrom) ? new Date(orderForEdit.dateFrom) : '';
      const dateObject = getDateStringElements(date);

      const defaultDateString = `${dateObject.year}-${dateObject.month}-${dateObject.day}`;

      let defaultHourString = '';
      if (new Date(date).getHours() < 10) {
        defaultHourString = `0${new Date(date).getHours()}:00`;
      } else {
        defaultHourString = `${new Date(date).getHours()}:00`;
      }



      let array = [];
      orderTypes.forEach(object => {
        array.push({
          type: object.value,
          selected: false,
          translation: object.translation || ''
        });
      });

      // service type array
      let arraySelectedItems = [...orderForEdit.typeOfService.split(',')];

      array.forEach(item => {
        arraySelectedItems.forEach(element => {
          if (item.type === element.trim()) {
            item.selected = true;
          }
        });
      });

      let hasParameterWhoDealtWithClient = false;

      if (
        orderForEdit.whoDealtWithClient &&
        orderForEdit.whoDealtWithClient._id &&
        orderForEdit.whoDealtWithClient._id.length > 0
      ) {
        hasParameterWhoDealtWithClient = true;
      }

      this.setState({
        _id: orderForEdit._id,
        disinfectorId: orderForEdit.disinfectorId._id,
        // userAcceptedOrder: orderForEdit.userAcceptedOrder._id,
        hasParameterWhoDealtWithClient,
        whoDealtWithClient: orderForEdit.whoDealtWithClient._id,

        clientType: orderForEdit.clientType,
        client: orderForEdit.client,
        clientId: orderForEdit.clientId._id,
        filial: orderForEdit.filial,
        address: orderForEdit.address,
        address_v2: { ...orderForEdit.address_v2 },
        date: defaultDateString,
        timeFrom: defaultHourString,
        phone: orderForEdit.phone,
        phone2: orderForEdit.phone2,
        typeOfService: array,
        advertising: orderForEdit.advertising,
        comment: orderForEdit.comment,
      });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onChangeAddress_v2 = (address_object) => {
    this.setState({ address_v2: address_object });
  }

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

  toggleSecondPhone = (e) => {
    e.preventDefault();
    this.setState({
      hasSecondPhone: !this.state.hasSecondPhone
    });
  }

  deleteSecondPhone = (e) => {
    e.preventDefault();
    this.setState({
      hasSecondPhone: false,
      phone2: ''
    });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    // validate date and time
    if (!this.state.date) {
      return toast.error('Выберите дату заказа');
    }
    if (!this.state.timeFrom) {
      return toast.error('Выберите время заказа');
    }

    // validate phone number
    const phoneValidityObject = validatePhoneNumber(this.state.phone);
    const phone2ValidityObject = validatePhoneNumber(this.state.phone2);

    // phone
    if (!phoneValidityObject.isValid) {
      return toast.error(phoneValidityObject.message);
    }

    // phone 2
    if (this.state.hasSecondPhone && !phone2ValidityObject.isValid) {
      return toast.error(phone2ValidityObject.message);
    }

    // validate service type
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

    if (selectedItems === 0) {
      return toast.error('Выберите тип заказа');
    }

    // input data validation is successful

    // create address string
    let addressString = '';
    if (this.state.address_v2 && Object.keys(this.state.address_v2).length > 0) {
      // address_v2
      addressString = getAddressString(this.state.address_v2);
    } else {
      // old address
      addressString = this.state.address.trim();
    }


    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    const order = {
      _id: this.state._id,
      disinfectorId: this.state.disinfectorId,
      // userAcceptedOrder: this.state.userAcceptedOrder,
      whoDealtWithClient: this.state.whoDealtWithClient,
      clientType: this.state.clientType,
      client: this.state.client.trim(),
      clientId: this.state.clientId,
      filial: this.state.filial,

      address: addressString,
      address_v2: { ...this.state.address_v2 },

      dateFrom: this.state.date,
      timeFrom: this.state.timeFrom,
      phone: this.state.phone,
      phone2: this.state.phone2,
      typeOfService: serviceTypeString,
      advertising: this.state.advertising,
      comment: this.state.comment.trim(),
    };
    // console.log('order', order);
    this.props.editOrder(order, this.props.history, this.props.auth.user.occupation);
  };

  componentWillUnmount() {
    this.props.clearOrderById();
  }

  render() {
    let allUsers = this.props.order.allUsers ? this.props.order.allUsers.sort((x, y) => x.name - y.name) : [];
    const userOptions = [
      { label: '-- Кто общался с клиентом? --', value: '' }
    ];
    allUsers.forEach(item => {
      userOptions.push({
        label: `${item.occupation}, ${item.name}`,
        value: item._id
      });
    });


    // ===========================================
    let disinfectors = allUsers.filter(user => user.occupation === 'disinfector' || user.occupation === 'subadmin');
    let disinfectorOptions = [
      { label: '-- Выберите ответственного дезинфектора --', value: '' }
    ];
    disinfectors.forEach(worker => disinfectorOptions.push(
      { label: `${worker.name}, ${worker.occupation}`, value: worker._id }
    ));


    // ===========================================
    const clientOptions = [
      { label: '-- Введите тип клиента --', value: '' },
      ...clientTypes
    ];


    // ===========================================
    const corporateClients = [
      { label: '-- Выберите корпоративного клиента --', value: '' }
    ];
    // sort clients alphabetically
    let sortedCorpClients = this.props.order.corporateClients.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) { return -1; }
      if (a.name.toUpperCase() > b.name.toUpperCase()) { return 1; }
      return 0;
    });
    sortedCorpClients.forEach(item => {
      corporateClients.push({
        label: item.name,
        value: item._id
      });
    });


    // ===========================================
    const advOptions = [
      { label: '-- Откуда узнали о нас? --', value: '' },
      ...advertisements
    ];


    return (
      <React.Fragment>
        {this.props.order.loading ? <Spinner /> : (
          <div className="container edit-order mt-4">
            <div className="row">
              <div className="col-md-8 m-auto">
                <div className="card">
                  <div className="card-body">
                    <h2 className="display-5 text-center">Редактировать Заказ</h2>
                    {/* <p>Номер Заявки: {}</p> */}

                    <form onSubmit={this.onSubmit}>
                      <div className="form-group">
                        <label htmlFor="clientType">Выберите Тип Клиента:</label>
                        <select
                          className="form-control"
                          value={this.state.clientType}
                          name="clientType"
                          onChange={this.onChange}
                          required
                        >
                          {clientOptions.map((item, index) =>
                            <option key={index} value={item.value}>{item.label}</option>
                          )}
                        </select>
                      </div>

                      {this.state.clientType === 'corporate' && (
                        <div className="form-group">
                          <label htmlFor="clientId">Выберите Корпоративного Клиента:</label>
                          <select
                            className="form-control"
                            value={this.state.clientId}
                            name="clientId"
                            onChange={this.onChange}
                            required
                          >
                            {corporateClients.map((item, index) =>
                              <option key={index} value={item.value}>{item.label}</option>
                            )}
                          </select>
                        </div>
                      )}

                      <TextFieldGroup
                        label="Введите Имя Клиента:"
                        type="text"
                        name="client"
                        value={this.state.client}
                        onChange={this.onChange}
                        required
                      />

                      {this.state.clientType === 'corporate' && (
                        <TextFieldGroup
                          label="Введите Филиал (Необязательно)"
                          type="text"
                          name="filial"
                          value={this.state.filial}
                          placeholder="Филиал"
                          onChange={this.onChange}
                        />
                      )}

                      {/* =========================================== */}
                      {/* Address_v2 */}
                      {this.state.address_v2 && Object.keys(this.state.address_v2).length > 0 ? (
                        <React.Fragment>
                          <div className="border-bottom"></div>
                          <h5>Введите Адрес</h5>

                          <AddressFormFields
                            onChangeAddress_v2={this.onChangeAddress_v2}
                            initialAddressFields={this.state.address_v2}
                          />

                          <div className="border-bottom"></div>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          {/* old address field*/}
                          <TextFieldGroup
                            label="Адрес"
                            type="text"
                            name="address"
                            value={this.state.address}
                            onChange={this.onChange}
                            required
                          />
                        </React.Fragment>
                      )}
                      {/* =========================================== */}

                      <TextFieldGroup
                        label="Телефон"
                        type="phone"
                        name="phone"
                        value={this.state.phone}
                        onChange={this.onChange}
                        required
                      />

                      {this.state.hasSecondPhone ? (
                        <React.Fragment>
                          <TextFieldGroup
                            label="Другой Номер Телефона"
                            placeholder="Введите запасной номер телефона"
                            type="phone"
                            name="phone2"
                            value={this.state.phone2}
                            onChange={this.onChange}
                            required
                          />
                          <button className="btn btn-danger mb-2" onClick={this.deleteSecondPhone}>
                            <i className="fas fa-minus-circle"></i> Убрать запасной номер телефона
                          </button>
                        </React.Fragment>
                      ) : (
                        <button className="btn btn-success mb-3" onClick={this.toggleSecondPhone}>
                          <i className="fas fa-plus-circle"></i> Добавить другой номер
                        </button>
                      )}

                      <TextFieldGroup
                        label="Дата выполнения заказа"
                        name="date"
                        type="date"
                        value={this.state.date}
                        onChange={this.onChange}
                        required
                      />

                      <TextFieldGroup
                        label="Время (часы:минуты) в 24-часовом формате"
                        name="timeFrom"
                        type="time"
                        value={this.state.timeFrom}
                        onChange={this.onChange}
                        required
                      />


                      <div className="border-bottom"></div>
                      <label htmlFor="">Выберите тип заказа (можно выбрать несколько):</label>
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


                      <div className="form-group">
                        <label htmlFor="advertising">Откуда Узнали:</label>
                        <select
                          className="form-control"
                          value={this.state.advertising}
                          name="advertising"
                          onChange={this.onChange}
                          required
                        >
                          {advOptions.map((item, index) =>
                            <option key={index} value={item.value}>{item.label}</option>
                          )}
                        </select>
                      </div>

                      {this.state.hasParameterWhoDealtWithClient && (
                        <div className="form-group">
                          <label htmlFor="whoDealtWithClient">Кто общался с клиентом?</label>
                          <select
                            className="form-control"
                            value={this.state.whoDealtWithClient}
                            name="whoDealtWithClient"
                            onChange={this.onChange}
                            required
                          >
                            {userOptions.map((item, index) =>
                              <option key={index} value={item.value}>{item.label}</option>
                            )}
                          </select>
                        </div>
                      )}

                      {this.props.order.loading ? (
                        <p>Дезинфекторы загружаются...</p>
                      ) : (
                        <div className="form-group">
                          <label htmlFor="disinfectorId">Выберите Дезинфектора:</label>
                          <select
                            className="form-control"
                            value={this.state.disinfectorId}
                            name="disinfectorId"
                            onChange={this.onChange}
                            required
                          >
                            {disinfectorOptions.map((item, index) =>
                              <option key={index} value={item.value}>{item.label}</option>
                            )}
                          </select>
                        </div>
                      )}


                      {/* <div className="form-group">
                        <label htmlFor="userAcceptedOrder">Кто принял заказ:</label>
                        <select
                          className="form-control"
                          value={this.state.userAcceptedOrder}
                          name="userAcceptedOrder"
                          onChange={this.onChange}
                          required
                        >
                          {userOptions.map((item, index) =>
                            <option key={index} value={item.value}>{item.label}</option>
                          )}
                        </select>
                      </div> */}

                      <TextAreaFieldGroup
                        name="comment"
                        placeholder="Комментарии (Это поле не обязательное)"
                        value={this.state.comment}
                        onChange={this.onChange}
                        required
                      />

                      <button type="submit" className="btn btn-primary" ref={this.state.submitButtonRef}>
                        <i className="fas fa-edit"></i> Редактировать
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  order: state.order,
  errors: state.errors,
});

export default connect(mapStateToProps, { getDisinfectors, getAllUsers, getCorporateClients, getOrderForEdit, editOrder, clearOrderById })(withRouter(EditOrder));