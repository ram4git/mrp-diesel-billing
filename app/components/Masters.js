import React, { Component } from 'react';
import { Button, List, Modal, Input, Header } from 'semantic-ui-react';
import { getMasters, addMasterValue } from '../int/Masters';

export default class Masters extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      modalOpen: false
    };
  }

  componentDidMount() {
    this.getMastersFromDB();
  }


  modalOpen = (masterKey) => this.setState({ modalOpen: true, modalMasterKey: masterKey })
  modalClose = () => this.setState({ modalOpen: false })
  disableAddButton = () => { return !this.state.modalMasterValue || !this.state.modalMasterValue.split(' ').join('').length; }

  render() {
    return (
      <div>
        <Header as='h1'>MASTERS</Header>
        <div className="box">
          { this.renderAllMasters() }
          { this.renderAddMasterModal() }
        </div>
      </div>
    );
  }

  renderAddMasterModal() {
    const { modalMasterKey } = this.state;
    return (
      <Modal size="small" open={this.state.modalOpen} onClose={this.modalClose.bind(this)}>
        <Modal.Header>
          Add to <span className="head">{ modalMasterKey }</span>
        </Modal.Header>
        <Modal.Content>
          <Input placeholder='type here' onChange={this.setMasterValue.bind(this)} />
        </Modal.Content>
        <Modal.Actions>
          <Button negative content='CANCEL' onClick={this.modalClose.bind(this)} />
          <Button positive icon='checkmark' labelPosition='right' content='ADD' onClick={this.addMasterValue.bind(this)} disabled={this.disableAddButton()} />
        </Modal.Actions>
      </Modal>
    );
  }

  addMasterValue() {
    const { modalMasterKey, modalMasterValue } = this.state;
    this.modalClose();
    console.log('MASTER=' + modalMasterKey + 'VALUE=' + modalMasterValue);

    addMasterValue(modalMasterKey,modalMasterValue)
    .then((resp) => {
      if (resp.success) {
        this.getMastersFromDB()
      }
    })
    .catch((err) => {
      this.setState({
        errMsg: err,
        modalMasterKey: '',
        modalMasterValue: ''
      });
    });
  }

  setMasterValue(e) {
    this.setState({
      modalMasterValue: e.target.value
    });
  }

  renderMasterValues(items) {
    const itemArray = [];
    items.forEach((item) => {
      itemArray.push(
        <List.Item key={item.key} >
          <List.Icon name='file' />
          <List.Content>
            <List.Header>{ item.text }</List.Header>
          </List.Content>
        </List.Item>
      );
    });
    return itemArray;
  }

  renderAllMasters() {
    const { masters } = this.state;
    const mastersArray = [];
    if (masters) {
      Object.keys(masters).forEach((masterKey) => {
        mastersArray.push(
          <List divided verticalAlign='middle' key={masterKey}>
            <List.Item className="master">
              <List.Content floated='right'>
                <Button circular icon='plus' size='mini' onClick={this.modalOpen.bind(this, masterKey)} />
              </List.Content>
              <List.Content>
                <List.Header className="head">{ masterKey }</List.Header>
                <List.List>
                  { this.renderMasterValues(masters[masterKey]) }
                </List.List>
              </List.Content>
            </List.Item>
          </List>
        );
      });
    }
    return mastersArray;
  }

  getMastersFromDB() {
    getMasters().then((data) => {
      const masters = {};
      const { rows, settings } = data;
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
          loading: false,
          modalMasterKey: '',
          modalMasterValue: ''
        });
        settings.forEach(row => { this.setState({ [row.name]: row.textJson }); });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({
        errorMsg: err
      });
    });
  }

}
