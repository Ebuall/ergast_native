import { unionize, ofType, UnionOf } from "unionize";
import { Driver, LoadDataParams as LoadDataParamsGen } from "../Table/ducks";
import { Lens } from "monocle-ts";
import * as t from "io-ts";
import { IntegerFromString } from "io-ts-types";
import { initRemoteD } from "../model/remote";
import { Epic } from "redux-observable";
import { filter, map, ignoreElements, switchMap, delay } from "rxjs/operators";
import { defer } from "rxjs";

type Id = Driver["driverId"];
type LoadDataParams = LoadDataParamsGen<Id>;
type LoadRacesRes = { driverId: Id; res: RemoteRaces };

export type RacesAction = UnionOf<typeof RacesAction>;
export const RacesAction = unionize(
  {
    LOAD_RACES_REQUEST: ofType<LoadDataParams>(),
    LOAD_RACES_RESULT: ofType<LoadRacesRes>(),
  },
  { tag: "type", value: "payload" },
);

export interface Race extends t.TypeOf<typeof Race> {}
export const Race = t.type(
  {
    Circuit: t.object,
    date: t.string,
    raceName: t.string,
    round: t.string,
    season: t.string,
    url: t.string,
  },
  "Race",
);

export interface RacesData extends t.TypeOf<typeof RacesData> {}
export const RacesData = t.type(
  {
    RaceTable: t.type({
      driverId: Driver.props.driverId,
      Races: t.array(Race),
    }),
    offset: IntegerFromString,
    limit: IntegerFromString,
  },
  "RacesData",
);

export type RemoteRaces = UnionOf<typeof RemoteRaces>;
export const RemoteRaces = initRemoteD<RacesData, string>();

const RacesDataRes = t.type({
  MRData: RacesData,
});

function loadRaces(params: LoadDataParams) {
  return import("./data.json")
    .then(res => {
      console.log(res);
      return RacesDataRes.decode(res.data).fold(
        err => {
          console.log("invalid races data", err);
          return RemoteRaces.Error("Unknown Error");
        },
        res => RemoteRaces.Ok(res.MRData),
      );
    })
    .catch(err => RemoteRaces.Error(err && err.message));
}

type RacesState = ReturnType<typeof getInitialState>;
function getInitialState() {
  return {
    dict: {} as Record<Id, RemoteRaces>,
  };
}

const dictL = Lens.fromProp<RacesState, "dict">("dict");

export function makeDictKeyLens(key: Id) {
  return dictL.compose(Lens.fromNullableProp(key, RemoteRaces.Loading()));
}

export function racesReducer(
  state = getInitialState(),
  action: RacesAction,
): RacesState {
  const newState = RacesAction.match(action, {
    LOAD_RACES_RESULT: data =>
      makeDictKeyLens(data.driverId).set(data.res)(state),
    default: () => state,
  });
  return newState;
}

const loadEpic: Epic = action$ =>
  action$.pipe(
    filter(RacesAction.is.LOAD_RACES_REQUEST),
    switchMap(a =>
      defer(() => loadRaces({ value: "asd" })).pipe(
        map(res =>
          RacesAction.LOAD_RACES_RESULT({ driverId: a.payload.value, res }),
        ),
      ),
    ),
    delay(500),
  );

export const racesEpic = loadEpic;
