const db = {
    [process.env.TO_NUMBER]: [
        {
            bookingId: 7,
            bookingName: `2bd 2ba in Pleasanton`,
            bookingDetails: `
                Beautiful 2bd 2ba home in the middle of town.
                Walking distance to basically everything.
                You will love your stay here.
                Please now that you will be in charge of cleaning up before you leave.
                No late checkouts allowed.
            `,
            chatTranscript: [
                { from: "host", body: "Welcome to our house!" },
                { from: "renter", body: "Hi, can we have a late checkout?"},
                { from: "host", body: "absolutely, no worries!"},
                { from: "renter", body: "awesome, thank you"},
                { from: "renter", body: "Hi, I thought we were ok with late checkout, but seems you charged us for it."},
                { from: "host", body: "sorry, we charge for late checkout."},
                { from: "renter", body: "but you didn't tell us ahead of time"},
                { from: "host", body: "sorry, that's not our problem"},
            ]
        },
        {
            bookingId: 6,
            bookingName: `2bd 1ba in Charlotte`,
            bookingDetails: `
                Beautiful 2bd 1ba home in the middle of town.
                Walking distance to basically everything.
                You will love your stay here.
                Please now that you will be in charge of cleaning up before you leave.
                Late checkouts will have an additional $60 fee.
            `,
            chatTranscript: [
                { from: "host", body: "Welcome to our house!" },
                { from: "renter", body: "Hi, can we have a late checkout?"},
                { from: "host", body: "absolutely, no worries, just so you know its an additional $60"},
                { from: "renter", body: "awesome, thank you"},
                { from: "renter", body: "Hi, I thought we were ok with late checkout, but seems you charged us for it."},
                { from: "host", body: "sorry, we charge for late checkout."},
                { from: "renter", body: "but you didn't tell us ahead of time"},
                { from: "host", body: "please read the above message, we told you in advance., that's not our problem"},
            ]
        }
    ]
}

function getRecentBooking({userId, bookingId}) {
    const bookings = db[userId];
    for(const booking of bookings) {
        if(booking.bookingId === bookingId) {
            return JSON.stringify(booking)
        }
    }
}

module.exports = getRecentBooking;