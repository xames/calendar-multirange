# Multi Date Range Picker for Twitter Bootstrap

## Original Calendar

https://github.com/dangrossman/bootstrap-daterangepicker

## Multi date range selection

![SingleRange]()
![MultiRange1]()
![MultiRange2]()

## Usage

Basic usage:

```
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="date.js"></script>
<script type="text/javascript" src="daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="bootstrap.css" />
<link rel="stylesheet" type="text/css" href="daterangepicker.css" />

<script type="text/javascript">
$(document).ready(function() {
  $('input[name="daterange"]').daterangepicker();
});
</script>
```

Additional options allow:
* Support SingleRagne selection and MultiRagne Selection
* Custom callback handler called when the date range selection is made
* Setting initial start and end dates for the calendars
* Bounding the minimum and maximum selectable dates
* Overriding all labels in the interface with localized text
* Starting the calendar week on any day of week
* Setting the date format string for parsing and printing dates
* Showing week numbers

Syntax for all the options can be found in the examples.html file.


