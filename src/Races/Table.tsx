import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ListItem } from "react-native-elements";
import { LazyList } from "../LazyList";
import { formatDate, formatRace, raceKeyExtractor } from "../model/format";
import { LoadDataParams, getRaces } from "./ducks";
import { Id, Race, RemoteRaces } from "./ducks";

type Props = {
  loadRaces: (params: LoadDataParams) => void;
  driverId: Id;
  data: RemoteRaces;
  refreshing: boolean;
};

export const PAGE_SIZE = 60;

export class RacesTable extends React.PureComponent<Props> {
  reload = () => {
    const { driverId, loadRaces } = this.props;
    loadRaces({ limit: PAGE_SIZE, offset: 0, driverId });
  };
  loadMore = () => {
    const { loadRaces, data, driverId } = this.props;
    const offset = RemoteRaces.match(data, {
      Ok: d => d.offset + PAGE_SIZE,
      default: () => 0,
    });
    console.log("loading more with offset", offset);
    loadRaces({ limit: PAGE_SIZE, offset, driverId });
  };
  renderItem = ({ item }: { item: Race }) => (
    <ListItem title={formatRace(item)} subtitle={formatDate(item.date)} />
  );
  renderDriverList = () => {
    const { data, refreshing } = this.props;
    const races = getRaces(data);
    return (
      <LazyList<Race>
        data={races}
        renderItem={this.renderItem}
        keyExtractor={raceKeyExtractor}
        onRefresh={this.reload}
        refreshing={refreshing}
        loadMore={this.loadMore}
      />
    );
  };
  render() {
    const { data } = this.props;
    return (
      <View justifyContent="center">
        {RemoteRaces.match(data, {
          Ok: this.renderDriverList,
          Loading: () => <ActivityIndicator size="large" />,
          default: e => <Text>{JSON.stringify(e)}</Text>,
        })}
      </View>
    );
  }
}
