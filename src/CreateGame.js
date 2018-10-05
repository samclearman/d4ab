import React from 'react'
import { Redirect } from 'react-router-dom'
import { createGame } from './game/events'

export default class CreateGame extends React.PureComponent {
  constructor() {
    super();
    this.state = {}
    console.log('creating game..')
    createGame(newGameId => this.setState({ newGameId }));
  }

  render() {
    if (!(this.state.newGameId)) {
      return (
        <div>
          Creating game...
        </div>
      )
    }
    console.log(`redirecting to ${this.state.newGameId}`);
    return (
      <Redirect
          to={{
            pathname: `/game/${this.state.newGameId}`,
          }}
        />
    )
  }
}
    
