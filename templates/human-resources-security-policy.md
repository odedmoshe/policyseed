---
id: P18
slug: human-resources-security-policy
title: Human Resources Security Policy
short: Sets the security requirements that apply to people before, during and after their engagement so that screening, access, training and accountability follow every personnel change.
owner_role: People/HR Lead
order: 18
tsc:
- CC1.1
- CC1.4
- CC1.5
- CC2.2
- CC6.2
- CC6.3
---

## 1. Purpose

People are the control that every other control depends on. This policy sets what {{company}} requires of its personnel, and of those who manage them, before someone starts, while they work here, when their role changes and when they leave, so that nobody gains access to {{product}} systems or customer data without being screened, bound by confidentiality obligations and trained, and so that access ends promptly when it is no longer needed.

## 2. Scope

This policy applies to every employee, contractor, intern, temporary worker and agency staff member engaged by {{company}} (together, "personnel") who receives a {{company}} account, a company device or access to any system that stores or processes {{product}} data. It covers screening, onboarding, training, role changes, discipline and offboarding, regardless of location; {{company}} currently operates on a {{work_model}} basis with {{headcount}} personnel. Where local employment law is more protective than this policy, it prevails and the difference is recorded under Section 6.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds screening and training, and sets the expectation that security obligations are part of every role; {{approver}} is the approver of record.
- **Security Owner ({{security_owner}})** owns the security content of the onboarding and offboarding checklists, defines the training curriculum, reviews access reconciliations and handles escalations of suspected policy violations.
- **Engineering** provisions and revokes technical access ({{scm}}, {{cloud}} and {{cicd}}) within the timelines in this policy and confirms completion on the relevant checklist.
- **People Operations** owns this policy and runs recruitment, screening, contract execution, the HR system of record, training tracking, role-change notifications and the offboarding trigger.
- **All Personnel** complete required screening and training, acknowledge policies, protect the credentials and equipment issued to them, report suspected security incidents to {{incident_contact}} and return company property when they leave.

## 4. Policy Statements

