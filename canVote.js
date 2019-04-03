const dayjs = require('dayjs');

module.exports = (req, res, next) => {
    const currentTime = dayjs();
    const startTime = dayjs(process.env.START_TIME, 'YYYY-MM-DD HH:mmZZ');
    const endTime = dayjs(process.env.END_TIME, 'YYYY-MM-DD HH:mmZZ');

    // is same or after start time and is same or before end time
    if (!currentTime.isBefore(startTime) && !currentTime.isAfter(endTime)) {
        if (!next) res.status(200).send(null); 
        else next();
    } else {
        const date = currentTime.isBefore(startTime) ? startTime : endTime
        res.status(412).json({
            notStarted: currentTime.isBefore(startTime),
            isClosed: currentTime.isAfter(endTime),
            date,
        });
    }
}