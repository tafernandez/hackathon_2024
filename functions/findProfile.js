const db = {
    [process.env.TO_NUMBER]: {
        userId: process.env.TO_NUMBER,
        name: process.env.TO_NAME,
        yearsCustomer: 8,
        numBookings: 7,
        guestRating: 5.0,
    }
};

function findProfile(id) {
   return db[id] || { name: "Unknown" } 
}

module.exports = findProfile;
