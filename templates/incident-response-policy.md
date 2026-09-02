---
id: P13
slug: incident-response-policy
title: Incident Response Policy
short: Defines how security incidents are reported, classified by severity, contained, resolved and reviewed, including customer, regulator and vendor notification obligations.
owner_role: Security Owner
order: 13
tsc:
- CC7.3
- CC7.4
- CC7.5
- CC2.3
---

## 1. Purpose

This policy establishes how {{company}} prepares for, detects, responds to and recovers from security incidents affecting {{product}}, its infrastructure and the information entrusted to {{company}} by customers, personnel and partners, so as to limit harm, restore normal operations quickly, meet notification obligations, preserve evidence, and turn every incident into a documented improvement.

## 2. Scope

This policy applies to all {{company}} personnel, including contractors and interns, and to every system and data set {{company}} owns or operates: production in {{cloud}}, code and pipelines in {{scm}} and {{cicd}}, corporate SaaS, endpoints, and vendor services holding {{company}} data.{{#if remote_or_hybrid}} It applies wherever personnel work, including home offices and travel.{{/if}}

A **security event** is any observable occurrence relevant to security. A **security incident** is an event that has, or is reasonably likely to have, compromised the confidentiality, integrity or availability of {{company}} systems or data. A **data breach** is an incident resulting in unauthorised access to, disclosure, alteration or loss of personal or customer data. Every incident is assigned one of these severity levels.

| Severity | Definition | Response targets | Notification |
| --- | --- | --- | --- |
| SEV1 - Critical | Confirmed exposure of customer data, attacker control of a production system, ransomware, or {{product}} unavailable for most customers | Acknowledge in 15 minutes; Incident Commander in 30 minutes; containment under way in 1 hour; updates hourly | Executive Management immediately; customers and regulators per Section 5 |
| SEV2 - High | Likely compromise of one account or system, malware on an endpoint with production access, exposure of internal confidential data, or partial outage of {{product}} | Acknowledge in 30 minutes; Incident Commander in 1 hour; containment in 4 hours; updates every 4 hours | Executive Management within 4 hours; affected customers |
| SEV3 - Moderate | Control failure with no confirmed exposure, phishing reported before credentials were entered, or an actively exploited vulnerability present in {{company}} systems | Acknowledge in 4 business hours; remediate in 5 business days; daily updates | Security Owner; quarterly incident report |
| SEV4 - Low | Negligible impact, such as a blocked scan, a false positive, or a lost device that was encrypted and wiped | Acknowledge in 2 business days; resolve in 30 days | Incident log only |

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, is notified of SEV1 and SEV2 incidents, makes final decisions on customer and regulatory notification, engages outside counsel and insurers, and funds and attends incident exercises.
- **Security Owner ({{security_owner}})** owns this policy and the incident runbook, monitors {{incident_contact}}, triages reports and assigns severity, appoints the Incident Commander, maintains the incident log, leads post-incident reviews and reports incident metrics.
- **Incident Commander** directs a given SEV1 or SEV2 response as the single decision-maker, setting priorities, assigning tasks, deciding containment actions and controlling the update cadence. The Security Owner fills the role unless someone else is appointed.
- **Engineering** staffs the on-call rotation, executes containment, eradication and recovery in {{cloud}}, {{scm}} and related systems, preserves evidence, and implements corrective actions.
- **People Operations** supports incidents involving personnel, such as insider misuse or lost devices, runs any disciplinary process, and ensures incident-reporting training at onboarding and annually.
- **All Personnel** report suspected incidents to {{incident_contact}}, cooperate with responders, preserve rather than delete potential evidence, and do not discuss incidents outside the response team.

## 4. Policy Statements

- **4.1** Anyone who observes or suspects a security incident must report it to {{incident_contact}} within one hour of discovery. Good-faith reports are never penalised, even where the reporter caused the incident.
- **4.2** Every report is triaged and assigned a severity from Section 2 within the acknowledgement target for that level. Severity may be raised by any responder at any time and lowered only by the Incident Commander with a written rationale.
- **4.3** Every SEV1 and SEV2 incident has a named Incident Commander with authority to take systems offline, revoke credentials, block traffic and engage vendors without prior approval; Executive Management is informed of containment decisions, not consulted first.
- **4.4** Every incident has a record in the incident log with a unique identifier, timestamped timeline, decisions, participants, affected systems and data, evidence and closure criteria, retained for at least three years.
- **4.5** Evidence, including logs{{#if has_logging_tool}} in {{logging_tool}}{{/if}}, cloud audit trails, snapshots and access records, is preserved before any remediation that could destroy it, and evidence that may be needed in a dispute is stored in a restricted location with a chain-of-custody note.
- **4.6** Containment prioritises protecting customer data and people over restoring availability. Compromised credentials are rotated and sessions revoked{{#unless idp_none}} in {{idp}}{{/unless}} as a first action; compromised hosts are isolated, not rebuilt, until evidence is captured.
- **4.7** Only Executive Management, or their designate for the incident, communicates about it with customers, the press, regulators, law enforcement or the public; personnel must not confirm, deny or speculate about incidents with third parties.
- **4.8** Customers whose data or service is affected by a confirmed incident are notified without undue delay, within any contractual timeframe, and in every case within 72 hours of {{company}} confirming their data was affected, stating what happened, what {{company}} has done and what the customer should do.
- **4.9** Legal, regulatory and contractual notification obligations are assessed for every SEV1 and SEV2 incident, with outside counsel where the analysis is unclear.{{#if has_pii}} Where personal data is involved, supervisory authorities are notified within 72 hours where the GDPR or UK GDPR applies, affected individuals and state attorneys general where US state breach-notification laws require it, and customers acting as data controllers in time to meet their own deadlines.{{/if}}{{#if has_phi}} Where protected health information is involved, {{company}} follows the HIPAA Breach Notification Rule and each business associate agreement, notifying the covered entity within the contractual period and never later than 60 days after discovery.{{/if}}{{#if has_payment}} Where cardholder data is involved, the payment processor, acquiring bank and card brands are notified as PCI DSS and the merchant agreement require, and {{company}} cooperates with any forensic investigation.{{/if}}
- **4.10** Incidents at vendors{{#if has_vendors}}, including {{vendors}},{{/if}} that affect {{company}} data or {{product}} are handled under this policy, and vendor contracts must require notification to {{company}} within 72 hours under the Vendor and Third-Party Risk Management Policy.
- **4.11** Every SEV1 and SEV2 incident receives a blameless post-incident review within five business days of closure that produces a root cause, an impact statement and corrective actions with owners and due dates, tracked to closure and reported to Executive Management.
- **4.12** The plan is exercised at least annually with Executive Management, Engineering and the Security Owner, and all personnel complete incident-reporting training at onboarding and annually; exercise findings are entered in the risk register.
- **4.13** Where an incident threatens the availability of {{product}}, the Incident Commander may invoke the Business Continuity and Disaster Recovery Policy; the incident and recovery records reference each other so that one timeline exists.

## 5. Procedures

- **5.1** **Detection and reporting.** Incidents arrive from{{#if has_logging_tool}} {{logging_tool}} alerts,{{/if}} {{cloud}} security notifications, {{scm}} secret-scanning and dependency alerts, vendor notices, customer reports and personnel reports to {{incident_contact}}. The on-call responder acknowledges each within the target for the suspected severity.
- **5.2** **Triage.** Within the acknowledgement target, the Security Owner or on-call responder confirms whether the event is an incident, assigns a severity (choosing the higher when facts are uncertain), opens a record with an identifier in the form INC-YYYY-NNN and, for SEV1 and SEV2, appoints the Incident Commander.
- **5.3** **Mobilisation.** The Incident Commander opens a dedicated channel named after the incident identifier, designates a scribe and, for SEV1 and SEV2, a communications lead, and sets the update cadence.
- **5.4** **Containment.** Responders first disable accounts and revoke sessions{{#unless idp_none}} in {{idp}}{{/unless}}, rotate exposed keys and secrets, block malicious addresses, isolate affected hosts or containers in {{cloud}}{{#if has_mdm}} and remotely lock or wipe endpoints through {{mdm}}{{/if}}. Longer-term containment, such as rebuilding hosts, is planned once spread is stopped, and each action and its time are recorded.
- **5.5** **Evidence collection.** Before eradication, responders snapshot affected volumes, export logs and cloud audit trails covering at least 30 days before the first indicator, capture attacker activity and preserve related messages and tickets in a restricted, access-logged location; large artefacts are hashed.
- **5.6** **Eradication and recovery.** Engineering removes the root cause, rebuilds compromised systems from known-good images or infrastructure code in {{scm}}, restores data where needed from backups{{#if has_backup_tool}} in {{backup_tool}}{{/if}} under the Backup and Recovery Policy, verifies integrity and returns systems to service through an expedited change approval, with heightened monitoring for 14 days.
- **5.7** **Notification.** Within 24 hours of confirming that customer or personal data was affected, the Security Owner prepares a notification assessment listing who must be told and by when. Executive Management approves the assessment and messages, counsel reviews regulatory notices, and copies of every notice are attached to the incident record.
- **5.8** **Post-incident review.** Within five business days of closing a SEV1 or SEV2 incident, the Incident Commander convenes a blameless review covering the timeline, root cause, response timings, impact, what went well and badly, and corrective actions with owners and due dates; the Security Owner approves it and presents SEV1 reviews to Executive Management.
- **5.9** **Metrics.** Each quarter the Security Owner reports to Executive Management the number of incidents by severity, mean time to acknowledge, contain and resolve, notifications made, overdue corrective actions and trends.
- **5.10** **Exercise and plan maintenance.** Each year the Security Owner runs a scenario exercise (a leaked {{scm}} token, ransomware on a laptop, or a compromised {{cloud}} administrator account) and documents decisions and gaps, and each quarter reviews the runbook and contact roster covering {{incident_contact}}, on-call rotations, Executive Management, counsel, the insurer, {{cloud}} support{{#if has_vendors}} and security contacts at {{vendors}}{{/if}}.

## 6. Exceptions

Exceptions require the written approval of the Security Owner, a compensating control and an expiry date no more than 12 months away, and are reviewed at each {{review_cadence}} policy review. No exception is available to the reporting obligation in 4.1, the communication restriction in 4.7, or any notification required by law or contract.

## 7. Enforcement

Failing to report a suspected incident, concealing one, destroying evidence, making unauthorised external statements or obstructing responders is a violation of this policy and may result in disciplinary action up to and including termination of employment or contract; unlawful conduct may be referred to law enforcement. Vendors that miss notification obligations are subject to the remedies in their contract.

## 8. Review Cadence

The Security Owner reviews this policy on a {{review_cadence}} basis and after every SEV1 incident, any exercise that reveals a material gap, significant changes to {{company}}'s infrastructure or reporting channels, and changes in breach-notification law. Each review is approved by {{approver}} and recorded in Section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
