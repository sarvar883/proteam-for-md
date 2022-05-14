import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import AddressFormFields from '../common/AddressFormFields';
import Spinner from '../common/Spinner';
import TextFieldGroup from '../common/TextFieldGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

import validatePhoneNumber from '../../utils/validatePhone';
import getAddressString from '../../utils/getAddressString';

import advertisements from '../common/advertisements';
import orderTypes from '../common/orderTypes';

import {
  getAllUsers,
  getRepeatOrderForm,
  createRepeatOrder,
} from '../../actions/orderActions';

import { toast } from 'react-toastify';


class CreateRepeatOrder extends Component {
  state = {
    disinfectorId: '',
    userAcceptedOrder: '',
    client: '',
    clientType: '',
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
    // typeOfService: '',
    typeOfService: [],
    advertising: '',
    comment: '',

    submitButtonRef: React.createRef(),
  };

  componentDidMount() {
    this.props.getRepeatOrderForm(this.props.match.params.orderId);
    this.props.getAllUsers();
    window.scrollTo({ top: 0 });

    let array = [];

    orderTypes.forEach(object => {
      array.push({
        type: object.value,
        selected: false
      });
    });

    this.setState({
      typeOfService: array
    });
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.order.repeatOrder) {
      let newOrder = nextProps.order.repeatOrder;

      if (!newOrder.phone2 || newOrder.phone2 === '') {
        this.setState({
          hasSecondPhone: false
        });
      } else {
        this.setState({
          hasSecondPhone: true,
          phone2: newOrder.phone2
        });
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
      let arraySelectedItems = [];
      // to prevent bugs
      if (newOrder.typeOfService && newOrder.typeOfService.length > 0) {
        arraySelectedItems = newOrder.typeOfService.split(',');

        array.forEach(item => {
          arraySelectedItems.forEach(element => {
            if (item.type === element.trim()) {
              item.selected = true;
            }
          });
        });
      }


      this.setState({
        disinfectorId: newOrder.disinfectorId._id ? newOrder.disinfectorId._id : '',
        clientType: newOrder.clientType ? newOrder.clientType : '',
        client: newOrder.client ? newOrder.client : '',
        clientId: newOrder.clientId ? newOrder.clientId._id : '',

        address: newOrder.address ? newOrder.address : '',
        address_v2: newOrder.address_v2 ? { ...newOrder.address_v2 } : {},

        phone: newOrder.phone ? newOrder.phone : '',
        // typeOfService: newOrder.typeOfService ? newOrder.typeOfService : '',
        typeOfService: array,
        advertising: newOrder.advertising ? newOrder.advertising : '',
        userAcceptedOrder: newOrder.userAcceptedOrder ? newOrder.userAcceptedOrder._id : '',
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

    const newOrder = {
      id: this.props.match.params.orderId,
      disinfectorId: this.state.disinfectorId,
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
      userCreated: this.props.auth.user.id,
      userAcceptedOrder: this.state.userAcceptedOrder,
    };
    // console.log(newOrder);
    this.props.createRepeatOrder(newOrder, this.props.history, this.props.auth.user.occupation);
  }

  render() {
    let allUsers = this.props.order.allUsers ? this.props.order.allUsers.sort((x, y) => x.name - y.name) : [];
    const userOptions = [
      { label: '-- Кто принял заказ? --', value: "" }
    ];
    allUsers.forEach(item => {
      userOptions.push({
        label: `${item.occupation}, ${item.name}`,
        value: item._id
      });
    });


    // ===========================================
    let disinfectors = allUsers.filter(user => user.occupation === 'disinfector' || user.occupation === 'subadmin');
    const disinfectorOptions = [
      { label: '-- Выберите ответственного дезинфектора --', value: "" }
    ];
    disinfectors.forEach(worker => disinfectorOptions.push({
      label: `${worker.name}, ${worker.occupation}`, value: worker._id
    }));


    // ===========================================
    const advOptions = [
      { label: '-- Откуда узнали о нас? --', value: "" },
      ...advertisements
    ];

    return (
      <React.Fragment>
        {this.props.order.loadingRepeatOrder ? <Spinner /> : (
          <div className="container mt-4">
            <div className="row">
              <div className="col-md-8 m-auto">
                <div className="card">
                  <div className="card-body">
                    <h2 className="display-5 text-center">Создать Повторный Заказ</h2>

                    <form onSubmit={this.onSubmit}>
                      {this.state.clientType === 'corporate' && (
                        <h5>Корпоративный Клиент: {this.props.order.repeatOrder.clientId.name}</h5>
                      )}

                      {this.state.clientType === 'individual' && (
                        <h5>Физический Клиент</h5>
                      )}

                      <TextFieldGroup
                        label="Введите Имя Клиента"
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
                          {/* old address field */}
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
                        label="Дата выполнения заказа"
                        name="date"
                        type="date"
                        onChange={this.onChange}
                        required
                      />
                      <TextFieldGroup
                        label="Время (часы:минуты:AM/PM) C"
                        name="timeFrom"
                        type="time"
                        onChange={this.onChange}
                        required
                      />
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
                            label="Запасной Номер Телефона"
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

                      <div className="border-bottom"></div>
                      <div className="form-group">
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
                      </div>
                      <div className="border-bottom"></div>


                      <div className="form-group">
                        <label htmlFor="advertising">Откуда узнали:</label>
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

                      <div className="form-group">
                        <label htmlFor="userAcceptedOrder">Кто принял Заказ:</label>
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
                      </div>

                      <TextAreaFieldGroup
                        name="comment"
                        placeholder="Комментарии (Это поле не обязательное)"
                        value={this.state.comment}
                        onChange={this.onChange}
                        required
                      />

                      <button type="submit" className="btn btn-primary" ref={this.state.submitButtonRef}>
                        <i className="fas fa-plus-circle"></i> Создать Повторный Заказ
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
  operator: state.operator,
  order: state.order,
  errors: state.errors,
});

export default connect(mapStateToProps, { getAllUsers, getRepeatOrderForm, createRepeatOrder })(withRouter(CreateRepeatOrder));