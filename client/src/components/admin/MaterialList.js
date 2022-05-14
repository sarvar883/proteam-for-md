import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import materialCategories from '../common/materialCategories';

import {
  getAllMaterials,
  deleteMaterialFromDB,
} from '../../actions/materialActions';


class MaterialList extends Component {
  state = {
    materials: this.props.material.materials || [],
  };

  componentDidMount() {
    if (
      this.props.material.materials &&
      this.props.material.materials.length > 0
    ) {
      // do not load materials
    } else {
      this.props.getAllMaterials();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.material.materials &&
      nextProps.material.materials.length > 0
    ) {
      this.setState({ materials: nextProps.material.materials });
    }
  }

  deleteMaterial = ({ material, unit }) => {
    const object = {
      material,
      unit,
    };
    // console.log('object', object);
    this.props.deleteMaterialFromDB(object);
  };

  render() {
    return (
      <div className="container">
        {this.props.material.loading ? (
          <div className="row mt-2">
            <div className="col-12">
              <Spinner />
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="row mt-2">
              <div className="col-12">
                <h2 className="text-center">Список материалов</h2>
              </div>
            </div>

            <div className="row">

              <div className="col-12">
                <div className="table-responsive mt-3">
                  <table className="table table-bordered table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Единица Измерения</th>
                        <th>Категория</th>
                        <th>Удалить</th>
                      </tr>
                    </thead>

                    <tbody>
                      {this.state.materials.map((item, index) => (
                        <tr key={index}>
                          <td>{item.material}</td>
                          <td>{item.unit}</td>
                          <td>{materialCategories[item.category]}</td>
                          <td>
                            <button className="btn btn-danger" onClick={() => {
                              if (window.confirm(`Вы уверены удалить материал <${item.material}> ?`)) {
                                this.deleteMaterial({ material: item.material, unit: item.unit });
                              }
                            }}>
                              <i className="fas fa-trash-alt"></i> Удалить Материал
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
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

export default connect(mapStateToProps, { getAllMaterials, deleteMaterialFromDB })(withRouter(MaterialList));