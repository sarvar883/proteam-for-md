import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from './Spinner';
import AddressFormFields from './AddressFormFields';

import getAddressString from '../../utils/getAddressString';

import {
  clientById,
  editClient,
} from '../../actions/adminActions';


class EditClient extends Component {
  state = {
    client: {
      orders: [],
    },
    id: '',
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

    submitButtonRef: React.createRef(),
  };

  componentDidMount() {
    if (this.props.admin.clientById._id) {
      this.setState({
        client: this.props.admin.clientById,
        id: this.props.admin.clientById._id,
        type: this.props.admin.clientById.type,
        name: this.props.admin.clientById.name || '',
        phone: this.props.admin.clientById.phone || '',
        address: this.props.admin.clientById.address || '',
        address_v2: this.props.admin.clientById.address_v2 || {},
        inn: this.props.admin.clientById.inn || '',
      });
    } else {
      this.props.clientById(this.props.match.params.id);
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.admin.clientById) {
      this.setState({
        client: nextProps.admin.clientById,
        id: nextProps.admin.clientById._id,
        type: nextProps.admin.clientById.type,
        name: nextProps.admin.clientById.name || '',
        phone: nextProps.admin.clientById.phone || '',
        address: nextProps.admin.clientById.address || '',
        address_v2: nextProps.admin.clientById.address_v2 || {},
        inn: nextProps.admin.clientById.inn || '',
      });
    }
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onChangeAddress_v2 = (address_object) => {
    this.setState({ address_v2: address_object });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    // create address string
    let addressString = '';
    if (this.state.address_v2 && Object.keys(this.state.address_v2).length > 0) {
      // address_v2
      addressString = getAddressString(this.state.address_v2);
    } else {
      // old address
      addressString = this.state.address.trim();
    }

    const object = {
      id: this.state.id,
      type: this.state.type,
      name: this.state.name.trim(),
      phone: this.state.phone,

      address: addressString,
      address_v2: { ...this.state.address_v2 },

      inn: this.state.inn.trim(),
    };
    // console.log('object', object);
    this.props.editClient(object, this.props.history);
  };

  render() {
    return (
      <div className="container-fluid">

        {this.props.admin.loadingClients ? (
          <div className="row mt-3">
            <div className="col-12">
              <Spinner />
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="row mt-3">
              <div className="col-lg-6 col-md-8 m-auto">
                <div className="card">
                  <div className="card-body">
                    <h3 className="display-5 text-center">Редактировать Клиента</h3>
                    <p className="font-bold mb-0">Тип клиента: {this.state.type === 'corporate' ? 'Корпоративный' : 'Физический'}</p>

                    <form onSubmit={this.onSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Имя Клиента:</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          onChange={this.onChange}
                          value={this.state.name}
                          required
                        />
                      </div>

                      {this.state.type === 'individual' && (
                        <React.Fragment>
                          <div className="form-group">
                            <label htmlFor="phone">Телефон Клиента:</label>
                            <input
                              type="text"
                              name="phone"
                              className="form-control"
                              onChange={this.onChange}
                              value={this.state.phone}
                              required
                            />
                          </div>

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
                              <div className="form-group">
                                <label htmlFor="address">Адрес Клиента:</label>
                                <input
                                  type="text"
                                  name="address"
                                  className="form-control"
                                  onChange={this.onChange}
                                  value={this.state.address}
                                  required
                                />
                              </div>
                            </React.Fragment>
                          )}
                          {/* =========================================== */}
                        </React.Fragment>
                      )}

                      {this.state.type === 'corporate' && (
                        <div className="form-group">
                          <label htmlFor="inn">ИНН Клиента:</label>
                          <input
                            type="text"
                            name="inn"
                            className="form-control"
                            onChange={this.onChange}
                            value={this.state.inn}
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary" ref={this.state.submitButtonRef}>
                        <i className="fas fa-edit"></i> Редактировать
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps, { clientById, editClient })(withRouter(EditClient));