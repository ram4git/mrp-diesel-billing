// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Segment } from 'semantic-ui-react';
import electron from 'electron';

import Billing from './Billing';
import Collections from './Collections';
import Settings from './Settings';
import Reports from './Reports';
import Search from './Search';
import Sundry from './Sundry';
import { logout } from '../int/Auth';


import styles from './Main.css';


class Main extends Component {

  componentMap = {
    billing: Billing,
    collections: Collections,
    reports: Reports,
    search: Search,
    settings: Settings,
    logout: Billing,
    sundry: Sundry
  }

  state = { activeItem: 'billing' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  renderSegment() {
    const Component = this.componentMap[this.state.activeItem];
    return (
      <Segment color='green' secondary>
        <Component {...this.props}/>
      </Segment>
    );
  }

  handleLogOut() {
    logout();
    const {remote} = electron;
    remote.getCurrentWindow().reload();
  }

  render() {
    const { activeItem } = this.state;

    return (
      <div className="main">
        <Menu fluid widths={7} className="menuBar">
          <Menu.Item name='billing' active={activeItem === 'billing'} onClick={this.handleItemClick}>BILLING</Menu.Item>
          <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleItemClick}>SETTINGS</Menu.Item>
          <Menu.Item name='reports' active={activeItem === 'reports'} onClick={this.handleItemClick}>REPORTS</Menu.Item>
          <Menu.Item name='search' active={activeItem === 'search'} onClick={this.handleItemClick}>SEARCH</Menu.Item>
          <Menu.Item name='sundry' active={activeItem === 'sundry'} onClick={this.handleItemClick}>MILEAGE</Menu.Item>
          <Menu.Item name='logout' active={activeItem === 'logout'} onClick={this.handleLogOut}>LOGOUT</Menu.Item>
        </Menu>
        { this.renderSegment() }
      </div>
    );
  }
}

export default Main;
