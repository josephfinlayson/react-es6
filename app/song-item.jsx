import React, {Component} from 'react';
import MusicItem from './music-item.jsx!'

class TrackItem extends MusicItem {

    getWrapperClass() {
        return 'my-track-class'
    }

    render () {
        return (<div
            onClick={this.openModal}
            className="music-item">
            Hi
            {this.renderModal()}
        </div>)
    }
}


export default TrackItem;

