import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import AddressFormFields from '../common/AddressFormFields';
import TextFieldGroup from '../common/TextFieldGroup';
import SelectListGroup from '../common/SelectListGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';
import Select from 'react-select';

import validatePhoneNumber from '../../utils/validatePhone';
import getAddressString from '../../utils/getAddressString';

import advertisements from '../common/advertisements';
import orderTypes from '../common/orderTypes';
import clientTypes from '../common/clientTypes';

import {
  getCorporateClients,
  getAllUsers,
  createOrder,
  clearErrors,
} from '../../actions/orderActions';

import { toast } from 'react-toastify';


class CreateOrder extends Component {
  constructor(props) {
    super(props);

    let date, hour;

    if (this.props.location.state) {
      date = this.props.location.state.state.date;
      hour = this.props.location.state.state.hour;
    } else {
      date = '';
      hour = '';
    }

    this.state = {
      disinfectorId: '',
      // userAcceptedOrder: '',
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

      date: date,
      timeFrom: hour,
      phone: '',
      hasSecondPhone: false,
      phone2: '',
      typeOfService: [],
      advertising: '',
      whoDealtWithClient: '',
      comment: '',
      errors: {},

      submitButtonRef: React.createRef(),
    };
  }

  componentDidMount() {
    this.props.clearErrors();
    this.props.getCorporateClients();
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
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   // if errors object is not empty
  //   if (nextProps.errors && Object.keys(nextProps.errors).length > 0) {
  //     console.log('componentWillReceiveProps', nextProps.errors);
  //     this.setState({ errors: nextProps.errors });

  //     // enable the submit button
  //     let submitButton = this.state.submitButtonRef.current;
  //     submitButton.disabled = false;

  //     window.scrollTo({ top: 0 });
  //   }
  // }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onChangeAddress_v2 = (address_object) => {
    this.setState({ address_v2: address_object });
  }

  onSelectClientTypeChange = (e) => {
    this.setState({
      clientId: e.value
    });
  };

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

