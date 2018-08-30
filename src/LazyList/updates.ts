import { Prism, Lens } from "monocle-ts";

export function updateIfNonZeroOffset<T, Data>(
  nonZeroOffsetP: Prism<Data, Data>,
  lens: Lens<Data, T[]>,
  prevArr: T[],
  newData: Data,
) {
  return nonZeroOffsetP
    .composeLens(lens)
    .modify(newArr => prevArr.concat(newArr))(newData);
}

export function keepOldDataIfNewOffsetIsNonZero<R, D, T>(
  remoteP: Prism<R, D>,
  arrFromDataL: Lens<D, T[]>,
  nonZeroOffsetP: Prism<D, D>,
  prevRemote: R,
  newRemote: R,
): R {
  return remoteP
    .composeLens(arrFromDataL)
    .getOption(prevRemote)
    .fold(newRemote, prev =>
      remoteP
        .getOption(newRemote)
        .fold(newRemote, newData =>
          remoteP.reverseGet(
            updateIfNonZeroOffset(nonZeroOffsetP, arrFromDataL, prev, newData),
          ),
        ),
    );
}
