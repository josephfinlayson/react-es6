import React, {Component} from 'react';
import MusicItem from './music-item.jsx!'
import abstractMusicItemFactory from './abstractMusicItem.jsx!';
import SongItem from './song-item.jsx!'


class MusicList extends Component {


    getMusicItem (model) {
        let Item
        if (model.type === 'track') {
            Item = SongItem
        } else {
            Item = MusicItem
        }
        return <Item model={model}/>
    }


    render () {
        return (<div className="music-list">
            {this.props.music.map(this.getMusicItem)}
        </div>)
    }

}

export default MusicList;





































//
//var boxType, boxTypeString;
//try {
//    // get a reference to the boxType
//    boxTypeString = item.provider.charAt(0).toUpperCase() + item.provider.slice(1) + 'Item';
//    boxType = eval(boxTypeString);
//} catch (e) {
//    console.error('no box type of type', boxTypeString);
//}
