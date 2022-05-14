import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// import Switch from 'react-input-switch';

import { setTheme } from '../../actions/optionsActions';


class Options extends Component {
  state = {
    theme: this.props.options.theme,
  };

  changeTheme = () => {
    // toggle theme
    let newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setState({ theme: newTheme });
    this.props.setTheme(newTheme);
  };

  render() {
    return (
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-lg-4 col-md-6">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <h5 className="text-center">Изменить Тему</h5>
                Светлая

                {/* <Switch
                  className="mx-2 mb-0"
                  on="dark" off="light"
                  value={this.state.theme}
                  onChange={() => this.changeTheme()}
                  styles={{
                    container: {
                      width: 33,
                      height: 24,
                    },
                    button: {
                      width: 20,
                    },
                  }}
                /> */}

                Темная
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
  options: state.options,
  errors: state.errors,
});

export default connect(mapStateToProps, { setTheme })(withRouter(Options));