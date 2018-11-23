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
        <Route path='/game/:id' render={({ match, location }) => {
          let params = new URLSearchParams(location.search)
          let players
          if (params.get('players')) {
            players = params.get('players').split(',').map(s => parseInt(s))
          }
          return (
            <div className="App" style={appStyle}>
              <Game gameId={match.params.id} players={players}/>
            </div>
          )
        }}/>
        </Switch>
    );
  }
}

export default App;