- **4.1** Every candidate for a role with access to {{product}} systems, customer data or company finances is screened before their start date: identity verification, right-to-work confirmation, verification of the most recent employment, and a criminal record check where legally permitted in the candidate's jurisdiction and proportionate to the role. Where a check is not permitted, People Operations records the reason and applies an alternative such as additional reference checks.
- **4.2** No account, device or system access is issued until the individual has signed an employment or services agreement with confidentiality and intellectual property terms and has acknowledged the Information Security Policy and the Acceptable Use Policy in writing.
- **4.3** Access is provisioned within one business day of the start date through {{#if idp_none}}the provisioning checklist maintained by the Security Owner{{/if}}{{#unless idp_none}}{{idp}}, the source of identity for all company accounts{{/unless}}, using a role-based access profile approved by the hiring manager. Multi-factor authentication is enrolled on the first day{{#if mfa}}, before any other system is used{{/if}}{{#unless mfa}} for every system that supports it{{/unless}}.
- **4.4** All personnel complete security awareness training within 30 days of starting and at least every 12 months thereafter. Engineers also complete secure development training covering the OWASP Top 10, secrets handling and change management.{{#if has_pii}} Personnel who handle personal data complete data protection training on lawful processing, data subject rights and breach reporting.{{/if}}{{#if has_phi}} Personnel who handle protected health information complete minimum-necessary and permitted-use training before access is granted.{{/if}}
- **4.5** When a person changes role, team or manager, their access is reviewed against the new role's profile within five business days. Access no longer required is removed rather than accumulated; a role change never grants access by default.
- **4.6** When an engagement ends, all access is revoked within 24 hours of the termination date, and immediately for involuntary departures or leave pending investigation. Revocation covers {{#unless idp_none}}the {{idp}} identity and every application connected to it, {{/unless}}{{scm}}, {{cloud}}, {{cicd}}{{#if has_vendors}}, {{vendors}}{{/if}}, shared mailboxes, API tokens and any credential the person held personally.
- **4.7** Company devices are returned on or before the last working day. {{#if has_mdm}}They are locked and wiped through {{mdm}} before reuse, and unreturned devices are wiped remotely within 24 hours of departure.{{/if}}{{#unless has_mdm}}They are securely erased and re-imaged before reuse, and the erasure is recorded on the offboarding checklist.{{/unless}}
- **4.8** {{#if has_password_manager}}Credentials that must be shared are stored only in {{password_manager}} vaults. When a person leaves, the vaults they could access are reviewed and any credential they could have read is rotated within five business days.{{/if}}{{#unless has_password_manager}}Shared credentials are prohibited unless approved by the Security Owner and recorded in the credential register; when a person leaves, every recorded credential they could have read is rotated within five business days.{{/unless}}
- **4.9** Contractors, agency workers and vendor staff with access to {{company}} systems meet the same screening, acknowledgement, training and offboarding requirements as employees. Where the contracting entity performs screening, {{company}} obtains written confirmation that it is equivalent to Section 4.1.
- **4.10** Every job description for a role with system access states its security responsibilities. Managers include adherence to security policies in performance conversations and may not waive policy requirements for individuals.
- **4.11** Violations of security policy are handled through a formal disciplinary process that is proportionate, documented and consistent. Sanctions range from retraining to termination of employment or contract and, where the law requires, referral to authorities.
- **4.12** Personnel report suspected security incidents, policy violations and concerns about unethical behaviour to {{incident_contact}} or to any member of Executive Management. {{company}} does not retaliate against anyone who reports in good faith.
- **4.13** People Operations retains evidence of screening, signed agreements, policy acknowledgements, training completion, role-change reviews and offboarding checklists for the duration of employment plus three years, or longer where law requires, so that these controls can be evidenced for any audit period.

## 5. Procedures

- **5.1** Pre-employment screening. After an offer is accepted, People Operations initiates screening through the screening provider or documented manual checks and reviews the results with the hiring manager before confirming the start date. Adverse findings are escalated to Executive Management, and the decision is recorded in the HR system. Owner: People Operations. Timing: complete before day one.
- **5.2** Onboarding. Three business days before the start date, People Operations opens an onboarding ticket listing role, manager, start date, device requirement and access profile. Engineering provisions {{#unless idp_none}}the {{idp}} account and groups, then {{/unless}}{{scm}} and cloud access from that profile and records completion on the ticket. On day one the new starter receives their device{{#if has_mdm}}, already enrolled in {{mdm}}{{/if}}, enrols multi-factor authentication{{#if has_password_manager}}, joins {{password_manager}}{{/if}} and acknowledges the required policies. Owner: People Operations, with Engineering. Timing: access live within one business day of start.
- **5.3** Policy acknowledgement. All personnel acknowledge the Information Security Policy, the Acceptable Use Policy and this policy within five business days of starting and within 30 days of each revision. Acknowledgements are collected electronically and stored with the personnel record. Owner: People Operations. Cadence: at hire and on every revision.
- **5.4** Security training. The Security Owner maintains the curriculum and assigns it to new starters within 30 days and to all personnel annually. Completion is tracked, and People Operations chases incomplete training at 14 and 7 days before the deadline. Phishing simulations run at least twice a year; anyone who fails one completes a refresher within two weeks. Owner: Security Owner, with People Operations. Cadence: at hire and annually.
- **5.5** Role change. When a manager notifies People Operations of a change, People Operations updates the HR record and opens an access review ticket. The new manager confirms the required profile, and Engineering removes access no longer needed, adds what is, and closes the ticket noting what was removed. Owner: People Operations, with Engineering. Timing: within five business days of the change.
- **5.6** Offboarding. People Operations records the last working day and notifies the Security Owner and Engineering. On the departure date (immediately for involuntary departures) Engineering disables {{#unless idp_none}}the {{idp}} account, cutting off connected applications, then {{/unless}}{{scm}}, {{cloud}} and {{cicd}} access{{#if has_vendors}}, removes the person from {{vendors}}{{/if}}, revokes personal API tokens and transfers ownership of documents and repositories to the manager. The device is collected{{#if has_mdm}} and wiped through {{mdm}}{{/if}}, and the timestamped checklist is stored with the personnel record. Owner: People Operations, with Engineering. Timing: all access revoked within 24 hours.
- **5.7** Quarterly access reconciliation. Each quarter the Security Owner compares the HR roster with the active accounts in {{#unless idp_none}}{{idp}}, {{/unless}}{{scm}} and {{cloud}}. Any account without a matching active person is disabled the same day and investigated, and the comparison is retained as evidence. Owner: Security Owner. Cadence: quarterly.
- **5.8** Disciplinary handling. Suspected violations are reported to the Security Owner, who documents the facts. People Operations conducts any formal process with the person's manager and, where warranted, Executive Management, giving the individual an opportunity to respond, and records the outcome and any corrective action. Owner: People Operations. Timing: initial review within five business days of the report.
- **5.9** Contractor lifecycle. Before a contractor receives access, People Operations confirms a signed services agreement with confidentiality terms, screening confirmation and policy acknowledgement, and records a contract end date on which access expires unless the engaging manager confirms an extension in writing. Owner: People Operations, with the engaging manager. Cadence: at engagement and on each extension.

## 6. Exceptions

Exceptions must be requested in writing to the Security Owner, state the business reason and the compensating controls, and be approved by {{approver}}. Approved exceptions are recorded in the exception register with an expiry date no more than 12 months away and are reviewed at each policy review. No exception may waive the offboarding timelines in Section 4.6 or the confidentiality requirements in Section 4.2.

## 7. Enforcement

Failure to comply with this policy may result in disciplinary action up to and including termination of employment or contract, in line with Section 4.11 and applicable law. Managers who knowingly allow non-compliance are subject to the same process, and contractual remedies apply to contractors and vendors.

## 8. Review Cadence

The People/HR Lead and the Security Owner review this policy on a {{review_cadence}} basis and after any material change to the workforce model, headcount band, identity provider or applicable employment law. Each review is recorded in Section 9, and material changes are communicated to all personnel within 30 days.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
