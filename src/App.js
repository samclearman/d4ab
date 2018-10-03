import React, { Component } from 'react';
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
      justifyContent: 'space-around',
    };

    return (
      <div className="App" style={appStyle}>
        <div>
          {this.renderTitle()}
          <Game/>
        </div>
      </div>
    );
  }
}

export default App;
