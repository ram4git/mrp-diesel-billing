import React, { Component } from 'react';
import { remote } from 'electron';
import DatePicker from 'react-datetime';
import moment from 'moment';
import { getMasters, getBillsForShift, getBillsForVehicle } from '../int/Masters';
import { Loader, Header, Message, Table, Popup, Dropdown, Button, Label } from 'semantic-ui-react';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      startDate: new Date().setHours(0, 0, 0, 0),
      endDate: new Date().setHours(24, 0, 0, 0)
    };
  }

  componentDidMount() {
    this.getBillsFromDB(this.state.startDate, this.state.endDate);
    this.loadMasters();
  }

  loadMasters() {
    getMasters().then((data) => {
      const masters = {};
      const rows = data.rows || [];
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
          masters
        });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({
        errorMsg: err
      });
    });
  }

  getBillsFromDB(start, end) {
    getBillsForShift(start,end).then((rows) => {
      if (rows) {
        this.setState({
          data: rows,
          loading: false,
        });
      }
    }).catch((err) => {
      console.log(err);
      //alert("Unable to fetch BILLs from DB");
      this.setState({
        loading: false,
        errorMsg: 'DB ACCESS ERROR'
      });
    });
  }

  getBillsForVehicle(start, end, vehicleNo) {
    getBillsForVehicle(start, end, vehicleNo).then((rows) => {
      if (rows) {
        this.setState({
          data: rows,
          loading: false,
        });
      }
    }).catch((err) => {
      console.log(err);
      //alert("Unable to fetch BILLs from DB");
      this.setState({
        loading: false,
        errorMsg: 'DB ACCESS ERROR'
      });
    });
  }

  getVehicleNumbers() {
    const { masters } = this.state;
    if (masters) {
      return masters.vehicleNumbers;
    }
    return [];
  }

  render() {
    return (
      <div className="searchResults">
        <Header as='h1'>SEARCH BILLS</Header>
        { this.state.loading
          ? <Loader active size='medium' inline='centered'>Searching Bills...</Loader>
          : this.renderBillsTable() }
        { this.showMsgIfAny() }
      </div>
    );
  }

  showMsgIfAny() {
    if(this.state.errorMsg) {
      return (
        <Message negative floating>{this.state.errorMsg}</Message>
      );
    }
  }

  renderBillsTable() {
    const { data } = this.state;
    let counter = 0;

    return (
      <div>
        { this.renderDateShiftPicker() }
        <Table sortable celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={1} >
                S.NO
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                DATE
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                VEHICLE
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                DRIVER
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                DIESEL
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                MILEAGE
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                ODOMETER
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                REMARKS
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                BILLED BY
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { data.map((row) => {
              const { sno, date, vehicleNo, driverName } = row;
              const { dieselIssued, odometerReading, remarks } = row;
              const { billEnteredBy, mileage, screenshot } = row;
              const d = new Date(date);
              const dateString = moment(d).format('DD/MMM/YYYY - h:mm:ssa')
              counter = counter + 1;
              // const dateString = d.toLocaleString();
              return (
                <Table.Row key={sno}>
                  <Table.Cell>{ counter }</Table.Cell>
                  <Table.Cell>{ dateString }</Table.Cell>
                  <Table.Cell>
                    <Popup
                      trigger={<Button icon>{ vehicleNo }</Button>}
                      on='click'
                      hideOnScroll>
                      <img src={ screenshot } />
                    </Popup>
                  </Table.Cell>
                  <Table.Cell>{ driverName }</Table.Cell>
                  <Table.Cell>{ dieselIssued }</Table.Cell>
                  <Table.Cell>{ mileage }</Table.Cell>
                  <Table.Cell>{ odometerReading }</Table.Cell>
                  <Table.Cell>{ remarks }</Table.Cell>
                  <Table.Cell>{ billEnteredBy }</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  }

  handleSearch(e,data) {
    const { startDate, endDate } = this.state;
    this.getBillsFromDB(startDate, endDate);
  }

  handlePrint(e,data) {
    remote.getCurrentWebContents().print();
  }

  renderDateShiftPicker() {
    return (
      <div>
        <div className="startDatePicker">
          <DatePicker
            withPortal
            value={this.state.startDate}
            dateFormat="DD/MM/YYYY"
            timeFormat="h:mm:ssa"
            className="datePicker"
            closeOnSelect={true}
            closeOnTab={true}
            placeholder="start date"
            selected={this.state.startDate}
            onChange={this.handleStartDateChange.bind(this)} />
        </div>
        <div className="endDatePicker">
          <DatePicker
            withPortal
            value={this.state.endDate}
            dateFormat="DD/MM/YYYY"
            timeFormat="h:mm:ssa"
            className="datePicker"
            closeOnSelect={true}
            closeOnTab={true}
            placeholder="end date"
            selected={this.state.endDate}
            onChange={this.handleEndDateChange.bind(this)} />
        </div>
        <Dropdown search className="vehiclePicker" placeholder='vehicle' search selection options={this.getVehicleNumbers()} value={this.state.vehicleNo} onChange={this.handleVehicleChange.bind(this)} />
        <Button.Group>
          <Button primary onClick={ this.handleSearch.bind(this) }>SEARCH</Button>
          <Button secondary onClick={ this.handlePrint.bind(this) }>PRINT</Button>
        </Button.Group>
        { this.renderTotalBalance() }

      </div>
    );
  }

  renderTotalBalance() {
    const totalBalance = this.state.data.map((item) => item.dieselIssued)
      .reduce((a, b) => a + b, 0) || 0;
    return (
      <Label as='a' size="massive">
        Total Diesel
        <Label.Detail>{`${totalBalance.toFixed(2).toLocaleString('en-IN')} Lts`}</Label.Detail>
      </Label>
    );
  }

  handleStartDateChange(date) {
    this.setState({
      startDate: date.toDate()
    });
  }

  handleEndDateChange(date) {
    this.setState({
      endDate: date.toDate()
    });
  }

  handleVehicleChange(e, data) {
    const { value } = data;
    if (value) {
      this.setState({
        loading: true,
        vehicleNo: value
      });
      const { startDate, endDate } = this.state;
      this.getBillsForVehicle(startDate, endDate, value);
    }
  }
}

export default Search;
