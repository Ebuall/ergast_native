import Axios from "axios";
import { pipe } from "fp-ts/lib/function";
import { none, some } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { DateFromISOString, IntegerFromString } from "io-ts-types";
import { Lens, Prism } from "monocle-ts";
import { Epic } from "redux-observable";
import { defer } from "rxjs";
import { delay, filter, map, switchMap } from "rxjs/operators";
import { ofType, unionize, UnionOf } from "unionize";
import { Driver, LoadDataParams as LoadDataParamsGen } from "../Drivers/ducks";
import { keepOldDataIfNewOffsetIsNonZero } from "../LazyList/updates";
import { initRemoteD } from "../model/remote";

export type Id = Driver["driverId"];
export type LoadDataParams = LoadDataParamsGen & {
  driverId: Id;
};
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
    date: DateFromISOString,
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

function loadRaces({ driverId, ...params }: LoadDataParams) {
  return (
    // return import("./data.json")
    Axios(`http://ergast.com/api/f1/drivers/${driverId}/races.json`, {
      params,
    })
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
      .catch(err => RemoteRaces.Error(err && err.message))
  );
}

type RacesState = ReturnType<typeof getInitialState>;
function getInitialState() {
  return {
    dict: {} as Record<Id, RemoteRaces>,
    refreshing: true,
  };
}

const dictL = Lens.fromProp<RacesState, "dict">("dict");
export const getRaces = RemoteRaces.match({
  Ok: v => v.RaceTable.Races,
  default: () => [],
});

export function makeDictKeyLens(key: Id) {
  return dictL.compose(Lens.fromNullableProp(key, RemoteRaces.Loading()));
}

export const refreshingL = Lens.fromProp<RacesState, "refreshing">(
  "refreshing",
);

export const remoteRacesOkP = new Prism<RemoteRaces, RacesData>(
  RemoteRaces.match({
    Ok: some,
    default: () => none,
  }),
  RemoteRaces.Ok,
);

const racesL = Lens.fromPath<RacesData, "RaceTable", "Races">([
  "RaceTable",
  "Races",
]);

const nonZeroOffsetP = Prism.fromPredicate<RacesData>(d => d.offset > 0);

export function racesReducer(
  state = getInitialState(),
  action: RacesAction,
): RacesState {
  const newState = RacesAction.match(action, {
    LOAD_RACES_RESULT: data =>
      pipe(
        refreshingL.set(false),
        makeDictKeyLens(data.driverId).modify(prevRemote =>
          keepOldDataIfNewOffsetIsNonZero(
            remoteRacesOkP,
            racesL,
            nonZeroOffsetP,
            prevRemote,
            data.res,
          ),
        ),
      )(state),
    default: () => state,
  });
  return newState;
}

const loadEpic: Epic = action$ =>
  action$.pipe(
    filter(RacesAction.is.LOAD_RACES_REQUEST),
    switchMap(a =>
      defer(() => loadRaces(a.payload)).pipe(
        map(res =>
          RacesAction.LOAD_RACES_RESULT({ driverId: a.payload.driverId, res }),
        ),
      ),
    ),
    delay(500),
  );

export const racesEpic = loadEpic;
