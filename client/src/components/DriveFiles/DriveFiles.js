import React from 'react';
import './DriveFiles.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    

    render() {
        if (this.state.authorized === false) return <Redirect to='/login' />;
        return(
            <div className='drive'>
                
            </div>
        );
    }
}

export default Home;