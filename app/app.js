import Rx from 'rx-dom';
import React, {Component} from 'react';
import MusicList from './music-list.jsx!';
import './styles.scss!';
import _ from 'lodash';

class Handler extends Component {

    constructor(props){
        super(props)
        this.state ={
            music: []
        }
    }

    componentDidMount () {
        Rx.DOM.ajax({
            url: 'https://api.spotify.com/v1/search?q=music&type=artist,album,track,playlist&limit=20',
            crossDomain: true,
            responseType: 'json'
        }).map(data => _.shuffle(
                Object.keys(data.response)
            .map((key) => data.response[key].items)
            .reduce((arr, secondArr) => arr.concat(secondArr)))
        )
            .subscribe(music => this.setState({music}))
    }


    render () {
        return (<MusicList music={this.state.music} />)
    }


}


React.render(React.createElement(Handler), document.getElementById('app'));
