const model = require("../config/gemini.js");
const Bus = require("../models/bus/Buses.js");
const Route = require("../models/Route_Management/Route.js");

const chatWithBot = async (req, res) => {
  console.log("✅ Request received:", req.body);

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required and must be a non-empty string",
      });
    }

    const lowerMsg = message.toLowerCase();

    // 🎯 Detect bus/route related queries
    const isBusQuery = /bus|route|schedule|time/i.test(lowerMsg);

    if (isBusQuery) {
      // 👉 Fetch data from DB
      const buses = await Bus.find();
      const routes = await Route.find();

      // 👉 Combine Bus + Route
      const combinedData = buses.map((b) => {
        const routeDetails = routes.find(
          (r) => r.route_name === b.route
        );

        return {
          bus_number: b.bus_number,
          route: b.route,
          departure_time: b.departure_time,
          arrival_time: b.arrival_time,
          start: routeDetails?.start_location || "N/A",
          end: routeDetails?.end_location || "N/A",
          duration: routeDetails?.duration || "N/A",
          price: routeDetails?.price || "N/A",
        };
      });

      // 👉 Convert to text for Gemini
      const busInfoText = combinedData
        .map(
          (b) =>
            `Bus ${b.bus_number} | Route: ${b.route} | From ${b.start} to ${b.end} | Departure: ${b.departure_time} | Arrival: ${b.arrival_time} |  Price: ${b.price}`
        )
        .join("\n");

      const prompt = `
You are a Smart University Transport Assistant.

Here are available bus details:
${busInfoText}

Answer the user clearly based on this data.

User Question:
${message}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return res.json({ reply: text });
    }

    // 🤖 Default chatbot (non-bus questions)
    const prompt = `
You are a Smart University Transport and Parking System Assistant.

Answer ONLY about:
- bus booking
- parking reservation
- user account
- transport pass
- university transport system

Always greet the user and provide helpful, concise answers.

If question is unrelated, say:
"I can only help with transport and parking system queries."

User Question:
${message}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("Chatbot Error:", error.message);

    res.status(500).json({
      error: "Chatbot error",
      message: error.message,
    });
  }
};

module.exports = chatWithBot ;