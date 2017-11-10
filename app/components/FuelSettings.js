import React, { Component } from 'react';
import { Header, Form, Message, Segment, Button, Statistic, Table } from 'semantic-ui-react';
import Storage from 'electron-json-storage-sync';
import moment from 'moment';


import { addFuelFillRecord, getFuelFillRecords, updateInitialMeterReading } from '../int/Masters';

export default class FuelSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: []
    };
  }

  componentDidMount() {
    this.getRecords();
  }

  getRecords() {
    getFuelFillRecords().then((rows) => {
      if (rows) {
        this.setState({
          data: rows.records || [],
          loading: false,
        });
        rows.settings.forEach(row => { this.setState({ [row.name]: row.textJson }); });
      }
    }).catch((err) => {
      console.log(err);
      // alert("Unable to fetch BILLs from DB");
      this.setState({
        loading: false,
        errorMsg: 'DB ACCESS ERROR'
      });
    });
  }

  render() {
    const { data } = Storage.get('session');
    if ((data.user === 'adish') || (data.user === 'admin')) {
      return (
        <div className="fuelSettings">
          <Header as='h1'>INITIAL SMALL METERE SETTING</Header>
          { this.renderInitialReading() }

          <Header as='h1'>FUEL FILL ENTRY</Header>
          { this.renderFuelFillSettings() }

        </div>
      );
    }
    return null;
  }

  onChangeValue(inputName, e, data) {
    const { value } = data;
    this.setState({
      [inputName]: value
    });
  }

  renderInitialReading() {
    return (
      <Segment inverted color='teal' className="userCreate">
        <Statistic horizontal color='blue'>
          <Statistic.Label>CURRENT METER READING: </Statistic.Label>
          <Statistic.Value>{ this.state.meterReading ? parseFloat(this.state.meterReading).toLocaleString('en-IN') : 0 }</Statistic.Value>
        </Statistic>
        <Form as="div" inverted className="userManagement" as="div">
          <Form.Group widths='equal' as="div">
            <Form.Input label='Initial Small Meter Reading' placeholder='Reading' onChange={ this.onChangeValue.bind(this,'initialReading')} />
          </Form.Group>
          <Button primary onClick={ this.saveInitialReading.bind(this) }>Upadte Inital Reading</Button>
        </Form>
      </Segment>
    );
  }

  saveInitialReading() {
    const initialReading = this.state.initialReading;
    updateInitialMeterReading(initialReading)
    .then((resp) => {
      if (resp.success) {
        this.setState({
          meterReading: resp.meterReading
        });
      }
    })
    .catch((err) => {
      alert('Initial reading save failed!' + err)
    });
  }

  renderFuelFillSettings() {
    const { waybridge, vehicleNo, fuelLoaded } = this.state;
    return (
      <div>
        { this.renderMsg() }
        <Segment inverted color='teal' className="userCreate">
          <Statistic horizontal color='blue'>
            <Statistic.Label>Fuel Left Now: </Statistic.Label>
            <Statistic.Value>{ this.state.remainingFuel ? parseFloat(this.state.remainingFuel).toLocaleString('en-IN') : 0 }</Statistic.Value>
          </Statistic>
          <Form inverted className="userManagement" as="div">
            <Form.Group widths='equal'>
              <Form.Input label='Waybridge No' placeholder='Waybridge No' name='waybridge' value={waybridge} onChange={this.handleChange} />
              <Form.Input label='Vehicle No' placeholder='Vehicle No' name='vehicleNo' value={vehicleNo} onChange={this.handleChange} />
              <Form.Input label='Fuel Loaded' placeholder='Fuel Loaded in Lts' name='fuelLoaded' value={fuelLoaded} onChange={this.handleChange} />
            </Form.Group>
            <Button primary content='Add Fuel' onClick={ this.handleFuelFillSubmit.bind(this) } />
          </Form>
          { this.renderFuelFillTable() }
        </Segment>
      </div>
    );
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleFuelFillSubmit() {
    const { vehicleNo, waybridge, fuelLoaded, remainingFuel } = this.state;
    const date = new Date();
    const time = date.getTime();
    const { data } = Storage.get('session');

    const fuelLeftNow = parseFloat(remainingFuel) + parseFloat(fuelLoaded);

    const payLoad = {
      date: time,
      waybridge,
      vehicleNo,
      fuelLoaded,
      billedBy: data.user,
    };

    addFuelFillRecord(payLoad, fuelLeftNow.toFixed(2))
      .then((resp) => {
        if (resp.success) {
          this.setState({
            waybridge: '',
            vehicleNo: '',
            fuelLoaded: '',
            remainingFuel: resp.remainingFuel
          });
          this.getRecords();
        }
      })
      .catch((err) => {
        alert('Fuel fill record save failed!')
      });
  }

  renderFuelFillTable() {
    const { data } = this.state;

    return (
      <Table sortable celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={2} >
              DATE
            </Table.HeaderCell>
            <Table.HeaderCell width={2} >
              WAYBRIDGE NO
            </Table.HeaderCell>
            <Table.HeaderCell width={2} >
              VEHICLE NO
            </Table.HeaderCell>
            <Table.HeaderCell width={1} >
              FUEL FILLED
            </Table.HeaderCell>
            <Table.HeaderCell width={1} >
              ENTERED BY
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { data.map((row) => {
            const { sno, date, vehicleNo, waybridge, fuelLoaded, billedBy } = row;
            const d = new Date(date);
            const dateString = moment(d).format('DD/MMM/YYYY - h:mm:ssa');
            return (
              <Table.Row key={sno}>
                <Table.Cell>{ dateString }</Table.Cell>
                <Table.Cell>{ waybridge }</Table.Cell>
                <Table.Cell>{ vehicleNo }</Table.Cell>
                <Table.Cell>{ fuelLoaded ? parseFloat(fuelLoaded).toLocaleString('en-IN') : 0 }</Table.Cell>
                <Table.Cell>{ billedBy }</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }

  renderMsg() {
    if (this.state.successMsg) {
      return (
        <Message positive>
          <Message.Header>Success!</Message.Header>
          <p>{ this.state.successMsg }</p>
        </Message>
      )
    } else if (this.state.errorMsg) {
      return (
        <Message negative>
          <Message.Header>Unable to fetch fuel fill records</Message.Header>
          <p>{ this.state.errorMsg }</p>
        </Message>
      )
    }
    return null;
  }

}
