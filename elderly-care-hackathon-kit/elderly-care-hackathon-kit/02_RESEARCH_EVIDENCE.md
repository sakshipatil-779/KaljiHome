# 02 — Research Evidence and Product Implications

**Research checked:** 15 November 2026  
**Geographic lens:** India-first; global evidence used where relevant.  
**Evidence discipline:** External evidence is distinguished from product inference. This is not a clinical literature review or legal opinion.

## 1. Medication adherence is a system problem

The WHO report *Adherence to Long-Term Therapies: Evidence for Action* explains that adherence should not be reduced to blaming a patient; it is shaped by interacting patient, therapy, condition, health-system and social/economic factors. Its central recommendation is a systems approach rather than expecting a reminder alone to solve the problem.

**Product implication:** Do not build only a timer. Support shared responsibility, clear schedules, understandable status, caregiver handoff and a way to record why a routine could not be completed. Never shame the user or label them “non-compliant”.

Source: WHO, *Adherence to long-term therapies: evidence for action* (2003): https://www.paho.org/sites/default/files/WHO-Adherence-Long-Term-Therapies-Eng-2003.pdf

## 2. Medication safety needs special care around polypharmacy and transitions

WHO's *Medication Without Harm* policy brief identifies medication-related harm as a major preventable patient-safety concern and highlights high-risk situations, polypharmacy and transitions of care. WHO's technical report on medication safety in polypharmacy calls for person-centred review and a multi-professional approach.

**Product implication:** A list of medicines is not automatically a clinically reconciled medication list. Record source, editor, effective date and confirmation. When a medicine changes, preserve history rather than silently overwriting. Do not calculate interactions or recommend a change unless a separately validated clinical service and governance process exists.

Sources:
- WHO, *Medication without harm: Policy brief* (7 March 2024): https://www.who.int/publications/i/item/9789240062764
- WHO, *Medication safety in polypharmacy: technical report* (20 June 2019): https://www.who.int/publications/i/item/WHO-UHC-SDS-2019.11

## 3. Older-person care should be person-centred and connected

WHO's second-edition ICOPE handbook (22 September 2025) describes person-centred assessment and personalised care pathways in primary/community care. The approach emphasizes identifying individual needs and adapting care, rather than assuming every older person has the same capabilities or support arrangement.

**Product implication:** Make the older adult's goals, preferred support, access choices, communication preferences and personal routine configurable. Do not assume a family member is the decision-maker. Provide an assisted-use mode without removing the older adult's visibility or voice.

Sources:
- WHO, *Integrated care for older people (ICOPE): guidance for person-centred assessment and pathways in primary care*, 2nd ed. (22 September 2025): https://www.who.int/publications/i/item/9789240103726
- WHO ICOPE implementation framework (2019): https://www.who.int/publications-detail-redirect/9789241515993

## 4. India has an established public-health context for elderly care

The Ministry of Health and Family Welfare's National Programme for Health Care of the Elderly (NPHCE) describes accessible, affordable, comprehensive and dedicated elderly care, with community-based primary care and domiciliary support among its strategies. The government page describes LASI as a nationally representative study of older persons in India and identifies health, healthcare financing, social networks and welfare as key domains.

**Product implication:** Design for a mix of home/family support and formal care, and for differing digital confidence and connectivity. Do not assume a single urban smartphone user. The MVP can be web-first but should be responsive, lightweight and capable of later language/local-service adaptation.

Sources:
- Directorate General of Health Services, NPHCE: https://www.dghs.mohfw.gov.in/national-programme-for-health-care-of-the-elderly.php
- MoHFW, *Annual Report 2024–25* (NPHCE overview): https://www.mohfw-dohfw.gov.in/static/uploads/2025/09/45b06af4508a53a059c74efc930d955e.pdf

## 5. Indian health-data governance: consent, purpose and minimization

The Government of India's ABDM Health Data Management Policy is described by the National Portal of India as setting minimum privacy-protection standards for participants in the ABDM ecosystem and advancing “Security & Privacy by Design”. In a parliamentary answer, MoHFW stated that the ABDM policy does not permit sharing with another entity, including insurers or pharmaceutical companies, without the individual's consent; it also described purpose limitation, no onward disclosure without consent, retention tied to purpose and data minimization.

**Product implication:** Apply these as design principles even where the prototype is not an ABDM participant: ask permission before sharing, show who has access, scope access to a specific older adult and purpose, avoid collecting unnecessary data, and never monetize health data through unrelated sharing. Do not claim ABDM compliance or connection without a formal integration.

Sources:
- National Portal of India, ABDM Health Data Management Policy: https://www.india.gov.in/category/health-wellness/subcategory/health-care-promotion-products/details/health-data-management-policy-of-ayushman-bharat-digital-mission-abdm
- Rajya Sabha answer, “Data Sharing under the Health Data Management Policy”, 17 December 2024: https://sansad.in/getFile/annex/266/AU2518_3blf7g.pdf?source=pqars

## 6. DPDP Act and Rules have phased commencement

