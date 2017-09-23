import React, { Component } from 'react';
import { Header, Form, Message, Segment, Button } from 'semantic-ui-react';
import Storage from 'electron-json-storage-sync';

import { addUser } from '../int/Masters';

export default class Users extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: '',
      pass: ''
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit() {
    const { user, pass } = this.state;
    console.log(user, pass, 'CREDS');
    addUser(user, pass)
    .then((resp) => {
      if(resp.success) {
        this.setState({
          successMsg: `Account has been created for ${user}!`,
          user: '',
          pass: '',
          errorMsg: ''
        });
      }
    })
    .catch((err) => {
      console.log(err);
      this.setState({
        errorMsg: err.message,
        user: '',
        pass: '',
        successMsg: ''
      });
    });
  }

  render() {
    const { data } = Storage.get('session');
    if (data.user === 'adish') {
      return (
        <div>
          <Header as='h1'>USER MANAGEMENT</Header>
          { this.renderUserMenu() }
        </div>
      );
    }

    return null;
  }

  renderUserMenu() {
    const { user, pass } = this.state;
    return (
      <div>
        { this.renderMsg() }
        <Segment inverted color='teal' className="userCreate">
          <Form inverted className="userManagement" as="div">
            <Form.Group widths='equal' as="div">
              <Form.Input label='New User Name' placeholder='User Name' name='user' value={user} onChange={this.handleChange} />
              <Form.Input label='Password' placeholder='Password' name='pass' value={pass} onChange={this.handleChange} />
            </Form.Group>
            <Button primary content='Create New User' onClick={ this.handleSubmit.bind(this) } />
          </Form>
        </Segment>
      </div>
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
    } else if ( this.state.errorMsg) {
      return (
        <Message negative>
          <Message.Header>Unable to create Account</Message.Header>
          <p>{ this.state.errorMsg }</p>
        </Message>
      )
    } else {
      return;
    }
  }

}
