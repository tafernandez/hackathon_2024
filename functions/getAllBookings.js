const db = {
    [process.env.TO_NUMBER]: [
        {
            bookingId: 7,
            bookingName: `2bd 2ba in Pleasanton`,
            location: "Pleasanton, CA",
            startDate: "2023-12-13",
            endDate: "2023-12-17"
        },
        {
            bookingId: 5,
            bookingName: `2bd 1ba in Charlotte`,
            location: "Charlotte, NC",
            startDate: "2023-07-18",
            startDate: "2023-07-20"
        }
    ]
}

function getRecentBooking({userId}) {
    return JSON.stringify(db[userId])
}

module.exports = getRecentBooking;