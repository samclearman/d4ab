import { reducers } from './board'

const events = [];

const handlers = {
  place: (event, gameState) => {
    const board = gameState.board;
    const newBoard = reducers.place(board, this.playerIndex, event.selectedOminoIdx, event.currentTransformation, event.cell.i, event.cell.j);
    return { newBoard };
  }
}


export const eventList = (getState, setState) => {

  const process = (event) => {
    const handler = handlers[event.type];
    setState(handler(getState(), event))
  }

  return {
    dispatch(event) {
      events.push(event);
      process(event);
    }
  }

}
