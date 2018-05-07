import { Accelerometer, GLView } from 'expo';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DoodleJump from './Game/DoodleJump';

class App extends React.Component {
  state = { score: 0 };

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe = () => {
    const isAndroid = Platform.OS === 'android';
    Accelerometer.setUpdateInterval(16);
    this._subscription = Accelerometer.addListener(({ x }) => {
      if (this.game) {
        if (isAndroid) {
          this.game.updateControls(x * -1);
        } else {
          this.game.updateControls(x);
        }
      }
    });
  };

  unsubscribe = () => {
    Accelerometer.removeAllListeners();
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  onContextCreate = context =>
    (this.game = new DoodleJump(context, score => this.setState({ score })));

  render() {
    return (
      <View style={styles.container}>
        <GLView
          style={styles.container}
          onContextCreate={this.onContextCreate}
        />
        <Text style={styles.score}>{this.state.score}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  score: {
    position: 'absolute',
    top: 24,
    left: 12,
    fontSize: 36,
    opacity: 0.7,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