    this.setState({ hasSecondPhone: false, phone2: '' });
  }

  fillWithTestData = () => {
    const object = {
      ...this.state,

      advertising: "Google",
      client: "TEST TEST TEST",
      clientId: "",
      clientType: "individual",
      comment: "",
      dateFrom: "2022-04-17",
      disinfectorId: "5e7e0117d15b550678ed41e8",
      filial: "",
      phone: "+998946704093",
      phone2: "",
      tgChat: "883014185",
      timeFrom: "01:00",
      userAcceptedOrder: "5f5f3da31380aa0035e0c5fb",
      userCreated: "5f5f3da31380aa0035e0c5fb",
      whoDealtWithClient: "5e7e0117d15b550678ed41e8",
    };

    this.setState({ ...object });
  };

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    // validate address_v2
    const addressRequiredFields = [
      { name: 'region', inRussian: 'регион/город' },
      { name: 'district', inRussian: 'район' },
      { name: 'block_or_street', inRussian: 'Квартал / улицу' },
      { name: 'houseNumber', inRussian: 'номер дома' },
      { name: 'referencePoint', inRussian: 'ориентир' },
    ];

    for (let i = 0; i < addressRequiredFields.length; i++) {
      let currentField = addressRequiredFields[i].name;
      let fieldInRussian = addressRequiredFields[i].inRussian;

      if (!this.state.address_v2[currentField]) {
        return toast.error(`Введите ${fieldInRussian}`);
      }
    }

    // validate corporate client
    if (this.state.clientType === 'corporate' && this.state.clientId === '') {
      return toast.error('Выберите корпоративного клиента');
    }

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

    if (!this.state.advertising) {
      return toast.error('Выберите пункт "Откуда узнали"');
    }

    if (!this.state.disinfectorId) {
      return toast.error('Выберите ответственного дезинфектора');
    }

    // if (!this.state.userAcceptedOrder) {
    //   return toast.error('Выберите пункт "Кто принял заказ"');
    // }

    if (!this.state.whoDealtWithClient) {
      return toast.error('Выберите пункт "Кто общался с клиентом"');
    }


    // input data validation is successful

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    // find object ответственный дезинфектор
    let respDisinf;
    this.props.order.allUsers.forEach((item, index) => {
      if (item._id === this.state.disinfectorId) {
        respDisinf = item;
        return;
      }
    });

    const newOrder = {
      disinfectorId: this.state.disinfectorId,
      tgChat: respDisinf.tgChat || '',
      client: this.state.client.trim(),
      clientType: this.state.clientType,
      clientId: this.state.clientId,
      filial: this.state.filial,

      address: getAddressString(this.state.address_v2),
      address_v2: { ...this.state.address_v2 },

      dateFrom: this.state.date,
      timeFrom: this.state.timeFrom,
      phone: this.state.phone,
      phone2: this.state.phone2,
      typeOfService: serviceTypeString,
      advertising: this.state.advertising,
      comment: this.state.comment.trim(),
      userCreated: this.props.auth.user.id,
      whoDealtWithClient: this.state.whoDealtWithClient,

      // 28.03.2022 now userAcceptedOrder is the  user who filled this from 
      // so, userAcceptedOrder = userCreated
      // userAcceptedOrder is replaced by whoDealtWithClient
      // userAcceptedOrder: this.state.userAcceptedOrder,
      userAcceptedOrder: this.props.auth.user.id,
    };
    // console.log('newOrder', newOrder);
    this.props.createOrder(newOrder, this.props.history, this.props.auth.user.occupation);
  };

  render() {
    const { errors } = this.state;

    let allUsers = this.props.order.allUsers ? this.props.order.allUsers.sort((x, y) => x.name - y.name) : [];

    const userOptions = [
      { label: '-- Кто общался с клиентом? --', value: 0 }
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
      { label: '-- Выберите ответственного дезинфектора --', value: 0 }
    ];
    disinfectors.forEach(worker => disinfectorOptions.push({
      label: `${worker.name}, ${worker.occupation}`, value: worker._id
    }));


    // ===========================================
    const clientOptions = [
      { label: '-- Введите тип клиента --', value: '' },
      ...clientTypes
    ];


    // ===========================================
    const corporateClients = [
      { label: '-- Выберите корпоративного клиента --', value: '' }
    ];
    // sort corporate clients by name in alphabetical order
    let corpClients = this.props.order.corporateClients.sort((a, b) => {
      return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
    });

    corpClients.forEach(item => {
      corporateClients.push({
        label: item.name,
        value: item._id
      });
    });


    // ===========================================
    const advOptions = [
      { label: '-- Откуда узнали о нас? --', value: 0 },
      ...advertisements
    ];


    // styles of select corporate client element (Select)
    const colourStyles = {
      control: (styles) => ({
        ...styles,
        backgroundColor: this.props.options.theme === 'dark' ? '#666666' : 'white',
        color: this.props.options.theme === 'dark' ? 'white' : 'black',
      }),
      option: (styles) => ({
        ...styles,
        backgroundColor: this.props.options.theme === 'dark' ? '#212d3b' : 'white',
        color: this.props.options.theme === 'dark' ? 'white' : 'black',
      }),
      placeholder: (styles) => ({
        ...styles,
        color: this.props.options.theme === 'dark' ? 'white' : 'black',
      }),
      singleValue: (styles) => ({
        ...styles,
        color: this.props.options.theme === 'dark' ? 'white' : 'black',
      }),
    };

    return (
      <div className="container create-order mt-4">
        {/* {this.state.errors.errorMessage && this.state.errors.errorMessage.length > 0 && (
          <div className="row">
            <div className="col-md-8 m-auto">
              <div className="alert alert-danger">
                <h5><i className="fas fas fa-exclamation"></i> {this.state.errors.errorMessage} <i className="fas fas fa-exclamation"></i></h5>
              </div>
            </div>
          </div>
        )} */}

        <div className="row mt-2">
          <div className="col-md-8 m-auto">
            <div className="card">
              <div className="card-body">
                <h2 className="text-center">Создать Заказ</h2>

                <form noValidate onSubmit={this.onSubmit}>
                  <SelectListGroup
                    name="clientType"
                    value={this.state.clientType}
                    onChange={this.onChange}
                    options={clientOptions}
                    error={errors.clientType}
                  />

                  {this.state.clientType === 'corporate' && (
                    <Select
                      className='select-corporate-client'
                      onChange={this.onSelectClientTypeChange}
                      options={corporateClients}
                      placeholder="Выберите корпоративного клиента"
                      styles={colourStyles}
                    />
                  )}

                  <TextFieldGroup
                    label="Введите Имя Клиента"
                    type="text"
                    name="client"
                    value={this.state.client}
                    placeholder="Имя Клиента"
                    onChange={this.onChange}
                    error={errors.client}
                  />

                  {this.state.clientType === 'corporate' && (
                    <TextFieldGroup
                      label="Введите Филиал (Необязательно)"
                      type="text"
                      name="filial"
                      value={this.state.filial}
                      placeholder="Филиал"
                      onChange={this.onChange}
                      error={errors.filial}
                    />
                  )}

                  {/* =========================================== */}
                  {/* Address_v2 */}
                  <div className="border-bottom"></div>
                  <h5>Введите Адрес</h5>

                  <AddressFormFields onChangeAddress_v2={this.onChangeAddress_v2} />

                  <div className="border-bottom"></div>
                  {/* =========================================== */}

                  <TextFieldGroup
                    label="Телефон"
                    type="phone"
                    name="phone"
                    value={this.state.phone}
                    placeholder="Номер телефона"
                    onChange={this.onChange}
                    error={errors.phone}
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
                    error={errors.date}
                  />

                  <TextFieldGroup
                    label="Время (часы:минуты) в 24-часовом формате"
                    name="timeFrom"
                    type="time"
                    value={this.state.timeFrom}
                    onChange={this.onChange}
                    error={errors.timeFrom}
                  />


                  <div className="border-bottom"></div>
                  <label htmlFor="">Выберите тип заказа (можно выбрать несколько):</label>
                  {orderTypes.map((item, key) =>
                    <div className="form-check" key={key}>
                      <label className="form-check-label">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={this.onChangeTypes}
                          value={item.value}
                        />{item.label} {item.translation && ` - ${item.translation}`}
                      </label>
                    </div>
                  )}
                  <div className="border-bottom"></div>

                  <label htmlFor="advertising">Откуда Узнали:</label>
                  <SelectListGroup
                    name="advertising"
                    value={this.state.advertising}
                    onChange={this.onChange}
                    error={errors.advertising}
                    options={advOptions}
                  />

                  <label htmlFor="whoDealtWithClient">Кто общался с клиентом?</label>
                  <SelectListGroup
                    name="whoDealtWithClient"
                    value={this.state.whoDealtWithClient}
                    onChange={this.onChange}
                    options={userOptions}
                    error={errors.whoDealtWithClient}
                  />

                  {this.props.order.loading ? (
                    <p>Дезинфекторы загружаются...</p>
                  ) : (
                    <React.Fragment>
                      <label htmlFor="disinfectorId">Выберите Дезинфектора:</label>
                      <SelectListGroup
                        name="disinfectorId"
                        value={this.state.disinfectorId}
                        onChange={this.onChange}
                        error={errors.disinfectorId}
                        options={disinfectorOptions}
                      />
                    </React.Fragment>
                  )}

                  {/* <label htmlFor="userAcceptedOrder">Кто принял заказ:</label>
                  <SelectListGroup
                    name="userAcceptedOrder"
                    value={this.state.userAcceptedOrder}
                    onChange={this.onChange}
                    options={userOptions}
                    error={errors.userAcceptedOrder}
                  /> */}

                  <TextAreaFieldGroup
                    name="comment"
                    placeholder="Комментарии (Необязательно)"
                    value={this.state.comment}
                    onChange={this.onChange}
                    error={errors.comment}
                  />

                  <button type="submit" className="btn btn-success mr-3" ref={this.state.submitButtonRef}>
                    <i className="fas fa-plus-circle"></i> Создать
                  </button>

                  {/* <button
                    type="button"
                    className='d-block btn btn-danger mt-2'
                    onClick={() => this.fillWithTestData()}
                  >Заполнить Тестовыми данными</button> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  options: state.options,
  errors: state.errors,
});

export default connect(mapStateToProps, { getCorporateClients, getAllUsers, createOrder, clearErrors })(withRouter(CreateOrder));