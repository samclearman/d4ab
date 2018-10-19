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
const myId = window.localStorage['id'];
const playerIds = {};
const availablePlayer = () => {
  for (let i = 1; i <= 4; i++) {
    if (!playerIds[i]) {
      return i;
    }
  }
  return 0;
}

const handlers = {
  place: (gameState, event) => {
    if (playerIds[event.playerIndex] !== event.source) {
      // Do something?
      return;
    }
    const board = gameState.board;
    const newBoard = reducers.place(board, event.playerIndex, event.selectedOminoIdx, event.currentTransformation, event.cell.i, event.cell.j);
    return { board: newBoard };
  },

  claimPlayer: (gameState, event) => {
    playerIds[event.playerId] = event.source
    if (event.source === myId) {
      return { playerId: event.playerId }
    }
    return {}
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
        Object.assign(event, {source: myId})
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

    if (!getState()['playerId']) {
      if (availablePlayer()) {
        dispatch({ type: 'claimPlayer', playerId: availablePlayer() })
      }
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
