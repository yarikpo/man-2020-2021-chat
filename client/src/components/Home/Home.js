import React from 'react';
import { Redirect } from 'react-router-dom';
import './Home.css';

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

    render() {
        if (this.state.authorized === false) return <Redirect to='/login' />;
        return(
            <div className='home-page'>
                name: { this.state.data.username }
                <br />
                title: { this.state.data.title }
            </div>
        );
    }
}

export default Home;