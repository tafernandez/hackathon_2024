const db = {
    [process.env.TO_NUMBER]: {
        userId: process.env.TO_NUMBER,
        name: process.env.TO_NAME,
        yearsCustomer: 8,
        numBookings: 7,
        guestRating: 5.0,
    }
};

const axios = require("axios");

async function findProfile(id) {
    const req = await axios.get("https://sienna-pheasant-5324.twil.io/profile")
        .catch(function(err) { return err.response })
    return req.data
}

module.exports = findProfile;
