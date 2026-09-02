---
id: P12
slug: logging-and-monitoring-policy
title: Logging and Monitoring Policy
short: Defines which security-relevant events are logged across the product, cloud and corporate systems, how logs are protected and retained, and how alerts are triaged and acted on.
owner_role: Engineering Lead
order: 12
tsc:
- CC2.1
- CC7.1
- CC7.2
- CC7.3
- A1.1
---

## 1. Purpose

Logs are the memory of a system. Without them {{company}} cannot tell whether an account was misused, how far an attacker got or whether a control actually operated. This policy defines which events {{company}} logs across {{product}}, its cloud platforms and its corporate systems, how logs are collected, protected and retained, which conditions raise alerts and how quickly alerts are handled, supporting the SOC 2 criteria for detecting and evaluating security events and for monitoring availability.

## 2. Scope

This policy applies to all systems that store, process or transmit {{company}} or customer data: all environments for {{product}}, {{scm}} and {{cicd}}{{#unless idp_none}}, {{idp}}{{/unless}}, endpoints{{#if has_mdm}} managed with {{mdm}}{{/if}}, and SaaS vendors{{#if has_vendors}} such as {{vendors}}{{/if}} to the extent they expose audit logs. The cloud platforms whose audit logs are in scope are:

{{#each cloud_list}}- {{this}}
{{/each}}

It binds all employees and contractors who build or operate these systems, respond to alerts or access logs.{{#if scope_availability}} Because Availability is within the scope of {{company}}'s SOC 2 examination, it also covers monitoring of the uptime, performance and capacity of {{product}}.{{/if}}

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds the log platform and on-call capacity, and receives quarterly reporting on detection coverage and alert handling.
- **Security Owner ({{security_owner}})** defines the required log sources and alert rules, performs or delegates the weekly log review, approves logging configuration changes and escalates alerts into the Incident Response Policy.
- **Engineering** implements logging in {{product}}, enables and forwards audit logs from every in-scope platform, operates the central log platform{{#if has_logging_tool}} ({{logging_tool}}){{/if}}, maintains alert rules and runbooks and staffs on-call.
- **People Operations** ensures on-call personnel and log reviewers complete the relevant training and that log access is removed at offboarding.
- **All Personnel** never attempt to disable, alter or delete logs, never write secrets or unnecessary sensitive data into logs or tickets, and report suspicious activity to {{incident_contact}}.

## 4. Policy Statements

- **4.1** At minimum the following are logged: for each platform in {{cloud}}, the provider's management and API audit log, identity and access changes, network flow or firewall logs where available, and access logs for storage holding customer data; {{#unless idp_none}}{{idp}} sign-in events, multi-factor enrollment changes and administrator actions; {{/unless}}the organization audit log of {{scm}} and repository security setting changes; {{cicd}} runs and configuration changes; {{product}} authentication successes and failures, password and multi-factor changes, authorization failures, privileged actions, API key creation and revocation, data exports and deletions, and security setting changes;{{#if has_mdm}} {{mdm}} enrollment and compliance changes;{{/if}} endpoint security agent events; and vendor administrator audit logs where available.
- **4.2** Each record includes a UTC timestamp, source system, acting identity, action, target, result and, where relevant, source IP address and a correlation identifier. Passwords, session tokens, API keys, private keys, full card numbers, health information and other sensitive data are never logged; fields that could contain them are masked before emission.
- **4.3** Logs from all sources are forwarded to {{#if has_logging_tool}}{{logging_tool}}{{/if}}{{#unless has_logging_tool}}a central log platform designated by Engineering{{/unless}} within 15 minutes of generation. Sources have write-only access, and the platform is the system of record for investigations.
- **4.4** Security and audit logs are retained for at least 12 months with the most recent 90 days searchable without restoration; application debug logs are retained for 30 days. Retention is enforced by platform configuration and reviewed under the Data Retention and Disposal Policy.{{#if has_payment}} Because Payment data is in scope, audit logs for the cardholder data environment are retained for at least 12 months with three months immediately available.{{/if}}
- **4.5** Logs are tamper-resistant: storage is append-only or uses provider immutability, deletion occurs only through the configured retention policy, and no individual, including administrators, holds standing rights to delete or modify records. Disabling a source, changing retention or altering forwarding is a change under the Change Management Policy and raises an alert.
- **4.6** Log access is restricted to Engineering and the Security Owner under the Access Control Policy, administrative access is limited to named individuals, and all access is logged and reviewed quarterly. All systems synchronize time with a trusted source so that events correlate across platforms.
- **4.7** Alert rules exist for at least: repeated authentication failures or credential stuffing; multi-factor authentication disabled or reset; a new administrator or privilege escalation; changes to cloud identity policies or roles; use of a root, owner or break-glass account; a security group or firewall rule opened to the internet; a storage bucket made public; a secret detected in {{scm}}; logging disabled; unusual data export or deletion volume; changes to {{cicd}} configuration or deployment credentials;{{#if has_mdm}} a device falling out of compliance in {{mdm}};{{/if}} and any endpoint security detection. Each rule has a severity, an owner and a runbook.
- **4.8** Alerts are acknowledged and triaged within defined timelines: Critical within 1 hour at any time; High within 4 business hours; Medium within 2 business days; Low at the weekly review. Any alert assessed as a confirmed or probable security event is escalated under the Incident Response Policy and reported to {{incident_contact}}.
- **4.9** The health and performance of {{product}} are monitored continuously, including external uptime checks, error rates, latency, queue depth and resource saturation, with alerts routed to the on-call engineer.{{#if scope_availability}} Because Availability is within scope, {{company}} defines service level objectives for availability and latency, monitors and alerts against them, and maintains a customer-facing status page updated within 30 minutes of a confirmed customer-impacting outage.{{/if}}
- **4.10** The Security Owner or a delegate reviews alert activity, privileged actions and log source health weekly, and reviews detection coverage against 4.1 and 4.7 quarterly, with results documented.
- **4.11** Alert rules are tuned to keep false positives manageable; changes to a rule's logic, threshold or severity are recorded with the reason, and rules that produced only false positives for a quarter are reviewed for relevance.
- **4.12** {{company}} subscribes to the status pages and security advisory feeds of its cloud platforms and critical vendors{{#if has_vendors}}, including {{vendors}},{{/if}} so that upstream incidents are correlated with internal alerts.
- **4.13** Non-production environments log the same security events as production so that misuse of staging is detectable, retain logs for 30 days and contain no production customer data.

## 5. Procedures

- **5.1** Log source inventory. Engineering maintains an inventory of every source in 4.1 with system, log type, forwarding method, retention and owner. The Security Owner reviews it quarterly against the asset inventory; any gap becomes a High finding under the Vulnerability and Patch Management Policy.
- **5.2** Onboarding a system. Before a new service, cloud account, vendor or environment goes live, the change record includes a logging checklist confirming audit logging is enabled, forwarding is verified with a test event, sensitive fields are masked, retention is set and alert rules cover the new source.
- **5.3** Alert rule catalogue. Engineering maintains each rule's name, source, condition, severity, owner, routing and runbook link. The Security Owner reviews the catalogue quarterly, confirms every condition in 4.7 is covered and records additions, removals and threshold changes.
- **5.4** Alert handling. The on-call engineer acknowledges each alert within the 4.8 timeline, classifies it as true positive, false positive or benign, investigates using the runbook, records the outcome in a ticket and resolves it or escalates it to the Security Owner as a potential incident.
- **5.5** Weekly log review. The Security Owner or delegate reviews the week's alerts and their dispositions, samples privileged actions across {{cloud}}{{#unless idp_none}}, {{idp}}{{/unless}} and {{scm}}, confirms every source reported during the week and records the review with date, reviewer and follow-up actions.
- **5.6** Source health. The log platform alerts when any source has delivered nothing for more than 30 minutes, and Engineering checks ingestion volumes monthly for unexplained drops or spikes.
- **5.7** Retention and archive. Engineering configures 90 days of searchable storage and archive to immutable lower-cost storage through 12 months, after which records are deleted automatically unless a legal hold under the Data Retention and Disposal Policy applies. Settings are verified quarterly.
- **5.8** Access review. Each quarter the Security Owner reviews the users and roles with log platform access, removes access no longer required and reviews the platform's own access log for unexpected activity.
- **5.9** Availability monitoring. Engineering maintains external uptime checks for every public {{product}} endpoint from at least two locations, dashboards for error rate, latency and saturation, and paging for the on-call engineer.{{#if scope_availability}} Each month Engineering reviews availability against the service level objectives, documents any breach and its cause, updates the capacity forecast and reports the results to Executive Management.{{/if}}
- **5.10** Detection testing and reporting. Semi-annually Engineering simulates a sample of the 4.7 conditions, such as a burst of failed logins or a test secret pushed to a sandbox repository, confirms each alert reaches on-call within the expected time and records the results. Each quarter the Security Owner reports to Executive Management on alert volume by severity, acknowledgement times against 4.8, incidents escalated, coverage gaps{{#if scope_availability}}, availability against objectives{{/if}} and corrective actions.

## 6. Exceptions

Deviations such as a system that cannot forward logs to the central platform or a vendor that exposes no audit logs require a written exception request describing the system, the risk, the compensating controls and the remediation date. The Security Owner approves or rejects it; exceptions affecting production customer data also require Executive Management approval. Approved exceptions are recorded in the exception register, last no more than 12 months and are reviewed at each policy review.

## 7. Enforcement

Disabling or tampering with logging, ignoring assigned alerts, or accessing logs without authorization violates this policy and is handled under the Human Resources Security Policy, up to and including termination of employment; contractors and vendors are subject to contract termination. Suspected tampering with logs is treated as a security incident and reported immediately to {{incident_contact}}.

## 8. Review Cadence

The Security Owner reviews this policy on the {{review_cadence_lc}} review cycle and after any significant change to {{company}}'s cloud platforms, log tooling or product architecture, and after any incident in which detection was delayed or logs were unavailable. Changes are approved by {{approver}} and recorded in the revision history.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
