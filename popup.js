var bg = chrome.extension.getBackgroundPage();

var round = bg.round;

// Get latest data when popup is opened.
// @todo. needs 2 times to open to see the real content.
bg._updateTimes();

var msg = '' +
    '<div style="color:' + (bg._isStatsForDayOk() ? 'green': 'red') + '">' +
      '<h2>Day</h2>' +
      'Total: ' + round(bg.times.day.billable + bg.times.day.nonBillable) + 'h / ' +  bg.config.minDayHours + 'h<br>' +
      'Billable: ' + bg.getBillablePercentDay() * 100 + '%' +
    '</div>' +
    '<div style="color:' + (bg.getBillablePercentWeek() > bg.config.minBillablePercent ? 'green': 'red') + '">' +
      '<h2>Week</h2>' +
      'Total: ' + round(bg.times.week.billable + bg.times.week.nonBillable) + 'h / ' + (bg.config.minDayHours * 5) + 'h<br>' +
      'Billable: ' + bg.getBillablePercentWeek() * 100 + '%' +
    '</div>' +
    '<div style="color:' + (bg._isStatsForMonthOk() ? 'green': 'red') + '">' +
      '<h2>Month</h2>' +
      'Total: ' + round(bg.times.month.billable + bg.times.month.nonBillable) + 'h / ' + (bg.config.minDayHours * 5) + 'h<br>' +
      'Billable: ' + bg.getBillablePercentMonth() * 100 + '%' +
    '</div>';
document.write(msg);

