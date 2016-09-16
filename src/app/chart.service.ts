import { Injectable } from '@angular/core';
import { MomentService } from './moment.service';

function hex(hex) {
  if (/^#/.test(hex)) {
    hex = hex.slice(1);
  }
  if (hex.length !== 3 && hex.length !== 6) {
    throw new Error("Invaild hex String");
  }

  var digit = hex.split("");

  if (digit.length === 3) {
    digit = [digit[0], digit[0], digit[1], digit[1], digit[2], digit[2]]
  }
  var r = parseInt([digit[0], digit[1]].join(""), 16);
  var g = parseInt([digit[2], digit[3]].join(""), 16);
  var b = parseInt([digit[4], digit[5]].join(""), 16);
  return [r, g, b];
}

@Injectable()
export class ChartService {

  constructor(private moment: MomentService) { }

  protected _buildLineChart(chartMap, paymentMethodsMap, datesMap, datasetConfig) {
    datasetConfig = datasetConfig || {};

    var chart = {};

    // Fill everything with zeros
    Object.keys(chartMap).forEach(function (currency) {
      chart[currency] = {
        datasets: [],
        data: [],
        options: {
          scales: {
            xAxes: [{
              type: 'category',
              barPercentage: 1.0,
              categoryPercentage: 1.0,
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
      };

      var datePoints = Object.keys(datesMap[currency]).sort(),
          startDateMoment = this.moment(datePoints[0], 'YYYY-MM-DD'),
          startDateMomentFormatted = startDateMoment.format('YYYY-MM-DD'),
          endDate = datePoints[datePoints.length - 1];

      while(startDateMoment.isBefore(this.moment(endDate, 'YYYY-MM-DD'))) {
        startDateMoment.add(1, 'days');
        startDateMomentFormatted = startDateMoment.format('YYYY-MM-DD');

        if (datePoints.indexOf(startDateMomentFormatted) === -1) {
          datePoints.push(startDateMomentFormatted);
        }
      }

      datePoints = datePoints.sort();
      chart[currency].labels = datePoints;

      Object.keys(paymentMethodsMap[currency]).forEach(function(paymentMethodId) {
        var line = [];

        datePoints.forEach(function(date) {
          line.push(+((chartMap[currency][paymentMethodId] && chartMap[currency][paymentMethodId][date] || 0).toFixed(2)));
        });

        var color = paymentMethodsMap[currency][paymentMethodId].color || '#bbb';

        chart[currency].datasets.push(Object.assign({}, datasetConfig, {
          label: paymentMethodsMap[currency][paymentMethodId].name,
          borderColor: color,
          hoverBorderColor: color,
          backgroundColor: 'rgba(' + hex(color) + ',' + (datasetConfig.backgroundOpacity || '0.5') + ')',
          hoverBackgroundColor: 'rgba(' + hex(color) + ','  + (datasetConfig.backgroundOpacity || '0.5') + ')',
          pointBorderColor: color,
          pointHoverBorderColor: color,
          pointHoverBackgroundColor: color,
          pointBackgroundColor: "#fff"
        }));

        chart[currency].data.push(line);
      });
    });

    return chart;
  }

  protected _fillInMaps(transactions, chartMap, paymentMethodsMap, datesMap) {
    transactions.forEach(function(e) {
      var currency = e.paymentMethod.currency.code,
          date = this.moment(e.createdAt).format('YYYY-MM-DD');

      if (!chartMap[currency]) {
        chartMap[currency] = {};
      }

      if (!datesMap[currency]) {
        datesMap[currency] = {};
      }

      if (!paymentMethodsMap[currency]) {
        paymentMethodsMap[currency] = {};
      }

      if (!chartMap[currency][e.paymentMethod.id]) {
        chartMap[currency][e.paymentMethod.id] = {};
      }

      if (chartMap[currency][e.paymentMethod.id][date] === undefined) {
        chartMap[currency][e.paymentMethod.id][date] = 0;
      }

      paymentMethodsMap[currency][e.paymentMethod.id] = {
        name: e.paymentMethod.name,
        color: e.paymentMethod.color
      };
      datesMap[currency][date] = date;
      chartMap[currency][e.paymentMethod.id][date] += e.amount;
    });
  }

  buildTransactionsChart(transactions) {
    var chartMap = {},
        paymentMethodsMap = {},
        datesMap = {};

    // Don't include expenses/incomes for transfers
    transactions = transactions.filter(function(transaction) {
      return transaction.category || transaction.incomeCategory;
    });

    // Create a widely rarefied matrix of transactions
    this._fillInMaps(transactions, chartMap, paymentMethodsMap, datesMap);

    return this._buildLineChart(chartMap, paymentMethodsMap, datesMap, { borderWidth: 0, backgroundOpacity: 1  });
  };

  buildBalanceChart(expenses, incomes, paymentMethods) {
    var chartMap = {},
      paymentMethodsMap = {},
      datesMap = {},
      totalsMap = {};

    // Get all transactions sorted by reverse date order to do a retrospective analysis
    var transactions = incomes.concat(
      expenses.map(function(expense) {
        var e = Object.create({}, expense);
        e.amount *= -1;
        return e;
      })
    ).sort(function(a, b) {
      var diff = +this.moment(a.createdAt) - +this.moment(b.createdAt);
      return diff > 0 ? -1 : diff < 0 ? 1 : 0;
    });

    this._fillInMaps(transactions, chartMap, paymentMethodsMap, datesMap);

    paymentMethods.forEach(function(paymentMethod) {
      // set initial values for retrospective
      totalsMap[paymentMethod.id] = paymentMethod.initialAmount + paymentMethod.incomes - paymentMethod.expenses;

      // Add date points as initial dates
      var currency = paymentMethod.currency.code,
        date = this.moment(paymentMethod.createdAt).format('YYYY-MM-DD');

      if (!chartMap[currency]) {
        chartMap[currency] = {};
      }

      if (!datesMap[currency]) {
        datesMap[currency] = {};
      }

      if (!paymentMethodsMap[currency]) {
        paymentMethodsMap[currency] = {};
      }

      if (!chartMap[currency][paymentMethod.id]) {
        chartMap[currency][paymentMethod.id] = {};
      }

      if (chartMap[currency][paymentMethod.id][date] === undefined) {
        chartMap[currency][paymentMethod.id][date] = 0;
      }

      paymentMethodsMap[currency][paymentMethod.id] = {
        name: paymentMethod.name,
        color: paymentMethod.color
      };
      datesMap[currency][date] = date;
      chartMap[currency][paymentMethod.id][date] += paymentMethod.initialAmount;
    });

    Object.keys(chartMap).forEach(function(currency) {
      var datePoints = Object.keys(datesMap[currency]).sort(),
        startDateMoment = this.moment(datePoints[0], 'YYYY-MM-DD'),
        startDateMomentFormatted = startDateMoment.format('YYYY-MM-DD'),
        endDate = datePoints[datePoints.length - 1];

      while(startDateMoment.isBefore(this.moment(endDate, 'YYYY-MM-DD'))) {
        startDateMoment.add(1, 'days');
        startDateMomentFormatted = startDateMoment.format('YYYY-MM-DD');

        if (datePoints.indexOf(startDateMomentFormatted) === -1) {
          datePoints.push(startDateMomentFormatted);
        }
      }

      datePoints = datePoints.sort();
      datePoints.reverse();

      Object.keys(chartMap[currency]).forEach(function(paymentMethodId) {
        var previousChange = 0;
        datePoints.forEach(function(date) {
          totalsMap[paymentMethodId] -= previousChange;
          previousChange = chartMap[currency][paymentMethodId][date] || 0;
          chartMap[currency][paymentMethodId][date] = totalsMap[paymentMethodId];
        });
      });
    });

    return this._buildLineChart(chartMap, paymentMethodsMap, datesMap, { lineTension: 0,  backgroundOpacity: 0.25 });
  };

  buildCategoriesChart(transactions, categoryKey) {
    // Don't include expenses/incomes for transfers
    transactions = transactions.filter(function(transaction) {
      return transaction[categoryKey];
    });

    var categoriesMap = {};

    // Fill everything with zeros
    var chart = {};

    transactions.forEach(function(e) {
      var categoryId = e[categoryKey].id,
        currency = e.paymentMethod.currency.code;

      // Don't include expenses/incomes for transfers
      if (!categoryId) {
        return;
      }

      if (!categoriesMap[currency]) {
        categoriesMap[currency] = {};
      }

      if (!categoriesMap[currency][categoryId]) {
        categoriesMap[currency][categoryId] = {
          label: e[categoryKey].name,
          color: e[categoryKey].color || '#bbb',
          total: 0
        };
      }

      categoriesMap[currency][categoryId].total += e.amount;
    });

    Object.keys(categoriesMap).map(function(currency) {
      var colors = [],
        opacityColors = [],
        data = [],
        labels = [];

      Object.keys(categoriesMap[currency]).map(function(key) {
        data.push(categoriesMap[currency][key].total.toFixed(2));
        labels.push(categoriesMap[currency][key].label);
        colors.push(categoriesMap[currency][key].color || '#bbb');
        opacityColors.push('rgba(' + hex(colors[colors.length - 1]) + ',0.5)');
      });

      chart[currency] = {
        labels: labels,
        data: [data],
        options: {},
        datasets: [{
          borderColor: colors,
          hoverBorderColor: colors,
          backgroundColor: colors,
          hoverBackgroundColor: opacityColors
        }]
      };
    });

    return chart;
  }
}
