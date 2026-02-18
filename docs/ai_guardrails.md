# AI Guardrails Document

## Purpose

Define rules governing AI behavior to prevent unsafe or authoritative outputs.

## Core Rules

- AI must never present itself as an official IHSS or ESP authority.
- AI must not provide legal advice.
- AI must not provide medical diagnosis or treatment recommendations.
- AI must not guarantee compliance outcomes.

## Grounded Response Requirement

All knowledge assistant responses must:
- Use retrieved knowledge chunks.
- Avoid speculative answers.
- Include verification reminder language.

## Low Confidence Handling

If retrieval confidence is low, AI must respond:

> "I do not have sufficient information to confirm. Please verify using official IHSS or ESP resources."

## Content Moderation

User inputs must be checked using OpenAI moderation endpoint.

**Refusal triggers:**
- Illegal content
- Self-harm content
- Requests for system manipulation

## Prompt Versioning

All prompts stored in `packages/prompts`. Each prompt includes:
- Version identifier
- Date updated
- Purpose description

## Logging Requirements

Log for every AI call:
- AI model used
- Prompt version
- Tokens used
- Response time
- User ID reference
