import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { ToastContainer } from 'react-toastify';
import {
  // Slide, 
  // Zoom, 
  Flip,
  // Bounce ,
} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';


class AlertContainer extends Component {
  render() {
    return (
      <React.Fragment>
        <ToastContainer
          // our classname to style this element
          className="toast-container"
          position="top-center"
          transition={Flip}
          // limit={3}
          theme={this.props.options.theme === "light" ? "dark" : "light"}
          autoClose={5000}
          collapseDuration={10000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          draggablePercent={25}
          pauseOnHover
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  options: state.options,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(withRouter(AlertContainer));