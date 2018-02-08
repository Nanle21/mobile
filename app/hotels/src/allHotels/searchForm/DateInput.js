// @flow

import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import { DatePicker } from '@kiwicom/react-native-app-shared';

import type { OnChangeSearchParams } from './SearchParametersType';

type Props = {|
  checkin: Date | null,
  checkout: Date | null,
  onChange: (search: OnChangeSearchParams) => void,
|};

type DateInputType = 'checkin' | 'checkout';

export const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';

export const checkinAndCheckoutToDate = (
  checkin: moment,
  checkout: moment,
) => ({
  checkin: checkin.toDate(),
  checkout: checkout.toDate(),
});
const isCheckinLaterThanCheckout = (diff: number) => diff < 0;
const isCheckoutMoreThan30DaysFromCheckin = (diff: number) => diff > 30;
const isCheckoutEqualToCheckin = (diff: number) => diff === 0;
const getDiffFromCheckoutToCheckin = (checkout: moment, checkin: moment) =>
  moment(checkout).diff(checkin, 'days');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
  },
  datePicker: {
    flex: 1,
    marginRight: 10,
  },
});

export default class DateInput extends React.Component<Props> {
  handleCheckinChange = (date: string) => {
    const { checkin, checkout } = this.getCheckinAndCheckoutDatesAsMoment(
      date,
      'checkin',
    );
    const diff = getDiffFromCheckoutToCheckin(checkout, checkin);

    if (isCheckinLaterThanCheckout(diff) || isCheckoutEqualToCheckin(diff)) {
      this.handleDateChange(checkin, moment(checkin).add(1, 'days'));
    } else if (isCheckoutMoreThan30DaysFromCheckin(diff)) {
      this.handleDateChange(checkin, moment(checkin).add(30, 'days'));
    } else {
      this.handleDateChange(checkin, checkout);
    }
  };

  handleCheckoutChange = (date: string) => {
    const { checkin, checkout } = this.getCheckinAndCheckoutDatesAsMoment(
      date,
      'checkout',
    );
    const diff = getDiffFromCheckoutToCheckin(checkout, checkin);

    if (isCheckinLaterThanCheckout(diff) || isCheckoutEqualToCheckin(diff)) {
      this.handleDateChange(moment(checkout).subtract(1, 'days'), checkout);
    } else if (isCheckoutMoreThan30DaysFromCheckin(diff)) {
      this.handleDateChange(moment(checkout).subtract(30, 'days'), checkout);
    } else {
      this.handleDateChange(checkin, checkout);
    }
  };

  handleDateChange = (checkin: moment, checkout: moment) => {
    this.props.onChange(checkinAndCheckoutToDate(checkin, checkout));
  };

  getCheckinAndCheckoutDatesAsMoment = (
    datestring: string,
    type: DateInputType,
  ) => {
    const date = moment(datestring, DISPLAY_DATE_FORMAT);
    const checkin = type === 'checkin' ? date : moment(this.props.checkin);
    const checkout = type === 'checkout' ? date : moment(this.props.checkout);
    return { checkin, checkout };
  };

  render() {
    const props = this.props;

    return (
      <View style={styles.container}>
        <DatePicker
          placeholder="Start date"
          format={DISPLAY_DATE_FORMAT}
          date={props.checkin}
          minDate={new Date()}
          onDateChange={this.handleCheckinChange}
          style={styles.datePicker}
        />
        <DatePicker
          placeholder="End date"
          format={DISPLAY_DATE_FORMAT}
          date={props.checkout}
          minDate={moment()
            .add(1, 'day')
            .toDate()}
          onDateChange={this.handleCheckoutChange}
          style={styles.datePicker}
        />
      </View>
    );
  }
}