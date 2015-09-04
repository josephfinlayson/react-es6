import React, {Component} from 'react';
import MusicItem from './music-item.jsx!'
import abstractMusicItemFactory from './abstractMusicItem.jsx!';


class MusicList extends Component {


    musicItemSettings = {
        playlist: {
            className: 'my-playlist-class'
        }, track: {
            className: 'my-track-class',
            image: 'https://pbs.twimg.com/profile_images/378800000822867536/3f5a00acf72df93528b6bb7cd0a4fd0c.jpeg'
        }, album: {
            className: 'my-album-class',
        }, artist: {
            className: 'my-artist-class',
        }
    };

    getMusicItem (model) {
        //let MusicItem = abstractMusicItemFactory(this.musicItemSettings[model.type]);

        return (
            <MusicItem model={model}/>
        )
    }

    render () {
        return (<div className="music-list">
            {this.props.music.map(this.getMusicItem)}
        </div>)
    }

}

export default MusicList;

