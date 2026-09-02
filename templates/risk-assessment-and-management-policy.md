---
id: P17
slug: risk-assessment-and-management-policy
title: Risk Assessment and Management Policy
short: Establishes a repeatable risk assessment, a scored risk register, treatment and acceptance authorities, and regular reporting so that security decisions are made on evidence.
owner_role: Security Owner
order: 17
tsc:
- CC3.1
- CC3.2
- CC3.3
- CC3.4
- CC4.1
- CC4.2
- CC5.1
- CC9.1
---

## 1. Purpose

This policy establishes how {{company}} identifies, analyses, treats and monitors the risks that could prevent it from meeting its security{{#if scope_availability}}, availability{{/if}}{{#if scope_confidentiality}}, confidentiality{{/if}} and business objectives for {{product}}. It gives {{company}} a consistent way to decide which risks matter, what to do about them, who may accept them, and how to show that decisions were made and followed through. Every control should trace to a risk in the register, and every risk should have an owner and a decision.

## 2. Scope

This policy applies to all risks to the confidentiality, integrity and availability of {{company}} information and systems, whether arising from technology, people, processes, vendors, physical environments, legal and regulatory change or fraud. It covers {{product}} and its infrastructure in {{cloud}}, corporate systems, data held by vendors{{#if has_vendors}} such as {{vendors}}{{/if}} and the {{headcount}} personnel who operate them, and binds Executive Management, the Security Owner, system owners and everyone who owns a risk or a treatment action. Risks are scored on likelihood and impact using the scales below; the score is likelihood multiplied by impact, and the rating sets the required response.

| Likelihood | Score | Description |
| --- | --- | --- |
| Rare | 1 | Not expected within five years |
| Unlikely | 2 | Could occur within five years |
| Possible | 3 | Could occur within a year |
| Likely | 4 | Expected within a year |
| Almost certain | 5 | Expected several times a year or already occurring |

| Impact | Score | Description |
| --- | --- | --- |
| Negligible | 1 | No customer impact; internal inconvenience only |
| Minor | 2 | Limited internal impact; no exposure of confidential data; {{product}} degraded under one hour |
| Moderate | 3 | Exposure of internal confidential data, outage of {{product}} up to four hours, or a contractual obligation missed for one customer |
| Major | 4 | Exposure of customer data{{#if has_sensitive_data}} including {{data_types}} data{{/if}} for some customers, outage beyond the recovery time objective, regulatory notification required, or material financial loss |
| Severe | 5 | Widespread exposure of customer data, prolonged loss of {{product}}, regulatory enforcement, or a threat to the viability of {{company}} |

| Rating | Score range | Required response |
| --- | --- | --- |
| Critical | 15 to 25 | Treatment plan within 5 business days; treatment started within 30 days; acceptance only by Executive Management |
| High | 10 to 14 | Treatment plan within 30 days; treated or accepted within 90 days |
| Moderate | 5 to 9 | Treatment plan within 90 days; reviewed each quarter |
| Low | 1 to 4 | Monitored; treated when practical or accepted by the system owner |

## 3. Roles and Responsibilities

- **Executive Management** approves this policy and the risk appetite, reviews the risk register at least quarterly, is the only authority that may accept Critical risks, allocates budget and people to treatment plans, and considers assessment results when setting company objectives.
- **Security Owner ({{security_owner}})** owns this policy and the risk register, leads annual and triggered assessments, facilitates scoring, tracks treatment actions to closure, maintains the mapping between risks and controls, and reports risk status to Executive Management.
- **Engineering** identifies technical threats and vulnerabilities affecting {{product}} and its {{cloud}} infrastructure, owns and executes technical treatment actions, provides evidence that controls operate, and raises new risks from architecture and vendor changes.
- **People Operations** identifies risks from hiring, role changes, departures, training gaps and insider threat, owns treatment actions in those areas, and ensures risk responsibilities are reflected in role descriptions.
- **All Personnel** raise risks they observe to their manager or {{incident_contact}}, complete assigned treatment actions on time, and cooperate with risk assessments.

## 4. Policy Statements

- **4.1** {{company}} conducts a formal risk assessment at least annually and after triggers including a SEV1 or SEV2 incident, a significant change to {{product}} or its infrastructure, adoption or loss of a Tier 1 vendor, entry into a new market or regulatory regime, a material change in organisation, or a failed control test. Triggered assessments may be limited to the affected area.
- **4.2** Every assessment identifies assets and owners, threats and vulnerabilities, existing controls, and likelihood and impact using the Section 2 scales, considering external attack, internal misuse, error, vendor failure, environmental events, legal change and fraud, including misuse of privileged access and manipulation of financial or customer records.
- **4.3** {{company}} maintains a single risk register recording for each risk an identifier, description, affected assets and objectives, owner, inherent and residual likelihood, impact and score, existing controls, chosen treatment, actions with owners and due dates, acceptance decisions with approver and expiry, and the date of last review.
- **4.4** Each risk is treated in one of four ways, mitigate, transfer, avoid or accept, and the choice and its rationale are recorded in the register.
- **4.5** Residual risk is accepted only by the authority in Section 2: Critical by Executive Management, High by the Security Owner with a member of Executive Management, Moderate by the Security Owner, Low by the system owner. Acceptances are written, state the reason and any conditions, and expire within 12 months, after which the risk is re-approved or treated.
- **4.6** {{company}}'s risk appetite, approved by Executive Management, is that no Critical risk is carried without an active treatment plan, no risk of exposing customer data{{#if has_sensitive_data}} or {{data_types}} data{{/if}} is accepted at High or Critical, and risks to customer availability commitments are treated before risks affecting only internal convenience.
- **4.7** Every risk has one named owner accountable for the treatment decision and for keeping the entry current. Treatment actions have owners and due dates in the ticketing system, and overdue actions on High and Critical risks are reported to Executive Management at the next quarterly review.
- **4.8** The Security Owner maintains a mapping from each risk to the policies and controls that treat it and to the applicable Trust Services Criteria, so that the control set can be shown to follow from assessed risks and gaps are visible.
- **4.9** Control operation is monitored through defined evidence: access reviews, vulnerability scans, backup and restore tests, incident metrics, vendor reviews and training completion. When monitoring shows a control has failed, the related risk is re-scored and, if it reaches High or Critical, a triggered assessment is opened.
- **4.10** Risks from vendors{{#if has_vendors}}, including {{vendors}},{{/if}} and from {{cloud}} platform dependencies are assessed under this policy using information gathered under the Vendor and Third-Party Risk Management Policy, with concentration and continuity risks recorded and owned.
- **4.11** The Security Owner reports to Executive Management at least quarterly on new and closed risks, rating changes, overdue actions, acceptances approaching expiry and control monitoring results; the review and its decisions are minuted.
- **4.12** Findings from internal reviews, external audits, penetration tests and post-incident reviews are entered in the register or linked to an existing risk within ten business days, so that one prioritised list of actions exists.
- **4.13** At least annually, someone who does not own the register (a member of Executive Management, an internal reviewer or an external advisor) evaluates whether the assessment was complete, scores consistent and treatments carried out, and records the outcome.

## 5. Procedures

- **5.1** **Annual planning.** The Security Owner schedules the assessment, confirms scope with Executive Management, updates the asset inventory with Engineering and People Operations, gathers the incident log, vulnerability reports, vendor reviews, audit findings, monitoring results and changes to {{product}} and applicable law, and invites system owners to workshops.
- **5.2** **Identification.** In workshops, the Security Owner walks through each asset group (production in {{cloud}}, code and delivery in {{scm}} and {{cicd}}, identity and endpoints, corporate data, vendors, people and facilities) and records threats, vulnerabilities and existing controls, including fraud scenarios and ways a privileged user could bypass controls. New risks receive an identifier in the form RISK-NNN.
- **5.3** **Scoring.** Participants agree inherent likelihood and impact using the Section 2 scales, list existing controls and agree residual scores. The Security Owner challenges scores inconsistent with comparable risks or incident history and records the rationale for each score.
- **5.4** **Treatment planning.** For each risk rated Moderate or above, the owner proposes treatment, actions, owners, due dates and the expected residual rating within the timeframe for the rating. The Security Owner reviews plans for completeness and cost; Executive Management approves plans for Critical risks and any plan needing budget.
- **5.5** **Acceptance.** Where acceptance is proposed, the Security Owner summarises the risk, controls, residual score and reason, obtains written approval from the authority in 4.5, records the approver and expiry in the register and adds the expiry to the review calendar.
- **5.6** **Register maintenance.** The Security Owner updates the register within ten business days of any change: new risks from incidents, audits, vendor reviews or personnel reports; completed actions with evidence; re-scored risks; and expired acceptances. Each entry shows the date and author of its last change.
- **5.7** **Quarterly review.** The Security Owner reviews every High and Critical risk with its owner, confirms progress, re-scores where circumstances have changed, chases overdue actions, checks acceptances expiring next quarter, reviews monitoring evidence and prepares the report required by 4.11.
- **5.8** **Triggered assessment.** When a trigger in 4.1 occurs, the Security Owner opens a triggered assessment within five business days limited to the affected scope, follows 5.2 to 5.5, and reports to Executive Management within 30 days, or immediately if a Critical risk is found.
- **5.9** **Control monitoring.** Engineering, People Operations and the Security Owner collect the evidence in 4.9 on the cadence set in the relevant policy, record results against mapped risks and raise a ticket for any control not operating. The Security Owner reviews results monthly and re-scores affected risks.
- **5.10** **Independent evaluation.** Once a year the Security Owner arranges the evaluation required by 4.13, provides the register, treatment evidence and monitoring results, records findings as risks or actions and presents the evaluation to Executive Management.

## 6. Exceptions

Exceptions require written approval from Executive Management, a statement of the reason and compensating measures, and an expiry date no more than 12 months away, and are recorded in the risk register and reviewed at each {{review_cadence}} policy review. No exception permits a Critical risk to be accepted by anyone other than Executive Management, or an acceptance to remain in force beyond its expiry without re-approval.

## 7. Enforcement

Failing to raise a known risk, failing to complete an assigned treatment action without an approved extension, accepting a risk without the required authority, or altering the risk register to conceal a risk or its status is a violation of this policy and may result in disciplinary action up to and including termination of employment or contract.

## 8. Review Cadence

The Security Owner reviews this policy on a {{review_cadence}} basis and after any independent evaluation that identifies a weakness in the risk process, any SEV1 incident caused by an unidentified or mis-scored risk, and changes to {{company}}'s objectives, regulatory obligations or scope of examination. Each review is approved by {{approver}} and recorded in Section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
