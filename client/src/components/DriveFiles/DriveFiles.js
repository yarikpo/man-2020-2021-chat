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
        console.log(e);

        async function postData(url, data={}) {
            const response = await fetch(url, {
                method: data.method,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        let data = {
            method: 'DELETE',
            code: 'enc',
            fileId: e.id,
        }

        postData('http://localhost:3001/drive/deleteAFile', data).catch(err => console.log(err));

        data = {
            method: 'POST',
            filename: e.name,
            fileId: e.id,
        }

        postData('http://localhost:3001/drive/upload', data).catch(err => console.log(err));

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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'fileId': e.id
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
                                <button onClick={() => this.handleClickEncode({id: file.id, name: file.name})}>Encode</button>
                                <button onClick={this.handleClickDecode}>Decode</button>
                                <p>{this.state.text[file.id] ? this.state.text[file.id] : 'NULL'}</p>
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