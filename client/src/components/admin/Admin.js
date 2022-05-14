import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Calendar from 'react-calendar';
import Moment from 'react-moment';
import Spinner from '../common/Spinner';
import { Swipeable } from 'react-swipeable';

import AdmSortedOrders from './AdmSortedOrders';

import { getSortedOrders } from '../../actions/adminActions';
import { setDateInCalendar } from '../../actions/optionsActions';


class Admin extends Component {
  state = {
    // date: new Date(),
    date: this.props.options.dateInCalendar || new Date()
  };

  componentDidMount() {
    // if orders this date are already in redux, then we do not have to load them again
    if (
      this.props.options.dateInCalendar &&
      this.props.options.dateInCalendar === this.props.admin.date &&
      this.props.admin.sortedOrders && this.props.admin.sortedOrders.length > 0
    ) {
      // do not load calendar orders
    } else {
      this.props.getSortedOrders(this.state.date);
    }
  }

  onChange = (date) => {
    // do not send another request if orders are already being loaded
    if (!this.props.admin.loadingSortedOrders) {
      this.setState({
        date: date,
      });

      this.props.getSortedOrders(date);
      this.props.setDateInCalendar(date);
    }
  };

  onSwiped = (direction) => {
    let newDate = new Date(this.state.date);

    if (direction === 'LEFT') {
      // add 1 day to state date
      newDate.setTime(newDate.getTime() + 1000 * 60 * 60 * 24);

    } else if (direction === 'RIGHT') {
      // decrement 1 day from state date
      newDate.setTime(newDate.getTime() - 1000 * 60 * 60 * 24);
    }

    this.setState({ date: newDate });

    this.props.getSortedOrders(this.state.date);
    this.props.setDateInCalendar(this.state.date);
  };

  today = () => {
    let newDate = new Date();

    // do not send another request if orders are already being loaded
    if (!this.props.admin.loadingSortedOrders) {
      this.setState({
        date: newDate,
      });

      this.props.getSortedOrders(newDate);
      this.props.setDateInCalendar(newDate);
    }
  };

  reloadOrders = () => {
    // do not send another request if orders are already being loaded
    if (!this.props.admin.loadingSortedOrders) {
      this.props.getSortedOrders(this.state.date);
    }
  };

  render() {
    const { loadingSortedOrders } = this.props.admin;

    return (
      <div className="container-fluid mt-1">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">
              Страница Админа {this.props.auth.user.name}
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mt-4 calendar">
            <div className="sticky-top">
              <Calendar
                className="react-calendar"
                onChange={this.onChange}
                value={this.state.date}
              />

              <button
                className="btn btn-dark mt-3 mr-2"
                onClick={() => this.today()}
              >
                <i className="fas fa-calendar-day"></i> Сегодня
              </button>

              <button
                className="btn btn-primary mt-3"
                onClick={() => this.reloadOrders()}
              >
                <i className="fas fa-sync"></i> Обновить Заказы
              </button>
            </div>
          </div>
          <div className="col-lg-9">
            <h2 className="text-center">
              Заявки на <Moment format="DD/MM/YYYY">{this.state.date}</Moment>
            </h2>
            {loadingSortedOrders ? (
              <Spinner />
            ) : (
              <Swipeable
                trackMouse
                preventDefaultTouchmoveEvent
                onSwipedLeft={() => this.onSwiped('LEFT')}
                onSwipedRight={() => this.onSwiped('RIGHT')}
                delta={120}
              >
                <AdmSortedOrders date={this.state.date} />
              </Swipeable>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  options: state.options,
  errors: state.errors,
});

export default connect(mapStateToProps, { getSortedOrders, setDateInCalendar })(withRouter(Admin));