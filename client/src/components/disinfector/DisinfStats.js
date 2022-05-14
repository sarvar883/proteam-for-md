import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../common/Spinner';
import Moment from 'react-moment';

import { clearStatsData } from '../../actions/adminActions';
import { getDisinfectorStats } from '../../actions/disinfectorActions';
import monthsNames from '../common/monthNames';
import getMonthAndYearLabels from '../../utils/monthAndYearLabels';
import returnMonthAndYear from '../../utils/returnMonthAndYear';
import returnSpecificDayForStats from '../../utils/returnSpecificDayForStats';

import ShowDisinfStats from './ShowDisinfStats';


import { getWeekDays, getWeekRange } from '../common/weekFunc';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';


class DisinfStats extends Component {
  state = {
    month: '',
    year: '',
    day: '',

    // to display month and year in heading h2
    headingMonth: '',
    headingYear: '',
    headingDay: '',

    hoverRange: undefined,
    selectedDays: [],
  };

  componentWillMount() {
    this.props.clearStatsData();
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  getMonthStats = (e) => {
    e.preventDefault();

    const object = {
      id: this.props.auth.user.id,
      type: 'month',
      month: this.state.month,
      year: this.state.year
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      headingMonth: this.state.month,
      headingYear: this.state.year
    });
  }

  getSpecificMonthStats = (param) => {
    const { month, year } = returnMonthAndYear(param);

    const object = {
      id: this.props.auth.user.id,
      type: 'month', month, year
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      headingMonth: month,
      headingYear: year
    });
  };

  getDayStats = (e) => {
    e.preventDefault();

    const object = {
      id: this.props.auth.user.id,
      type: 'day',
      day: this.state.day
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      headingDay: this.state.day.split('-').reverse().join('-')
    });
  }

  getSpecificDayStats = (param) => {
    const day = returnSpecificDayForStats(param);

    const object = {
      id: this.props.auth.user.id,
      type: 'day',
      day
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      headingDay: day.split('-').reverse().join('-')
    });
  }


  // weekly calendar
  handleDayChange = (date) => {
    const object = {
      id: this.props.auth.user.id,
      type: 'week',
      days: getWeekDays(getWeekRange(date).from)
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      selectedDays: getWeekDays(getWeekRange(date).from)
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
    const object = {
      id: this.props.auth.user.id,
      type: 'week',
      days: getWeekDays(getWeekRange(days[0]).from)
    };

    this.props.getDisinfectorStats(object);

    this.setState({
      selectedDays: getWeekDays(getWeekRange(days[0]).from)
    });
  };
  // end of weekly calendar


  render() {
    const { monthLabels, yearLabels } = getMonthAndYearLabels();

    const yearsOptions = yearLabels.map((year, index) =>
      <option value={year.value} key={index}>{year.label}</option>
    );
    const monthOptions = monthLabels.map((month, index) =>
      <option value={month.value} key={index}>{month.label}</option>
    );


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
          <div className="col-12">
            <h2 className="text-center">Ваша статистика</h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 col-md-6 mt-3">
            <form onSubmit={this.getMonthStats} className="form-bg p-2">
              <h4 className="text-center">Статистика по месяцам</h4>
              <div className="form-group">
                <label htmlFor="year"><strong>Выберите Год:</strong></label>
                <select name="year" className="form-control" onChange={this.onChange} required>
                  {yearsOptions}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="month"><strong>Выберите Месяц:</strong></label>
                <select name="month" className="form-control" onChange={this.onChange} required>
                  {monthOptions}
                </select>
              </div>
              <button type="submit" className="btn btn-success mr-1 mt-1"><i className="fas fa-search"></i> Искать</button>

              <button type="button" className="btn btn-danger mr-1 mt-1" onClick={() => this.getSpecificMonthStats('current')}>Этот месяц</button>

              <button type="button" className="btn btn-primary mr-1 mt-1" onClick={() => this.getSpecificMonthStats('previous')}>Прошлый месяц</button>
            </form>
          </div>

          <div className="col-lg-4 col-md-6 mt-3">
            <form onSubmit={this.getDayStats} className="form-bg p-2">
              <h4 className="text-center">Статистика по дням</h4>
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
              <h4 className="text-center">Статистика по неделям</h4>
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

        <div className="row mt-2">
          <div className="col-12">
            {this.props.disinfector.method === 'week' && (
              <h3 className="text-center pl-3 pr-3">Ваша Недельная статистика за <Moment format="DD/MM/YYYY">{this.state.selectedDays[0]}</Moment> - <Moment format="DD/MM/YYYY">{this.state.selectedDays[6]}</Moment></h3>
            )}

            {this.props.disinfector.method === 'month' && (
              <h3 className="text-center pl-3 pr-3">Ваша Месячная Статистика за {monthsNames[this.state.headingMonth]}, {this.state.headingYear}</h3>
            )}

            {this.props.disinfector.method === 'day' && (
              <h3 className="text-center pl-3 pr-3">Ваша Дневная Статистика за {this.state.headingDay}</h3>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.props.disinfector.loadingDisinfStats ? <Spinner /> : <ShowDisinfStats />}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  admin: state.admin,
  order: state.order,
  disinfector: state.disinfector,
  errors: state.errors
});

export default connect(mapStateToProps, { getDisinfectorStats, clearStatsData })(withRouter(DisinfStats));