The Digital Personal Data Protection Act, 2023 was followed by the Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), 13 November 2025), plus a corrigendum (G.S.R. 892(E), 10 December 2025). The commencement notification (G.S.R. 843(E), 13 November 2025) phases provisions. As of 15 November 2026, the one-year tranche has started (13 November 2026), while the eighteen-month tranche is scheduled for 13 May 2027. The IT Act section 43A repeal is in the eighteen-month tranche, so the existing IT Act/SPDI framework remains relevant until that date.

**Product implication:** Build data minimization, purpose limitation, clear notice, explicit authorization, security safeguards, correction/deletion workflows and breach readiness into the product now. Do not simply assert that all DPDP Act/Rules obligations are already in force on the research date. Have Indian privacy counsel confirm the exact obligations and any later Gazette updates before production launch.

Primary sources:
- Gazette, G.S.R. 843(E), DPDP Act commencement notification (13 November 2025): https://egazette.gov.in/WriteReadData/2025/267647.pdf
- Gazette, G.S.R. 846(E), DPDP Rules, 2025 (13 November 2025): https://egazette.gov.in/WriteReadData/2025/267650.pdf
- IndiaCode reproduction of corrigendum G.S.R. 892(E) (10 December 2025): https://indiacode.ecourtsindia.com/rules/corrigendum-to-digital-personal-data-protection-rules-2025-d95eb25b/
- IndiaCode reproduction of IT SPDI Rules, 2011: https://indiacode.ecourtsindia.com/rules/the-information-technology-reasonable-security-practices-and-a1af21b5/

## 7. Telemedicine and clinical boundaries

The Government of India's Telemedicine Practice Guidelines describe the registered medical practitioner’s professional judgment as central to deciding whether telemedicine is appropriate and whether an in-person review is required. The guidelines identify context, practitioner/patient identification, communication mode, consent, consultation type, evaluation and management as elements to consider.

**Product implication:** The MVP is not a telemedicine consultation platform. It should not represent reminders or automated summaries as medical advice. Any future consultation capability needs a distinct compliance and clinician-governance workstream.

Source: MoHFW, *Telemedicine Practice Guidelines*: https://www.mohfw.gov.in/pdf/Telemedicine.pdf

## 8. Accessibility is directly relevant to older users

W3C's WAI guidance on older users explains that accessibility standards address many needs that can arise with ageing, including visual, auditory, motor and cognitive changes. WCAG 2.2 is the current W3C recommendation identified by W3C; its Level AA Success Criterion 2.5.8 sets a 24×24 CSS-pixel minimum target-size requirement subject to exceptions. The product should go beyond the bare minimum for its primary audience.

**Product implication:** Use large readable text, high contrast, simple language, obvious labels, keyboard support, visible focus, generous spacing and large primary controls. Avoid requiring drag-and-drop, precise gestures, memory of hidden icons or color recognition alone.

Sources:
- W3C WAI, *Older Users and Web Accessibility*: https://www.w3.org/WAI/older-users/
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: https://www.w3.org/TR/WCAG22/
- W3C WAI, *Understanding SC 2.5.8 Target Size (Minimum)*: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum

## 9. Security verification should be testable

OWASP ASVS 5.0.0 (published 30 May 2025) is a framework of application-security verification requirements. It is useful as a checklist for authentication, session management, access control, validation, cryptography, error handling and logging.

**Product implication:** Turn security into test cases: another family member cannot read this profile; a revoked member cannot access it; a used/expired passcode cannot be reused; sensitive health information never appears in generic email templates or logs; audit events identify the actor without duplicating the sensitive payload.

Source: OWASP Application Security Verification Standard 5.0.0: https://asvs.owasp.org/

## 10. Interoperability is a later opportunity, not an MVP assumption

The ABDM FHIR Implementation Guide describes FHIR R4-based health data interchange for the Indian context and identifies health information providers/users in the ABDM ecosystem. An integration would require conformance, consent flows, sandbox/production onboarding and technical approvals; it is not achieved by merely adding a field for an ABHA number.

**Product implication:** Keep the internal data model clean and standards-aware, but defer ABDM connectivity until the core platform is stable and the team has completed the official onboarding and consent requirements. Do not store or request ABHA identifiers without a concrete approved purpose.

Source: NRCeS, ABDM FHIR Implementation Guide (version page; draft build observed 15 July 2026): https://www.snomedctnrc.in/preview/ndhm/fhir/r4/index.html

## 11. Research gaps requiring primary user validation

The desk research cannot establish whether your target users prefer email, phone calls, WhatsApp, printed routines or assisted use; how many people should receive an alert; which languages are needed; whether they share devices; what level of schedule detail is understandable; and how they want caretaker access revoked. Conduct short moderated interviews with older adults and their chosen caregivers. Do not infer needs solely from age.

Suggested questions:
- “Show me how you currently remember and track medicines.”
- “Who helps you, and what should each person be able to see or change?”
- “What should happen if nobody records a dose status?”
- “Which information would you not want in an email?”
- “How would you know the medication schedule in the app is current?”
- “Can you revoke someone's access without help?”

## Evidence quality and caveats

WHO, W3C, MoHFW, official Gazette and National Portal sources are primary or authoritative references. Some legal references above use IndiaCode reproductions for searchable text; the Gazette remains authoritative. The research does not validate the current website, establish actual user behaviour, prove clinical efficacy, establish regulatory classification, or certify the product. Re-check laws, official guidance and technical versions before deployment.
