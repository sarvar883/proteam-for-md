import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Moment from 'react-moment';


class ShowMatDistrib extends Component {
  state = {
    events: this.props.subadmin.addMatEvents || [],
  };

  render() {
    const { events } = this.state;

    // totalAddedMatObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }

    const totalAddedMatObject = {};

    events.forEach(thing => {
      thing.materials.forEach(item => {

        if (totalAddedMatObject.hasOwnProperty(item.material)) {
          totalAddedMatObject[item.material].amount += item.amount;
        } else {
          totalAddedMatObject[item.material] = {
            amount: item.amount,
            unit: item.unit,
          };
        }

      });
    });

    let renderTotal = Object.keys(totalAddedMatObject).map((key, index) => (
      <li key={index}>{key}: {totalAddedMatObject[key].amount.toLocaleString()} {totalAddedMatObject[key].unit}</li>
    ));


    let renderDistributions = events.map((item, index) => {
      let renderMaterials = item.materials.map((element, number) => (
        <li key={number}>{element.material}: {element.amount.toLocaleString()} {element.unit}</li>
      ));

      return (
        <div className="col-lg-4 col-md-6" key={index}>
          <div className="card order mt-2">
            <div className="card-body p-0">
              <ul className="font-bold mb-0 list-unstyled">
                {item.disinfector && (
                  <li>Получатель: {item.disinfector.name}</li>
                )}
                <li>Дата: <Moment format="DD/MM/YYYY HH:mm">{item.createdAt}</Moment></li>
                <li>Материалы:</li>
                <ul>
                  {renderMaterials}
                </ul>
              </ul>
            </div>
          </div>
        </div>
      );
    });

    return (
      <React.Fragment>

        <div className="row">
          <div className="col-lg-5 col-md-7 m-auto">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Ваша Общая Раздача Материалов за этот период:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotal}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          {renderDistributions}
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  subadmin: state.subadmin,
  errors: state.errors,
});

export default connect(mapStateToProps)(withRouter(ShowMatDistrib));