import * as React from "react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, combineReducers, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import logger from "redux-logger";
import Main from "./src/Main";
import { driversEpic, driversReducer } from "./src/Drivers/ducks";
import { racesReducer, racesEpic } from "./src/Races/ducks";

const reducer = combineReducers({
  drivers: driversReducer,
  races: racesReducer,
});
const epic = combineEpics(driversEpic, racesEpic);
const epicMiddleware = createEpicMiddleware();
const store = createStore(reducer, applyMiddleware(logger, epicMiddleware));

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
