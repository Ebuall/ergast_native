import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { Table } from "../Drivers";
import { DriverInfo } from "../Drivers/DriverInfo";
import { Races } from "../Races";

const Home = createStackNavigator(
  {
    DriversTable: Table,
    DriverInfo,
    Races,
  },
  { initialRouteName: "DriversTable" },
);

class Main extends React.PureComponent {
  render() {
    return (
      // <View paddingTop={Constants.statusBarHeight}>
      <Home />
      // </View>
    );
  }
}

export default Main;
