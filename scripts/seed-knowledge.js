#!/usr/bin/env node
/**
 * IHSS Knowledge Base Seeder
 * Usage: ADMIN_SECRET=<secret> API_URL=<url> node scripts/seed-knowledge.js
 */

const API_URL = process.env.API_URL || 'https://api-production-67a7.up.railway.app';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error('ERROR: ADMIN_SECRET env var is required');
  process.exit(1);
}

async function ingest(doc) {
  const res = await fetch(`${API_URL}/knowledge/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET,
    },
    body: JSON.stringify(doc),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Ingest failed for "${doc.title}": ${JSON.stringify(data.error)}`);
  }
  return data;
}

const DOCUMENTS = [
  {
    title: 'IHSS Program Overview — What is IHSS?',
    source: 'CDSS IHSS Program Guide',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'What is IHSS?',
        content: 'In-Home Supportive Services (IHSS) is a California Medicaid (Medi-Cal) program that provides funding for personal care and domestic services to eligible low-income aged, blind, and disabled individuals who live at home. IHSS helps recipients remain safely in their own homes and avoid institutionalization. The program is administered by the California Department of Social Services (CDSS) and operated by each county.',
      },
      {
        title: 'Who is eligible for IHSS?',
        content: 'To be eligible for IHSS, a person must: (1) be 65 or older, or blind, or disabled; (2) be a California resident; (3) live in their own home or the home of a relative; (4) be eligible for Medi-Cal or be able to pay for services themselves (IHSS Plus Option); and (5) need assistance with activities of daily living (ADLs) or domestic services to remain safely at home. Eligibility is determined by a county social worker through an in-home assessment.',
      },
      {
        title: 'What services does IHSS cover?',
        content: 'IHSS covers a range of services including: personal care services (bathing, grooming, dressing, feeding, bowel/bladder care, ambulation, transferring, positioning, paramedical services); domestic services (housecleaning, laundry, meal preparation and cleanup, shopping, errands); and protective supervision for recipients who are mentally impaired and cannot be left alone safely. The specific services and hours are determined by a county social worker assessment.',
      },
      {
        title: 'IHSS Provider Enrollment',
        content: 'To become an IHSS provider, you must: (1) be hired by an IHSS recipient; (2) complete a provider enrollment form (SOC 426); (3) pass a criminal background check (Live Scan fingerprinting); (4) complete provider orientation; (5) complete required training (IHSS Orientation and any required in-home care training). Providers cannot be enrolled until the recipient is approved for IHSS services. Providers are employees of the recipient, not of the county or state.',
      },
    ],
  },
  {
    title: 'Electronic Services Portal (ESP) — Timesheet Submission Guide',
    source: 'CDSS ESP User Guide',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'What is the Electronic Services Portal (ESP)?',
        content: 'The Electronic Services Portal (ESP) is the online system used by IHSS providers to submit timesheets electronically. Providers can access ESP at www.etimesheets.ihss.ca.gov. ESP allows providers to submit, view, and manage their timesheets without paper. Both the provider and recipient must be enrolled in ESP to use electronic timesheets. Providers can also use the IHSS EVV (Electronic Visit Verification) mobile app.',
      },
      {
        title: 'How to submit a timesheet in ESP',
        content: 'To submit a timesheet in ESP: (1) Log in at etimesheets.ihss.ca.gov; (2) Select "Submit Timesheet" from the menu; (3) Select the pay period you are submitting for; (4) Enter the hours worked each day; (5) Review your entries for accuracy; (6) Submit the timesheet for recipient approval; (7) The recipient must approve the timesheet before it is processed for payment. Timesheets must be submitted within the pay period deadlines to avoid delayed payment.',
      },
      {
        title: 'ESP Pay Period Deadlines',
        content: 'IHSS pay periods run from the 1st through the 15th and from the 16th through the last day of the month. Timesheets for the first half of the month (1st-15th) are due by the 20th of that month. Timesheets for the second half of the month (16th-last day) are due by the 5th of the following month. Late timesheets may result in delayed payment. Providers should submit timesheets as soon as possible after the pay period ends.',
      },
      {
        title: 'ESP Enrollment for Providers',
        content: 'To enroll in ESP as a provider: (1) Go to etimesheets.ihss.ca.gov; (2) Click "Register" and select "Provider"; (3) Enter your provider number (found on your SOC 840 form or paycheck stub); (4) Create a username and password; (5) Verify your identity using your date of birth and SSN last 4 digits; (6) Accept the terms of use. Once enrolled, you can submit timesheets electronically. Your recipient must also be enrolled in ESP to approve your timesheets.',
      },
      {
        title: 'EVV (Electronic Visit Verification) Requirements',
        content: 'California requires Electronic Visit Verification (EVV) for IHSS personal care services. EVV records the time, location, and type of service provided. Providers can use the IHSS EVV mobile app to clock in and out of shifts. EVV data is used to verify that services were provided as claimed. Providers who do not use EVV may have their timesheets flagged for review. The EVV app is available for iOS and Android devices.',
      },
    ],
  },
  {
    title: 'IHSS Provider Training Requirements',
    source: 'CDSS IHSS Training Program',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'Required training for new IHSS providers',
        content: 'All new IHSS providers are required to complete: (1) Provider Orientation — a one-time orientation covering IHSS program rules, provider responsibilities, and timesheet submission. This is required before a provider can receive payment. (2) In-Home Care Training — providers who work with recipients who need specific types of care may be required to complete additional training. The specific training requirements depend on the services authorized for the recipient.',
      },
      {
        title: 'IHSS Provider Orientation',
        content: 'IHSS Provider Orientation is a mandatory one-time training for all new providers. It covers: the IHSS program overview, provider rights and responsibilities, how to complete and submit timesheets, recipient rights, fraud prevention, and workplace safety. Orientation can be completed online at the CDSS website or in person at the county IHSS office. Providers must complete orientation before they can receive their first paycheck.',
      },
      {
        title: 'Advanced Training for IHSS Providers',
        content: 'IHSS providers may be required to complete advanced training if their recipient has specific care needs. Advanced training topics may include: medication management, wound care, catheter care, feeding tube care, respiratory care, and other paramedical services. Training requirements are determined by the county social worker based on the recipient\'s authorized services. Providers should check with their county IHSS office for specific training requirements.',
      },
      {
        title: 'CPR and First Aid for IHSS Providers',
        content: 'CPR and First Aid certification is not universally required for all IHSS providers, but may be required for providers who perform certain paramedical services. Some counties or recipients may request that providers have CPR certification. Providers who wish to obtain CPR certification can do so through the American Red Cross, American Heart Association, or other accredited organizations. Always verify specific requirements with your county IHSS office.',
      },
      {
        title: 'Continuing Education for IHSS Providers',
        content: 'IHSS providers are encouraged to pursue ongoing education to improve their caregiving skills. While not universally mandated for all providers, some counties offer optional training programs. Topics may include dementia care, fall prevention, communication skills, and self-care for caregivers. Providers can contact their county IHSS office or the California Department of Aging for information about available training resources.',
      },
    ],
  },
  {
    title: 'IHSS Timesheet Rules and Overtime',
    source: 'CDSS IHSS Provider Handbook',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'IHSS Overtime Rules',
        content: 'IHSS providers are entitled to overtime pay under California law. Overtime is paid at 1.5 times the regular hourly rate for hours worked over 8 hours in a day or 40 hours in a workweek. IHSS providers who work for multiple recipients may have their hours combined for overtime calculation purposes. The IHSS overtime rules are governed by California Labor Code and the IHSS Memorandum of Understanding (MOU) in counties with collective bargaining agreements.',
      },
      {
        title: 'IHSS Maximum Hours',
        content: 'IHSS providers are subject to a maximum of 66 hours per workweek (exceptions may apply for live-in providers). Providers who work for multiple recipients cannot exceed the weekly maximum across all recipients combined. The county IHSS office tracks provider hours across all recipients. Providers who exceed the maximum hours may have their timesheets rejected. Live-in providers (who live with their recipient) may be exempt from certain overtime rules.',
      },
      {
        title: 'Timesheet Accuracy Requirements',
        content: 'IHSS providers must accurately record the hours they work. Timesheets must reflect the actual hours worked, not estimated hours. Providers should not submit timesheets for hours not worked. Falsifying timesheets is considered IHSS fraud and can result in termination, repayment of funds, and criminal prosecution. Providers should keep personal records of their work hours to verify against their timesheets.',
      },
      {
        title: 'Travel Time Between Recipients',
        content: 'IHSS providers who work for multiple recipients may be entitled to compensation for travel time between recipients. Travel time is compensable if the provider travels directly from one recipient\'s home to another. Providers should record travel time on their timesheets. The rules for travel time compensation may vary by county and are subject to the applicable MOU or county policies. Providers should consult their county IHSS office for specific guidance.',
      },
    ],
  },
  {
    title: 'IHSS Recipient Rights and Provider Responsibilities',
    source: 'CDSS IHSS Rights and Responsibilities',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'IHSS Recipient Rights',
        content: 'IHSS recipients have the right to: (1) choose their own IHSS provider, including family members (with some exceptions); (2) direct their own care and tell providers what tasks to perform; (3) hire, supervise, and fire their IHSS provider; (4) receive services in a safe and dignified manner; (5) appeal IHSS decisions they disagree with; (6) be free from abuse, neglect, and exploitation. Recipients are the employer of their IHSS provider.',
      },
      {
        title: 'IHSS Provider Responsibilities',
        content: 'IHSS providers are responsible for: (1) performing only the tasks authorized on the recipient\'s IHSS Notice of Action (NOA); (2) maintaining the recipient\'s privacy and confidentiality; (3) submitting accurate timesheets on time; (4) completing required training; (5) reporting changes in the recipient\'s condition to the county; (6) not performing tasks that are outside the scope of IHSS (e.g., medical procedures not authorized); (7) treating the recipient with dignity and respect.',
      },
      {
        title: 'Prohibited Activities for IHSS Providers',
        content: 'IHSS providers are prohibited from: (1) performing tasks not listed on the recipient\'s authorized services; (2) leaving a recipient who requires protective supervision alone; (3) accepting gifts or money beyond their authorized wages; (4) borrowing money from the recipient; (5) having the recipient sign blank timesheets; (6) working hours that are not authorized; (7) performing medical procedures without proper training and authorization. Violations can result in termination and legal action.',
      },
      {
        title: 'Mandatory Reporting for IHSS Providers',
        content: 'IHSS providers who suspect abuse, neglect, or exploitation of their recipient are encouraged to report it to Adult Protective Services (APS) at 1-833-401-0832. While IHSS providers are not legally classified as mandated reporters under California law (unlike healthcare professionals), they are strongly encouraged to report suspected abuse. Providers should also report any changes in the recipient\'s condition or needs to the county IHSS office.',
      },
      {
        title: 'IHSS Fraud Prevention',
        content: 'IHSS fraud includes submitting timesheets for hours not worked, performing services not authorized, or misrepresenting the recipient\'s condition. IHSS fraud is investigated by the CDSS Fraud Investigation Unit and county agencies. Providers found to have committed fraud may be required to repay funds, be terminated from the IHSS program, and face criminal prosecution. Recipients who participate in fraud may lose their IHSS benefits. Report suspected fraud to the IHSS fraud hotline.',
      },
    ],
  },
  {
    title: 'IHSS Incident Documentation Best Practices',
    source: 'IHSS Caregiver Best Practices Guide',
    jurisdiction: 'California',
    effectiveDate: '2024-01-01',
    chunks: [
      {
        title: 'What is an IHSS incident?',
        content: 'An IHSS incident is any unexpected event that affects the health, safety, or welfare of the recipient or provider. Examples include: falls, injuries, medical emergencies, behavioral incidents, property damage, allegations of abuse or neglect, and any situation that deviates from the normal care routine. Documenting incidents promptly and accurately is essential for protecting both the recipient and the provider.',
      },
      {
        title: 'How to document an IHSS incident',
        content: 'When documenting an IHSS incident, include: (1) the date, time, and location of the incident; (2) a factual description of what happened; (3) who was present; (4) the recipient\'s condition before and after the incident; (5) actions taken in response; (6) whether emergency services were called; (7) any witnesses. Use objective, factual language. Avoid speculation or opinions. Keep a copy of all incident documentation for your records.',
      },
      {
        title: 'When to report an IHSS incident',
        content: 'Providers should report incidents to the county IHSS office when: (1) the recipient is injured or requires emergency medical care; (2) there is a change in the recipient\'s condition that affects their care needs; (3) there is an allegation of abuse, neglect, or exploitation; (4) there is a safety concern in the recipient\'s home; (5) any situation arises that may affect the recipient\'s IHSS services. When in doubt, report the incident. It is better to over-report than to under-report.',
      },
    ],
  },
];

async function main() {
  console.log(`Seeding knowledge base at ${API_URL}...`);
  let success = 0;
  let failed = 0;

  for (const doc of DOCUMENTS) {
    try {
      const result = await ingest(doc);
      console.log(`✓ Ingested: "${doc.title}" (${result.data?.chunksIngested ?? '?'} chunks)`);
      success++;
    } catch (err) {
      console.error(`✗ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} documents ingested, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
