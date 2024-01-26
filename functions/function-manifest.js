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
  {
    type: "function",
    function: {
      name: "callHostToConfirm",
      description: "calls the host to gather more information about the matter",
      parameters: {
        type: "object",
        properties: {
          phone_number: {
            type: "string",
            description: "the phone number associated to the host of the listing.",
          },
          callSid: {
            type: "string",
            description: "the callSid from the initial call that was responded which we are trying to resolve.",
          },
        },
        required: ["callSid", "phone_number"],
      },
      returns: {
        type: "boolean"
      }
    },
  },
  {
    type: "function",
    function: {
      name: "createFlexTask",
      description: "takes information from the call with the guest as well as information from the call with the host and packages up the data to be able to send it off to Flex.",
      parameters: {
        type: "object",
        properties: {
          summary_of_calls: {
            type: "string",
            description: "the transcript between assistant and host.",
          },
          conclusion: {
            type: "string",
            description: "the transcript between assistant and host.",
          },
        },
        required: ["summary_of_calls", "conclusion"],
      },
      returns: {
        type: "boolean"
      }
    },
  },
];

module.exports = tools;