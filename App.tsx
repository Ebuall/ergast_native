import * as React from "react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import Main from "./src/Main";
import { tableEpic, tableReducer } from "./src/Table/ducks";
import { racesReducer, racesEpic } from "./src/Races/ducks";

const reducer = combineReducers({ table: tableReducer, races: racesReducer });
const epic = combineEpics(tableEpic, racesEpic);
const epicMiddleware = createEpicMiddleware();
const store = createStore(reducer, applyMiddleware(epicMiddleware));

export type RootState = ReturnType<typeof reducer>;

epicMiddleware.run(epic);

export default class App extends React.Component<{}> {
  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>
    );
  }
}
