import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { addClient } from '../../actions/adminActions';

import validatePhoneNumber from '../../utils/validatePhone';
import getAddressString from '../../utils/getAddressString';

import clientTypes from '../common/clientTypes';

import AddressFormFields from '../common/AddressFormFields';
import TextFieldGroup from '../common/TextFieldGroup';
import SelectListGroup from '../common/SelectListGroup';

import { toast } from 'react-toastify';


class AddClient extends Component {
  state = {
    type: '',
    name: '',
    phone: '',

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

    inn: '',
    errors: {},

    submitButtonRef: React.createRef(),
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onChangeAddress_v2 = (address_object) => {
    this.setState({ address_v2: address_object });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    if (!this.state.type) {
      return toast.error('Выберите тип клиента');
    }

    // send this object with request
    let object = {};

    if (this.state.type === 'individual') {
      // validate phone number with special function
      const phoneValidityObject = validatePhoneNumber(this.state.phone);

      if (!phoneValidityObject.isValid) {
        return toast.error(phoneValidityObject.message);
      }

      object = {
        type: this.state.type,
        name: this.state.name.trim(),
        phone: this.state.phone,
        address: getAddressString(this.state.address_v2),
        address_v2: { ...this.state.address_v2 },
        // createdAt: new Date(),
      };
    }

    if (this.state.type === 'corporate') {
      object = {
        type: this.state.type,
        name: this.state.name.trim(),
        inn: this.state.inn.trim(),
        // createdAt: new Date(),
      };
    }

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    // console.log('object', object);
    this.props.addClient(object, this.props.history, this.props.auth.user.occupation);
  }

  render() {
    const { errors } = this.state;

    // ===========================================
    const clientOptions = [
      { label: '-- Введите тип клиента --', value: '' },
      ...clientTypes
    ];

    return (
      <div className="container create-order mt-4" >
        <div className="row">
          <div className="col-md-8 m-auto">
            <div className="card">
              <div className="card-body">
                <h3 className="text-center">Добавить Клиента</h3>

                <form onSubmit={this.onSubmit}>
                  <SelectListGroup
                    name="type"
                    value={this.state.type}
                    onChange={this.onChange}
                    error={errors.type}
                    options={clientOptions}
                    required
                  />

                  <TextFieldGroup
                    label="Введите Имя Клиента"
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.onChange}
                    error={errors.name}
                    required
                  />

                  {this.state.type === 'corporate' && (
                    <React.Fragment>
                      <TextFieldGroup
                        label="Введите ИНН Клиента"
                        type="text"
                        name="inn"
                        value={this.state.inn}
                        onChange={this.onChange}
                        error={errors.inn}
                      />
                    </React.Fragment>
                  )}

                  {this.state.type === 'individual' && (
                    <React.Fragment>
                      <TextFieldGroup
                        label="Введите Тел Номер Клиента в формате +998XX-XXX-XX-XX (без тире)"
                        type="text"
                        name="phone"
                        value={this.state.phone}
                        onChange={this.onChange}
                        error={errors.phone}
                        required
                      />

                      {/* <TextFieldGroup
                        label="Введите Адрес Клиента"
                        type="text"
                        name="address"
                        value={this.state.address}
                        onChange={this.onChange}
                        error={errors.address}
                        required
                      /> */}

                      {/* =========================================== */}
                      {/* Address_v2 */}
                      <div className="border-bottom"></div>
                      <h5>Введите Адрес</h5>

                      <AddressFormFields onChangeAddress_v2={this.onChangeAddress_v2} />

                      <div className="border-bottom"></div>
                      {/* =========================================== */}
                    </React.Fragment>
                  )}

                  <button type="submit" className="btn btn-success" ref={this.state.submitButtonRef}>
                    <i className="fas fa-plus-circle"></i> Добавить
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, { addClient })(withRouter(AddClient));