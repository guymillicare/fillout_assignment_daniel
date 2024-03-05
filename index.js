const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 80;
const HOST = "0.0.0.0";
const FILLOUT_API_KEY = process.env.API_KEY;
const PAGE_SIZE = 10;

app.get("/:formId/filteredResponses", async (req, res) => {
  try {
    const formId = req.params.formId;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

    // const filters = [
    //   {
    //     id: "4KC356y4M6W8jHPKx9QfEy",
    //     condition: "equals",
    //     value: "I'm excited for it!",
    //   },
    // ];

    // Construct URL for Fillout API
    const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}/submissions`;

    // Set up request headers including authorization
    const config = {
      headers: {
        Authorization: `Bearer ${FILLOUT_API_KEY}`,
      },
    };
    // Make GET request to Fillout API
    const response = await axios.get(apiUrl, config);
    const filteredResponses = response.data.responses.filter((response) => {
      return filters.every((filter) => {
        const question = response.questions.find((q) => q.id === filter.id);
        if (!question) return false;
        switch (filter.condition) {
          case "equals":
            return question.value === filter.value;
          case "does_not_equal":
            return question.value !== filter.value;
          case "greater_than":
            return question.value > filter.value;
          case "less_than":
            return question.value < filter.value;
          default:
            return true; // No filter applied for unknown condition
        }
      });
    });
    const totalResponses = filteredResponses.length;
    const pageCount = Math.ceil(totalResponses / PAGE_SIZE);
    // Return filtered responses
    res.json({
      responses: filteredResponses,
      totalResponses: totalResponses,
      pageCount: pageCount,
    });
  } catch (error) {
    console.error("Error fetching and filtering responses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
