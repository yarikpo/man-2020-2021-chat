import React from 'react';
import './DriveFiles.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            files: []
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleClickEncode = this.handleClickEncode.bind(this);
        this.handleClickDecode = this.handleClickDecode.bind(this);
    }

    handleButtonClick(e) {
        console.log('Update');
        console.log(this.state.files);


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

        getData('http://localhost:3001/drive/list')
            .then(data => {
                // console.log(data);
                this.setState({ files: data.files });  
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleClickEncode(e) {
        console.log('encode');
    }

    handleClickDecode(e) {
        console.log('decode');
    }


    

    render() {
        return(
            <div className='drive'>
                <button onClick={this.handleButtonClick}>Update</button>
                Files:
                <br />
                <ul>
                    {
                        this.state.files.map(file => 
                            <div>
                                <li>name: {file.name}</li>
                                <br />
                                <li>id: {file.id}</li>
                                <br />
                                <button onClick={this.handleClickEncode}>Encode</button>
                                <button onClick={this.handleClickDecode}>Decode</button>
                            </div>
                        )
                    }
                </ul>
            </div>
        );
    }
}

export default Home;