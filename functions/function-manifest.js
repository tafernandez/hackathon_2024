// create metadata for all the available functions to pass to completions API
const tools = [
  {
    type: "function",
    function: {
      name: "findProfile",
      description: "Gets the profile of the customer from Segment.",
      returns: {
        type: "object",
        properties: {
          price: {
            type: "object",
            description: "profile object of the customer from database"
          }
        }
      }
    },
  },
  {
    type: "function",
    function: {
      name: "getAllBookings",
      description: "Get all the bookings for a particular user. this action can be used to find all of the bookings in a user's account so you can ask which one they are calling about.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "the id of the user whose bookings we want to look up, must start with a +",
          },
        },
        required: ["userId"],
      },
      returns: {
        type: "array",
        description: "an array of all the bookings this user's account has"
      }
    },
  },
  {
    type: "function",
    function: {
      name: "getBooking",
      description: "Get a particular booking from a customers' account",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "the id of the user whose most recent booking we want to look up. must start with +",
          },
          bookingId: {
            type: "integer",
            description: "the id of the booking the user is calling about",
          },
        },
        required: ["userId", "bookingId"],
      },
      returns: {
        type: "object",
        description: "an object containing the listing details and chat transcript of the most recent booking for this customer."
      }
    },
  },
  {
    type: "function",
    function: {
      name: "refundLateCheckoutFee",
      description: "refunds the checkout fee on a particular booking.",
      parameters: {
        type: "object",
        properties: {
          booking_id: {
            type: "integer",
            description: "initiates the refund of the late checkout fee on a particular booking.",
          },
        },
        required: ["booking_id"],
      },
      returns: {
        type: "boolean"
      }
    },
  },
];

module.exports = tools;