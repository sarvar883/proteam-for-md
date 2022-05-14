import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { logoutUser } from '../../actions/authActions';
import { clearCurrentProfile } from '../../actions/profileActions';
import { setTheme } from '../../actions/optionsActions';


class Navbar extends Component {
  onLogoutClick = (e) => {
    e.preventDefault();

    this.props.clearCurrentProfile();
    this.props.logoutUser(this.props.history);
  }

  changeTheme = (theme) => {
    this.props.setTheme(theme);
  };

  render() {
    const { isAuthenticated, user } = this.props.auth;

    const authLinks = (
      <div className="authLinks">
        <li className="nav-item list-inline-item">
          <Link to="/login" onClick={this.onLogoutClick} className="nav-link logout">
            <i className="fas fa-sign-out-alt"></i> Выйти
          </Link>
        </li>
      </div>
    );


    const guestLinks = (
      <div className="guestLinks">
        <li className="nav-item list-inline-item">
          <Link className="nav-link logout" to="/login">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </li>
      </div>
    );

    const optionLinks = (
      <React.Fragment>
        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Опции</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link to="/about" className="nav-link">About</Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/options" className="nav-link">Настройки</Link>
            </li> */}
          </div>
        </div>
      </React.Fragment>
    );


    const disinfectorLinks = (
      <div className="disinfectorLinks">

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Стат.</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/disinfector/stats">Статистика</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fail/see">Некач. и Повт. Заказы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Функции</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/disinfector/queries">Запросы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/returned-queries">Возвращенные Запросы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Материалы</button>
          <div className="dropdown-menu">
            {/* показывать этим дезинфекторам 12.05.2022 */}
            {/* "60825dd3dfdc2a0031da1d46" -- id of disinfector Akmal */}
            {/* "623c9232bd9290002f441144" -- id of disinfector Muhammad Zokir */}

            {['60825dd3dfdc2a0031da1d46', '623c9232bd9290002f441144'].includes(this.props.auth.user.id) && (
              <li className="nav-item">
                <Link className="nav-link" to="/disinfector/distrib-materials">Раздать пользователям</Link>
              </li>
            )}


            {/* показывать дезинфектору Jamol inspector test 09.12.2021 */}
            {/* "6045cdbfec05b0002f34e19b" -- id of Jamol Snab */}
            {/* "6149760559bdd4002fe1a335" -- id of Jamol inspector test */}

            {['6045cdbfec05b0002f34e19b', '6149760559bdd4002fe1a335'].includes(this.props.auth.user.id) && (
              // {this.props.auth.user.id === '6149760559bdd4002fe1a335' && (
              <li className="nav-item">
                <Link className="nav-link" to="/subadmin/send-materials-between-disinfectors">Материалы между Дезинфекторами</Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/disinfector/mat-com-history">Ваши приходы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/disinfector/mat-distrib-history">Ваши раздачи</Link>
            </li>
          </div>
        </div>
      </div>
    );


    const operatorLinks = (
      <div className="operatorLinks">
        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Стат.</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/operator/stats">Статистика</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fail/see">Некач. и Повт. Заказы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Функции</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/operator/order-queries">Запросы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/clients">Клиенты</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/operator/repeat-orders">Повторные продажи</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/not-completed-orders">Невып. Заказы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-orders">Поиск заказов</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Добавить</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/create-order">Заказ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-client">Клиента</Link>
            </li>
          </div>
        </div>
      </div>
    );


    const accountantLinks = (
      <div className="accountantLinks">
        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Стат.</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/accountant/stats">Статистика</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fail/see">Некач. и Повт. Заказы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Функции</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/accountant/queries">Запросы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/clients">Клиенты</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-orders">Поиск заказов</Link>
            </li>
          </div>
        </div>
      </div>
    );


    const supplierLinks = (
      <div className="supplierLinks">
        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">История</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-coming-history">Приходы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-history">Раздачи</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Приход</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-coming">Добавить</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Раздача</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/materials">Раздача из Склада</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/send-materials-between-disinfectors">Раздача между Дезинфекторами</Link>
            </li>
          </div>
        </div>
      </div>
    );


    const subadminLinks = (
      <div className="subadminLinks">
        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Стат.</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/stats">Ваша Стат.</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/stats">Общая Стат.</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fail/see">Некач. и Повт. Заказы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/disinf-stats">Стат. Дезинфекторов</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/operator-stats">Стат. Оператора / Админа</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/adv-stats">Стат. Рекламы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Функции</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/orders">Ваши Заказы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/queries">Запросы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/returned-queries">Возвращенные Запросы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-orders">Поиск заказов</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/clients">Клиенты</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/not-completed-orders">Невып. Заказы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Материалы</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/material-coming-history">Приходы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/subadmin/material-distrib-history">Раздачи</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Добавить</button>
          <div className="dropdown-menu">
            {/* <li className="nav-item">
              <Link className="nav-link" to="/subadmin/materials">Материалы Дезинфектору</Link>
            </li> */}


            {/* показывать субадмину Jamol Snab и Jamol inspector test  09.12.2021 */}
            {/* "6045cdbfec05b0002f34e19b" -- id of Jamol Snab */}
            {/* "6149760559bdd4002fe1a335" -- id of Jamol inspector test */}

            {['6045cdbfec05b0002f34e19b', '6149760559bdd4002fe1a335'].includes(this.props.auth.user.id) && (
              <React.Fragment>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/material-coming">Приход Материалов</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/materials">Материалы из Склада</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/subadmin/send-materials-between-disinfectors">Материалы между Дезинфекторами</Link>
                </li>
              </React.Fragment>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/add-client">Клиента</Link>
            </li>
          </div>
        </div>
      </div>
    );


    const adminLinks = (
      <div className="adminLinks">

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Стат.</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/stats">Общая Статистика</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fail/see">Некач. и Повт. Заказы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/disinf-stats">Статистика Дезинфекторов</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/operator-stats">Стат. Оператора / Админа</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/adv-stats">Статистика Рекламы</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Функции</button>
          <div className="dropdown-menu">
            {/* <li className="nav-item">
              <Link className="nav-link" to="/admin/order-queries">Запросы</Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/clients">Клиенты</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/not-completed-orders">Невып. Заказы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-orders">Поиск заказов</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">Пользователи</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Материалы</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/new/mat">Создать Новый</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-list">Список</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-coming-history">Приходы</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-history">Раздачи</Link>
            </li>
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="btn btn-primary dropdown-toggle align-baseline mr-2" data-toggle="dropdown">Добавить</button>
          <div className="dropdown-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/material-coming">Приход Материалов</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/materials">Материалы Пользователю</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-client">Клиента</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register">Новый Пользователь</Link>
            </li>
          </div>
        </div>
      </div>
    );


    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary pt-0 pb-0" id="navbar">
        <div className="container pt-2 pb-2 pl-0 pr-0">
          <Link to={`/${user.occupation}`} className="navbar-brand p-2">ProDez</Link>

          {this.props.options.theme === 'light' ? (
            <button className="navbar-brand" onClick={() => this.changeTheme('dark')}>
              <i className="fas fa-moon"></i>
            </button>
          ) : (
            <button className="navbar-brand" onClick={() => this.changeTheme('light')}>
              <i className="fas fa-sun"></i>
            </button>
          )}

          {/* {isAuthenticated && (
            <Link className="navbar-brand p-2" to="/about">About</Link>
          )} */}

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarCollapse">
            <img src="../img/hamburger.svg" className="hamburger" alt="Hamburger" />
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav ml-auto list-inline">
              {isAuthenticated && optionLinks}
              {user.occupation === 'admin' && adminLinks}
              {user.occupation === 'subadmin' && subadminLinks}
              {user.occupation === 'supplier' && supplierLinks}
              {user.occupation === 'accountant' && accountantLinks}
              {user.occupation === 'operator' && operatorLinks}
              {user.occupation === 'disinfector' && disinfectorLinks}
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  options: state.options,
});

export default connect(mapStateToProps, { logoutUser, clearCurrentProfile, setTheme })(withRouter(Navbar));