/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const XP      = require('expandjs'),
    XPEmitter = require('xp-emitter'),
    Task      = require('./task');

/*********************************************************************/

/**
 * A server side class used to provide scheduling functionality.
 *
 * @class XPScheduler
 * @extends XPEmitter /bower_components/xp-emitter/lib/index.js
 * @since 1.0.0
 * @description A server side class used to provide scheduling functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-scheduler/blob/master/lib/index.js
 */
module.exports = global.XPScheduler = new XP.Class('XPScheduler', {

    // EXTENDS
    extends: XPEmitter,

    /*********************************************************************/

    /**
     * @constructs
     * @param {Object} [options] The scheduler's options.
     *   @param {number} [options.interval = 60000] The polling interval.
     */
    initialize(options) {

        // Super
        XPEmitter.call(this);

        // Setting
        this.scheduled = {};
        this.options   = options;
        this.interval  = this.options.interval || 60000;

        // Polling
        setInterval(() => this.emit('poll'), this.interval);
    },

    /*********************************************************************/

    /**
     * Adds the provided `handler` to the poll event and invokes it.
     *
     * @method poll
     * @param {Function} handler
     */
    poll(handler) {

        // Asserting
        XP.assertArgument(XP.isFunction(handler), 1, 'Function');

        // Listening
        this.on('poll', handler);

        // Handling
        handler();
    },

    /**
     * Adds a scheduled task.
     *
     * @method schedule
     * @param {Date} date
     * @param {string} [id]
     * @param {Function} [handler]
     * @returns {string}
     */
    schedule: {
        callback: true,
        value(date, id, handler) {

            // Asserting
            XP.assertArgument(XP.isDate(date), 1, 'Date');
            XP.assertArgument(XP.isVoid(id) || XP.isString(id, true), 2, 'string');
            XP.assertArgument(XP.isFunction(handler), 3, 'Function');

            // Preparing
            if (!id) { id = XP.uuid(); }

            // Unscheduling
            if (this.scheduled[id]) { this.unschedule(id); }

            // Setting
            this.scheduled[id] = setTimeout(() => { delete this.scheduled[id]; handler(); }, date - Date.now());

            // Returning
            return id;
        }
    },

    /**
     * Returns a new task.
     *
     * @method task
     * @param {Object} options
     *   @param {Date} [options.endDate]
     *   @param {string} [options.frequency = "precise"]
     *   @param {number} [options.interval]
     *   @param {number} [options.iterations]
     *   @param {number} [options.month]
     *   @param {number} [options.monthDay]
     *   @param {Date} [options.startDate]
     *   @param {string} [options.startTime]
     *   @param {string} [options.week]
     *   @param {string} [options.weekDay]
     *   @param {Array} [options.weekDays]
     * @returns {Object}
     */
    task(options) {

        // Defining
        return new Task(options);
    },

    /**
     * Removes a scheduled task.
     *
     * @method unschedule
     * @param {string} id
     * @returns {boolean}
     */
    unschedule(id) {

        // Asserting
        XP.assertArgument(XP.isString(id, true), 1, 'string');

        // Clearing
        if (this.scheduled[id]) { clearTimeout(this.scheduled[id]); }

        // Deleting
        return delete this.scheduled[id];
    },

    /*********************************************************************/

    /**
     * The polling interval.
     *
     * @property interval
     * @type number
     */
    interval: {
        set(val) { return this.interval || val; },
        validate(val) { return !XP.isInt(val, true) && 'number'; }
    },

    /**
     * The scheduled tasks.
     *
     * @property scheduled
     * @type Object
     * @readonly
     */
    scheduled: {
        set(val) { return this.scheduled || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    }
});
