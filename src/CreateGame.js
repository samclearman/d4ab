import React from 'react'
import { Redirect } from 'react-router-dom'
import { createGame } from './game/events'

export default class CreateGame extends React.PureComponent {
  constructor() {
    super();
    this.state = {}
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
    return (
      <Redirect
          to={{
            pathname: `/game/${this.state.newGameId}`,
          }}
        />
    )
  }
}
    
