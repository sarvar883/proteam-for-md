import React, { Component } from 'react';

import regions from './regions';


// new address_v2 form fields
class AddressFormFields extends Component {
  state = {
    address_v2: {
      region: '',  // город / регион
      district: '', // район
      block_or_street: '', // квартал / махалля / улица
      houseNumber: '',  // номер дома
      apartmentNumber: '', // номер квартиры (необязательно)
      floor: '', // этаж (необязательно)
      referencePoint: '', // ориентир 
    },
  };

  componentDidMount() {
    // if initial address_v2 fields are passed in (i.e. in EditOrder component)
    // then write that data to the state
    this.setState({
      address_v2: this.props.initialAddressFields
    });
  }

  onChange = (e) => {
    let address_v2 = { ...this.state.address_v2 };

    address_v2[e.target.name] = e.target.value;

    // change address_v2 fields in state
    this.setState({ address_v2 });

    // change address_v2 in parent component
    this.props.onChangeAddress_v2(address_v2);
  };

  render() {
    // ===========================================
    const regionOptions = [
      { label: '-- Выберите регион/город --', value: '' },
      ...regions
    ];


    return (
      <React.Fragment>
        <div className="form-group">
          <select
            className="form-control"
            value={this.state.address_v2.region}
            name="region"
            onChange={this.onChange}
            required
          >
            {regionOptions.map((item, index) =>
              <option key={index} value={item.value}>{item.label}</option>
            )}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="district">Введите район:</label>
            <input
              type="text"
              name="district"
              className="form-control"
              value={this.state.address_v2.district || ''}
              placeholder="Район"
              onChange={this.onChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="block">Квартал / махалля / улица:</label>
            <input
              type="text"
              name="block_or_street"
              className="form-control"
              value={this.state.address_v2.block_or_street || ''}
              placeholder="Квартал / махалля / улица"
              onChange={this.onChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="houseNumber">Номер дома:</label>
            <input
              type="text"
              name="houseNumber"
              className="form-control"
              value={this.state.address_v2.houseNumber || ''}
              placeholder="Номер дома"
              onChange={this.onChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="apartmentNumber">Номер квартиры (Необязательно):</label>
            <input
              type="text"
              name="apartmentNumber"
              className="form-control"
              value={this.state.address_v2.apartmentNumber || ''}
              placeholder="Номер квартиры"
              onChange={this.onChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="floor">Этаж (Необязательно):</label>
            <input
              type="text"
              name="floor"
              className="form-control"
              value={this.state.address_v2.floor || ''}
              placeholder="Этаж"
              onChange={this.onChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="referencePoint">Ориентир:</label>
            <input
              type="text"
              name="referencePoint"
              className="form-control"
              value={this.state.address_v2.referencePoint || ''}
              placeholder="Ориентир"
              onChange={this.onChange}
              required
            />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

AddressFormFields.defaultProps = {
  initialAddressFields: {},
};

export default AddressFormFields;