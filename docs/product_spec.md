# Product Specification

## Product Vision

Provide IHSS caregivers with a structured operational companion that reduces documentation burden and improves workflow organization without replacing official systems.

## Primary User

IHSS caregiver using ESP for timesheet submission.

## Core Features

| Feature | Description |
|---|---|
| Shift Companion | Start shift, log activities via quick actions or notes, end shift, timeline view |
| Structured Care Documentation | AI converts raw events into structured care summaries |
| Weekly Export | Generates formatted weekly summaries as copy-friendly text and PDF |
| Incident Protection | Structured incident logging, AI narrative structuring, exportable incident report |
| Knowledge Assistant | Answers IHSS and ESP workflow questions using curated documents |

## Non-Goals

This product does not provide direct ESP integration, compliance enforcement automation, or medical guidance.

## User Flow

Login → Dashboard → Start shift → Log events → End shift → Generate structured notes → Generate weekly export → Ask knowledge assistant when needed.

## Success Metrics

- User completes shift workflow in under three minutes.
- Weekly export reduces manual preparation time.
- Knowledge assistant responses grounded in curated sources.

## Release Strategy

Deploy MVP with shift workflow and exports first. Add knowledge assistant after real workflow data exists. Guardrail enforcement required before production launch.
