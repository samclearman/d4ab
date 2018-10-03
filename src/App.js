import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './Game'

class App extends Component {
  renderTitle() {
    const titleStyle = {
      fontSize: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
    }

    return (
      <div style={titleStyle}>
        Down for a block
      </div>
    );
  }

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
        {this.renderTitle()}
        <Game/>
      </div>
    );
  }
}

export default App;
