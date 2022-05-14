import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Spinner from '../common/Spinner';
import Moment from 'react-moment';

import {
  getRepeatOrders,
  repeatOrderNotNeeded,
} from '../../actions/operatorActions';
import RenderOrder from '../common/RenderOrder';
import returnSpecificDayForStats from '../../utils/returnSpecificDayForStats';


import { getWeekDays, getWeekRange } from '../common/weekFunc';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';


class RepeatOrders extends Component {
  state = {
    repeatOrders: [],

    day: '',

    // to display month and year in heading h2
    // headingMonth: '',
    // headingYear: '',
    headingDay: '',

    method: '',
    hoverRange: undefined,
    selectedDays: []
  };


  // THIS <CACHING> NOT USED CURRENTLY BECAUSE IF REPEAT ORDER NOT NEEDED, THEN WE NEED TO DELETE THAT ORDER FROM GLOBAL STATE AND FROM DOM WHICH IS NOT YET DONE

  // componentDidMount() {
  // if (
  //   this.props.operator.repeatOrders &&
  //   this.props.operator.repeatOrders.length > 0
  // ) {
  //   this.setState({
  //     repeatOrders: this.props.operator.repeatOrders,
  //     headingDay: this.props.operator.repeatOrderSearchVars.headingDay,
  //     method: this.props.operator.repeatOrderSearchVars.method,
  //     selectedDays: this.props.operator.repeatOrderSearchVars.selectedDays
  //   });
  // }
  // }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repeatOrders: nextProps.operator.repeatOrders
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  getDayRepeats = (e) => {
    e.preventDefault();
    const object = {
      operatorId: this.props.auth.user.id,
      type: 'day',
      day: this.state.day
    };

    this.props.getRepeatOrders(object);

    this.setState({
      method: 'day',
      headingDay: this.state.day.split('-').reverse().join('-')
    });
  }

  getSpecificDayStats = (param) => {
    const day = returnSpecificDayForStats(param);

    const object = {
      operatorId: this.props.auth.user.id,
      type: 'day',
      day
    };

    this.props.getRepeatOrders(object);

    this.setState({
      method: 'day',
      headingDay: day.split('-').reverse().join('-')
    });
  }

  noNeed = (id) => {
    this.props.repeatOrderNotNeeded(id, this.props.history, this.props.auth.user.occupation);
  }


  // weekly calendar
  handleDayChange = date => {
    let object = {
      operatorId: this.props.auth.user.id,
      type: 'week',
      days: getWeekDays(getWeekRange(date).from)
    };

    this.props.getRepeatOrders(object);

    this.setState({
      method: 'week',
      selectedDays: getWeekDays(getWeekRange(date).from)
    });
  };

