import React, { Component } from 'react';
import FilterableTable from 'react-filterable-table';
import { Header } from 'semantic-ui-react';

import { getMonthlyMileage } from '../int/Masters';


const fields = [
  { name: 'month', displayName: 'Month', inputFilterable: true, sortable: true },
  { name: 'vehicleNo', displayName: 'Vehicle', inputFilterable: true, exactFilterable: true, sortable: true },
  { name: 'vehicleType', displayName: 'Vehicle Type', inputFilterable: true, exactFilterable: true, sortable: true },
  { name: 'totalDistance', displayName: 'KMs in Month', inputFilterable: true, exactFilterable: true, sortable: true },
  { name: 'totalFuel', displayName: 'Diesel in Lts', inputFilterable: true, exactFilterable: true, sortable: true },
  { name: 'mileage', displayName: 'Mileage', inputFilterable: true, exactFilterable: true, sortable: true }
];

class Sundry extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
  }

  componentDidMount() {
    this.loadInitialData();
  }

  loadInitialData() {
    getMonthlyMileage().then((rows) => {
      console.log('DATA=', rows);
      const data = [];
      if (rows) {
        if(rows && rows.length) {
          rows.forEach((row, idx) => {
            console.log('ROW=', idx, JSON.stringify(row, null, 2));
            const { totalDistance = 0, totalFuel = 0, month, vehicleNo, vehicleType } = row;
            let mileage = 0
            if (totalFuel) {
              mileage = totalDistance / totalFuel;
            }
            data.push({
              month,
              totalDistance: totalDistance ? totalDistance.toFixed(2) : 0,
              totalFuel: totalFuel ? totalFuel.toFixed(2) : 0,
              vehicleNo,
              vehicleType,
              mileage: mileage ? mileage.toFixed(2) : 0
            });
          });
        }
        this.setState({
          data,
          loading: false,
        });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({
        loading: false,
        errorMsg: 'DB ACCESS ERROR'
      });
    });
  }

  render() {
    const { data = [] } = this.state;
    const pageSizes = [50, 100];
    return (
      <div className="billing">
        <Header as='h1'>MILEAGE SEARCH</Header>
        <FilterableTable
          namespace="People"
          initialSort="month"
          data={data}
          fields={fields}
          tableClassName="ui table mileage"
          roRecordsMessage="There are no records to display"
          noFilteredRecordsMessage="No records match your filters!"
          pageSize={100}
          topPagerVisible={false}
          pageSizes={pageSizes}
        />
      </div>
    );
  }

}

export default Sundry;
