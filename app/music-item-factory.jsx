import React, {Component} from 'react';

function musicItemFactory (settings){

    class MusicItem extends Component {

        render () {
            return (<div className="music-item">
                Hi
            </div>)
        }
    }

    return musicItem;
}

export default MusicItemFactory;

