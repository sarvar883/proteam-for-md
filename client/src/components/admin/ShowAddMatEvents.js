import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Moment from 'react-moment';


class ShowAddMatEvents extends Component {
  state = {
    events: this.props.admin.addMatEvents || [],
  };

  render() {
    const { events } = this.state;
    const { disinfectors } = this.props.admin;

    // ============================
    // ============================
    // Calculate TOTAL added materials in given period

    // totalAddedMatObject has structure:
    // {
    //   [name_of_material]: {
    //     amount: number,
    //     unit: String,
    //   }
    // }
    const totalAddedMatObject = {};

    events.forEach(event => {
      event.materials.forEach(material => {

        if (totalAddedMatObject.hasOwnProperty(material.material)) {
          totalAddedMatObject[material.material].amount += material.amount;
        } else {
          totalAddedMatObject[material.material] = {
            amount: material.amount,
            unit: material.unit,
          };
        }

      });
    });

    let renderTotal = Object.keys(totalAddedMatObject).map((key, index) => (
      <li key={index}>{key}: {totalAddedMatObject[key].amount.toLocaleString()} {totalAddedMatObject[key].unit}</li>
    ));


    // ============================
    // ============================
    // Calculate added materials for each disinfector 
    const disinfArray = [];

    disinfectors.forEach(person => {
      disinfArray.push({
        _id: person._id,
        name: person.name,
        occupation: person.occupation,
        events: [],
        receivedMaterials: {},
      });
    });

    events.forEach(event => {
      disinfArray.forEach(element => {

        if (
          event.disinfector &&
          event.disinfector._id.toString() === element._id.toString() &&
          event.disinfector.name === element.name
        ) {
          element.events.push(event);

          event.materials.forEach(thing => {

            if (element.receivedMaterials.hasOwnProperty(thing.material)) {
              element.receivedMaterials[thing.material].amount += thing.amount;
            } else {
              element.receivedMaterials[thing.material] = {
                amount: thing.amount,
                unit: thing.unit,
              };
            }

          });
        }
      });
    });

    let renderDisinfectors = disinfArray.map((person, index) => {
      let renderDisinfectorTotal = Object.keys(person.receivedMaterials).map((key, number) => (
        <li key={number}>{key}: {person.receivedMaterials[key].amount.toLocaleString()} {person.receivedMaterials[key].unit}</li>
      ));

      let renderDisinfEvents = person.events.map((event, iteration) => {

        let renderEventsInDisinfArray = event.materials.map((item, number) => (
          <li key={number}>{item.material}: {item.amount.toLocaleString()} {item.unit}</li>
        ));

        return (
          <React.Fragment key={iteration}>
            <div className="col-lg-4 col-md-6" key={iteration}>
              <div className="card order mt-2">
                <div className="card-body p-0">
                  <ul className="font-bold mb-0 list-unstyled">
                    <li>Когда Получено: <Moment format="DD/MM/YYYY HH:mm">{event.createdAt}</Moment></li>
                    {event.admin && (
                      <li>Кто раздал: {event.admin.occupation} {event.admin.name}</li>
                    )}
                    <p className="mb-0">Материалы</p>
                    <ul>
                      {renderEventsInDisinfArray}
                    </ul>
                  </ul>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      });

      return (
        <React.Fragment key={index}>
          <div className="border-between-disinfectors mt-3"></div>
          <div className="border-between-disinfectors mt-1"></div>

          <h3 className="text-center mt-3">{person.occupation} {person.name}</h3>

          {person.events.length === 0 ? (
            <h4>У пользователя нет раздач</h4>
          ) : (
            <React.Fragment>
              <div className="row mt-3">
                <div className="col-lg-4 col-md-6">
                  <div className="card order mt-2">
                    <div className="card-body p-0">
                      <h4 className="text-center">Всего {person.name} Получил за этот период:</h4>
                      <ul className="font-bold mb-0 list-unstyled">
                        {renderDisinfectorTotal}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                {renderDisinfEvents}
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });

    return (
      <React.Fragment>

        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h4 className="text-center">Общая Раздача Материалов за этот период:</h4>
                <ul className="font-bold mb-0 list-unstyled">
                  {renderTotal}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            <h2 className="text-center pl-3 pr-3">Раздача Материалов Пользователям</h2>
            {renderDisinfectors}
          </div>
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

export default connect(mapStateToProps)(withRouter(ShowAddMatEvents));