  handleDayEnter = date => {
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

    this.props.getRepeatOrders(object);

    this.setState({
      method: 'week',
      selectedDays: getWeekDays(getWeekRange(days[0]).from)
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


    let renderOrders = this.state.repeatOrders.map((item, index) => {
      return (
        <React.Fragment key={index}>
          <div className="col-lg-4 col-md-6 mt-3">
            <div className="card order mt-2">
              <div className="card-body p-0">
                <ul className="font-bold mb-0 list-unstyled">
                  <RenderOrder
                    order={item}
                    shouldRenderIfOrderIsPovtor={false}
                    shouldRenderIfOrderIsFailed={false}
                    sholdRenderIfOrderIsReturned={false}
                    shouldRenderDisinfector={true}
                    shouldRenderNextOrdersAfterFailArray={false}
                    shouldRenderPrevFailedOrderDate={false}
                    shouldRenderOperatorDecided={false}
                    shouldRenderAccountantDecided={false}
                    shouldRenderGuarantee={false}
                    shouldRenderMaterialConsumption={false}
                    shouldRenderPaymentMethod={false}
                    shouldRenderUserAcceptedOrder={false}
                    shouldRenderUserCreated={false}
                    shouldRenderCompletedAt={false}
                    shouldRenderAdminGaveGrade={false}
                  />

                  <li>Дата предыдущего заказа: <Moment format="DD/MM/YYYY">{item.previousOrder.dateFrom}</Moment></li>
                  <li>Срок гарантии (в месяцах): {item.previousOrder.guarantee}</li>
                  <li>Срок гарантии истекает: <Moment format="DD/MM/YYYY">{item.timeOfRepeat}</Moment></li>
                </ul>

                <button type="button" className="btn btn-primary mt-2 mr-1" data-toggle="modal" data-target={`#info${index}`}>Полная информация о предыдущем заказе</button>

                <Link to={`/create-repeat-order-form/${item._id}`} className="btn btn-success mt-2 mr-1">Повторная работа нужна</Link>

                <button className="btn btn-danger mt-2 mr-1" onClick={() => { if (window.confirm('Вы  уверены?')) return this.noNeed(item._id) }}>Повторная работа не нужна</button>

              </div>
            </div>
          </div>

          <div className="modal fade" id={`info${index}`}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <ul className="font-bold mb-0 list-unstyled">
                    <RenderOrder
                      order={item.previousOrder}
                      shouldRenderIfOrderIsPovtor={true}
                      shouldRenderIfOrderIsFailed={true}
                      sholdRenderIfOrderIsReturned={false}
                      shouldRenderDisinfector={true}
                      shouldRenderNextOrdersAfterFailArray={false}
                      shouldRenderPrevFailedOrderDate={false}
                      shouldRenderOperatorDecided={true}
                      shouldRenderAccountantDecided={true}
                      shouldRenderGuarantee={false}
                      shouldRenderMaterialConsumption={true}
                      shouldRenderPaymentMethod={false}
                      shouldRenderUserAcceptedOrder={true}
                      shouldRenderWhoDealtWithClient={true}
                      shouldRenderUserCreated={true}
                      shouldRenderCompletedAt={false}
                      shouldRenderAdminGaveGrade={false}
                    />
                  </ul>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" data-dismiss="modal">Закрыть</button>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    });

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Повторные продажи</h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 col-md-6 weekly-stats mt-3">
            <div className="SelectedWeekExample form-bg font-weight-bold">
              <h4 className="text-center">Повторные продажи по неделям</h4>
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

          <div className="col-lg-4 col-md-6 mt-3">
            <form onSubmit={this.getDayRepeats} className="form-bg p-2">
              <h4 className="text-center">Повторные продажи по дням</h4>
              <div className="form-group">
                <label htmlFor="day"><strong>Выберите День:</strong></label>
                <input type="date" name="day" className="form-control" onChange={this.onChange} required />
              </div>

              <button type="submit" className="btn btn-success mr-1 mt-1"><i className="fas fa-search"></i> Искать</button>

              <button type="button" className="btn btn-danger mr-1 mt-1" onClick={() => this.getSpecificDayStats('current')}>Сегодня</button>

              <button type="button" className="btn btn-primary mr-1 mt-1" onClick={() => this.getSpecificDayStats('previous')}>Вчера</button>
            </form>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.state.method === 'week' && (
              <h2 className="text-center pl-3 pr-3">Недельные повторные продажи за <Moment format="DD/MM/YYYY">{this.state.selectedDays[0]}</Moment> - <Moment format="DD/MM/YYYY">{this.state.selectedDays[6]}</Moment></h2>
            )}

            {this.state.method === 'day' && (
              <h2 className="text-center pl-3 pr-3">Дневные повторные продажи за {this.state.headingDay}</h2>
            )}
          </div>
        </div>

        {this.props.operator.loadingSortedOrders ? (
          <Spinner />
        ) : (
          <div className="row">
            {renderOrders}
          </div>
        )}
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

export default connect(mapStateToProps, { getRepeatOrders, repeatOrderNotNeeded })(withRouter(RepeatOrders));