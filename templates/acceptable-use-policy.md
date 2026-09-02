---
id: P02
slug: acceptable-use-policy
title: Acceptable Use Policy
short: Sets the rules every person must follow when using company accounts, devices, data, networks and third-party tools.
owner_role: Security Owner
order: 2
tsc:
- CC1.1
- CC1.4
- CC2.2
- CC5.3
- CC6.7
- CC6.8
---

## 1. Purpose

Most security incidents at companies the size of {{company}} start with an everyday action: a reused password, a customer export left in a personal drive, a link clicked in a convincing email. This policy sets out what personnel may and may not do with the accounts, devices, data and services {{company}} provides, so that everyone understands the expectations before a mistake becomes an incident.

## 2. Scope

This policy applies to every employee, contractor, intern and temporary worker of {{company}}, and to anyone else granted an account on a company system. It covers:

- Company accounts, including {{#unless idp_none}}{{idp}} identities and every application signed into through them, {{/unless}}{{scm}}, {{cicd}}, the {{cloud}} consoles, email, chat and ticketing tools{{#if has_vendors}}, and third-party services such as {{vendors}}{{/if}}.
- Company-issued laptops and phones{{#if has_mdm}} enrolled in {{mdm}}{{/if}}, and any personally owned device used to read company email, join company chat or reach company data.
- All data that {{company}} creates, receives or processes, including {{product}} customer data{{#if has_sensitive_data}} and the {{data_types}} data within it{{/if}}.
- Networks used for work{{#if remote_or_hybrid}}, including home and public networks used by remote and travelling staff{{/if}}.

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy, models the behaviour it describes, and ensures enforcement is consistent regardless of seniority.
- **Security Owner** ({{security_owner}}) owns this policy, maintains the approved tool list, answers questions about whether a use is permitted, and investigates reported violations.
- **Engineering** enforces these rules technically where practical, for example by requiring single sign-on, blocking unmanaged devices from production and enabling secret scanning in {{scm}}.
- **People Operations** obtains signed acknowledgement from every new hire before access is granted, re-collects it at each {{review_cadence}} review, and handles disciplinary consequences with the Security Owner.
- **All Personnel** follow this policy, ask before doing something they are unsure about, and report accidental violations immediately rather than concealing them.

## 4. Policy Statements

- **4.1** Company systems, accounts and devices are provided for the business of {{company}}. Limited personal use is permitted where it does not interfere with work, create legal or security risk, or mix personal files with company data. Personnel have no expectation of privacy in company systems beyond what applicable law provides.
- **4.2** Accounts are personal. Personnel never share passwords, session cookies, multi-factor codes or hardware keys, never sign in as another person, and never create accounts outside the Access Control Policy process. {{#if has_password_manager}}Work credentials are stored only in {{password_manager}}.{{/if}}{{#unless has_password_manager}}Work credentials are stored only in the password manager approved by the Security Owner, never in browsers, notes or spreadsheets.{{/unless}}
- **4.3** {{#if mfa}}Every account that supports multi-factor authentication has it enabled.{{/if}}{{#unless mfa}}Multi-factor authentication is enabled on every account that supports it as part of the rollout led by the Security Owner.{{/unless}} Personnel never approve an authentication prompt they did not initiate; an unexpected prompt is reported to {{incident_contact}}.
- **4.4** Production systems, source code and customer data are accessed only from company-managed devices running a supported operating system with full-disk encryption, screen lock and automatic updates enabled{{#if has_mdm}} and enrolled in {{mdm}}{{/if}}. Personally owned devices may be used for email and chat only with Security Owner approval and only if they meet the same baseline.
- **4.5** Customer data and Confidential or Restricted information, as defined in the Data Classification and Handling Policy, stay inside approved systems and are never copied to personal email, personal cloud storage, removable media, screenshots, chat messages or unapproved tools. {{#if has_phi}}Protected health information is never placed in email or chat unless the Security Owner has approved the specific channel. {{/if}}{{#if has_payment}}Full payment card numbers are never typed, pasted, stored or transmitted by personnel; card handling is delegated entirely to the payment processor.{{/if}}
- **4.6** AI assistants, code generation tools and similar services are used only if they are on the approved tool list. Customer data, secrets, personal data and unreleased source code are not entered into any AI tool unless the Security Owner has confirmed in writing that its data handling terms permit it.
- **4.7** Secrets such as API keys, tokens, private keys and database passwords are never written into source code, tickets, chat, documents or wikis. They live in the secrets manager approved by Engineering, and secret scanning in {{scm}} is never bypassed.
- **4.8** Personnel install software only from official vendor sources or the approved list, keep it updated, and never disable or tamper with endpoint protection, disk encryption, logging agents{{#if has_mdm}}, {{mdm}} management profiles{{/if}} or other security controls.
- **4.9** The following are prohibited: bypassing or testing security controls without written authorisation from the Security Owner; scanning, probing or attacking systems {{company}} does not own; downloading or distributing pirated content or malware; cryptocurrency mining; harassment or threats; and any activity that is illegal where it takes place.
- **4.10** Personnel verify unexpected requests for money, credentials or data through a second channel before acting, do not auto-forward company mail to external addresses, and share documents externally only through approved systems with the narrowest audience that gets the job done.
- **4.11** {{#if remote_or_hybrid}}When working away from a company office, personnel keep screens out of the view of others, lock devices when stepping away, avoid discussing Confidential information in public, and reach internal systems only through the company-approved connectivity method. Public Wi-Fi is used only with the device baseline in 4.4 fully in place.{{/if}}{{#unless remote_or_hybrid}}Devices are locked when unattended, screens showing Confidential information face away from visitors and shared areas, and company equipment leaves the office only with Security Owner approval.{{/unless}}
- **4.12** Public statements about the security, compliance or data handling practices of {{company}} are made only by people authorised by Executive Management. Personnel do not describe {{company}} or {{product}} as certified, compliant or audited in any public or customer-facing channel unless the wording has been approved.
- **4.13** Lost or stolen devices, suspected malware, phishing attempts, accidental data exposure and any other suspected security event are reported to {{incident_contact}} as soon as they are discovered, and in any case within four hours during working days. Prompt good-faith reporting is never penalised.

## 5. Procedures

- **5.1** Acknowledgement. People Operations sends this policy with the offer paperwork, obtains a signed acknowledgement, and files it before the Security Owner approves account creation. Acknowledgements are re-collected at each {{review_cadence}} review and after any material revision.
- **5.2** Device provisioning. Engineering or the designated IT function configures each company device to the baseline in 4.4 before handover{{#if has_mdm}}, enrols it in {{mdm}} and verifies that encryption, screen lock and update policies have applied{{/if}}, and records the device and its user in the asset register under the Asset Management Policy.
- **5.3** Tool approval. Personnel who want to use a new SaaS product, browser extension, AI tool or piece of software submit a request to the Security Owner describing the tool, the data it will touch and the business need. The Security Owner reviews its data retention, training-use and sub-processor terms, responds within five business days, records the decision and permitted data classifications in the approved tool list, and arranges single sign-on through {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}the company identity provider once one is adopted{{/if}} where supported. The list is re-checked quarterly because vendor terms change.
- **5.4** Lost or stolen device. The affected person reports to {{incident_contact}} immediately. The Security Owner {{#if has_mdm}}triggers a remote lock and wipe through {{mdm}}, {{/if}}revokes active sessions in {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}each business application{{/if}}, rotates any credentials stored on the device, and records the event under the Incident Response Policy.
- **5.5** Phishing. Personnel forward suspicious messages to {{incident_contact}} without clicking links or opening attachments. The Security Owner assesses the message within one business day, blocks the sender or indicator where possible, and warns the team if the campaign is targeted. Phishing recognition is part of annual awareness training.
- **5.6** Quarterly spot checks. The Security Owner reviews external sharing settings in {{#unless idp_none}}{{idp}} and the connected applications{{/unless}}{{#if idp_none}}the company document and email platforms{{/if}}, checks {{scm}} secret scanning alerts and their resolution, {{#if has_logging_tool}}reviews relevant alerts in {{logging_tool}}, {{/if}}and samples device compliance{{#if has_mdm}} in {{mdm}}{{/if}}. Findings are logged and tracked to closure.
- **5.7** Violations. Suspected violations, including one's own, are reported to the Security Owner or People Operations. The Security Owner investigates, preserves relevant logs, documents the outcome and, with People Operations, decides on the response in section 7.
- **5.8** Offboarding. On the last working day People Operations confirms that devices, badges and materials have been returned and that no copies of company or customer data are retained, and Engineering confirms that all accounts have been disabled under the Access Control Policy. Returned devices are wiped before reassignment.

## 6. Exceptions

Exceptions are approved in writing by the Security Owner, recorded in the exception register with the justification, compensating controls and an expiry date no later than twelve months out, and reviewed at each {{review_cadence}} review. No exception permits sharing accounts, disabling multi-factor authentication where it is mandatory, or storing Restricted data outside approved systems.

## 7. Enforcement

People Operations and the Security Owner handle violations together. Consequences are proportionate to intent and impact and range from a documented conversation and retraining, through temporary loss of access, to termination of employment or contract. Deliberate misuse of customer data, deliberate circumvention of controls or illegal activity is escalated to Executive Management immediately and may be referred to law enforcement. Accidental violations that are self-reported promptly are treated as learning opportunities.

## 8. Review Cadence

The Security Owner reviews this policy at the {{review_cadence}} policy review, whenever a new class of tool or working arrangement is introduced at {{company}}, and after any incident in which a rule in this policy was a contributing factor. Revisions are approved by {{approver}}, recorded in section 9 and re-acknowledged by all personnel.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
