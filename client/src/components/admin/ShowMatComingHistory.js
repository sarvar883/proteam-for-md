import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Moment from 'react-moment';


class ShowMatComingHistory extends Component {
  state = {
    comings: this.props.admin.materialComing || [],
  };

  render() {
    const { comings } = this.state;

    // matComingObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }
    const matComingObject = {};

    comings.forEach(event => {
      event.materials.forEach(item => {

        if (matComingObject.hasOwnProperty(item.material)) {
          matComingObject[item.material].amount += item.amount;
        } else {
          matComingObject[item.material] = {
            amount: item.amount,
            unit: item.unit,
          };
        }

      });
    });

    let renderTotal = Object.keys(matComingObject).map((key, index) => (
      <li key={index}>{key}: {matComingObject[key].amount.toLocaleString()} {matComingObject[key].unit}</li>
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
                  <li>Кто добавил: {item.admin.occupation} {item.admin.name}</li>
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
                <h4 className="text-center">Общий Приход Материалов за этот период:</h4>
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
  order: state.order,
  admin: state.admin,
  errors: state.errors,
});

export default connect(mapStateToProps)(withRouter(ShowMatComingHistory));