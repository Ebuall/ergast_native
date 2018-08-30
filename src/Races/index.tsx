import * as React from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { RootState } from "../../App";
import { makeDictKeyLens, RemoteRaces, RacesAction } from "./ducks";
import { Card } from "react-native-elements";
import { Dispatch } from "redux";

type OwnProps = NavigationInjectedProps;
type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

function getId(navigation: NavigationInjectedProps["navigation"]) {
  return navigation.getParam("driverId");
}

const Races_ = class Races extends React.PureComponent<Props> {
  componentDidMount() {
    const { loadRaces, navigation } = this.props;
    loadRaces(getId(navigation));
  }
  render() {
    const { navigation, data } = this.props;
    const driverId = getId(navigation);
    console.log("races data", data);
    return (
      <Card>
        <Text>Races {driverId}</Text>
        {RemoteRaces.match(data, {
          Loading: () => <ActivityIndicator size="large" />,
          default: x => <Text>{JSON.stringify(x.value)}</Text>,
        })}
      </Card>
    );
  }
};

function mapStateToProps({ races }: RootState, ownProps: OwnProps) {
  const driverId = getId(ownProps.navigation);
  return {
    data: makeDictKeyLens(driverId).get(races),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loadRaces: (id: string) =>
      dispatch(RacesAction.LOAD_RACES_REQUEST({ value: id })),
  };
}

export const Races = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Races_);
