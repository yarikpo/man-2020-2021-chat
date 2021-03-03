import React from 'react';
import './Register.css';
import keyboard from './keyboard.jpeg';
import { Redirect } from 'react-router-dom';

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authorized: false,
            nickname: '',
            password: '',
            email: ''
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleNameChange(e) {
        this.setState({ nickname: e.target.value });
    }

    handlePasswordChange(e) {
        this.setState({ password: e.target.value });
    }

    handleEmailChange(e) {
        this.setState({ email: e.target.value });
    }

    handleSubmit(e) {
        alert(`Submit: name: ${this.state.nickname}; email: ${this.state.email};`);

        async function postData(url='', data={}) {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        postData('http://localhost:3001/api/register', {
            username: this.state.nickname,
            email: this.state.email,
            password: this.state.password
        }).then(data => console.log(data)).catch(err => console.log(err));

        this.setState({ nickname: '', password: '', email: '' });
        e.preventDefault();
    }

    async componentDidMount() {
        
        async function getData(url) {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return await response.json();
        }

        getData('http://localhost:3001/api/posts')
            .then(data => {
                console.log(data);
                if (data.length > 0) {
                    this.setState({ authorized: true });
                    this.props.handleChangeAuthorized(true);
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({ authorized: false });
                this.props.handleChangeAuthorized(false);
            });
    }

    render() {
        if (this.state.authorized === true) return <Redirect to='/' />;
        return(
            <div className='register-page'>
                <img src={keyboard} alt='keyboard' />
                <form onSubmit={this.handleSubmit}>
                    
                    <label>
                        <input placeholder='Name' type='text' value={this.state.nickname} onChange={this.handleNameChange} />
                    </label>

                    <label>
                        <input placeholder='email' type='email' value={this.state.email} onChange={this.handleEmailChange} />
                    </label>

                    <label>
                        <input placeholder='Password' type='password' value={this.state.password} onChange={this.handlePasswordChange} />
                    </label>

                    <input className='submit' type='submit' value='Send' />
                </form>
            </div>
        );
    }
}

export default Register;