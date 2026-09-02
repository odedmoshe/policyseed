---
id: P22
slug: privacy-and-data-protection-policy
title: Privacy and Data Protection Policy
short: Sets out how personal data handled through the product and the business is collected, used, shared, protected, retained and made available to the people it concerns.
owner_role: Security Owner
order: 22
tsc:
- CC2.3
- CC9.2
- C1.1
- C1.2
---

## 1. Purpose

{{company}} handles personal data belonging to customers, the users of {{product}}, prospects, personnel and business contacts. This policy defines how that data is collected, used, shared, protected, retained and deleted, and how {{company}} responds to the people it concerns, so that {{company}} meets its legal and contractual privacy obligations and takes privacy decisions deliberately rather than by default.

## 2. Scope

This policy applies to all personal data processed by {{company}}, whether as a controller (personnel and marketing data) or as a processor for its customers (data submitted to {{product}}). It applies to all personnel and to all systems, including {{product}}, corporate applications{{#if has_vendors}} and third-party services, currently including {{vendors}}{{/if}}. {{#if has_sensitive_data}}{{company}} currently processes the following regulated categories of data through {{product}}: {{data_types}}.{{/if}}{{#unless has_sensitive_data}}{{company}} has not identified regulated categories of data beyond ordinary account, contact and personnel data, to which this policy applies in full.{{/unless}} This policy is not legal advice; stricter local requirements prevail.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy and the privacy notice and is accountable for {{company}}'s privacy obligations to customers and regulators; {{approver}} is the approver of record.
- **Security Owner ({{security_owner}})** owns this policy and acts as privacy lead: maintains the data inventory, approves new processing and vendors, coordinates data subject requests, leads breach assessment and reports privacy risk to Executive Management, which appoints a data protection officer or representative where law requires one.
- **Engineering** builds privacy protections into {{product}} (access controls, encryption, retention enforcement, export and deletion), implements approved data flows only and supports requests and investigations with technical evidence.
- **People Operations** handles personnel data under this policy, ensures privacy training is completed and manages the privacy aspects of recruitment and employment records.
- **All Personnel** use personal data only for the purpose it was collected for, follow the Data Classification and Handling Policy, and report suspected privacy incidents and any individual's request about their data to {{incident_contact}} without delay.

## 4. Policy Statements

- **4.1** {{company}} maintains a data inventory (record of processing activities) listing each category of personal data, its purpose, source, systems, recipients, retention period and whether {{company}} acts as controller or processor. The inventory underpins the privacy notice, vendor agreements and data subject responses.
- **4.2** Personal data is processed only for specified, explicit and legitimate purposes. Each processing activity records its lawful basis (such as contract, legitimate interests, legal obligation or consent), and consent, where relied upon, is freely given, specific, recorded and as easy to withdraw as to give.
- **4.3** Personal data is limited to what is necessary for the purpose. {{product}} features collect the minimum data needed, default to the most privacy-protective setting and give customers the means to export and delete the data they submit. New features and processing activities are assessed for privacy risk before launch, with a documented privacy impact assessment where the risk to individuals is likely to be high.
- **4.4** {{#if has_pii}}Individuals may exercise their rights of access, rectification, erasure, restriction, portability and objection, and may withdraw consent. {{company}} verifies the requester's identity, responds within 30 days of receipt (or any shorter statutory period) and logs every request and its outcome. Requests from a customer's end users are referred to that customer, with {{company}}'s assistance.{{/if}}{{#unless has_pii}}{{company}} responds to any request from an individual about their data within 30 days of receipt, verifies the requester's identity first and logs every request and its outcome.{{/unless}}
- **4.5** {{#if has_pii}}Every vendor that processes personal data for {{company}} is bound by a written data processing agreement covering the scope and purpose of processing, security measures, onward sub-processing, and assistance with data subject requests and breach notification.{{#if has_vendors}} This applies to {{vendors}} and to any future vendor.{{/if}}{{/if}}{{#unless has_pii}}Every vendor that could access personal data for {{company}} is bound by written terms requiring confidentiality, appropriate security measures and prompt notification of any incident affecting that data.{{/unless}} No vendor receives personal data before the agreement is in place and the vendor has been assessed under the Vendor and Third-Party Risk Management Policy.
- **4.6** Where {{company}} acts as a processor for customers, it processes personal data only on the customer's documented instructions, maintains a published list of sub-processors, gives customers advance notice of changes to that list, and flows down equivalent obligations to each sub-processor.
- **4.7** Personal data crosses national borders only where a lawful transfer mechanism applies, such as an adequacy decision or standard contractual clauses. The hosting regions used for {{product}} on {{cloud}} are documented in the data inventory and disclosed to customers.
- **4.8** {{#if has_phi}}Protected health information is processed only under a business associate agreement or equivalent contractual instrument, is limited to the minimum necessary for the permitted purpose, is stored only in designated systems, is never used in non-production environments, and is subject to access logging reviewed under the Logging and Monitoring Policy.{{/if}}{{#unless has_phi}}{{company}} does not knowingly process health information or other special categories of personal data through {{product}}. Any proposal to process such data requires a privacy impact assessment and, where required, additional contractual instruments before processing begins.{{/unless}}
- **4.9** {{#if has_payment}}Payment card data is handled through a payment processor that is independently assessed against the PCI DSS; full card numbers, security codes and magnetic stripe data are never stored, logged or transmitted through {{company}} systems, and any payment-related data {{company}} retains is protected as confidential.{{/if}}{{#unless has_payment}}{{company}} does not handle payment card data directly; payments go through a third-party processor, and {{company}} systems never store full card numbers or security codes.{{/unless}}
- **4.10** Personal data is retained only as long as the data inventory, law or contract requires and is then deleted or irreversibly anonymised under the Data Retention and Disposal Policy. Customer data is deleted or returned within 30 days of contract termination or of the customer's request, and deletion from backups follows the backup rotation schedule.
- **4.11** A breach affecting personal data is handled under the Incident Response Policy. The Security Owner assesses the risk to individuals, notifies supervisory authorities where the law requires (within 72 hours where the GDPR or a similar law applies), notifies affected customers within their contractual period and no later than 72 hours after confirmation, and notifies affected individuals where the risk to them is high.
- **4.12** {{company}} publishes a privacy notice that describes in plain language what personal data it collects, why, on what basis, with whom it is shared, how long it is kept, where it is stored, and how individuals can exercise their rights and contact {{company}}. Marketing messages always include a working unsubscribe mechanism.

## 5. Procedures

- **5.1** Data inventory maintenance. Engineering notifies the Security Owner of any new data field, flow, system or vendor involving personal data before deployment, and the Security Owner updates the inventory within ten business days. The full inventory is reviewed {{review_cadence_adverb}} with Engineering and People Operations. Owner: Security Owner. Cadence: on change; full review {{review_cadence}}.
- **5.2** Data subject request handling. Requests arriving through any channel are forwarded to {{incident_contact}} on the day received. The Security Owner logs the request, verifies the requester's identity, and either fulfils the request with Engineering's assistance or refers it to the responsible customer. Owner: Security Owner. Timing: acknowledged within three business days; completed within 30 days of receipt.
- **5.3** Privacy impact assessment. Before launching a feature or processing activity involving new personal data, new purposes, profiling, special categories or cross-border transfers, the product owner completes the privacy impact template describing the processing, its necessity, risks and mitigations. The Security Owner approves it, requires changes or escalates residual risk to Executive Management. Owner: product owner, with the Security Owner. Timing: before launch.
- **5.4** Vendor data protection onboarding. Before any vendor receives personal data, the Security Owner confirms that a data processing agreement or equivalent terms are executed, that the vendor risk assessment is complete, that any transfer mechanism is recorded, and that the vendor is added to the data inventory and, where applicable, the sub-processor list with customer notice given. Owner: Security Owner. Timing: before data is shared; sub-processor list reviewed quarterly.
- **5.5** Breach assessment and notification. When an incident may involve personal data, the incident lead notifies the Security Owner immediately. Within 24 hours the Security Owner records what data, individuals and customers are affected, assesses the likely risk and determines notification obligations. Notifications are drafted with Executive Management and sent within the required deadlines; the assessment is retained with the incident record. Owner: Security Owner. Timing: assessment within 24 hours; notifications within 72 hours where required.
- **5.6** Retention enforcement. Engineering automates deletion or anonymisation of {{product}} data to the retention periods in the data inventory, and the Security Owner verifies each quarter that the jobs ran, that deletion requests were completed within 30 days and that offboarded customers' data is gone. {{#if has_backup_tool}}Backups taken by {{backup_tool}} on the {{backup_cadence}} schedule age out under the Backup and Recovery Policy.{{/if}}{{#unless has_backup_tool}}Backup expiry is verified against the Backup and Recovery Policy.{{/unless}} Owner: Engineering, verified by the Security Owner. Cadence: continuous; verification quarterly.
- **5.7** Privacy notice and consent records. The Security Owner reviews the privacy notice {{review_cadence_adverb}} and whenever the data inventory changes materially, and Executive Management approves each revision before publication. Consent records capture the timestamp, wording and method of consent, and unsubscribe requests are actioned within ten business days. Owner: Security Owner. Cadence: {{review_cadence}} and on material change.
- **5.8** Privacy training. All personnel complete privacy training as part of the security awareness programme within 30 days of starting and annually thereafter. Roles that regularly handle personal data (support, sales, engineers with production access) receive role-specific guidance on recognising requests, minimisation and secure handling. Owner: Security Owner, with People Operations. Cadence: at hire and annually.

## 6. Exceptions

Exceptions must be requested in writing to the Security Owner with the business reason and the compensating controls, and approved by {{approver}}. Approved exceptions are recorded in the exception register with an expiry date no more than 12 months away and are reviewed at each policy review. No exception may waive the requirement for a written agreement before personal data is shared with a vendor.

## 7. Enforcement

Failure to comply with this policy is subject to disciplinary action under the Human Resources Security Policy, up to and including termination of employment or contract. Contractual remedies apply to contractors and vendors.

## 8. Review Cadence

The Security Owner reviews this policy on a {{review_cadence_lc}} basis and whenever {{company}} begins processing a new category of personal data, enters a new jurisdiction or changes its hosting regions or sub-processors. Reviews are recorded in Section 9 and changes communicated to all personnel within 30 days.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
