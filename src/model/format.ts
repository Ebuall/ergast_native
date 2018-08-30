import { Driver } from "../Table/ducks";
import { Race } from "../Races/ducks";

export const formatDriver = (d: Driver) => d.givenName + " " + d.familyName;
export const formatRace = (r: Race) => r.raceName;
export const formatDate = (d: Date) =>
  d.toLocaleDateString(navigator.language, { year: "numeric" });

export const driverKeyExtractor = (d: Driver) => d.driverId;
export const raceKeyExtractor = (r: Race) => r.raceName + "/" + r.season;
