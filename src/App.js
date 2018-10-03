import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './Game'

class App extends Component {
  render() {
    const appStyle = {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div className="App" style={appStyle}>
        <Game/>
      </div>
    );
  }
}

export default App;
