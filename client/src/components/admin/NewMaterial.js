import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import TextFieldGroup from '../common/TextFieldGroup';
import SelectListGroup from '../common/SelectListGroup';
import materialCategories from '../common/materialCategories';

import { addNewMaterial } from '../../actions/materialActions';

import { toast } from 'react-toastify';


class NewMaterial extends Component {
  state = {
    material: '',
    unit: '',
    category: '',
    errors: {},

    submitButtonRef: React.createRef(),
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    if (!this.state.unit) {
      return toast.error('Выберите единицу измерения');
    }

    if (!this.state.category) {
      return toast.error('Выберите категорию');
    }

    // check if material with this name already exists
    // case insensitive search
    const materialNames = this.props.material.materials.map(item => item.material.toLowerCase());
    // console.log('materialNames', materialNames);
    if (materialNames.includes(this.state.material.toLowerCase())) {
      return toast.error('Материал с таким названием уже существует');
    }

    // input data validation is successful

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    const object = {
      material: this.state.material,
      unit: this.state.unit,
      category: this.state.category,
    };
    // console.log('object', object);
    this.props.addNewMaterial(object, this.props.history, this.props.auth.user.occupation);
  };

  render() {
    const { errors } = this.state;

    const units = [
      { label: '-- Выберите единицу измерения --', value: '' },
      { label: 'гр', value: 'гр' },
      { label: 'шт', value: 'шт' },
      { label: 'мл', value: 'мл' },
      { label: 'пак', value: 'пак' },
    ];

    const categoryOptions = [
      { label: '-- Выберите категорию --', value: '' },
    ];

    Object.keys(materialCategories).forEach((key) => {
      categoryOptions.push({
        label: materialCategories[key],
        value: key,
      });
    });

    return (
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card">
              <div className="card-body">
                <h3 className="text-center">Добавить Новый Материал</h3>

                <form onSubmit={this.onSubmit}>
                  <TextFieldGroup
                    label="Введите Название Материала"
                    type="text"
                    name="material"
                    value={this.state.material}
                    onChange={this.onChange}
                    placeholder="Название "
                    error={errors.material}
                    required
                  />

                  <label htmlFor="unit">Единица Измерения</label>
                  <SelectListGroup
                    name="unit"
                    value={this.state.unit}
                    onChange={this.onChange}
                    error={errors.unit}
                    options={units}
                  />

                  <label htmlFor="category">Категория</label>
                  <SelectListGroup
                    label="Категория"
                    name="category"
                    value={this.state.category}
                    onChange={this.onChange}
                    error={errors.unit}
                    options={categoryOptions}
                  />

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
  material: state.material,
  errors: state.errors,
});

export default connect(mapStateToProps, { addNewMaterial })(withRouter(NewMaterial));