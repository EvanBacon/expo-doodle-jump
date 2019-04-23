import { Accelerometer, GLView } from 'expo';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

import DoodleJump from './Game/DoodleJump';
import KeyboardControlsView from './KeyboardControlsView';
import DisableBodyScrollingView from './DisableBodyScrollingView';
import ExpoButton from './ExpoButton';
const Sensor = Accelerometer;
class App extends React.Component {
  state = { score: 0, controls: true, size: Dimensions.get('window') };

  componentDidMount() {
    this.subscribe();
    Dimensions.addEventListener('change', this.onResize);
  }

  onResize = ({ window }) => {
    if (this.game) {
      this.game.resize(window);
    }
    this.setState({ size: window });
  };

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onResize);
    this.unsubscribe();
    if (this.game) {
      this.game.deallocate();
    }
  }

  subscribe = async () => {
    if (!(await Sensor.isAvailableAsync())) {
      this.setState({ controls: false });
      return;
    }
    const isAndroid = Platform.OS === 'android';
    // Accelerometer.setUpdateInterval(16);
    const isWeb = Platform.OS === 'web';
    Sensor.addListener(({ x }) => {
      let inputX = isWeb ? x * 0.3 : x;
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
    Sensor.removeAllListeners();
  };

  onContextCreate = context =>
    (this.game = new DoodleJump(context, score => this.setState({ score })));

  render() {
    const { size, controls } = this.state;

    if (!controls) {
      return (
        <View
          style={{
            flex: 1,
            color: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: 'white' }}>
            Device Sensors are not available on this device!
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[styles.container, { width: size.width, height: size.height }]}
      >
        <DisableBodyScrollingView>
          <KeyboardControlsView
            onKeyDown={({ code }) => {
              if (this.game) {
                if (code === 'ArrowRight' || code === 'KeyD') {
                  this.game.onRight();
                } else if (code === 'ArrowLeft' || code === 'KeyA') {
                  this.game.onLeft();
                }
              }
            }}
            onKeyUp={() => this.game && this.game.onKeyUp()}
          >
            <GLView
              style={styles.container}
              onContextCreate={this.onContextCreate}
            />
            <Text style={styles.score}>{this.state.score}</Text>
          </KeyboardControlsView>
        </DisableBodyScrollingView>
        <ExpoButton />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
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
