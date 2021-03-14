import React from 'react';
import { Redirect } from 'react-router-dom';
import './Home.css';
import GoogleLogin from 'react-google-login';
import DriveFiles from '../DriveFiles/DriveFiles';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authorized: true,
            data: {}
        };
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
                
                if (data.length > 0) {
                    console.log(data);
                    this.setState({ authorized: true });
                    this.setState({ data: data[0] });
                    this.props.handleChangeAuthorized(true);
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({ authorized: false });
                this.props.handleChangeAuthorized(false);
            });
    }

    responseGoogle(response) {
        console.log(response);
        console.log(response.profileObj);
    }

    render() {
        if (this.state.authorized === false) return <Redirect to='/login' />;
        return(
            <div className='home-page'>
                <span className='home-name'>{ this.state.data.username }</span>
                <br />
                <GoogleLogin 
                    className='google-login'
                    clientId='3479913194-a82j7al6q90o0b6i2orp79pk3qvp0tvj.apps.googleusercontent.com'
                    buttonText='Login'
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />
                <br />
                email: { this.state.data.email }
                <br />
                <DriveFiles />
            </div>
        );
    }
}

export default Home;