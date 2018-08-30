import { updateIfNonZeroOffset, Driver, DriverTableData } from "./ducks";

function drivers(...arr: any[]) {
  return arr as Driver[];
}

describe("nonZeroOffset", () => {
  const oldArr = drivers(1, 2, 3);
  const newDataNonZero: DriverTableData = {
    DriverTable: {
      Drivers: drivers(5, 6, 7),
    },
    limit: 30,
    offset: 30,
  };
  const newDataZero: DriverTableData = {
    DriverTable: {
      Drivers: drivers(5, 6, 7),
    },
    limit: 30,
    offset: 0,
  };

  it("updates if not zero", () => {
    expect(updateIfNonZeroOffset(oldArr, newDataNonZero)).toEqual({
      DriverTable: {
        Drivers: drivers(1, 2, 3, 5, 6, 7),
      },
      limit: 30,
      offset: 30,
    });
  });
  it("doest not update if zero", () => {
    expect(updateIfNonZeroOffset(oldArr, newDataZero)).toEqual(newDataZero);
  });
});
