import React, { Component } from 'react';
import { Button, List } from 'semantic-ui-react';
import Masters from './Masters';
import UserManagement from './Users';
import FuelSettings from './FuelSettings';


class Settings extends Component {

  render() {
    return (
      <div className="billing">
        <Masters />
        <UserManagement />
        <FuelSettings />
      </div>
    );
  }
}

export default Settings;
