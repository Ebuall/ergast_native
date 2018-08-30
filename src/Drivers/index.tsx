import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ListItem } from "react-native-elements";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RootState } from "../../App";
import { LazyList } from "../LazyList";
import { driverKeyExtractor, formatDate, formatDriver } from "../model/format";
import { DriverInfo } from "./DriverInfo";
import {
  Driver,
  driverRemoteDataL,
  getDrivers,
  LoadDataParams,
  refreshingL,
  RemoteDrivers,
  TableAction,
} from "./ducks";

type Props = NavigationInjectedProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export const PAGE_SIZE = 60;

const TableGen = class Table extends React.PureComponent<Props> {
  static navigationOptions = {
    title: "Drivers",
  };
  reload = () => {
    this.props.loadDrivers({ limit: PAGE_SIZE, offset: 0 });
  };
  loadMore = () => {
    const { loadDrivers, data } = this.props;
    const offset = RemoteDrivers.match(data, {
      Ok: d => d.offset + PAGE_SIZE,
      default: () => 0,
    });
    console.log("loading more with offset", offset);
    loadDrivers({ limit: PAGE_SIZE, offset });
  };
  renderItem = ({ item }: { item: Driver }) => (
    <ListItem
      title={formatDriver(item)}
      subtitle={formatDate(item.dateOfBirth)}
      onPress={() =>
        this.props.navigation.push(DriverInfo.name, { driver: item })
      }
    />
  );
  renderDriverList = () => {
    const { data, refreshing } = this.props;
    const drivers = getDrivers(data);
    return (
      <LazyList
        data={drivers}
        renderItem={this.renderItem}
        keyExtractor={driverKeyExtractor}
        onRefresh={this.reload}
        refreshing={refreshing}
        loadMore={this.loadMore}
      />
    );
  };
  componentDidMount() {
    this.reload();
  }
  render() {
    const { data } = this.props;
    return (
      <View justifyContent="center">
        {RemoteDrivers.match(data, {
          Ok: this.renderDriverList,
          Loading: () => <ActivityIndicator size="large" />,
          default: e => <Text>{JSON.stringify(e)}</Text>,
        })}
      </View>
    );
  }
};

function mapStateToProps({ drivers }: RootState) {
  return {
    data: driverRemoteDataL.get(drivers),
    refreshing: refreshingL.get(drivers),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loadDrivers: (p: LoadDataParams) =>
      dispatch(TableAction.LOAD_DRIVERS_REQUEST(p)),
  };
}

export const Table = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableGen);
