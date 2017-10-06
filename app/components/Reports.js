import React, { Component } from 'react';
import { remote } from 'electron';
import { Modal, Loader, Header, Message, Table, Popup, Dropdown, Button, Label, Icon } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getBills, getBillsForShift, deleteBillRecord } from '../int/Masters';

const shiftOptions = [
  { key: 'morning', value: 'morning', text: 'MORNING 9AM-9PM' },
  { key: 'night', value: 'night', text: 'NIGHT 9PM-9AM' }
];


class Reports extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      shift: 'morning',
      startDate: moment(),
      modalOpen: false,
    };
  }


  componentDidMount() {
    const currHour = this.state.startDate.get('hour');
    if(currHour >= 9 && currHour < 18) {
      if(this.state.shift === 'night') {
        this.setState({
          shift: 'morning'
        });
      }
    } else {
      if(this.state.shift === 'morning') {
        this.setState({
          shift: 'night'
        });
      }
    }
    this.getBillsFromDB();
  }

  getBillsFromDB() {
    getBills().then((rows) => {
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

  getBillsForShiftDB(start, end) {
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

  modalOpen = (rowId, dieselIssued, vehicleNo, driverName, meterReading, remainingFuel) => this.setState({
    modalOpen: true, rowId, dieselIssued, vehicleNo, driverName, meterReading, remainingFuel
  })
  modalClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <div className="reports">
        <Header as='h1'>DAYWISE BILLS</Header>
        { this.state.loading
          ? <Loader active size='medium' inline='centered'>Fetching Bills...</Loader>
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
              <Table.HeaderCell width={1} >
                VEHICLE
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                DRIVER
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                SMALL METER
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                FUEL LEFT
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                DIESEL
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                ODOMETER
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                MILEAGE
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                REMARKS
              </Table.HeaderCell>
              <Table.HeaderCell width={2} >
                BILLED BY
              </Table.HeaderCell>
              <Table.HeaderCell width={1} >
                KEY ISSUED?
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { data.map((row) => {
              const { sno, date, vehicleNo, driverName, meterReading, remainingFuel } = row;
              const { dieselIssued, odometerReading, remarks } = row;
              const { areKeysIssued, billEnteredBy, screenshot } = row;
              const { mileage, prevOdometerReading } = row;
              const d = new Date(date);
              const dateString = moment(d).format('DD/MMM/YYYY - h:mm:ssa')
              counter += 1;

              const currentTime = new Date();
              const diffMins = moment(currentTime).diff(moment(d), 'minutes');
              return (
                <Table.Row key={sno}>
                  <Table.Cell>{ counter }{ (diffMins < 30 && sno === 1) ? <Icon name='trash' className='action'
                    onClick={this.modalOpen.bind(this, date, dieselIssued, vehicleNo, driverName, meterReading, remainingFuel )} /> : null }</Table.Cell>
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
                  <Table.Cell>{ meterReading }</Table.Cell>
                  <Table.Cell>{ remainingFuel }</Table.Cell>
                  <Table.Cell>{ dieselIssued }</Table.Cell>
                  <Table.Cell>{ `${odometerReading} (p${prevOdometerReading})` }</Table.Cell>
                  <Table.Cell>{ mileage }</Table.Cell>
                  <Table.Cell>{ remarks }</Table.Cell>
                  <Table.Cell>{ billEnteredBy }</Table.Cell>
                  <Table.Cell>{ areKeysIssued }</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        { this.renderDeleteModal() }
      </div>
    );
  }

  renderDateShiftPicker() {
    return (
      <div>
        <div className="datePicker">
          <DatePicker
            withPortal
            dateFormat="DD/MM/YYYY"
            className="datePicker"
            selected={this.state.startDate}
            onChange={this.handleDateShiftChange.bind(this)} />
        </div>
        <Dropdown className="shiftPicker" placeholder='shift' search selection options={shiftOptions} value={this.state.shift} onChange={ this.handleShiftChange.bind(this) } />
        <Button.Group>
          <Button primary onClick={ this.handleSearch.bind(this) }>SEARCH</Button>
          <Button secondary onClick={ this.handlePrint.bind(this) }>PRINT</Button>
        </Button.Group>
        { this.renderTotalBalance() }

      </div>
    );
  }

  renderDeleteModal() {
    const { rowId, dieselIssued, vehicleNo, driverName } = this.state;
    const d = new Date(rowId);
    const dateString = moment(d).format('DD/MMM/YYYY - h:mm:ssa')

    return (
      <Modal size="small" open={this.state.modalOpen} onClose={this.modalClose.bind(this)}>
        <Modal.Header>
          Delete bill dated on <span className="head">{ dateString }</span>
        </Modal.Header>
        <Modal.Content>
          Are you sure you want to delete bill for <strong>{dieselIssued} Lts </strong>
         for <strong>{vehicleNo}</strong> (driver <string>{driverName}</string>)?
        </Modal.Content>
        <Modal.Actions>
          <Button negative content='CANCEL' onClick={this.modalClose.bind(this)} />
          <Button positive icon='checkmark' labelPosition='right' content='DELETE' onClick={this.deleteBill.bind(this)} />
        </Modal.Actions>
      </Modal>
    );
  }

  deleteBill() {
    const { rowId, dieselIssued, remainingFuel, meterReading } = this.state;
    this.modalClose();

    const newRemainingFuel = remainingFuel + dieselIssued;
    const newMeterReading = meterReading - dieselIssued;

    deleteBillRecord(rowId, dieselIssued)
    .then((resp) => {
      if (resp.success) {
        this.getBillsFromDB()
      }
    })
    .catch((err) => {
      this.setState({
        errMsg: err,
        rowId: '',
        dieselIssued: '',
        vehicleNo: '',
        driverName: '',
        meterReading: '',
        remainingFuel: ''
      });
      alert('Unable to delete record ' + err);
    });
  }

  renderTotalBalance() {
    const totalBalance = this.state.data.map((item) => item.dieselIssued).reduce((a, b) => a + b, 0) || 0;
    return (
      <Label as='a' size="massive">
        Total Diesel
        <Label.Detail>{`${totalBalance.toFixed(2).toLocaleString('en-IN')} Lts`}</Label.Detail>
      </Label>
    );
  }

  handleSearch(e,data) {
    let startEpoch = this.state.startDate.toDate().setHours(9,0,0,0);
    let endEpoch = this.state.startDate.toDate().setHours(21,0,0,0);
    if(this.state.shift === 'night') {
      startEpoch = this.state.startDate.toDate().setHours(21,0,0,0);
      endEpoch = this.state.startDate.toDate().setHours(33,0,0,0);
    }
    this.getBillsForShiftDB(startEpoch, endEpoch);
  }

  handlePrint(e,data) {
    remote.getCurrentWebContents().print();
  }

  handleDateShiftChange(date) {
    console.log("RAM");
    this.setState({
      startDate: date
    });
  }

  handleShiftChange(e, data) {
    const { value } = data;
    this.setState({
      shift: value
    });
  }

  formatDate(epoch) {
    const date = new Date(epoch);
    return date.toLocaleString();
  }

}

export default Reports;
