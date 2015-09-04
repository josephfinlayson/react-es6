import React, {PropTypes as T} from 'react';
import _ from 'lodash';

let MusicItemMap = new Map();

/**
 *
 * @param {Object} settings
 * @param {string} settings.isRounded should the image be rounded
 * @param {string} settings.type What type is this // optional
 * @returns {*}
 */

function musicItemFactory(settings) {
    let existingMusicItem = MusicItemMap.get(settings);
    // if there's something that already wants the same kind of featureditem, return that
    if (existingMusicItem) {
        return existingMusicItem;
    }

    class Musicitem extends React.Component {

        static defaultProps = settings;

        render () {
            (<div className={this.props.className + ' music-item'}
                  onClick={this.openModal}>
                {this.props.image}
                {this.props.model.name}
            </div>)
        }
    }

    MusicItemMap.set(settings);

    return Musicitem;
}

export default musicItemFactory;
