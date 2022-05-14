import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Moment from 'react-moment';


class ShowMatComings extends Component {
  state = {
    comings: this.props.subadmin.materialComing || [],
  };

  render() {
    const { comings } = this.state;

    // totalMatComingObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }

    const totalMatComingObject = {};

    comings.forEach(thing => {
      thing.materials.forEach(item => {

        if (totalMatComingObject.hasOwnProperty(item.material)) {
          totalMatComingObject[item.material].amount += item.amount;
        } else {
          totalMatComingObject[item.material] = {
            amount: item.amount,
            unit: item.unit,
          };
        }

      });
    });

    let renderTotal = Object.keys(totalMatComingObject).map((key, index) => (
      <li key={index}>{key}: {totalMatComingObject[key].amount.toLocaleString()} {totalMatComingObject[key].unit}</li>
    ));


    let renderComings = comings.map((item, index) => {
      let renderMaterials = item.materials.map((element, number) => (
        <li key={number}>{element.material}: {element.amount.toLocaleString()} {element.unit}</li>
      ));

      return (
        <div className="col-lg-4 col-md-6" key={index}>
          <div className="card order mt-2">
            <div className="card-body p-0">
              <ul className="font-bold mb-0 list-unstyled">
                {item.admin && (
                  <li>Отправитель: {item.admin.name}</li>
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
                <h4 className="text-center">Ваш Общий Приход Материалов за этот период:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotal}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          {renderComings}
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

export default connect(mapStateToProps)(withRouter(ShowMatComings));