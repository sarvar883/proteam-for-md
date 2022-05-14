import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import materialCategories from './materialCategories';


class RenderMaterialOptions extends Component {
  state = {
    materials: this.props.material.materials || [],
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.material.materials &&
      nextProps.material.materials.length > 0
    ) {
      this.setState({ materials: nextProps.material.materials });
    }
  }

  render() {
    let allCategories = this.state.materials.map(item => item.category || 'other');

    // remove duplicates from allCategories array
    const uniqueCategories = [...new Set(allCategories)];
    // console.log('uniqueCategories', uniqueCategories);

    // this object has structure:
    // {
    //    category_name: [{ material: string, unit: string, category: string }] -- array of materials
    // }
    const object = {};
    uniqueCategories.forEach(category => {
      object[category] = [];
    });

    // materialsArray.forEach(item => {
    this.state.materials.forEach(item => {
      object[item.category || 'other'].push(item);
    });

    // console.log('object', object);

    // loop through object and render the options
    const renderOptions = Object.keys(object).map((category, index) => {
      let categoryInRussian = materialCategories[category] || materialCategories.other;

      //  materials that belong to this category
      let materials = object[category];

      return (
        <optgroup label={categoryInRussian} key={index}>
          {materials.map((item, id) => (
            <option value={`${item.material}+${item.unit}`} key={id}>{item.material} {item.unit}</option>
          ))}
        </optgroup>
      );
    });

    return (
      <React.Fragment>
        <option value=''>-- Выберите вещество --</option>
        {renderOptions}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  material: state.material,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(RenderMaterialOptions));