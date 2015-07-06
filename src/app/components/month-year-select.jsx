import React from 'react';
import { DropDownMenu } from 'material-ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class MonthYearSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: (this.props.selected || this.props.min).getMonth(),
      currentYear: (this.props.selected || this.props.min).getFullYear()
    };

    this._onSelect = this._onSelect.bind(this);
    this._makeDate = this._makeDate.bind(this);
  }

  _onSelect(key, e, selectedIndex, menuItem) {
    // This resolves cases when changing the year sets the visualizer to year
    // for which the currently selected month would be disabled. We clamp the
    // month to within the acceptable range in this case.
    if (key === 'currentYear' ) {
      let year = menuItem.payload;
      if (year === this.props.min.getFullYear()) {
        if (this.state.currentMonth < this.props.min.getMonth()) {
          this.state.currentMonth = this.props.min.getMonth();
        }
      } else if (year === this.props.max.getFullYear()) {
        if (this.state.currentMonth > this.props.max.getMonth()) {
          this.state.currentMonth = this.props.max.getMonth();
        }
      }
    }

    this.state[key] = menuItem.payload;

    this.setState(this.state, () => {
      this.props.onChange(this._makeDate());
    });
  }

  _makeDate() {
    return new Date(this.state.currentYear, this.state.currentMonth);
  }

  render() {
    let minMonth = this.props.min.getMonth(),
      minYear = this.props.min.getFullYear(),
      maxMonth = this.props.max.getMonth(),
      maxYear = this.props.max.getFullYear();

    let years = Array.apply(null, Array(maxYear - minYear + 1)).map((v, i) => { return minYear + i; }),
      yearOptions = years.map(y => {
        return {
          payload: y,
          text: y
        };
      });

    let isMinYear = this.state.currentYear === minYear,
      isMaxYear = this.state.currentYear === maxYear,
      monthOptions = MONTHS.map((name, index) => {
        let m = {
          payload: index,
          text: name
        };

        if ((isMinYear && index < minMonth) || (isMaxYear && index > maxMonth)) {
          m.disabled = true;
        }

        return m;
      });

    return (
      <div style={{float: 'left'}}>
        <DropDownMenu
          menuItems={yearOptions}
          underlineStyle={{borderTop: 'none'}}
          selectedIndex={this.state.currentYear - minYear}
          onChange={this._onSelect.bind(this, 'currentYear')}/>
        <DropDownMenu
          menuItems={monthOptions}
          underlineStyle={{borderTop: 'none'}}
          selectedIndex={this.state.currentMonth}
          onChange={this._onSelect.bind(this, 'currentMonth')}/>
      </div>
    );
  }
}

export default MonthYearSelect;
