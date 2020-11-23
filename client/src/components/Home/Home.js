import React from 'react';
import { Redirect } from 'react-router-dom';
import './Home.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.authorized === false) return <Redirect to='/login' />;
        return(
            <div className='home-page'>
                HOME
            </div>
        );
    }
}

export default Home;