import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Game from './Game'
import CreateGame from './CreateGame'

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
      <Switch>
        <Route exact path='/' component={CreateGame} />
        <Route path='/game/:id' render={({ match }) => (
          <div className="App" style={appStyle}>
            <div>
              {this.renderTitle()}
              <Game gameId={match.params.id}/>
            </div>
          </div>
        )}
        />
        </Switch>
    );
  }
}

export default App;
