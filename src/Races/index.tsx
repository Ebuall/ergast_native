import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Card } from "react-native-elements";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RootState } from "../../App";
import {
  LoadDataParams,
  makeDictKeyLens,
  RacesAction,
  RemoteRaces,
} from "./ducks";
import { RacesTable, PAGE_SIZE } from "./Table";
import { refreshingL } from "./ducks";

type OwnProps = NavigationInjectedProps;
type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

function getId(navigation: NavigationInjectedProps["navigation"]) {
  return navigation.getParam("driverId");
}

const Races_ = class Races extends React.PureComponent<Props> {
  static navigationOptions = ({ navigation }: NavigationInjectedProps) => ({
    title: "Races " + getId(navigation),
  });
  componentDidMount() {
    const { loadRaces, navigation } = this.props;
    loadRaces({ driverId: getId(navigation), limit: PAGE_SIZE, offset: 0 });
  }
  render() {
    const { navigation, data, ...tableProps } = this.props;
    const driverId = getId(navigation);
    return (
      <View>
        {RemoteRaces.match(data, {
          Ok: () => (
            <RacesTable {...tableProps} data={data} driverId={driverId} />
          ),
          Loading: () => <ActivityIndicator size="large" />,
          default: x => <Text>{JSON.stringify(x)}</Text>,
        })}
      </View>
    );
  }
};

function mapStateToProps({ races }: RootState, ownProps: OwnProps) {
  const driverId = getId(ownProps.navigation);
  return {
    data: makeDictKeyLens(driverId).get(races),
    refreshing: refreshingL.get(races),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loadRaces: (params: LoadDataParams) =>
      dispatch(RacesAction.LOAD_RACES_REQUEST(params)),
  };
}

export const Races = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Races_);
