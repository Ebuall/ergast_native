import * as React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { List, ListItem } from "react-native-elements";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RootState } from "../../App";
import {
  Driver,
  driverRemoteDataL,
  LoadDataParams,
  refreshingL,
  RemoteDrivers,
  TableAction,
  getDrivers,
} from "./ducks";
import { Param0 } from "type-zoo";
import { NavigationInjectedProps } from "react-navigation";
import { DriverInfo } from "./DriverInfo";

export const formatDriver = (d: Driver) => d.givenName + " " + d.familyName;
const formatDate = (d: Date) =>
  d.toLocaleDateString(navigator.language, {
    year: "numeric",
    // month: "long",
    // day: "numeric",
  });

type Props = NavigationInjectedProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export const PAGE_SIZE = 60;

const keyExtractor = (d: Driver) => d.driverId;

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
  componentDidMount() {
    this.reload();
  }
  renderDriverList = () => {
    const { data, refreshing } = this.props;
    const drivers = getDrivers(data);
    return (
      <List>
        <FlatList
          data={drivers}
          renderItem={this.renderItem}
          keyExtractor={keyExtractor}
          onRefresh={this.reload}
          refreshing={refreshing}
          onEndReached={this.loadMore}
          onEndReachedThreshold={1}
        />
      </List>
    );
  };
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

function mapStateToProps({ table }: RootState) {
  return {
    data: driverRemoteDataL.get(table),
    refreshing: refreshingL.get(table),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loadDrivers: (p?: LoadDataParams) =>
      dispatch(TableAction.LOAD_DRIVERS_REQUEST(p)),
  };
}

export const Table = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableGen);
