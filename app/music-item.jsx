import React, {Component} from 'react';
import _ from 'lodash';

class MusicItem extends Component {

    getWrapperClass () {
        let wrapperClass;
        switch (this.props.model.type) {
            case 'album':
                wrapperClass = 'my-album-class'
                break;
            case 'artist':
                wrapperClass = 'my-artist-class'
                break;
            case 'playlist':
                wrapperClass = 'my-playlist-class'
                break;
            case 'track':
                wrapperClass = 'my-track-class'
                break;
        }

        return wrapperClass;
    }


    renderImage () {
        switch (this.props.model.type) {
            case 'album' :
                if (this.props.model.images[0]) {
                    return  <img className="square-image" src={this.props.model.images[0].url}/>
                }
                break;
            case 'artist':
                if (this.props.model.images[0]) {
                    return <div className="rounded-image" style={{backgroundImage: "url('" +this.props.model.images[0].url + "')"}} />
                }

                break;
            case 'playlist':
                if (this.props.model.images[0]){
                    return <div className="rounded-image" style={{backgroundImage: "url('" +this.props.model.images[0].url + "')"}} />
                }
                break;
            case 'track':
                return <img className="square-image" src={'https://pbs.twimg.com/profile_images/378800000822867536/3f5a00acf72df93528b6bb7cd0a4fd0c.jpeg'}/>
                break;
        }
    }

    openModal () {

    }

    render () {
        return (<div className={this.getWrapperClass() + ' music-item'}
                     onClick={this.openModal}>
            {this.renderImage()}
            {this.props.model.name}
        </div>)
    }


}

export default MusicItem;

