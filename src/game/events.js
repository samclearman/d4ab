import firebase from 'firebase'
import uuidv1 from 'uuid/v1'
import { reducers } from './board'

firebase.initializeApp({
  apiKey: "AIzaSyAqf4uvH6K3k86kUYDruuHC89Bg25IVBIM",
  authDomain: "d4ab-7864e.firebaseapp.com",
  databaseURL: "https://d4ab-7864e.firebaseio.com",
  projectId: "d4ab-7864e",
  storageBucket: "d4ab-7864e.appspot.com",
  messagingSenderId: "990806837807"
});


// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();

// Infrastructure to associate browser with colors
if (!window.localStorage['id']) {
  window.localStorage['id'] = uuidv1();
}
const mySession = window.localStorage['id'];
const playerSessions = {};
const availablePlayer = () => {
  for (let i = 1; i <= 4; i++) {
    if (!playerSessions[i]) {
      return i;
    }
  }
  return 0;
}

const handlers = {
  place: (gameState, event) => {
    if (playerSessions[event.playerIndex] !== event.source) {
      // Do something?
      return;
    }
    const board = gameState.board;
    const newBoard = reducers.place(board, event.playerIndex, event.selectedOminoIdx, event.currentTransformation, event.cell.i, event.cell.j);
    return { board: newBoard };
  },

  claimPlayers: (gameState, event) => {
    for (const playerId of event.playerIds) {
      playerSessions[playerId] = playerSessions[playerId] || event.source
    }
    const claimedPlayers = []
    for (const id in playerSessions) {
      if (playerSessions[id] === mySession) {
        claimedPlayers.push(id)
      }
    }
    return { claimedPlayers: claimedPlayers.map(p => parseInt(p)) }
  },
    
}

export const eventList = (getState, setState, { gameId }) => {
  
  const process = (event) => {
    const handler = handlers[event.type];
    setState(handler(getState(), event))
  }
    
  const dispatch = (event) => {
    doc.update({
      events: firebase.firestore.FieldValue.arrayUnion(
        Object.assign(event, {source: mySession})
      )
    })
  }
  
  const processedEvents = [];
  const doc = db.collection('games').doc(gameId)
  
  const snapshotHandler = doc => {
    const events = doc.data().events
    for (let i = processedEvents.length; i < events.length; i++) {
      process(events[i]);
      processedEvents.push(events[i]);
    }

    // Make sure we've claimed the players that we want (or if no players are requested,
    // claim the next available player.)
    if (!(getState()['requestedPlayers'] && (getState()['requestedPlayers']).length > 0)) {
      if (availablePlayer()) {
        setState({requestedPlayers: [availablePlayer()]})
      }
    }
    const unclaimedPlayers = [];
    for (const player of (getState()['requestedPlayers'])) {
      if (!(player in getState()['claimedPlayers'])) {
        unclaimedPlayers.push(player)
      }
    }
    if (unclaimedPlayers.length > 0) {
      dispatch({ type: 'claimPlayers', playerIds: unclaimedPlayers })
    }
  }
  doc.onSnapshot(snapshotHandler);

  return { dispatch }
}

export const createGame = (callback) => {
  db.collection('games').add({events: []}).then(ref => {
    callback(ref.id)
  })
}
