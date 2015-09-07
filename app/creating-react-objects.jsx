import React from 'react';

function PlainOldObjectComponent(props, context){
    var instance = Object.create(React.Component.prototype)

    instance.props = props
    instance.context = context
    instance.state = { message: 'Object literals ftw' }
    instance.render = function() {
        return <li>
            <button onClick={ e => this.setState({ message: 'stateful!' })}>
                {this.state.message}
            </button>
        </li>
    }

    return instance
}

function MixinComponent(props, context) {
    return {
        ...React.Component.prototype,
        props,
        context,
        state: {
            message: 'Instances through Extension'
        },
        render() {
            return (<li>
                <button onClick={ e => this.setState({ message: 'stateful!' })}>
                    {this.state.message}
                </button>
        </li>)
        }
    }
}

//https://gist.github.com/jquense/47bbd2613e0b03d7e51c
