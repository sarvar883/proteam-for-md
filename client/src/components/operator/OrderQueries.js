import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import Moment from 'react-moment';

import { getCompleteOrders } from '../../actions/operatorActions';

import returnSpecificDayForStats from '../../utils/returnSpecificDayForStats';

import ShowOrderQueries from './ShowOrderQueries';

import { getWeekDays, getWeekRange } from '../common/weekFunc';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';


class OrderQueries extends Component {
  state = {
    month: '',
    year: '',
    day: '',

    // to display month and year in heading h2
    headingDay: '',
    type: '',

    hoverRange: undefined,
    selectedDays: [],
  };

  componentDidMount() {
    // previous time params in global state
    let type = this.props.operator.completeOrdersTimeParams.type;

    if (type) {
      this.setState({ type });
    }

    if (type === 'day') {
      const dayString = this.props.operator.completeOrdersTimeParams.day.split('-').reverse().join('-');

      this.setState({ headingDay: dayString });
    }

    if (type === 'week') {
      this.setState({
        selectedDays: this.props.operator.completeOrdersTimeParams.days,
      });
    }
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  getQueriesForDay = (e) => {
    e.preventDefault();

    const object = {
      operatorId: this.props.auth.user.id,
      type: 'day',
      day: this.state.day,
    };
    // console.log('object', object);
    this.props.getCompleteOrders(object);

    this.setState({
      type: object.type,
      headingDay: this.state.day.split('-').reverse().join('-'),
    });
  }

  getSpecificDayStats = (param) => {
    const day = returnSpecificDayForStats(param);

    const object = {
      operatorId: this.props.auth.user.id,
      type: 'day',
      day
    };

    this.props.getCompleteOrders(object);

    this.setState({
      type: object.type,
      headingDay: day.split('-').reverse().join('-'),
    });
  }


  // weekly calendar
  handleDayChange = (date) => {
    let object = {
      operatorId: this.props.auth.user.id,
      type: 'week',
      days: getWeekDays(getWeekRange(date).from)
    };
    // console.log('object', object);
    this.props.getCompleteOrders(object);

    this.setState({
      type: object.type,
      selectedDays: getWeekDays(getWeekRange(date).from),
    });
  };

  handleDayEnter = (date) => {
    this.setState({
      hoverRange: getWeekRange(date)
    });
  };

  handleDayLeave = () => {
    this.setState({
      hoverRange: undefined
    });
  };

  handleWeekClick = (weekNumber, days, e) => {
    let object = {
      operatorId: this.props.auth.user.id,
      type: 'week',
      days: getWeekDays(getWeekRange(days[0]).from)
    };

    this.props.getCompleteOrders(object);

    this.setState({
      type: object.type,
      selectedDays: getWeekDays(getWeekRange(days[0]).from),
    });
  };
  // end of weekly calendar


  render() {
    // weekly calender
    const { hoverRange, selectedDays } = this.state;

    const daysAreSelected = selectedDays.length > 0;

    const modifiers = {
      hoverRange,
      selectedRange: daysAreSelected && {
        from: selectedDays[0],
        to: selectedDays[6],
      },
      hoverRangeStart: hoverRange && hoverRange.from,
      hoverRangeEnd: hoverRange && hoverRange.to,
      selectedRangeStart: daysAreSelected && selectedDays[0],
      selectedRangeEnd: daysAreSelected && selectedDays[6]
    };
    // end of calendar


    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-4 col-md-6 mt-3">
            <form onSubmit={this.getQueriesForDay} className="form-bg p-2">
              <h4 className="text-center">Запросы по дням</h4>
              <div className="form-group">
                <label htmlFor="day"><strong>Выберите День:</strong></label>
                <input type="date" name="day" className="form-control" onChange={this.onChange} required />
              </div>
              <button type="submit" className="btn btn-success mr-1 mt-1"><i className="fas fa-search"></i> Искать</button>

              <button type="button" className="btn btn-danger mr-1 mt-1" onClick={() => this.getSpecificDayStats('current')}>Сегодня</button>

              <button type="button" className="btn btn-primary mr-1 mt-1" onClick={() => this.getSpecificDayStats('previous')}>Вчера</button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 weekly-stats mt-3">
            <div className="SelectedWeekExample form-bg font-weight-bold">
              <h4 className="text-center">Запросы по неделям</h4>
              <DayPicker
                selectedDays={selectedDays}
                showWeekNumbers
                showOutsideDays
                modifiers={modifiers}
                firstDayOfWeek={1}
                onDayClick={this.handleDayChange}
                onDayMouseEnter={this.handleDayEnter}
                onDayMouseLeave={this.handleDayLeave}
                onWeekClick={this.handleWeekClick}
              />
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            {this.state.type === 'week' && (
              <h2 className="text-center pl-3 pr-3">Запросы за неделю <Moment format="DD/MM/YYYY">{this.state.selectedDays[0]}</Moment> - <Moment format="DD/MM/YYYY">{this.state.selectedDays[6]}</Moment></h2>
            )}

            {this.state.type === 'day' && (
              <h2 className="text-center pl-3 pr-3">Запросы за день {this.state.headingDay}</h2>
            )}
          </div>
        </div>

        <div className="row m-0">
          <div className="col-12 p-0">
            {this.props.operator.loadingCompleteOrders ? <Spinner /> : (
              <React.Fragment>
                {this.state.type && this.props.operator.completeOrders.length === 0 ? (
                  <h2 className="text-center mt-3">Запросы не найдены</h2>
                ) : (
                  <ShowOrderQueries />
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.order,
  operator: state.operator,
  errors: state.errors,
});

export default connect(mapStateToProps, { getCompleteOrders })(withRouter(OrderQueries));