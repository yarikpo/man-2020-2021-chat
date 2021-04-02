import React from 'react';
import './DriveFiles.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            text: []
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleClickEncode = this.handleClickEncode.bind(this);
        this.handleClickDecode = this.handleClickDecode.bind(this);
        this.handleClickWrite = this.handleClickWrite.bind(this);
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

    handleClickWrite(e) {
        console.log('write');
        console.log(e);

        async function getData(url) {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Status': '200 OK',
                    'Vary': 'Accept',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'fieldId': e.id
                })
            });
            return await response.json();
        }

        getData('http://localhost:3001/drive/getFile').then(data => {
            console.log(data);
            let t = this.state.text;
            t[e.id] = data.data;
            this.setState({ text: t });  
        }).catch(err => {
            console.log(err);
        });
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
                                <button onClick={() => this.handleClickWrite({id: file.id})}>write data</button>
                                <button onClick={this.handleClickEncode}>Encode</button>
                                <button onClick={this.handleClickDecode}>Decode</button>
                                <p></p>
                                <br />
                            </div>
                        )
                    }
                </ul>
            </div>
        );
    }
}

export default Home;