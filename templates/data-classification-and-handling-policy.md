---
id: P06
slug: data-classification-and-handling-policy
title: Data Classification and Handling Policy
short: Defines the four data classification levels and the storage, transmission, sharing and disposal rules that apply to each.
owner_role: Security Owner
order: 6
tsc:
- CC6.1
- CC6.5
- CC6.7
- CC3.2
- C1.1
- C1.2
---

## 1. Purpose

Not all information needs the same protection, and treating everything as top secret is as unworkable as treating nothing that way. This policy gives {{company}} a simple, four-level classification scheme and states, for each level, where data may be stored, how it may be transmitted, who it may be shared with, and how it is disposed of. It tells an engineer whether a dataset can go into staging, tells a salesperson whether a document can be emailed to a prospect, and tells an examiner how {{company}} identifies and protects the information it has committed to keep confidential.

## 2. Scope

This policy applies to all personnel of {{company}} and to all information that {{company}} creates, receives, stores or processes in any form, including data held in {{cloud}}, in {{scm}}, in business applications{{#if has_vendors}} such as {{vendors}}{{/if}}, on endpoints, in backups and logs, and on paper. It covers the customer data that {{product}} processes{{#if has_sensitive_data}}, which includes {{data_types}} data,{{/if}} as well as internal business information, personnel records, source code and security records. {{#if scope_confidentiality}}Because Confidentiality is within the scope of the SOC 2 examination, this policy also defines how {{company}} identifies information subject to confidentiality commitments and protects it for as long as those commitments last.{{/if}}

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy and the classification scheme, and approves any external disclosure of Restricted information not already covered by a customer agreement.
- **Security Owner** ({{security_owner}}) owns this policy, maintains the data inventory, decides classification where it is unclear, approves external sharing of Confidential and Restricted information, and monitors compliance with the handling rules.
- **Engineering** implements the technical handling controls in {{cloud}} and {{product}}: encryption, access restrictions, tagging of storage by classification, separation of production and non-production data, and secure deletion.
- **People Operations** classifies and protects personnel records, and includes classification and handling in onboarding and annual training.
- **All Personnel** classify information they create, handle it according to its level, apply the stricter level when in doubt, and report suspected mishandling to {{incident_contact}}.

## 4. Policy Statements

- **4.1** {{company}} classifies information into four levels. **Public** is information approved for release to anyone, such as marketing content and published documentation. **Internal** is routine business information that would cause limited harm if disclosed, such as internal announcements and most project documentation. **Confidential** is information whose disclosure would harm {{company}}, its personnel or its partners, such as financial records, contracts, personnel data, unreleased product plans, source code and security configurations. **Restricted** is information whose disclosure would cause serious harm to customers or {{company}} or breach a legal or contractual obligation, including all customer data processed by {{product}}{{#if has_sensitive_data}}, all {{data_types}} data{{/if}}, credentials and encryption keys, and security incident details.
- **4.2** The person who creates or first receives information classifies it. Where classification is unclear, the higher level applies until the Security Owner decides. Aggregations of Internal information that together reveal Confidential or Restricted facts take the higher classification.
- **4.3** Restricted and Confidential information is stored only in systems that the Security Owner has approved for that level and that are recorded in the data inventory. Customer data is stored only in the production environment of {{product}} in {{cloud}} and its managed backups, never on endpoints, in chat, in tickets, in personal storage or in unapproved SaaS tools.
- **4.4** Restricted information is encrypted at rest and in transit using the standards in the Encryption and Key Management Policy. Confidential information is encrypted in transit and, where stored on endpoints or removable media, at rest. Encryption is not a substitute for the access restrictions in the Access Control Policy.
- **4.5** Access to Restricted information is limited to individuals with a documented need, granted under the Access Control Policy, reviewed quarterly, and logged{{#if has_logging_tool}} in {{logging_tool}}{{/if}}. Access to Confidential information is limited to the teams that need it for their work.
- **4.6** Production customer data is not copied into development, staging, test or analytics environments. Where realistic data is needed for testing, Engineering uses synthetic data or data irreversibly anonymised through a documented process approved by the Security Owner.
- **4.7** Confidential and Restricted information is shared externally only with a party that has a signed agreement containing confidentiality terms, only through approved channels that provide encryption and access control, only with the minimum content required, and only with the approval of the information owner. Restricted information additionally requires Security Owner approval unless it is being returned to the customer who owns it through the ordinary operation of {{product}}. Public links, open shares and personal email are never used for these levels.
- **4.8** {{#if has_pii}}Personal data is collected only for the purposes described in the privacy notice of {{company}}, is limited to what those purposes require, is not repurposed without a lawful basis, and is handled under the Privacy and Data Protection Policy. Requests from individuals to access, correct or delete their data are routed to the Security Owner within one business day.{{/if}}{{#unless has_pii}}Any personal data that {{company}} incidentally holds, such as the contact details of customer users, is treated as Confidential, limited to what the business relationship requires, and handled under the Privacy and Data Protection Policy.{{/unless}}
- **4.9** {{#if has_phi}}Protected health information is Restricted, is processed only within the boundary described in the applicable business associate agreements, is never sent by email or chat, is accessed only by personnel who have completed health data handling training, and is logged on every access. {{company}} does not use protected health information for product development, analytics or marketing.{{/if}}{{#unless has_phi}}{{company}} does not knowingly process protected health information. If a customer or prospect proposes to send health data through {{product}}, the Security Owner and Executive Management decide whether to accept it and what additional controls and agreements are required first.{{/unless}}
- **4.10** {{#if has_payment}}Payment card data is Restricted. {{company}} delegates card capture, storage and processing to a certified payment processor; full card numbers, security codes and chip or stripe data are never stored, logged or displayed by {{product}} or handled by personnel. Only tokens and the last four digits are retained.{{/if}}{{#unless has_payment}}{{company}} does not process payment card data directly. Any future acceptance of card payments is designed so that card data is captured, stored and processed only by a certified payment processor and never enters the systems of {{company}}.{{/unless}}
- **4.11** Restricted and Confidential documents are labelled with their classification where the format allows, for example in a header, footer or document property. Systems that hold Restricted data are tagged with that classification in the asset register and in {{cloud}}.
- **4.12** Information is retained only as long as the Data Retention and Disposal Policy requires and is then disposed of securely: deleted from primary storage and backups on the documented schedule, wiped from media as in the Asset Management Policy, and shredded where on paper. Customer data is deleted or returned at the end of the customer relationship on the timeline in the customer agreement.
- **4.13** {{#if scope_confidentiality}}Information that {{company}} has agreed to keep confidential under a customer agreement, non-disclosure agreement or partnership is identified when the agreement is signed, recorded in the data inventory against the agreement, classified as Restricted or Confidential according to its terms, and protected for the duration the agreement requires, even after the relationship ends.{{/if}}{{#unless scope_confidentiality}}Information received from customers, partners or prospects under a non-disclosure agreement is classified as Confidential at minimum, recorded in the data inventory against the agreement, and protected for the duration the agreement requires.{{/unless}}
- **4.14** Suspected mishandling of information, including sending Confidential or Restricted data to the wrong recipient, is reported to {{incident_contact}} immediately and handled under the Incident Response Policy. Reporting one's own mistake promptly is expected and never penalised.

## 5. Procedures

- **5.1** Data inventory. The Security Owner maintains an inventory of the significant datasets and data stores of {{company}}, recording for each the description, classification, owner, hosting system, whether it contains {{#if has_sensitive_data}}{{data_types}} data{{/if}}{{#unless has_sensitive_data}}personal or regulated data{{/unless}}, the retention period, and any contractual confidentiality obligation. The inventory is updated at each quarterly access review and whenever a new data store is introduced.
- **5.2** Classifying a new dataset or system. Before a new data store, integration or SaaS tool receives company or customer data, the requester describes the data to the Security Owner using the classification questionnaire. The Security Owner assigns the level, records it in the data inventory and asset register, and confirms that the system meets the storage and encryption requirements for that level. Engineering applies the corresponding tags in {{cloud}}.
- **5.3** External sharing approval. A person who needs to share Confidential or Restricted information externally raises a request naming the recipient, the agreement that covers them, the content and the channel. The information owner approves Confidential sharing; the Security Owner additionally approves Restricted sharing. Approved sharing uses an approved channel with access limited to named recipients and expiring links where supported, and the request is retained as evidence.
- **5.4** Non-production data. Engineering documents the source of data in every non-production environment. Where production-like data is genuinely needed, the requesting engineer proposes an anonymisation or synthesis method, the Security Owner approves it, and the resulting dataset is recorded in the data inventory as Internal with a note of its origin. Production credentials are never present in non-production environments.
- **5.5** Restricted data access logging. Engineering ensures that access to production customer data stores is logged with the identity, time and action{{#if has_logging_tool}} in {{logging_tool}}{{/if}}, and the Security Owner samples those logs monthly against approved tickets and incidents. Unexplained access is investigated within two business days.
- **5.6** Quarterly exposure checks. The Security Owner reviews externally shared files and public links in {{#unless idp_none}}{{idp}} and the applications federated to it{{/unless}}{{#if idp_none}}the company document and email platforms{{/if}}, checks {{cloud}} storage for publicly readable buckets or objects, and reviews {{scm}} for repositories whose visibility does not match their classification. Findings are corrected within five business days and recorded.
- **5.7** Customer data requests. Requests from customers to export, correct or delete their data are logged on receipt, verified as coming from an authorised customer contact, executed by Engineering within the timeline in the customer agreement or applicable law, and confirmed to the customer in writing. Deletion covers primary storage and, on the backup rotation schedule, backups.
- **5.8** Training. People Operations includes the classification scheme and handling rules in onboarding and annual security training, with role-specific content for Engineering{{#if has_phi}} and health data handling training for anyone who accesses protected health information{{/if}}. Completion is recorded as evidence.
- **5.9** Mishandling response. On a report of misdirected or exposed information, the Security Owner confirms the classification, works with the sender to recall or request deletion, assesses whether customer or regulatory notification is required under the Incident Response Policy and the Privacy and Data Protection Policy, and records the event and any corrective action.

## 6. Exceptions

Exceptions, such as a temporary need to hold Confidential information in an unapproved tool during a migration, are approved in writing by the Security Owner, recorded in the exception register with the compensating controls and an expiry date no later than twelve months out, and reviewed at each {{review_cadence}} review. Exceptions that affect Restricted information additionally require approval from {{approver}}. No exception permits customer data in personal accounts or unapproved AI tools, or production data in non-production environments without an approved anonymisation method.

## 7. Enforcement

Information found outside the systems approved for its classification is removed or secured as soon as it is discovered, and the circumstances are investigated. Personnel who share Confidential or Restricted information without approval, copy customer data to unapproved locations, or ignore the handling rules are subject to the disciplinary process in the Acceptable Use Policy, up to and including termination. Deliberate exfiltration of customer data is escalated to Executive Management immediately and may be referred to law enforcement.

## 8. Review Cadence

The Security Owner reviews this policy at the {{review_cadence}} policy review, after any incident involving data exposure, and whenever {{company}} begins processing a new category of data, enters a market with new data protection obligations, or changes the scope of its SOC 2 examination. Revisions are approved by {{approver}} and recorded in section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
