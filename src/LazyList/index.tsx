import * as React from "react";
import { FlatList, FlatListProps } from "react-native";
import { List } from "react-native-elements";

type Props<T> = {
  loadMore: () => void;
  onRefresh: () => void;
} & FlatListProps<T>;

export class LazyList<T = any> extends React.PureComponent<Props<T>> {
  render = () => {
    const { loadMore } = this.props;
    return (
      <List>
        <FlatList<T>
          onEndReached={loadMore}
          onEndReachedThreshold={2}
          {...this.props}
        />
      </List>
    );
  };
}
