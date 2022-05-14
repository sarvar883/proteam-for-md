import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import Moment from 'react-moment';
import RenderMaterialOptions from '../common/RenderMaterialOptions';

import removeZeros from '../../utils/removeZerosMat';

import {
  getCurrentMaterials,
  setCurrentMaterials,
} from '../../actions/adminActions';

import { toast } from 'react-toastify';


class SetCurrentMaterials extends Component {
  state = {
    currentMaterials: [],

    materials: [{
      material: '',
      amount: 0,
      unit: ''
    }]
  };

  componentDidMount() {
    if (
      this.props.admin.currentMaterials &&
      this.props.admin.currentMaterials.materials &&
      this.props.admin.currentMaterials.materials.length > 0
    ) {
      this.setState({
        currentMaterials: this.props.admin.currentMaterials.materials
      });
    } else {
      this.props.getCurrentMaterials();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.admin.currentMaterials.materials) {
      this.setState({
        currentMaterials: nextProps.admin.currentMaterials.materials
      });
    }
  }

  changeSelect = (e) => {
    const index = e.target.name.split('-')[1];
    const value = e.target.value.split('+')[0];
    const unit = e.target.value.split('+')[1];

    let helpArray = [...this.state.materials];

    helpArray[index].material = value;
    helpArray[index].unit = unit;

    this.setState({
      materials: helpArray
    });
  }

  changeAmount = (e) => {
    const index = e.target.name.split('-')[1];
    const amount = Number(e.target.value);

    let helpArray = [...this.state.materials];
    helpArray[index].amount = amount;

    this.setState({
      materials: helpArray
    });
  }

  addMaterial = (e) => {
    e.preventDefault();

    const newMaterialObject = {
      material: '',
      amount: 0,
      unit: ''
    };

    let array = [...this.state.materials];
    array.push(newMaterialObject);
    this.setState({
      materials: array
    }, () => {
      // scroll to bottom of hte page
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  deleteMaterial = (e) => {
    e.preventDefault();

    // delete the last element in this.state.materials
    let array = [...this.state.materials];
    array.pop();

    this.setState({
      materials: array
    });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    console.clear();

    let hasEmptyFields = false;
    let hasNegativeAmountFields = false;

    // check for empty material name fields
    this.state.materials.forEach(item => {
      if (item.material === '' || item.unit === '') {
        hasEmptyFields = true;
      }

      if (item.amount < 0) {
        hasNegativeAmountFields = true;
      }
    });

    if (hasEmptyFields) {
      return toast.error('Заполните Поле "Выберите Материал и Количество"');
    }
    if (hasNegativeAmountFields) {
      return toast.error('Количество Материала не может быть отрицательнам числом');
    }

    // input data validation is successful

    const object = {
      materials: this.state.materials,
    };
    // console.log('object', object);
    this.props.setCurrentMaterials(object, this.props.history);
  }

  render() {
    // current materials
    let currentMat = removeZeros([...this.state.currentMaterials]);

    let renderCurMat = currentMat.map((item, index) => (
      <li key={index}>{item.material}: {item.amount} {item.unit}</li>
    ));

    const renderMaterialInputs = this.state.materials.map((item, index) => (
      <React.Fragment key={index}>
        <div className="form-group">
          <select
            name={`material-${index}`}
            className="form-control"
            onChange={this.changeSelect}
            required
          >
            <RenderMaterialOptions />
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`quantity-${index}`}>Количество:</label>
          <input
            type="number"
            step="0.001"
            className="form-control"
            name={`quantity-${index}`}
            onChange={this.changeAmount}
            required
          />
        </div>

        <div className="border-bottom-red"></div>
        <div className="border-bottom-red"></div>
      </React.Fragment>
    ));

    return (
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-12">
            <h3 className="text-center">Изменить количество материалов на складе</h3>
          </div>
        </div>

        <div className="row mt-2">
          {/* Render Form */}
          <div className="col-md-6">
            <div className="card mt-2">
              <div className="card-body">
                <h4 className="text-center">Введите названия материалов, которых хотите изменить и их количество</h4>

                <form onSubmit={this.onSubmit}>
                  {renderMaterialInputs}

                  {this.state.materials.length < this.props.material.materials.length && (
                    <button
                      className="btn btn-primary mr-2 mt-2"
                      onClick={this.addMaterial}
                    >
                      <i className="fas fa-plus"></i> Добавить Материал
                    </button>
                  )}

                  {this.state.materials.length === 1 ? '' : (
                    <button
                      className="btn btn-danger mt-2"
                      onClick={this.deleteMaterial}
                    >
                      <i className="fas fa-trash-alt"></i> Удалить последний материал
                    </button>
                  )}

                  <div className="border-bottom"></div>

                  <button
                    type="submit"
                    className="btn btn-success"
                  >
                    <i className="fas fa-marker"></i> Изменить материалы
                  </button>
                </form>
              </div>
            </div>
          </div>


          {/* Render current materials */}
          <div className="col-md-6">
            {this.props.admin.loadingCurMat ? <Spinner /> : (
              <div className="card order mt-2">
                <div className="card-body p-0">
                  <h3 className="text-center">Сейчас имеется материалов на складе</h3>
                  <ul className="font-bold mb-0 list-unstyled">
                    {renderCurMat}
                    <li className="mt-2">Последнее обновление: <Moment format="DD/MM/YYYY HH:mm">{this.props.admin.currentMaterials.lastUpdated}</Moment></li>
                  </ul>
                </div>
              </div>
            )}
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

export default connect(mapStateToProps, { getCurrentMaterials, setCurrentMaterials })(withRouter(SetCurrentMaterials));