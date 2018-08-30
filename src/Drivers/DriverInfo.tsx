import * as React from "react";
import { Text } from "react-native";
import { Button, Card } from "react-native-elements";
import { NavigationInjectedProps } from "react-navigation";
import { formatDriver } from "../model/format";

export class DriverInfo extends React.PureComponent<NavigationInjectedProps> {
  static navigationOptions = ({ navigation }: NavigationInjectedProps) => ({
    title: formatDriver(navigation.getParam("driver")),
  });

  render() {
    const { navigation } = this.props;
    const driver = navigation.getParam("driver");
    return (
      <Card>
        {Object.keys(driver).map(key => {
          const value = driver[key];
          return (
            <Text key={key}>
              <Text style={{ fontWeight: "bold" }}>{key}: </Text>
              {JSON.stringify(value)}
            </Text>
          );
        })}
        <Button
          title="View races"
          onPress={() =>
            navigation.push("Races", { driverId: driver.driverId })
          }
        />
      </Card>
    );
  }
}
