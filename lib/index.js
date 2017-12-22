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
    Task      = require('./classes/Task');

/*********************************************************************/

/**
 * A server side class used to provide scheduling functionality.
 *
 * @class XPScheduler
 * @extends XPEmitter /bower_components/xp-emitter/lib/index.js
 * @description A server side class used to provide scheduling functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-scheduler/blob/master/lib/index.js
 */
module.exports = new XP.Class('XPScheduler', {

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
        this.tasks    = {};
        this.timers   = {};
        this.options  = options;
        this.latest   = Date.now();
        this.interval = this.options.interval || 60000;

        // Polling
        setInterval(this._handlePoll.bind(this), this.interval);
    },

    /*********************************************************************/

    /**
     * Removes a scheduled task.
     *
     * @method remove
     * @param {string} id
     * @param {Function} [callback]
     */
    remove: {
        callback: true,
        value(id, callback) {

            // Asserting
            if (!XP.isString(id, true)) { callback(new XP.ValidationError('id', 'string')); return; }

            // Clearing
            if (this.timers[id]) { clearTimeout(this.timers[id]); }

            // Deleting
            delete this.tasks[id];
            delete this.timers[id];

            // Callback
            callback(null, null);
        },
    },

    /**
     * Adds a scheduled task.
     *
     * @method schedule
     * @param {Object} options
     *   @param {Function} options.handler
     *   @param {Date} [options.endDate]
     *   @param {string} [options.frequency = "precise"]
     *   @param {string} [options.id]
     *   @param {number} [options.interval]
     *   @param {number} [options.iterations]
     *   @param {number} [options.month]
     *   @param {number} [options.monthDay]
     *   @param {Date} [options.startDate]
     *   @param {string} [options.startTime]
     *   @param {string} [options.week]
     *   @param {string} [options.weekDay]
     *   @param {Array} [options.weekDays]
     * @param {Function} [callback]
     */
    schedule: {
        callback: true,
        value(options, callback) {

            // Let
            let task;

            // Waterfall
            XP.waterfall([
                next => new Task(options, (err, res) => next(err, task = res)), // preparing task
                next => this.remove(task.id, next) // removing task
            ], error => {

                // Checking
                if (error) { callback(error); return; }

                // Scheduling
                this.tasks[task.id] = task;

                // Handling
                this._handleTask(task);

                // Callback
                callback(null, task);
            });
        }
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
     * The timestamp of the latest poll.
     *
     * @property latest
     * @type number
     */
    latest: {
        set(val) { return val; },
        validate(val) { return !XP.isInt(val, true) && 'number'; }
    },

    /**
     * The scheduled tasks.
     *
     * @property tasks
     * @type Object
     * @readonly
     */
    tasks: {
        set(val) { return this.tasks || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    },

    /**
     * The scheduled tasks timers.
     *
     * @property timers
     * @type Object
     * @readonly
     */
    timers: {
        set(val) { return this.timers || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    },

    /*********************************************************************/

    // HANDLER
    _handlePoll() {

        // Updating
        this.latest = Date.now();

        // Handling
        Object.keys(this.tasks).forEach(id => this._handleTask(this.tasks[id]));
    },

    // HANDLER
    _handleTask(task) {

        // Let
        let date = task.nextDate;

        // Preventing
        if (!date || date > this.latest + this.interval) { return; }

        // Setting
        this.timers[task.id] = setTimeout(this._handleTimeout.bind(this, task), date - Date.now());
    },

    // HANDLER
    _handleTimeout(task) {

        // Handling
        this._handleTask(task);

        // Executing
        task.handler();
    }
});
