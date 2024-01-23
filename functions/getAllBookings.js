const db = {
    [process.env.TO_NUMBER]: [
        {
            bookingId: 7,
            bookingName: `2bd 2ba in Pleasanton`,
        },
        {
            bookingId: 6,
            bookingName: `2bd 1ba in Charlotte`,
        }
    ]
}

function getRecentBooking({userId}) {
    return JSON.stringify(db[userId])
}

module.exports = getRecentBooking;