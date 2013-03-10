 /**
* @version: 1.0.1
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2012-08-20
* @copyright: Copyright (c) 2012 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
* 
* Modified by: xamess[at]gmail[dot]com
*
*
*/
!function ($) {

    var DateRangePicker = function (element, options, cb) {
        var hasOptions = typeof options == 'object'
        var localeObject;

        //state
        this.startDate = Date.today();
        this.endDate = Date.today();
        this.minDate = false;
        this.maxDate = false;
        this.ranges = {};
        this.calendar_num = 3;
        this.cb = function () { };
        this.format = 'yyyy-MM-dd';
        this.separator = ' - ';
        this.rangeSeparator = ', ';
        this.showWeekNumbers = false;
        this.buttonClasses = ['btn-success'];
        this.locale = {
            applyLabel: 'Apply',
            clearLabel:"Clear",
            weekLabel: 'W',
            daysOfWeek: Date.CultureInfo.shortestDayNames,
            monthNames: Date.CultureInfo.monthNames,
            firstDay: 1
        };
        this.rangeType = 'singleRange'; // multiSameRange, multiDiffRange

        this.changed = false;
        this.cleared = false;
        this.calendarList = [];
        this.clickCount = 0;

        localeObject = this.locale;

        
        for (var i = 0; i < this.calendar_num; i++ ) {
            this.calendarList.push({
                month: Date.today().set({
                    day: 1, 
                    month: this.startDate.getMonth(), 
                    year: this.startDate.getFullYear() }
                ).add({
                    months: i - this.calendar_num + ( this.calendar_num > 2 ? 2 : 1)
                }),
                calendar: Array()
            })
        }

        //element that triggered the date range picker
        this.element = $(element);

        if (this.element.is('input')) {
            this.element.on({
                click: $.proxy(this.show, this),
                focus: $.proxy(this.show, this)
            });
        } else {
            this.element.on('click', $.proxy(this.show, this));
        }

        if (hasOptions) {
            if(typeof options.locale == 'object') {
                $.each(localeObject, function (property, value) {
                    localeObject[property] = options.locale[property] || value;
                });
            }
        }

        var clist = '';
        for( var i in this.calendarList ) {
            clist += '<div class="calendar list num_' + (this.calendar_num - i - 1) + '"></div>';
        }

        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="ranges">' +
                '</div>' +
                clist +
                '<div class="controls">' + 
                    '<button class="btn btn-small btn-success applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>&nbsp;' +
                    '<button class="btn btn-small clearBtn">' + this.locale.clearLabel + '</button>' +
                    '<ul class="range-types">' +
                        '<li id="singleRange" class="active">Single range</li>' +
                        '<li id="multiSameRange">Multi range previous</li>' +
                        '<li id="multiDiffRange">Multi range custom</li>' +
                    '</ul>' + 
                '</div>' +
              '</div>';

        this.container = $(DRPTemplate).appendTo('body');

        if (hasOptions) {

            if (typeof options.format == 'string')
                this.format = options.format;

            if (typeof options.separator == 'string')
                this.separator = options.separator;

            if (typeof options.startDate == 'string')
                this.startDate = Date.parse(options.startDate, this.format);

            if (typeof options.endDate == 'string')
                this.endDate = Date.parse(options.endDate, this.format);

            if (typeof options.minDate == 'string')
                this.minDate = Date.parse(options.minDate, this.format);

            if (typeof options.maxDate == 'string')
                this.maxDate = Date.parse(options.maxDate, this.format);

            if (typeof options.startDate == 'object')
                this.startDate = options.startDate;

            if (typeof options.endDate == 'object')
                this.endDate = options.endDate;

            if (typeof options.minDate == 'object')
                this.minDate = options.minDate;

            if (typeof options.maxDate == 'object')
                this.maxDate = options.maxDate;

            if (typeof options.ranges == 'object') {
                for (var range in options.ranges) {

                    var start = options.ranges[range][0];
                    var end = options.ranges[range][1];

                    if (typeof start == 'string')
                        start = Date.parse(start);

                    if (typeof end == 'string')
                        end = Date.parse(end);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start < this.minDate)
                        start = this.minDate;

                    if (this.maxDate && end > this.maxDate)
                        end = this.maxDate;

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end < this.minDate) || (this.maxDate && start > this.maxDate))
                    {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }

            // update day names order to firstDay
            if (typeof options.locale == 'object') {
                if (typeof options.locale.firstDay == 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }
            }

            if (typeof options.showWeekNumbers == 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses == 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses == 'object') {
                this.buttonClasses = options.buttonClasses;
            }

        }

        //apply CSS classes to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });

        if (typeof options == 'undefined' || typeof options.ranges == 'undefined')
            this.container.find('.calendar').show();

        if (typeof cb == 'function')
            this.cb = cb;

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));
        // листалки "вперед назад"
        this.container.find('.calendar').on('click', '.prev', $.proxy(this.clickPrev, this));
        this.container.find('.calendar').on('click', '.next', $.proxy(this.clickNext, this));
        
        // применить/отменить
        this.container.find('.controls').on('click', 'button.applyBtn', $.proxy(this.clickApply, this));
        this.container.find('.controls').on('click', 'button.clearBtn', $.proxy(this.clickClear, this));

        this.container.find('.calendar').on('click', 'td.available', $.proxy(this.clickDate, this));
        this.container.find('.ranges').on('click', 'li', $.proxy(this.clickRange, this));
        this.container.find('.ranges').on('mouseenter', 'li', $.proxy(this.enterRange, this));
        this.container.find('.ranges').on('mouseleave', 'li', $.proxy(this.updateView, this));

        // кнопки типов диапазонов
        this.container.find('.range-types').on('click', 'li', $.proxy(this.clickRangeType, this));


        this.element.on('keyup', $.proxy(this.updateFromControl, this));

        if( !this.updateFromControl() ) {
            this.updateView(1);
            this.updateCalendars();
        }
        
    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        clickRangeType: function(e) {
            $(e.target).parent().find(".active").toggleClass("active");
            var oldType = this.rangeType;
            this.rangeType = $(e.target).attr('id');
            $(e.target).toggleClass("active");
            
            if ( oldType != this.rangeType ) {
                this.changed = true;    
            }
            if ( this.rangeType == 'multiDiffRange' && !this.startDate2 && !this.endDate2) {
                this.clickCount = 2;
            }
            else if ( this.clickCount >= 2 ) {
                this.clickCount = 0;
            }
            this.updateCalendars();
        },

        updateMiltiRange: function () {
            if ( this.rangeType == 'singleRange' ) {
                this.startDate2 = null;
                this.endDate2 = null;
            }
            else if ( this.rangeType == 'multiSameRange' ) {
                var dayDiff = parseInt((this.endDate - this.startDate) / 86400000); 
                this.endDate2 = this.startDate.clone().add({days: -1});
                this.startDate2 = this.endDate2.clone().add({days: -1 * dayDiff })
                this.changed = true;
            }
            else {

            }
        },
        mousedown: function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        updateView: function (e) {
            //проверить входит ли дата в показываемые календарные месяцы, если да - не перерендеривать
            if ( e === 1 ) {
                for(var i = 0; i < this.calendar_num; i++) {
                    this.calendarList[this.calendar_num - 1 - i].month.set({
                        month: this.endDate.getMonth(),
                        year: this.endDate.getFullYear(),
                    }).add({
                        months: 1 + -1 * i
                    });
                }
            }

            if (this.startDate.equals(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;

            var dateRanges = this.element.val().split(new RegExp('\\s*' + this.rangeSeparator + '\\s*'));
            //console.log(dateRanges);
            
            var dateString = dateRanges[dateRanges.length - 1].split(this.separator);
            var start = Date.parseExact(dateString[0], this.format);
            var end = Date.parseExact(dateString[1], this.format);

            if (start == null || end == null) return;
            if (end.isBefore(start)) {
                this.startDate = end;
                this.endDate = start;
            }
            else {
                this.startDate = start;
                this.endDate = end;
            }

            if (dateRanges.length === 2 ) {
                var dateString = dateRanges[0].split(this.separator);
                var start = Date.parseExact(dateString[0], this.format);
                var end = Date.parseExact(dateString[1], this.format);

                if (start == null || end == null) return;
                if (end.isBefore(start)) {
                    this.startDate2 = end;
                    this.endDate2 = start;
                }
                else {
                    this.startDate2 = start;
                    this.endDate2 = end;
                }
                this.container.find(".active").toggleClass("active");
                this.container.find("#multiDiffRange").toggleClass("active");
                this.rangeType = 'multiDiffRange';
            }
            //console.log([this.startDate, this.endDate, this.startDate2, this.endDate2]);
            this.updateView(1);
            this.cb(this.startDate, this.endDate);
            this.updateCalendars();
            return 1;
        },

        notify: function () {
            if (!this.cleared) {
                //this.updateView(1);
            }
            //console.log(this.rangeType);
            if (this.element.is('input')) {
                var val = '';
                if ( this.cleared  ) {
                    //
                }
                else if ( this.rangeType != 'singleRange' && this.startDate2 && this.endDate2) {
                    val =   this.startDate.toString(this.format) + 
                            this.separator + 
                            this.endDate.toString(this.format) +
                            this.rangeSeparator + 
                            this.startDate2.toString(this.format) + 
                            this.separator + 
                            this.endDate2.toString(this.format);
                }
                else {
                    val =   this.startDate.toString(this.format) + 
                            this.separator + 
                            this.endDate.toString(this.format);

                }
                this.element.val(val);

            }
            var arg1 = (this.cleared ? null : this.startDate),
                arg2 = (this.cleared ? null : this.endDate);
            this.cleared = false;
            this.cb(arg1,arg2);
        },

        move: function () {
            this.container.css({
                top: this.element.offset().top + this.element.outerHeight(),
                left: this.element.offset().left,
                right: 'auto'
            });
        },

        show: function (e) {
            this.container.show();
            this.move();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            this.changed = false;
            this.element.trigger('shown',{target:e.target,picker:this});
            $(document).on('mousedown', $.proxy(this.hide, this));
            this.container.find('.calendar').show();
            this.clickCount = 0;
        },

        hide: function (e) {
            this.container.hide();
            $(document).off('mousedown', this.hide);

            if (this.changed) {
                this.changed = false;
                this.notify();
            }
        },

        enterRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView(1);
            }
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;            
            var dates = this.ranges[label];

            this.startDate = dates[0];
            this.endDate = dates[1];

            this.container.find(".active").toggleClass("active");
            this.container.find("#singleRange").toggleClass("active");
            this.rangeType = 'singleRange';
            this.startDate2 = null;
            this.endDate2 = null;

            this.updateView(1);
            this.updateCalendars();
            this.changed = true;

            this.container.find('.calendar').hide();
            this.hide();
        },

        // стрелка "назад" при просмтре прошлых дат
        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            for(var i in this.calendarList) {
                this.calendarList[i].month.add({ months: -1 });   
            }
            this.updateCalendars();
        },

        // стрелка "вперед" при просмтре прошлых дат
        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            for(var i in this.calendarList) {
                this.calendarList[i].month.add({ months: 1 });   
            }
            this.updateCalendars();
        },

        // при движении мышкой по календарю
        enterDate: function (e) {
            var title = $(e.target).attr('title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cnum = title.substr(5, 1);
            var cal = $(e.target).parents('.calendar');
        },
        // при клике по ячейке календаря
        clickDate: function (e) {
            var title = $(e.target).attr('title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cnum = title.substr(5, 1);
            var cal = $(e.target).parents('.calendar');
            var startDate, startDate2, endDate, endDate2;
            
            this.clickCount++;
            // singleRange
            if ( this.clickCount === 1 ) {
                startDate = this.calendarList[cnum].calendar[row][col];
                this.endDate = startDate;
                endDate = this.endDate;
            }
            else if ( this.clickCount === 2 ) {
                startDate = this.startDate;
                endDate = this.calendarList[cnum].calendar[row][col];
            }
            // multiDiffRange
            else if ( this.clickCount === 3 ) {
                startDate2 = this.calendarList[cnum].calendar[row][col];
                this.endDate2 = startDate2;
                endDate2 = this.endDate2;
            }
            else if ( this.clickCount === 4 ) {
                startDate2 = this.startDate2;
                endDate2 = this.calendarList[cnum].calendar[row][col];
            }

            // single range
            if ( this.clickCount <= 2 ) {
                if (startDate.equals(endDate) || startDate.isBefore(endDate)) {
                    if (!startDate.equals(this.startDate) || !endDate.equals(this.endDate))
                        this.changed = true;
                    this.startDate = startDate;
                    this.endDate = endDate;
                }
                else if (startDate.isAfter(endDate)) {
                    //$(e.target).addClass('active');
                    this.changed = true;
                    this.endDate = startDate;
                    this.startDate = endDate;
                }

                this.startDate2 = null;
                this.endDate2 = null;
            }
            // multi range
            else if( this.clickCount >= 3 ) {
                if (startDate2.equals(endDate2) || startDate2.isBefore(endDate2)) {
                    if (!startDate2.equals(this.startDate2) || !endDate2.equals(this.endDate2))
                        this.changed = true;
                    this.startDate2 = startDate2;
                    this.endDate2 = endDate2;
                }
                else if (startDate2.isAfter(endDate2)) {
                    //$(e.target).addClass('active');
                    this.changed = true;
                    this.endDate2 = startDate2;
                    this.startDate2 = endDate2;
                }
            }

            if ((this.clickCount === 2 && this.rangeType != 'multiDiffRange') ||
                (this.clickCount === 4 && this.rangeType == 'multiDiffRange') ) {
                this.clickCount = 0;
            }
            this.updateCalendars();
        },
        // кнопанька "применить"
        clickApply: function (e) {
            this.hide();
        },
        // кнопанька "отменить"
        clickClear: function (e) {
            this.changed = true;
            this.cleared = true;
            this.hide();
        },

        updateCalendars: function () {
            this.updateMiltiRange();
            for(var i in this.calendarList ) {
                this.calendarList[i].calendar = this.buildCalendar(
                    this.calendarList[i].month.getMonth(), 
                    this.calendarList[i].month.getFullYear()
                );
                this.container.find('.calendar.list.num_' + i).html(
                    this.renderCalendar(this.calendarList[i].calendar, i)
                );
            }
            //console.log(JSON.stringify(this.calendarList,null,4));
            this.element.trigger('updated',this);
        },

        getCellClass:  function(cellDate, is_on) {
            // куски других месяцев сверху и снизу
            if (!is_on) return 'off';
            // меньше минимальной допустимой даты
            if ( this.minDate && cellDate < thus.minDate ) return 'off disabled';
            // больше максимальной допустимой даты
            if ( this.maxDate && cellDate > this.maxDate ) return 'off disabled';
            
            var cname   = '',
                type    = '';

            if (cellDate.equals(this.startDate)) 
                cname += ' active start-date '
            else if (cellDate.equals(this.endDate))
                cname += ' active end-date '
            else if (cellDate >= this.startDate && cellDate <= this.endDate) 
                cname += ' in-range '

            else if (this.startDate2 && cellDate.equals(this.startDate2)) 
                cname += ' active start-date second-range '
            else if (this.endDate2 && cellDate.equals(this.endDate2))
                cname += ' active end-date second-range '
            else if (cellDate >= this.startDate2 && cellDate <= this.endDate2)
                cname += ' in-range second-range '

            else if (cellDate.equals(Date.today())) 
                cname = 'today'
            
            if ( this.rangeType == 'multiDiffRange' && this.clickCount >= 2 ) {
                if ( this.clickCount === 3 ) {
                    if ( this.startDate2 < this.startDate && cellDate < this.startDate )
                        type = ' available'
                    else if ( this.startDate2 > this.endDate && cellDate > this.endDate )
                        type = ' available '
                    else
                        type = ' disabled '
                }
                else if ( this.clickCount === 2 ) {
                    if ( cellDate < this.startDate || cellDate > this.endDate )
                        type = ' available '
                    else
                        type = ' disabled '
                }
                else
                    type = ' disabled '
            }
            else
                type = ' available '


            return cname + type;
        },
        // построить массив календаря
        buildCalendar: function (month, year) {

            var firstDay = Date.today().set({ day: 1, month: month, year: year });
            var lastMonth = firstDay.clone().add(-1).day().getMonth();
            var lastYear = firstDay.clone().add(-1).day().getFullYear();

            var daysInMonth = Date.getDaysInMonth(year, month);
            var daysInLastMonth = Date.getDaysInMonth(lastYear, lastMonth);

            var dayOfWeek = firstDay.getDay();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = Array();
            for (var i = 0; i < 6; i++) {
                calendar[i] = Array();
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = Date.today().set({ day: startDay, month: lastMonth, year: lastYear });
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = curDate.clone().add(1).day()) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate;
            }

            return calendar;

        },

        // массив календаря в html
        renderCalendar: function (calendar, cnum) {
            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr class="cheader">';
            
            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';
            
            if (cnum == 0 && (!this.minDate || this.minDate < calendar[1][1])) {

                html += '<th class="prev available"><i class="icon-arrow-left"></i></th>';
            }
            else {
                html += '<th></th>';
            }
            html += '<th colspan="5" style="width: auto">' + this.locale.monthNames[calendar[1][1].getMonth()] + calendar[1][1].toString(" yyyy") + '</th>';

            if (cnum == (this.calendar_num - 1) && (!this.maxDate || this.maxDate > calendar[1][1])) {
                html += '<th class="next available"><i class="icon-arrow-right"></i></th>';
            }
            else {
                 html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';
            
            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';
                
                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].getWeek() + '</td>';
                
                for (var col = 0; col < 7; col++) {
                    var is_on = (calendar[row][col].getMonth() == calendar[1][1].getMonth()); // in month
                    var cname = this.getCellClass(calendar[row][col], is_on);
                    var title = 'r' + row + 'c' + col + 'c' + cnum;
                    html += '<td class="' + 
                        cname.replace(/\s+/g,' ').replace(/^\s?(.*?)\s?$/,'$1') + 
                        '" title="' + title + '">' + calendar[row][col].getDate() + 
                    '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            return html;

        }

    };

    $.fn.daterangepicker = function (options, cb) {
      this.each(function() {
        var el = $(this);
        if (!el.data('daterangepicker'))
          el.data('daterangepicker', new DateRangePicker(el, options, cb));
      });
      return this;
    };

} (window.jQuery);
