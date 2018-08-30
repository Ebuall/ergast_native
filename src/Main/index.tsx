import { Constants } from "expo";
import * as React from "react";
import { View } from "react-native";
import { createStackNavigator } from "react-navigation";
import { Table } from "../Table";
import { DriverInfo } from "../Table/DriverInfo";
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
