import Axios, { AxiosResponse } from "axios";
import { none, some } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { DateFromISOString, IntegerFromString } from "io-ts-types";
import { Lens, Prism } from "monocle-ts";
import { Epic } from "redux-observable";
import { debounceTime, filter, map, switchMap } from "rxjs/operators";
import { ofType, unionize, UnionOf } from "unionize";
import { initRemoteD } from "../model/remote";
import { pipe } from "rxjs";
import { keepOldDataIfNewOffsetIsNonZero } from "../LazyList/updates";

export interface Driver extends t.TypeOf<typeof Driver> {}
export const Driver = t.type(
  {
    dateOfBirth: DateFromISOString,
    driverId: t.string,
    familyName: t.string,
    givenName: t.string,
    nationality: t.string,
    url: t.string,
  },
  "Driver",
);

export interface DriverTableData extends t.TypeOf<typeof DriverTableData> {}
export const DriverTableData = t.type(
  {
    DriverTable: t.type({
      Drivers: t.array(Driver),
    }),
    limit: IntegerFromString,
    offset: IntegerFromString,
  },
  "DriverTableData",
);

const DriverTableRes = t.type(
  {
    MRData: DriverTableData,
  },
  "DriverTableRes",
);

export const RemoteDrivers = initRemoteD<DriverTableData, string>();
export type RemoteDrivers = UnionOf<typeof RemoteDrivers>;

const dataL = Lens.fromProp<AxiosResponse<t.mixed>, "data">("data");

export type LoadDataParams = {
  limit: number;
  offset: number;
};

export function loadDrivers(params: LoadDataParams) {
  return (
    Axios("http://ergast.com/api/f1/drivers.json", { params })
      // import("./data.json")
      .then(res => {
        console.log(res);
        const data = dataL.get(res);
        return DriverTableRes.decode(data).fold(
          err => {
            console.log("incorrect data from api", err);
            return RemoteDrivers.Error("Unknown Error");
          },
          res => RemoteDrivers.Ok(res.MRData),
        );
      })
      .catch(err => RemoteDrivers.Error(err && err.message))
  );
}

export type TableAction = UnionOf<typeof TableAction>;
export const TableAction = unionize(
  {
    LOAD_DRIVERS_REQUEST: ofType<LoadDataParams>(),
    LOAD_DRIVERS_RESULT: ofType<RemoteDrivers>(),
  },
  { tag: "type", value: "payload" },
);

export type TableState = ReturnType<typeof getInitialState>;
function getInitialState() {
  return {
    drivers: RemoteDrivers.Loading(),
    refreshing: true,
  };
}

export const driverRemoteDataL = Lens.fromProp<TableState, "drivers">(
  "drivers",
);
export const refreshingL = Lens.fromProp<TableState, "refreshing">(
  "refreshing",
);
export const remoteOkP = new Prism<RemoteDrivers, DriverTableData>(
  RemoteDrivers.match({
    Ok: some,
    default: () => none,
  }),
  RemoteDrivers.Ok,
);
export const driversL = Lens.fromPath<
  DriverTableData,
  "DriverTable",
  "Drivers"
>(["DriverTable", "Drivers"]);
export const driversFromRemoteL = remoteOkP.composeLens(driversL);
const nonZeroOffsetP = Prism.fromPredicate<DriverTableData>(d => d.offset > 0);

export function getDrivers(rd: RemoteDrivers) {
  return driversFromRemoteL.getOption(rd).getOrElse([]);
}

export function driversReducer(
  state = getInitialState(),
  action: TableAction,
): TableState {
  const newState = TableAction.match(action, {
    LOAD_DRIVERS_RESULT: data =>
      pipe(
        refreshingL.set(false),
        driverRemoteDataL.modify(prevRemote =>
          keepOldDataIfNewOffsetIsNonZero(
            remoteOkP,
            driversL,
            nonZeroOffsetP,
            prevRemote,
            data,
          ),
        ),
      )(state),
    default: () => state,
  });

  return newState;
}

const loadDriversEpic: Epic = action$ =>
  action$.pipe(
    filter(TableAction.is.LOAD_DRIVERS_REQUEST),
    debounceTime(200),
    switchMap(a => loadDrivers(a.payload)),
    map(res => TableAction.LOAD_DRIVERS_RESULT(res)),
  );

export const driversEpic = loadDriversEpic;
