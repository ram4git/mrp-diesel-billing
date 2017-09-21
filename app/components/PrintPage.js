import React, { Component } from 'react';
import Storage from 'electron-json-storage-sync';
import { Statistic } from 'semantic-ui-react';
import moment from 'moment';
import { remote } from 'electron';

import { getBill } from '../int/Masters';

export default class PrintPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mileage: 10.23
    };
  }

  componentDidMount() {
    getBill(this.props.billNo)
      .then((row) => {
        console.log("BILL DATA=", row);
        this.setState({
          data: row[0]
        });
      })
      .catch((err) => {
        console.error("BILL DATA FETCH FAILED FOR " + this.props.billNo, err);
        this.setState({
          err: err
        });
      })
  }

  render() {
    //remote.getCurrentWindow().openDevTools();
    return (
      <div className="page">
        <div className="original copy">
          { this.renderPageHeader('logistics') }
          { this.renderBillDetails() }
          { this.renderFooter() }
        </div>
        <div className="security copy">
          { this.renderPageHeader('stores') }
          { this.renderBillDetails() }
          { this.renderFooter() }
        </div>
      </div>
    );
  }

  renderFooter() {
    const { status, data } = Storage.get('session');
    if (status) {
      return (
        <footer>printed by <strong>{ data.user }</strong></footer>
      );
    }
  }

  renderPageHeader(copyType) {
    const dateStr = moment().format('DD/MMM/YYYY - h:mm:ssa')

    return (
      <div className="printPageHeader">
        <h5>Sree Lalitha Industries Pvt Ltd.</h5>
        <h5>{ `BILL - #${this.state.data ? this.state.data.sno : ''}` }</h5>
        <h5>{ dateStr }</h5>
        <p>{ `${copyType.toUpperCase()} COPY` }</p>
        <hr />
      </div>
    );
  }

  renderBillDetails() {

    if (!this.state.data) {
      return
    }

    return (
      <div className="orderHeader">
        <table>
          <tr>
            <td className="key">VEHICLE NO<span>:</span></td>
            <td className="value">{this.state.data.vehicleNo.toUpperCase()}</td>
            <td className="key">VEHICLE TYPE<span>:</span></td>
            <td className="value">{this.state.data.vehicleType.toUpperCase()}</td>
          </tr>
          <tr>
            <td className="key">DIESEL FILLED<span>:</span></td>
            <td className="value">{`${this.state.data.dieselIssued.toFixed(2)} Lts`}</td>
            <td className="key">ODOMETER READING<span>:</span></td>
            <td className="value">{`${this.state.data.odometerReading.toFixed(2)} KMs`}</td>
          </tr>
          <tr>
            <td className="key">MILEAGE<span>:</span></td>
            <td className="value">{`${this.state.mileage.toFixed(2)} KM/Ltr`}</td>
            <td className="key">DRIVER<span>:</span></td>
            <td className="value">{this.state.data.driverName}</td>
          </tr>
        </table>
        <img src={this.state.data.screenshot} height={250}/>
      </div>
    );
  }
}
