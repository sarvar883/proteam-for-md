import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import RenderMaterialOptions from '../common/RenderMaterialOptions';

import removeZeros from '../../utils/removeZerosMat';
import {
  getSubadminMaterials,
  addMaterialToDisinfector,
} from '../../actions/subadminActions';
import { getAllDisinfectorsAndSubadmins } from '../../actions/adminActions';

import { toast } from 'react-toastify';


class MaterialDistrib extends Component {
  state = {
    array: [{}],
    currentMaterials: [],
    materials: [
      {
        material: '',
        amount: 0,
        unit: ''
      }
    ],
    disinfector: '',

    submitButtonRef: React.createRef(),
  };

  componentDidMount() {
    this.props.getAllDisinfectorsAndSubadmins();
    this.props.getSubadminMaterials(this.props.auth.user.id);
    window.scrollTo({ top: 0 });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentMaterials: nextProps.auth.user.materials
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  changeSelect = (e) => {
    const index = e.target.name.split('-')[1];
    let newMaterialsArray = this.state.materials;
    newMaterialsArray[index].material = e.target.value.split('+')[0];
    newMaterialsArray[index].unit = e.target.value.split('+')[1];
    this.setState({
      materials: newMaterialsArray
    });
  }

  changeAmount = (e) => {
    const index = e.target.name.split('-')[1];
    let newMaterialsArray = this.state.materials;
    newMaterialsArray[index].amount = Number(e.target.value);
    this.setState({
      materials: newMaterialsArray
    });
  }

  addMaterial = (e) => {
    e.preventDefault();
    let newArray = this.state.array;
    newArray.push({});
    let newMaterialsArray = this.state.materials;
    newMaterialsArray.push({
      material: '',
      amount: 0,
      unit: ''
    });
    this.setState({
      array: newArray,
      materials: newMaterialsArray
    });
  }

  deleteMaterial = (e) => {
    e.preventDefault();
    let newArray = this.state.array;
    newArray.pop();
    let newMaterialsArray = this.state.materials;
    newMaterialsArray.pop();
    this.setState({
      array: newArray,
      materials: newMaterialsArray
    });
  }

  onSubmit = (e) => {
    e.preventDefault();

    // close previous toasts
    toast.dismiss();

    let emptyFields = 0;
    let notEnoughMaterials = 0;
    let zeroValues = 0;

    this.state.materials.forEach(item => {
      if (item.material === '') {
        emptyFields++;
      }

      if (item.amount <= 0) {
        zeroValues++;
      }

      this.state.currentMaterials.forEach(element => {
        if (item.material === element.material && item.unit === element.unit && item.amount > element.amount) {
          notEnoughMaterials++;
          return;
        }
      });
    });

    if (emptyFields > 0) {
      return toast.error('Заполните Поле "Выберите Материал и Количество"');
    }

    if (zeroValues > 0) {
      return toast.error('Количество Материала не может быть нулем или отрицательнам числом');
    }

    if (notEnoughMaterials > 0) {
      return toast.error('У вас недостаточно материалов');
    }

    // input data validation is successful

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    const object = {
      disinfector: this.state.disinfector,
      subadmin: this.props.auth.user.id,
      materials: this.state.materials
    };
    // console.log('subadmin mat distrib', object);
    this.props.addMaterialToDisinfector(object, this.props.history);
    // this.props.getAllDisinfectorsAndSubadmins();
  }

  render() {
    // current materials without zeros
    const currentMaterials = removeZeros([...this.state.currentMaterials]);

    let renderSubadminMaterials = currentMaterials.map((item, index) =>
      <li key={index}>{item.material}: {item.amount} {item.unit}</li>
    );

    let showDisinfectors = this.props.subadmin.disinfectors.map((item, index) => {
      let matArray = removeZeros([...item.materials]);

      let disinfectorMaterials = matArray.map((material, number) =>
        <li key={number}>{material.material}: {material.amount} {material.unit}</li>
      );

      return (
        <div className="col-lg-4 col-md-6" key={index}>
          <div className="card order mt-2">
            <div className="card-body p-0">
              <ul className="font-bold mb-0 list-unstyled">
                <h4 className="text-center">{item.occupation}: {item.name}</h4>
                <p className="mb-0">Имеется в наличии материалов:</p>
                <ul>
                  {disinfectorMaterials}
                </ul>
              </ul>
            </div>
          </div>
        </div>
      )
    });


    let renderMaterials = this.state.array.map((item, index) => (
      <React.Fragment key={index}>
        <div className="form-group">
          <select
            name={`consumption-${index}`}
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

    let disinfectorOptions = [
      { label: '-- Выберите пользователя --', value: "" }
    ];

    this.props.subadmin.disinfectors.forEach(worker => {
      if (worker._id !== this.props.auth.user.id) {
        disinfectorOptions.push({
          label: `${worker.occupation} ${worker.name}`, value: worker._id
        });
      }
    });

    return (
      <div className="container-fluid">
        <div className="row mt-3">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h3 className="text-center">У вас имеется материалов</h3>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderSubadminMaterials}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* не показывать имеющиеся материалы других дезинфекторов 27.10.2021 */}
        {/* исключение: показывать только субадмину Jamol Snab 29.10.2021 */}
        {/* "6045cdbfec05b0002f34e19b" -- id of Jamol Snab */}
        {this.props.auth.user.id === '6045cdbfec05b0002f34e19b' && (
          <>
            <div className="row mt-3">
              <div className="col-12">
                <h3 className="text-center">Материалы у пользователей</h3>
              </div>
            </div>

            {this.props.subadmin.loading ? <Spinner /> : (
              <div className="row mt-2">
                {showDisinfectors}
              </div>
            )}
          </>
        )}

        <div className="row mt-3">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="card mt-2">
              <div className="card-body">
                <h3 className="text-center">Добавить Материалы Пользователю</h3>

                <form onSubmit={this.onSubmit}>
                  <div className="form-group">
                    <label htmlFor="disinfector">Выберите Пользователя:</label>
                    {this.props.subadmin.loading ? (
                      <p>Дезинфекторы загружаются...</p>
                    ) : (
                      <select
                        value={this.state.disinfector}
                        name="disinfector"
                        className="form-control"
                        onChange={this.onChange}
                        required
                      >
                        {disinfectorOptions.map((item, index) =>
                          <option value={item.value} key={index}>{item.label}</option>
                        )}
                      </select>
                    )}
                  </div>

                  <label htmlFor="consumption">Выберите Материал и Количество:</label>
                  {renderMaterials}

                  {this.state.array.length < this.props.material.materials.length ? (
                    <button className="btn btn-primary mr-2" onClick={this.addMaterial}>
                      <i className="fas fa-plus"></i> Добавить Материал
                    </button>
                  ) : ''}

                  {this.state.array.length === 1 ? '' : (
                    <button className="btn btn-danger" onClick={this.deleteMaterial}>
                      <i className="fas fa-trash-alt"></i> Удалить последний материал
                    </button>
                  )}

                  <div className="border-bottom"></div>

                  <button type="submit" className="btn btn-success" ref={this.state.submitButtonRef}>
                    <i className="fas fa-plus-circle"></i> Добавить Пользователю
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
  subadmin: state.subadmin,
  material: state.material,
  errors: state.errors,
});

export default connect(mapStateToProps, { getAllDisinfectorsAndSubadmins, getSubadminMaterials, addMaterialToDisinfector })(withRouter(MaterialDistrib));