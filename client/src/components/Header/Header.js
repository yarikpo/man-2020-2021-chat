import './Header.css';
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import userLogo from './user.svg';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
    };

    this.handleSignOut = this.handleSignOut.bind(this);
  }

  async componentDidMount() {
    if (localStorage.getItem('accessToken') == null) return;
    async function getData(url='', accessToken='') {
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'authorization': 'Bearer ' + accessToken
          }
        }).catch(err => console.log(JSON.stringify(err)));

        return await response;
      } catch (e) {
        console.log(e);
      }
    }

    const response = await getData('http://localhost:3001/api/posts', localStorage.getItem('accessToken'))
      .then(response => response.json())
      .catch(err => console.log(err));

    try {
      console.log(response[0]);
      const name = response[0].username;
      console.log(name)
    } catch (e) {
      console.log(e);
    }
    // this.props.handleChangeAuthorized(true);
  }

  handleSignOut(e) {
    console.log('out');
    async function deleteData(url) {
      try {
        const response = fetch(url, {
          'Content-Type': 'application/json',
          'method': 'DELETE',
          'mode': 'cors',
          'body': {
            token: localStorage.getItem('refreshToken')
          }
        });
        return await response;
      } catch (e) {
        console.log(e);
      }
    }

    const response =  deleteData('http://localhost:3001/api/logout')
      .then(response => response.json())
      .catch(err => console.log(err));

    

    try {
      console.log(response);
      localStorage.clear();
    } catch (e) {
      console.log(e);
    }

  }

  render() {
    return (
      <header>
        <ul>
            <li><Link to='/'>Home</Link></li>
            {this.props.authorized === true ? <li className='right'><Link to='/login' onClick={this.handleSignOut}>Sign out</Link></li> : '' }
            {this.props.authorized === false ? <li className='right'><Link to='/login'>Sign In</Link></li> : '' }
            {this.props.authorized === false ? <li className='right'><Link to='/register'>Sign Up</Link></li> : ''}
            {this.props.authorized === true ? <li className='right'><Link to='/profile'><img src={userLogo} alt='user-logo' /></Link></li> : ''}
        </ul>
      </header>
    );
  }
}

export default Header;
