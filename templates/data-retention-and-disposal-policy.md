---
id: P07
slug: data-retention-and-disposal-policy
title: Data Retention and Disposal Policy
short: Defines how long each category of data is kept and how data, media and devices are securely disposed of when they are no longer needed.
owner_role: Security Owner
order: 7
tsc:
- CC6.5
- CC6.1
- CC6.7
- C1.2
---

## 1. Purpose

This policy establishes how long {{company}} retains each category of data it creates, receives or processes while operating {{product}}, and how that data is destroyed when it is no longer needed. Keeping data longer than necessary increases breach impact, storage cost and legal exposure; deleting it too early can breach contracts, tax law or employment law. A written retention schedule, automated deletion and disposal methods that render data unrecoverable resolve that tension and support the SOC 2 criteria for disposal of data and physical assets and for destruction of confidential information.

## 2. Scope

This policy applies to all data regardless of format or location: production databases and object storage on {{cloud}}, backups and snapshots{{#if has_backup_tool}} in {{backup_tool}}{{/if}}, logs{{#if has_logging_tool}} in {{logging_tool}}{{/if}}, source code and build artifacts in {{scm}} and {{cicd}}, email and collaboration tools, SaaS vendor systems{{#if has_vendors}} including {{vendors}}{{/if}}, laptops and mobile devices, removable media and paper records.{{#if has_sensitive_data}} It applies with particular force to the {{data_types}} data that {{company}} handles.{{/if}} It binds all employees and contractors and covers data held for customers as well as {{company}}'s own records. Where a customer agreement or law requires a different retention period, that requirement prevails and the schedule in Section 5 records it.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds retention automation, authorizes legal holds and resolves conflicts between business needs and retention limits.
- **Security Owner ({{security_owner}})** owns the retention schedule, approves disposal of Confidential and Restricted data, maintains the disposal log and legal-hold register, runs the quarterly retention audit and reports results at each policy review.
- **Engineering** implements retention in {{product}} through lifecycle rules, time-to-live settings and deletion jobs, executes customer deletion requests, decommissions cloud resources and verifies that backups expire on schedule.
- **People Operations** retains employment, recruiting and training records per the schedule, coordinates return and wiping of equipment at offboarding, and confirms departing personnel have kept no company data.
- **All Personnel** store company data only in approved systems, keep no personal copies or exports, and follow the disposal procedures for any data or media they handle.

## 4. Policy Statements

- **4.1** {{company}} maintains a written retention schedule (Section 5.1) listing each data category, its system of record, retention period and disposal method. Data is kept no longer than its business purpose, contractual commitment or legal obligation requires, whichever is longest, and is disposed of promptly afterwards.
- **4.2** Personnel collect and keep only data needed for a defined purpose. New data collection in {{product}} must have an owner, a classification under the Data Classification and Handling Policy and a retention period before release.
- **4.3** Customer data in {{product}} is retained for the term of the customer agreement and deleted within 30 days after termination or after a verified written deletion request, unless a legal hold applies. {{company}} confirms deletion in writing on request.
- **4.4** Backups follow the {{backup_cadence}} schedule in the Backup and Recovery Policy and expire automatically no later than 35 days after creation{{#if has_backup_tool}} through {{backup_tool}} lifecycle settings{{/if}}. Deleted production data is fully purged once the last backup containing it expires; personnel do not restore backups to circumvent a deletion.
- **4.5** Security and audit logs are retained for 12 months and application debug logs for 30 days, consistent with the Logging and Monitoring Policy, unless a legal hold or documented investigation requires longer.
- **4.6** Data subject to specific legal or regulatory retention rules follows those rules, which take precedence over the general schedule.{{#if has_pii}} Personal data is retained only as described in the privacy notices given to individuals, and verified deletion requests are fulfilled within 30 days.{{/if}}{{#if has_phi}} Documentation required by the HIPAA Security Rule is retained for at least six years from creation or last effective date.{{/if}}{{#if has_payment}} Cardholder data is never stored after authorization except as processor-issued tokens, and sensitive authentication data such as CVV codes is never stored.{{/if}}
- **4.7** Electronic data is disposed of by cryptographic erasure, provider-level deletion followed by expiry of associated snapshots, or overwriting, so that it cannot be reconstructed with commercially reasonable effort. Media leaving {{company}}'s control is purged or destroyed per NIST SP 800-88 Rev. 1; paper is cross-cut shredded.
- **4.8** Laptops and mobile devices are fully erased before reassignment, return, sale or recycling{{#if has_mdm}} using the remote erase function in {{mdm}}{{/if}}. Because all devices use full-disk encryption under the Endpoint and Workstation Security Policy, destroying the device encryption key is an acceptable disposal method.
- **4.9** A legal hold suspends every deletion that would otherwise apply to the data it covers. Only Executive Management, on advice of counsel, initiates or releases a hold; the Security Owner records each hold, its scope and its release in the legal-hold register.
- **4.10** Vendors that process {{company}} or customer data must be contractually obliged to delete or return it within 90 days after the service ends and to confirm deletion on request.{{#if has_vendors}} This is verified during vendor reviews for {{vendors}}.{{/if}}
- **4.11** Personnel may not keep company or customer data in personal email, personal cloud storage, personal devices or removable media. Bulk exports of customer data require a documented reason and Security Owner approval and are deleted once their purpose is served.
- **4.12** Disposal of Confidential or Restricted data and of hardware that has held company data is recorded in the disposal log with date, method, performer and verifier.{{#if scope_confidentiality}} Because Confidentiality is within the scope of {{company}}'s SOC 2 examination, disposal records are retained as evidence for the full examination period.{{/if}}

## 5. Procedures

- **5.1** Retention schedule. Customer data in {{product}}: agreement term plus 30 days; system of record is the production databases and object storage on {{cloud}}; disposal by application deletion job and provider API. Backups and snapshots: 35 days rolling, automatic expiry. Security and audit logs: 12 months; application debug logs: 30 days. Source code: indefinitely in {{scm}}; build artifacts and CI logs in {{cicd}}: 90 days. Employment records: 7 years after employment ends, or longer where law requires. Unsuccessful candidate records: 12 months. Financial, tax and payroll records: 7 years. Contracts and vendor records: term plus 7 years. Support tickets: 3 years after closure. Incident records, risk assessments, access reviews, policy approvals and audit evidence: 7 years. Product analytics and marketing data: 24 months.
- **5.2** Automated deletion. Engineering configures lifecycle rules, time-to-live settings or scheduled deletion jobs for each category and documents them alongside the schedule; changes follow the Change Management Policy. Each quarter Engineering confirms every rule is present and executed successfully and attaches the evidence to the retention audit.
- **5.3** Customer deletion requests. Requests arriving through support or {{incident_contact}} are verified as coming from an authorized customer representative, ticketed and assigned to Engineering, which deletes the data from production within 30 days and confirms no copies remain in non-production environments. Support confirms deletion to the customer in writing.
- **5.4** Customer offboarding. When an agreement ends, the account enters a read-only export state for 30 days, after which the deletion procedure in 5.3 runs.{{#if has_vendors}} Where sub-processors such as {{vendors}} hold the customer's data, Engineering triggers deletion in each within the same window and records the confirmation.{{/if}}
- **5.5** Device disposal. People Operations collects devices at offboarding or replacement and records receipt in the asset register.{{#if has_mdm}} Engineering issues a remote erase through {{mdm}} and retains the completion record.{{/if}}{{#unless has_mdm}} Engineering performs a factory reset that destroys the full-disk encryption key and records the serial number and date.{{/unless}} Devices leaving the company go to a certified recycler whose certificate of destruction is attached to the asset record.
- **5.6** Cloud decommissioning. When a service, environment or account on {{cloud}} is retired, Engineering completes a checklist: delete volumes and buckets, expire snapshots and backups, revoke credentials and keys, remove DNS and monitoring, and update the asset inventory. The checklist is attached to the change record.
- **5.7** Legal hold. Executive Management notifies the Security Owner in writing of the matter, custodians and data categories. Within two business days the Security Owner suspends the relevant automated deletions, instructs custodians in writing, records the hold in the register and reviews it quarterly until Executive Management releases it in writing.
- **5.8** Quarterly retention audit. The Security Owner samples each category, confirms the oldest records do not exceed their retention period, checks the disposal log for completeness and records the results. Findings become issues with a 30-day remediation deadline and are reported to Executive Management.
- **5.9** Paper and removable media. Paper holding Confidential or Restricted data is kept in locked cabinets and destroyed by cross-cut shredder or locked shredding bin. Removable media is prohibited for company data except with Security Owner approval; approved media is encrypted and destroyed after use, and the destruction is logged.
- **5.10** Schedule review. At each {{review_cadence}} policy review the Security Owner checks the schedule against new customer commitments, changes in law and new data categories in {{product}}, and updates the schedule and automation.

## 6. Exceptions

Exceptions require a written request describing the data, the business justification, the proposed retention period or disposal method and the compensating controls. The Security Owner approves or rejects it; exceptions involving customer data or a period longer than the schedule also require Executive Management approval. Approved exceptions are recorded in the exception register, expire after no more than 12 months unless renewed, and are reviewed at each policy review.

## 7. Enforcement

Violations of this policy are handled under the Human Resources Security Policy and may result in disciplinary action up to and including termination of employment; contractors and vendors are subject to contract termination. Unauthorized retention, export or disposal of data is treated as a security incident and reported to {{incident_contact}} under the Incident Response Policy.

## 8. Review Cadence

The Security Owner reviews this policy on the {{review_cadence}} review cycle and after any significant change to {{company}}'s systems, vendors, customer commitments or applicable law, and after any incident involving improper retention or disposal. Changes are approved by {{approver}} and recorded in the revision history.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
