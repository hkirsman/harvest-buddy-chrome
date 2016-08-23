var config = {
    'minBillablePercent': 0.7,
    'minDayHours': 7.5,
    'workdayEnds': {
      'hour': 18, // 0 - 23.
      'minute': 0 // 0 - 59.
    },
    colorBarOk: '#92CD00',
    colorBarNotOk: 'red'
  },
  times = {
    'month': {
      'billable': 0,
      'nonBillable': 0
    },
    'week': {
      'billable': 0,
      'nonBillable': 0
    },
    'day': {
      'billable': 0,
      'nonBillable': 0
    }
  },
  canvas,
  svgButtonBarMonth,
  svgButtonBarWeek,
  svgButtonBarDay;

/**
 * Get month times from Harvest.
 * @private
 */
var _getTimesMonth = function() {
  var date = new Date(),
      firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10).split('-').join(''),
      lastDayofMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;
  $.get('https://mearra.harvestapp.com/reports/users/960362?from=' + firstDayOfMonth + '&kind=month&till=' + lastDayofMonth, function(data) {
    $html = $(data);
    if ($html.find('span.billable-percent-key').length) {
      billable = parseFloat($html.find('span.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('span.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }

    times.month = {
      "billable": billable,
      "nonBillable": nonBillable
    };
  });
};

/**
 * Get week times from Harvest.
 * @private
 */
var _getTimesWeek = function() {
  var curr = new Date, // Get current date.
      first = curr.getDate() - curr.getDay(), // First day is the day of the month - the day of the week
      last = first + 6, // Last day is the first day + 6
      firstday = new Date(curr.setDate(first)).toISOString().slice(0, 10).split('-').join(''),
      lastday = new Date(curr.setDate(last)).toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;
  $.get('https://mearra.harvestapp.com/reports/users/960362?from=' + firstday + '&kind=custom&till=' + lastday, function(data) {
    $html = $(data);
    if ($html.find('span.billable-percent-key').length) {
      billable = parseFloat($html.find('span.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('span.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }

    times.week = {
      "billable": billable,
      "nonBillable": nonBillable
    };
  });
};

/**
 * Get day times from Harvest.
 * @private
 */
var _getTimesDay = function() {
  var today = new Date().toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;

  $.get('https://mearra.harvestapp.com/reports/users/960362?from=' + today + '&kind=custom&till=' + today, function(data) {
    $html = $(data);
    if ($html.find('SPAN.billable-percent-key').length) {
      billable = parseFloat($html.find('SPAN.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('SPAN.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }
    times.day = {
      "billable": billable,
      "nonBillable": nonBillable
    };
    _updateDayBar();
  });
};

var _updateDayBar = function() {
  var
    dayOk = false,
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    day = new Date().getDate(),
    hours = config.workdayEnds.hour,
    minutes = config.workdayEnds.minute,
    seconds = 0,
    milliseconds = 0,
    workdayEndsDate = new Date(year, month, day, hours, minutes, seconds, milliseconds),
    timediff = workdayEndsDate.getTime() - new Date().getTime(),
    totalDayTime = times.day.billable + times.day.nonBillable,
    billableDayPercent = times.day.billable / totalDayTime;

  if (timediff <= 0) {
    // If workday is over.

    if (billableDayPercent >= config.minBillablePercent && totalDayTime >= config.minDayHours) {
      dayOk = true;
    }
    else {
      dayOk = false;
    }
  }
  else {
    // If workday is not over.

    if (billableDayPercent >= config.minBillablePercent && totalDayTime + (timediff / (1000 * 60 * 60)) >= config.minDayHours) {
      dayOk = true;
    }
    else {
      dayOk = false;
    }
  }

  if (dayOk) {
    _drawDayBar(config.colorBarOk);
  }
  else {
    _drawDayBar(config.colorBarNotOk)
  }
};

_drawDayBar = function(color) {
  var context = canvas.getContext('2d');
  context.beginPath();
  context.rect(1, 0, 5, 19);
  context.fillStyle = color;
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
};

function _drawInitialButton() {
  canvas = document.createElement('canvas'); // Create the canvas
  canvas.width = 19;
  canvas.height = 19;

  var context = canvas.getContext('2d');
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 19, 19);

  _drawDayBar(config.colorBarOk);

  context = canvas.getContext('2d');
  context.beginPath();
  context.rect(7, 0, 5, 19);
  context.fillStyle = "#92CD00";
  context.fill();

  context = canvas.getContext('2d');
  context.beginPath();
  context.rect(13, 0, 5, 19);
  context.fillStyle = "#92CD00";
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
}

var _updateTimes = function() {
  _getTimesMonth();
  _getTimesWeek();
  _getTimesDay();
};

_drawInitialButton();

_updateTimes();
setInterval(_updateTimes, 1000 * 60 * 5);
