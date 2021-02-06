// Convert GMT-3 to UTC -and- "2021-01-23T14:23" to Date()
function toWrite (dt) {
    var dateTime = new Date(dt);
    return new Date(dateTime.setHours( dateTime.getHours() + 3 ));
}

// Convert UTC to GMT-3 -and- Date() to "2021-01-23T14:23"
function toReadHtmlForm (dt) {
    var dateTime = new Date(dt);
    dateTime = dateTime.setHours( dateTime.getHours() - 3 );
    return new Date(dateTime).toISOString().slice(0,-8);
}

// Convert UTC to GMT-3 -and- Date() to "2021-01-23 14:23"
function toReadHuman (dt) {
    var dateTime = new Date(dt);
    dateTime = dateTime.setHours( dateTime.getHours() - 3 );
    return new Date(dateTime).toISOString().slice(0,-8).replace('T',' ');
}

module.exports = { toWrite, toReadHtmlForm, toReadHuman }