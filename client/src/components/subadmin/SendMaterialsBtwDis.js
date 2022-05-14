import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import RenderMaterialOptions from '../common/RenderMaterialOptions';

import removeZeros from '../../utils/removeZerosMat';

import { getAllDisinfectorsAndSubadmins } from '../../actions/adminActions';
import { disAddMatToOther } from '../../actions/disinfectorActions';

import { toast } from 'react-toastify';


// раздать материалы между дезинфекторами
class SendMaterialsBtwDis extends Component {
  state = {
    materials: [{
      material: '',
      amount: 0,
      unit: ''
    }],

    sender: '',
    receiver: '',

    submitButtonRef: React.createRef(),
  };

  componentDidMount() {
    this.props.getAllDisinfectorsAndSubadmins();
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

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

    // check if sender user has enough materials
    let notEnoughMaterials = false;

    const senderUser = this.props.subadmin.disinfectors.find(user => user._id === this.state.sender);

    this.state.materials.forEach(item => {
      senderUser.materials.forEach(element => {
        if (item.material === element.material && item.unit === element.unit && item.amount > element.amount) {
          notEnoughMaterials = true;
          return;
        }
      });
    });

    if (notEnoughMaterials) {
      return toast.error('У Отправителя недостаточно материалов');
    }

    // INPUT VALID
    // console.log('success');
    // console.log('materials', this.state.materials);

    // disable the submit button so that the form is not submitted multiple times
    let submitButton = this.state.submitButtonRef.current;
    submitButton.disabled = true;

    const object = {
      disinfector: this.state.receiver,
      admin: this.state.sender,
      materials: this.state.materials
    };
    // console.log('object', object);
    this.props.disAddMatToOther(object, this.props.auth.user.occupation, this.props.history);
  };


  render() {
    // показать материалы дезинфекторов и субадминов
    const showDisinfectors = this.props.subadmin.disinfectors.map((item, index) => {
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

    const disinfectorOptions = [
      { label: '-- Выберите пользователя --', value: "" }
    ];

    this.props.subadmin.disinfectors.forEach(worker => {
      disinfectorOptions.push({
        label: `${worker.occupation} ${worker.name}`, value: worker._id
      });
    });

    const renderMaterials = this.state.materials.map((item, index) => (
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

    return (
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-12">
            <h3 className="text-center">Раздать материалы от одного дезинфектора другому</h3>
          </div>
        </div>

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


        <div className="row mt-3">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="card mt-2">
              <div className="card-body">
                <h3 className="text-center">Отправить Материалы между дезинфекторами</h3>
                <form onSubmit={this.onSubmit}>
                  <div className="form-group">
                    <label htmlFor="disinfector">Выберите <span className="font-weight-bold">ОТПРАВИТЕЛЯ:</span></label>
                    {this.props.subadmin.loading ? (
                      <p>Дезинфекторы загружаются...</p>
                    ) : (
                      <select
                        value={this.state.sender}
                        name="sender"
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

                  <div className="form-group">
                    <label htmlFor="disinfector">Выберите <span className="font-weight-bold">ПОЛУЧАТЕЛЯ:</span></label>
                    {this.props.subadmin.loading ? (
                      <p>Дезинфекторы загружаются...</p>
                    ) : (
                      <select
                        value={this.state.receiver}
                        name="receiver"
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

                  <div className="border-bottom"></div>

                  <label htmlFor="consumption">Выберите Материал и Количество:</label>
                  {renderMaterials}

                  {this.state.materials.length < this.props.material.materials.length && (
                    <button className="btn btn-primary mr-2 mt-2" onClick={this.addMaterial}>
                      <i className="fas fa-plus"></i> Добавить Материал
                    </button>
                  )}

                  {this.state.materials.length === 1 ? '' : (
                    <button className="btn btn-danger mt-2" onClick={this.deleteMaterial}>
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
  admin: state.admin,
  subadmin: state.subadmin,
  material: state.material,
  errors: state.errors,
});

export default connect(mapStateToProps, { getAllDisinfectorsAndSubadmins, disAddMatToOther })(withRouter(SendMaterialsBtwDis));