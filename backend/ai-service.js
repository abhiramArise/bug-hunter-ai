const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a website for bugs using AI.
 * @param {string} screenshotBase64 - Base64 encoded screenshot of the page.
 * @param {string} domText - Simplified DOM structure or text content.
 * @param {string[]} consoleLogs - Array of console logs/errors.
 */
async function analyzeWebsite(screenshotBase64, domText, consoleLogs) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    Act as a Senior QA Automation Engineer and UI/UX Designer. 
    Analyze the provided website state for bugs, UI inconsistencies, and functional issues.

    CONTEXT:
    - DOM Structure (Partial): ${domText.substring(0, 5000)} ...
    - Console Logs: ${JSON.stringify(consoleLogs)}

    TASK:
    1. Inspect the screenshot provided.
    2. Check for visual bugs (misaligned elements, overlapping text, broken images).
    3. Check for functional bugs based on the console logs.
    4. Provide a structured report in JSON format.

    OUTPUT FORMAT:
    {
      "summary": "Short overview of the health of the site",
      "bugs": [
        {
          "type": "visual | functional | performance",
          "severity": "low | medium | high",
          "description": "Clear description of the bug",
          "recommendation": "How to fix it"
        }
      ],
      "overallScore": 0-100
    }

    Return ONLY the JSON.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: screenshotBase64,
        mimeType: "image/png",
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from response (handling potential markdown blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response", raw: text };
}

module.exports = { analyzeWebsite };
