import React, { Component } from 'react';
import { Form, Step, Button, Statistic, Message, Segment } from 'semantic-ui-react'
import { getMasters, chargesMap, lorryToRusumMap, lorry2JattuMap, addBill } from '../int/Masters';
import path from 'path';
import electron, { remote } from 'electron';
import Clock from 'react-live-clock';
import Storage from 'electron-json-storage-sync';
import Webcam from 'react-webcam';


const app = remote.app;
const appDir = app.getAppPath();
const APP_DIR = process.cwd() + '/app';
console.log('APP DIR=' + APP_DIR);


class Billing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      meterReading: 5543588.440,
      remainingFuel: 16697.50
    };
  }

  componentDidMount() {
    getMasters().then((rows) => {
      const masters = {};
      if (rows) {
        rows.forEach((row, index) => {
          const { name, key, value } = row;
          masters[name] = masters[name] || [];
          masters[name].push(
            {
              key,
              value: key,
              text: value
            }
          );
        });
        this.setState({
          masters,
          loading: false
        });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({
        errorMsg: err
      });
    });
  }

  render() {

    return (
      <div className="billing1">
        <Segment clearing textAlign='center'>
          <Clock
            format={'DD/MMM/YYYY - h:mm:ssa'}
            ticking={true}
          />
          { this.renderSummary() }
        </Segment>
        <Form as="div">
          <Form.Group className="selectors" as="div">
            <Form.Select search label='Vehicle No' options={ this.getMasters('vehicleNumbers') } placeholder='REG NO' width={5} required  onChange={ this.onChangeValue.bind(this, 'vehicleNo')} error={!this.state.vehicleNo} />
            <Form.Select search label='Vehicle Type' options={ this.getMasters('vehicleType') } placeholder='Lorry/Van' width={5} required onChange={ this.onChangeValue.bind(this, 'vehicleType')} error={!this.state.vehicleType} />
            <Form.Select search label='Driver Name' options={ this.getMasters('drivers')} placeholder='driver name' width={6} required onChange={ this.onChangeValue.bind(this, 'driverName')} error={!this.state.driverName} />
          </Form.Group>
          { this.renderInputFields() }
          { this.renderCamera() }
          { this.renderFooter() }
        </Form>
      </div>
    );
  }



  renderCamera() {
    return (
      <div className="cameraContainer">
        <Webcam
          audio={false}
          height={300}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={400}
        />
      <button onClick={this.capture} className="camera" width={2}><span>📷</span></button>
        {this.state.screenshot ? <img src={this.state.screenshot} height={300}/> : null}
      </div>
    );
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  }

  capture = () => {
    const screenshot = this.webcam.getScreenshot();
    this.setState({
      screenshot
    });
  };

  renderSummary() {
    const { meterReading, remainingFuel } = this.state;

    const items = [
      { label: 'Meter Reading', value: meterReading.toFixed(2) },
      { label: 'Remaining Fuel', value: remainingFuel.toFixed(2) },
    ];
    return (
      <div className="summary" >
        <Statistic.Group items={items} color='blue' size='small' />
      </div>
    );
  }


  renderFooter() {
    if (this.areAllFieldsEntered()) {
      return (
        <Form.Group className="actionButtons" as="div">
          <Form.Button fluid attached='left' content='SAVE & PRINT' width={12} onClick={this.saveBillToDB.bind(this)} color="blue" />
          <Form.Button fluid attached='right' content='CLEAR' width={4} onClick={this.clearAllSettings.bind(this)} color="red" />
        </Form.Group>
      );
    }
    return (
      <Message negative floating>
        Please fill all inputs in red
      </Message>
    );
  }

  renderInputFields() {
    const { remarks, dieselIssued, odometerReading, areKeysIssued } = this.state;

    return (
      <Form.Group as="div" className="inputs">
        <Form.Input label='Diesel Issued' placeholder='' width={4} onChange={ this.onChangeValue.bind(this, 'dieselIssued')} value={dieselIssued} error={!this.state.dieselIssued} />
        <Form.Input label='Odometer Reading' placeholder='' width={4} onChange={ this.onChangeValue.bind(this, 'odometerReading')} value={odometerReading} error={!this.state.odometerReading} />
        <Form.Input label='Keys Issued?' width={2} onChange={ this.onChangeValue.bind(this, 'areKeysIssued')} value={areKeysIssued} />
        <Form.TextArea label='Remarks' placeholder='' width={6} onChange={ this.onChangeValue.bind(this, 'remarks')} value={this.state.remarks} />
    </Form.Group>
    );
  }

  saveBillToDB() {
    const { vehicleNo, vehicleType, driverName, meterReading, remainingFuel } = this.state;
    const { dieselIssued, odometerReading, remarks, areKeysIssued, screenshot } = this.state;
    const date = new Date();
    const sno = `${date.toISOString().slice(0, 10).split('-').join('')}${date.toISOString().slice(11, 23).split(/:|\./).join('')}`;
    const time = date.getTime();

    const { status, data } = Storage.get('session');

    const payLoad = {
      sno,
      date: time,
      vehicleNo,
      vehicleType,
      driverName,
      meterReading,
      remainingFuel,
      dieselIssued: parseFloat(dieselIssued),
      odometerReading: parseFloat(odometerReading),
      remarks,
      areKeysIssued,
      billEnteredBy: data.user,
      screenshot
    };

    addBill(payLoad)
      .then((resp) => {
        console.log("LAST ID:" + resp.id);
        if (resp.success) {
          let win = new remote.BrowserWindow(
            {
              width: '29.7cm',
              height: '42cm',
              frame: true,
              x: 20,
              y: 20
            });
          win.loadURL(`file://${appDir}/app.html?print=${resp.id}`);
          win.webContents.on('did-finish-load', () => {
            win.openDevTools();
            if (!win) {
              throw new Error('"Print Window" is not defined');
            }
            win.show();
            win.focus();
            // win.webContents.print({ pageSize: 'A4', silent: true });
          });

          win.on('closed', () => {
            win = null;
          });
        }
        this.clearAllSettings();
      })
      .catch((err) => {
        alert("Bill save failed!")
      });
  }

  getMasters(masterType) {
    const { masters } = this.state;
    if (masters) {
      return masters[masterType];
    }
    return [];
  }

  onChangeValue(inputName, e, data) {
    const { value } = data;
    this.setState({
      [inputName]: value
    });
  }

  areAllFieldsEntered() {
    const { vehicleNo, vehicleType, driverName, dieselIssued, odometerReading } = this.state;
    return vehicleNo && vehicleType && driverName && dieselIssued && odometerReading;
  }

  clearAllSettings() {
    this.props.onClear();
  }

}

export default Billing;
