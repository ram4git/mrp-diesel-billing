// @flow
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Storage from 'electron-json-storage-sync';
import { Button, Form, Message } from 'semantic-ui-react';
import { auth } from '../int/Auth';
import Main from './Main';
import styles from './Home.css';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      pass: '',
      authMsg: '',
      authenticated: false,
      mKey: 1
    };
  }

  componentDidMount() {
    const { status, data, error } = Storage.get('session');
    if(status) {
      const { user, status } = data;
      this.setState({
        user,
        authenticated: status === 'LOGGED-IN'
      });
    }
  }

  render() {
    return (
      <div>
        { this.state.authenticated ? this.renderMainPage() : this.renderLoginPage() }
      </div>
    );
  }

  renderLoginPage() {
    const { user, pass } = this.state;
    const disabled = !(user && pass);
    return (
      <div className={`${styles.container} login`} data-tid="container">
        <h2>Lalitha ⛽️ Billing</h2>
          <Form as="div">
            <Form.Field>
              <label>USERNAME</label>
              <input placeholder="USERNAME" onChange={this.onChangeValue.bind(this, 'user')} />
            </Form.Field>
            <Form.Field>
              <label>PASSWORD</label>
              <input placeholder="PASSWORD" type="password" onChange={this.onChangeValue.bind(this, 'pass')} />
            </Form.Field>
            <Button type="submit" color='teal'
              content='LOGIN'
              disabled={disabled}
              onClick={this.authenticateUser.bind(this)}
              />
            { this.state.authMsg ? <Message color='red'>{ this.state.authMsg }</Message> : null }
          </Form>
      </div>
    );
  }

  renderMainPage() {
    const mKey = this.state.mKey;
    return (
      <Main onClear={this.forceRefresh.bind(this)} key={mKey} />
    );
  }

  forceRefresh() {
    const mKey = this.getFourDigitRandomNumber();
    this.setState({
      mKey
    });
  }

  getFourDigitRandomNumber() {
    const min = Math.ceil(1000);
    const max = Math.floor(9999);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  authenticateUser() {
    const { user, pass } = this.state;
    auth(user, pass)
    .then((row) => {
      if (!row.length) {
        this.setState({
          authMsg: 'USERNAME/PASSWORD does not exist'
        });
      } else {
        const { name: dbName, pass: dbPass } = row[0];
        //console.log('ROW from db ', JSON.stringify(row[0], null, 2));

        if (dbName === user) {
          if (dbPass === pass) {
            const result = Storage.set('session', {
              user,
              status: 'LOGGED-IN'
            });
            this.setState({
              authenticated: true
            });
          } else {
            this.setState({
              authMsg: 'Incorrect Password ❌'
            });
          }
        } else {
          response.msg = 'USERNAME doesn\'t exist ❗️';
          this.setState({
            authMsg: 'USERNAME doesn\'t exist ❗️'
          });
        }
      }
    })
    .catch((err) => {
      this.setState({
        authMsg: 'Unable to authenticate User❗️'
      });
    });
  }

  onChangeValue(paramName, e) {
    this.setState({
      [paramName]: e.target.value
    });
  }
}
