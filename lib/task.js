/**
 * @license
 * Copyright (c) 2015 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const XP  = require('expandjs'),
    RRule = require('rrule').RRule;

/*********************************************************************/

/**
 * A class used by XPSchedule to provide scheduling functionality.
 *
 * @class Task
 * @since 1.0.0
 * @description A class used by XPSchedule to provide scheduling functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-scheduler/blob/master/lib/task.js
 */
module.exports = new XP.Class('Task', {

    /**
     * @constructs
     * @param {Object} [options] The task's options
     *   @param {Date} [options.endDate] The recurrence's date limit
     *   @param {string} [options.frequency = "precise"] The recurrence's repetition frequency
     *   @param {number} [options.interval] The interval between each recurrence's iteration
     *   @param {number} [options.iterations = 1] The number of recurrence's iterations
     *   @param {number} [options.month] The recurrence's month
     *   @param {number} [options.monthDay] The recurrence's day of the month
     *   @param {Date} [options.startDate] The recurrence's start date
     *   @param {string} [options.startTime] The recurrence's start time
     *   @param {string} [options.week] The recurrence's week
     *   @param {string} [options.weekDay] The recurrence's day of the week
     *   @param {Array} [options.weekDays] The recurrence's days of the week
     */
    initialize(options) {

        // Setting
        this.options    = options;
        this.endDate    = this.options.endDate || null;
        this.frequency  = this.options.frequency || 'precise';
        this.interval   = this.options.interval || null;
        this.iterations = this.frequency !== 'precise' ? this.options.iterations || null : 1;
        this.month      = this.options.month || null;
        this.monthDay   = this.options.monthDay || null;
        this.startDate  = this.options.startDate || new Date();
        this.startTime  = this.options.startTime || null;
        this.week       = this.options.week || null;
        this.weekDay    = this.options.weekDay || null;
        this.weekDays   = this.options.weekDays || [];

        // Adapting
        this.adaptee = new RRule({
            freq: RRule[this.frequencies[this.frequency]],
            interval: this.interval,
            count: this.iterations,
            byweekday: this.weekDay ? RRule[this.days[this.weekDay]] : this.weekDays.map(day => RRule[this.days[day]]),
            bymonth: this.month,
            bymonthday: this.monthDay,
            byhour: this.startTime && XP.toDefined(XP.toFinite(this.startTime.match(XP.timeRegex)[1])),
            byminute: this.startTime && XP.toDefined(XP.toFinite(this.startTime.match(XP.timeRegex)[2])),
            bysecond: this.startTime && XP.toDefined(XP.toFinite(this.startTime.match(XP.timeRegex)[4])),
            bysetpos: this.week && this.weeks[this.week],
            dtstart: this.startDate,
            until: this.endDate
        });
    },

    /*********************************************************************/

    /**
     * The map of possible recurrence's days.
     *
     * @property days
     * @type Object
     * @readonly
     */
    days: {
        frozen: true,
        writable: false,
        value: {mo: 'MO', tu: 'TU', we: 'WE', th: 'TH', fr: 'FR', sa: 'SA', su: 'SU'}
    },

    /**
     * The recurrence's date limit.
     *
     * @property endDate
     * @type Date
     */
    endDate: {
        set(val) { return XP.isDefined(this.endDate) ? this.endDate : val; },
        validate(val) { return !XP.isNull(val) && !XP.isDate(val) && 'Date'; }
    },

    /**
     * The map of possible recurrence's frequencies.
     *
     * @property frequencies
     * @type Object
     * @readonly
     */
    frequencies: {
        frozen: true,
        writable: false,
        value: {
            daily: 'DAILY',
            hourly: 'HOURLY',
            minutely: 'MINUTELY',
            monthly: 'MONTHLY',
            precise: 'YEARLY',
            secondly: 'SECONDLY',
            weekly: 'WEEKLY',
            yearly: 'YEARLY'
        }
    },

    /**
     * The recurrence's repetition frequency.
     *
     * By default, the recurrence won't be repeated.
     *
     * @property frequency
     * @type string
     * @default "precise"
     */
    frequency: {
        set(val) { return this.frequency || val; },
        validate(val) { return !this.frequencies[val] && 'string'; }
    },

    /**
     * The interval between each recurrence's iteration.
     *
     * @property interval
     * @type number
     */
    interval: {
        set(val) { return XP.isDefined(this.interval) ? this.interval : val; },
        validate(val) { return !XP.isNull(val) && (!XP.isInt(val) || val < 1) && 'number'; }
    },

    /**
     * The number of recurrence's iterations.
     *
     * @property iterations
     * @type number
     */
    iterations: {
        set(val) { return XP.isDefined(this.iterations) ? this.iterations : val; },
        validate(val) { return !XP.isNull(val) && (!XP.isInt(val) || val < 1) && 'number'; }
    },

    /**
     * The recurrence's month.
     *
     * @property month
     * @type number
     */
    month: {
        set(val) { return XP.isDefined(this.month) ? this.month : val; },
        validate(val) { return !XP.isNull(val) && (!XP.isInt(val) || val < 1 || val > 12) && 'number'; }
    },

    /**
     * The recurrence's day of the month.
     *
     * @property monthDay
     * @type number
     */
    monthDay: {
        set(val) { return XP.isDefined(this.monthDay) ? this.monthDay : val; },
        validate(val) { return !XP.isNull(val) && (!XP.isInt(val) || val < 1 || val > 31) && 'number'; }
    },

    /**
     * The date of the next recurrence's iteration.
     *
     * @property nextDate
     * @type Date
     * @readonly
     */
    nextDate: {
        get() { return this.adaptee && this.adaptee.after(new Date()); }
    },

    /**
     * The recurrence's start date.
     *
     * @property startDate
     * @type Date
     */
    startDate: {
        set(val) { return XP.isDefined(this.startDate) ? this.startDate : val; },
        validate(val) { return !XP.isNull(val) && !XP.isDate(val) && 'Date'; }
    },

    /**
     * The recurrence's start time.
     *
     * @property startTime
     * @type string
     */
    startTime: {
        set(val) { return XP.isDefined(this.startTime) ? this.startTime : val; },
        validate(val) { return !XP.isNull(val) && !XP.isTime(val) && 'string'; }
    },

    /**
     * The recurrence's week.
     *
     * @property week
     * @type string
     */
    week: {
        set(val) { return XP.isDefined(this.week) ? this.week : val; },
        validate(val) { return !XP.isNull(val) && !this.weeks[val] && 'string'; }
    },

    /**
     * The recurrence's day of the week.
     *
     * @property weekDay
     * @type string
     */
    weekDay: {
        set(val) { return XP.isDefined(this.weekDay) ? this.weekDay : val; },
        validate(val) { return !XP.isNull(val) && !this.days[val] && 'string'; }
    },

    /**
     * The recurrence's day of the weeks.
     *
     * @property weekDays
     * @type Array
     */
    weekDays: {
        set(val) { return this.weekDays || val; },
        validate(val) { return (!XP.isArray(val) || !val.every(val => this.days[val])) && 'Array'; }
    },

    /**
     * The map of possible recurrence's weeks.
     *
     * @property weeks
     * @type Object
     * @readonly
     */
    weeks: {
        frozen: true,
        writable: false,
        value: {first: 1, second: 2, third: 3, fourth: 4, last: -1}
    }
});
