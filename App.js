import React from 'react';
import Expo from 'expo';
import DoodleJump from './DoodleJump';
import { View, Text,Platform, TouchableWithoutFeedback} from 'react-native'

// import { MultiTouchView } from 'expo-multi-touch';

export default class App extends React.Component {
  componentDidMount() {
    this._subscribe();
  }
  componentWillUnmount() {
    this._unsubscribe();
  }
  state = {score: 0}

  _subscribe = () => {
    const isAndroid = Platform.OS == "android"
    Expo.Accelerometer.setUpdateInterval(16);
    this._subscription = Expo.Accelerometer.addListener(
      ({ x }) => {
        if (isAndroid) {
        this.game && this.game.updateControls(x * -1)  
        } else {
          this.game && this.game.updateControls(x)
        }
        
        
      }
    );
  };

  _unsubscribe = () => {
    Expo.Accelerometer.removeAllListeners();
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  // shouldComponentUpdate = () => false;

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => this.game.onPress()}>
      <View style={{flex: 1}}>
      <Expo.GLView
        style={{ flex: 1 }}
        onContextCreate={async context => {
          this.game = new DoodleJump(context, (score) => {
            this.setState({score})
          });
        }}
      />
      <Text style={{position: 'absolute', top: 24, left: 12, fontSize: 36, opacity: 0.7, fontWeight: 'bold', color: 'black'}}>{this.state.score}</Text>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}
