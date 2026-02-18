// ============================================================
// @ihss/prompts
// Versioned prompt library for AI Caregiver Companion
// All prompts are versioned modules with defined input/output contracts
// ============================================================

export interface PromptModule {
  name: string;
  version: string;
  dateUpdated: string;
  purpose: string;
  inputs: string[];
  expectedOutputSchema: string;
  build: (inputs: Record<string, string>) => string;
}

// ---- Prompt: Care Log Structuring ----
export const careLogStructuringPrompt: PromptModule = {
  name: 'care-log-structuring',
  version: '1.0.0',
  dateUpdated: '2026-02-18',
  purpose: 'Convert raw shift events into a structured care log JSON object.',
  inputs: ['shiftDate', 'startTime', 'endTime', 'events'],
  expectedOutputSchema: JSON.stringify({
    summary: 'string',
    activitiesPerformed: ['string'],
    careHighlights: 'string',
    duration: 'string',
    generatedAt: 'ISO8601 string',
  }),
  build: ({ shiftDate, startTime, endTime, events }) => `
You are a professional care documentation assistant. Convert the following raw caregiver shift events into a structured care log.

Shift Date: ${shiftDate}
Start Time: ${startTime}
End Time: ${endTime}

Events logged during shift:
${events}

Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "A 2-3 sentence professional summary of the shift",
  "activitiesPerformed": ["array of specific activities performed"],
  "careHighlights": "Notable observations or highlights from the shift",
  "duration": "Total shift duration in hours and minutes",
  "generatedAt": "ISO 8601 timestamp"
}

Do not include any text outside the JSON object. Do not add commentary or explanation.
`.trim(),
};

// ---- Prompt: Incident Structuring ----
export const incidentStructuringPrompt: PromptModule = {
  name: 'incident-structuring',
  version: '1.0.0',
  dateUpdated: '2026-02-18',
  purpose: 'Convert a raw incident description into a structured incident report JSON object.',
  inputs: ['incidentDescription', 'incidentDate'],
  expectedOutputSchema: JSON.stringify({
    summary: 'string',
    timeline: 'string',
    involvedParties: ['string'],
    actionsTaken: ['string'],
    recommendedFollowUp: 'string',
  }),
  build: ({ incidentDescription, incidentDate }) => `
You are a professional documentation assistant helping an IHSS caregiver document an incident for their records.

Incident Date: ${incidentDate}
Incident Description:
${incidentDescription}

Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "A concise 1-2 sentence summary of the incident",
  "timeline": "A brief chronological description of what occurred",
  "involvedParties": ["list of parties involved, e.g., caregiver, recipient, supervisor"],
  "actionsTaken": ["list of actions taken in response to the incident"],
  "recommendedFollowUp": "Recommended next steps for documentation or follow-up"
}

Do not include any text outside the JSON object. Do not add commentary or explanation.
`.trim(),
};

// ---- Prompt: Weekly Export Structuring ----
export const weeklyExportPrompt: PromptModule = {
  name: 'weekly-export-structuring',
  version: '1.0.0',
  dateUpdated: '2026-02-18',
  purpose: 'Generate a formatted weekly summary from shift data for ESP preparation.',
  inputs: ['weekRange', 'shiftsData'],
  expectedOutputSchema: JSON.stringify({
    weekRange: 'string',
    totalHours: 'number',
    days: [{ date: 'string', shifts: [], totalHours: 'number' }],
    submissionChecklist: ['string'],
  }),
  build: ({ weekRange, shiftsData }) => `
You are a professional documentation assistant helping an IHSS caregiver prepare their weekly summary for ESP submission.

Week Range: ${weekRange}
Shift Data:
${shiftsData}

Return ONLY a valid JSON object matching this exact schema:
{
  "weekRange": "e.g., Feb 10 - Feb 16, 2026",
  "totalHours": 0.0,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "shifts": [
        {
          "shiftId": "string",
          "startedAt": "ISO8601",
          "endedAt": "ISO8601",
          "hours": 0.0,
          "highlights": ["string"]
        }
      ],
      "totalHours": 0.0
    }
  ],
  "submissionChecklist": [
    "Verify all shift times match your ESP timesheet",
    "Confirm recipient signature if required",
    "Submit by the pay period deadline"
  ]
}

Do not include any text outside the JSON object. Do not add commentary or explanation.
`.trim(),
};

// ---- Prompt: Knowledge Assistant ----
export const knowledgeAssistantPrompt: PromptModule = {
  name: 'knowledge-assistant',
  version: '1.0.0',
  dateUpdated: '2026-02-18',
  purpose:
    'Answer IHSS and ESP workflow questions grounded strictly in retrieved knowledge chunks.',
  inputs: ['question', 'retrievedChunks'],
  expectedOutputSchema: JSON.stringify({
    answer: 'string',
    sources: [{ documentTitle: 'string', source: 'string', snippet: 'string' }],
    verificationReminder: 'string',
    confidence: 'high | low',
  }),
  build: ({ question, retrievedChunks }) => `
You are a knowledgeable IHSS and ESP workflow assistant. Answer the user's question using ONLY the information provided in the retrieved knowledge chunks below.

IMPORTANT RULES:
- Do not speculate or answer from general knowledge.
- Do not provide legal advice or medical guidance.
- Do not guarantee compliance outcomes.
- Do not make definitive statements like "you will be paid" or "this is allowed."
- If the retrieved chunks do not contain sufficient information, respond with the low-confidence message.

Retrieved Knowledge Chunks:
${retrievedChunks}

User Question: ${question}

Return ONLY a valid JSON object matching this exact schema:
{
  "answer": "Your grounded answer based only on the retrieved chunks",
  "sources": [
    {
      "documentTitle": "Title of the source document",
      "source": "Source identifier",
      "snippet": "Relevant excerpt from the chunk"
    }
  ],
  "verificationReminder": "Always verify this information with official IHSS or ESP resources before taking action.",
  "confidence": "high or low"
}

If you cannot answer from the retrieved chunks, set confidence to "low" and set answer to: "I do not have sufficient information to confirm. Please verify using official IHSS or ESP resources."

Do not include any text outside the JSON object.
`.trim(),
};

// ---- Prompt: JSON Repair ----
export const jsonRepairPrompt: PromptModule = {
  name: 'json-repair',
  version: '1.0.0',
  dateUpdated: '2026-02-18',
  purpose: 'Repair malformed JSON output from a previous generation attempt.',
  inputs: ['originalPrompt', 'malformedOutput'],
  expectedOutputSchema: 'Same schema as the original prompt',
  build: ({ originalPrompt, malformedOutput }) => `
The following JSON output is malformed or invalid. Please repair it and return ONLY valid JSON matching the original schema.

Original prompt context:
${originalPrompt}

Malformed output to repair:
${malformedOutput}

Return ONLY the corrected valid JSON object. No explanation, no commentary.
`.trim(),
};

// ---- Registry ----
export const promptRegistry: Record<string, PromptModule> = {
  'care-log-structuring': careLogStructuringPrompt,
  'incident-structuring': incidentStructuringPrompt,
  'weekly-export-structuring': weeklyExportPrompt,
  'knowledge-assistant': knowledgeAssistantPrompt,
  'json-repair': jsonRepairPrompt,
};
