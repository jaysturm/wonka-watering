var rpio = require('rpio');
var express = require('express');
var router = express.Router();
var gpioUtil = require(`${__basedir}/services/gpio.service`);
var logger = require(`${__basedir}/logger`);

// watering cycle settings
var dispensed = 0, // water dispensed thus far (flow meter pulses)
    pulsesPerGallon = 60,
    zoneToWater = -1; // which zone to water

// pins
var flowSensor = 2;

// sockets
var waterPump = 1,
    valve = 2;

// middleware
router.use((req, res, next) => {
    // logger.info('Watering API middleware hit');
    next();
});

router.get('/', (req, res) => {
    res.send('no watering cycles currently running.');
    res.end();
});

router.post('/', (req, res) => {
    try {
        logger.info('**** starting watering cycle ****');

        // desired pulses (don't know how much water per pulse yet)
        var amountToDispense = req.body.waterAmount;

        // set up flow sensor pin and register handler
        // rpio.open(flowSensor, rpio.INPUT, rpio.PULL_UP);
        // rpio.poll(flowSensor, pulse_handler);

        // start watering cycle
        start_water();

        // uncomment once water flow sensor is hooked up
        // while (dispensed < amountToDispense) {
        //     logger.info('watering...');
        // }

        rpio.sleep(10);

        // stop watering cycle
        stop_water();

        res.send('watering cycle complete.');
        res.end();
    } catch (err) {
        logger.error('>> error watering => ', err);
        res.send('error occured during watering cycle.');
        res.end();
    }

    logger.info('**** ending watering cycle ****');
});

function pulse_handler(channel) {
    logger.info('>> pulse channel => ' + channel);
    dispensed++;
}

function start_water() {
    // open valve and turn on pump
    logger.info('>> opening solenoid valve.');
    rpio.write(solenoidValve, gpioUtil.turnOn);

    logger.info('>> turning on water pump.');
    rpio.write(waterPump, gpioUtil.turnOn);
}

function stop_water() {
    // reset dispensed amount
    dispensed = 0;

    // turn off water pump
    logger.info('>> shutting off water pump.')
    rpio.write(waterPump, gpioUtil.turnOff);

    // wait 10 seconds
    rpio.sleep(10);

    // close solenoid valve
    logger.info('>> closing solenoid valve.');
    rpio.write(solenoidValve, gpioUtil.turnOff);
}

module.exports = router;