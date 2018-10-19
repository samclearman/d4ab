import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Game from './Game'
import CreateGame from './CreateGame'

class App extends Component {


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
            <Game gameId={match.params.id}/>
          </div>
        )}
        />
        </Switch>
    );
  }
}

export default App;
