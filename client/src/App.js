import './App.css';
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authorized: false
    };

    this.handleChangeAuthorized = this.handleChangeAuthorized.bind(this);
  }

  componentDidMount() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken == null) this.setState({ authorized: false });
    
    console.log(accessToken);
  }

  handleChangeAuthorized(authorized) {
    this.setState({ authorized: authorized });
  }

  render() {
    return (
      <>
        <Header handleChangeAuthorized={this.handleChangeAuthorized} authorized={this.state.authorized} />
        <Switch>
          <Route exact path='/' render={() => <Home authorized={this.state.authorized} handleChangeAuthorized={this.handleChangeAuthorized} />} />
          <Route path='/login' render={() => <Login authorized={this.state.authorized} handleChangeAuthorized={this.handleChangeAuthorized} />} />
          <Route path='/register' render={() => <Register authorized={this.state.authorized} handleChangeAuthorized={this.handleChangeAuthorized} />} />
        </Switch>
      </>
    );
  }
}

export default App;
