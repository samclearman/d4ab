import firebase from 'firebase'
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

// const GAME_ID = 'yuIG6DNpPXV8C3tmOHMf';
const GAME_ID = null;

const handlers = {
  place: (gameState, event) => {
    const board = gameState.board;
    const newBoard = reducers.place(board, event.playerIndex, event.selectedOminoIdx, event.currentTransformation, event.cell.i, event.cell.j);
    return { board: newBoard };
  }
}


export const eventList = (getState, setState) => {

  const processedEvents = [];
  let doc;
  
  const snapshotHandler = doc  => {
    const events = doc.data().events
      for (let i = processedEvents.length; i < events.length; i++) {
        process(events[i]);
        processedEvents.push(events[i]);
      }
    }
  
  if (GAME_ID) {
    doc = db.collection('games').doc(GAME_ID)
    doc.onSnapshot(snapshotHandler);
  } else {
    db.collection('games').add({events: []}).then(ref => {
      doc = ref
      doc.onSnapshot(snapshotHandler)
    }
    )
  }
                      
  
  const process = (event) => {
    const handler = handlers[event.type];
    setState(handler(getState(), event))
  }

  return {
    dispatch(event) {
      doc.update({
        events: firebase.firestore.FieldValue.arrayUnion(event)
      })
    }
  }

}
