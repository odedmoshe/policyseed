---
id: P16
slug: vendor-and-third-party-risk-policy
title: Vendor and Third-Party Risk Management Policy
short: Requires vendors to be inventoried, tiered by the data and services they touch, assessed before onboarding, bound by contract, reviewed annually and offboarded cleanly.
owner_role: Security Owner
order: 16
tsc:
- CC9.2
- CC3.2
- CC2.3
---

## 1. Purpose

{{company}} depends on vendors to host {{product}}, run the business and serve customers, and each one can put the confidentiality, integrity or availability of {{company}} data and services at risk. This policy ensures that every vendor is known, its risk understood before it is trusted with data or access, its contract holds it to the standard {{company}} holds itself to, and the relationship is reviewed and ended in a controlled way.

## 2. Scope

This policy applies to every external organisation that stores, processes or transmits {{company}} data, provides infrastructure or software on which {{product}} depends, has access to {{company}} systems or premises, or serves customers on {{company}}'s behalf: cloud providers ({{cloud}}), delivery tooling ({{scm}}, {{cicd}}), identity providers{{#unless idp_none}} ({{idp}}){{/unless}}, {{#if has_vendors}}vendors such as {{vendors}}, {{/if}}contractors and consultants, and free or trial services adopted by individuals. It binds everyone who selects, approves, administers or uses vendor services. Vendors are tiered at onboarding; the tier sets the depth of due diligence, contract requirements and review cadence.

| Tier | Criteria | Examples | Due diligence | Review |
| --- | --- | --- | --- | --- |
| Tier 1 - Critical | Stores or processes customer data{{#if has_sensitive_data}} or {{data_types}} data{{/if}}, or is a dependency of a Tier 1 system under the Business Continuity and Disaster Recovery Policy | {{cloud}}, {{scm}}{{#unless idp_none}}, {{idp}}{{/unless}}{{#if has_vendors}}, and those of {{vendors}} that meet the criteria{{/if}} | SOC 2 Type II report or ISO 27001 certificate reviewed, security questionnaire where gaps remain, data flow documented, contract security terms, continuity and exit plan | Annually, and on any incident or material change |
| Tier 2 - Important | Internal confidential data or personnel personal data, or access to internal systems, but no customer data | Ticketing, HR and payroll, finance, collaboration tools, monitoring | Assurance report or completed questionnaire, contract security terms, single sign-on where supported | Annually |
| Tier 3 - Low | No access to confidential data or systems | Design tools without customer data, marketing services, office suppliers | Tier confirmed by the Security Owner; standard terms | Every two years or on change of use |

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, approves Tier 1 vendor relationships and any acceptance of residual vendor risk, signs vendor contracts, and reviews the vendor risk summary at least annually.
- **Security Owner ({{security_owner}})** owns this policy and the vendor inventory, assigns tiers, performs or coordinates due diligence, sets required contract terms with counsel, runs the annual review, and coordinates response to vendor incidents.
- **Engineering** identifies technical dependencies and data flows to each vendor, configures integrations with least privilege, monitors vendor status and security advisories, and maintains fallback or exit plans for Tier 1 dependencies.
- **People Operations** manages contractor and consultant agreements, ensures confidentiality terms and security training obligations exist for individuals with system access, and includes vendor account removal in offboarding.
- **All Personnel** obtain approval before adopting a vendor service or connecting one to {{company}} data or accounts, use vendors only for their approved purpose, and report suspected vendor security issues to {{incident_contact}}.

## 4. Policy Statements

- **4.1** {{company}} maintains a vendor inventory recording, for every vendor, the business owner, service provided, data shared and its classification, systems accessed, tier, contract and renewal date, last review date and outcome, and assurance evidence held, and reviews it for completeness at least annually.
- **4.2** No vendor receives {{company}} data, system access or a connection to {{company}} accounts until it is in the inventory, tiered by the Security Owner and cleared through the due diligence for its tier. Free, trial and personal-account services follow the same rule.
- **4.3** For Tier 1 vendors, the Security Owner reviews an independent assurance report covering the service used, records exceptions and the complementary user entity controls {{company}} must operate, and documents the data flow and sub-processors.
- **4.4** Contracts with Tier 1 and Tier 2 vendors include confidentiality obligations, security controls appropriate to the data, notification of incidents affecting {{company}} data within 72 hours of the vendor becoming aware, restrictions on sub-processors, return or deletion of data on termination, and a right to assurance evidence.
- **4.5** {{#if has_pii}}Vendors processing personal data on {{company}}'s behalf sign a data processing agreement meeting the GDPR, UK GDPR and applicable US state privacy laws, including sub-processor approval, assistance with data subject requests and transfer safeguards. {{/if}}{{#if has_phi}}Vendors that create, receive, maintain or transmit protected health information sign a business associate agreement before any such data is shared. {{/if}}{{#if has_payment}}Vendors that store, process or transmit cardholder data provide evidence of current PCI DSS compliance, and the division of PCI responsibilities is documented. {{/if}}{{#unless has_sensitive_data}}Before a vendor processes personal, health or payment data, the applicable data processing, business associate or PCI DSS terms are put in place. {{/unless}}The Security Owner confirms regulatory terms before signature.
- **4.6** Vendor access to {{company}} systems follows the Access Control Policy: least privilege, single sign-on{{#unless idp_none}} through {{idp}}{{/unless}} where supported, multi-factor authentication, logging, time limits on support access, and removal within one business day of the engagement ending.
- **4.7** API keys, tokens and service accounts issued to vendors are unique per vendor, scoped to minimum permissions, stored in the secrets manager, rotated at least annually and on suspected exposure, and inventoried with the vendor record.
- **4.8** Every Tier 1 and Tier 2 vendor is reviewed at least annually to confirm the service, data and tier are still accurate, obtain the current assurance report, check incidents and material changes, confirm contract terms, and decide whether the relationship continues, changes or ends.
- **4.9** {{company}} monitors critical vendors between reviews through status pages, security advisories and published sub-processor changes, and treats any vendor breach notification as an incident under the Incident Response Policy.
- **4.10** Tier 1 vendors on which {{product}} depends have a documented continuity assessment and exit plan covering how {{company}} would withstand a prolonged outage or end the relationship, including data retrieval and migration time, and reliance on a single vendor for a critical function is recorded in the risk register.
- **4.11** When a vendor relationship ends, {{company}} revokes all access and credentials, retrieves needed data, obtains written confirmation of deletion within the contractual period and updates the inventory; contractors and consultants are offboarded like personnel.
- **4.12** Personnel may not connect third-party applications, browser extensions or artificial-intelligence services to {{company}} accounts, or paste confidential or customer data into them, unless the service is an approved vendor whose tier permits that data; Engineering reviews OAuth grants quarterly and revokes unapproved ones.
- **4.13** Residual risk from a vendor that cannot meet its tier's requirements is recorded in the risk register and accepted in writing, with an expiry date and compensating measures, by Executive Management for Tier 1 and the Security Owner for Tier 2 and Tier 3.

## 5. Procedures

- **5.1** **Request and intake.** The requester states the business purpose, data to be shared, systems to be accessed, expected users and cost, and any existing alternative in the inventory; the Security Owner assigns a provisional tier within five business days and lists the due diligence required.
- **5.2** **Due diligence.** For Tier 1 vendors, the Security Owner obtains the current SOC 2 Type II report or ISO 27001 certificate, reviews scope, opinion, exceptions and complementary user entity controls, sends the {{company}} questionnaire where gaps remain and documents the data flow with Engineering; Tier 2 vendors need an assurance report or completed questionnaire. Findings and the final tier are recorded.
- **5.3** **Contracting.** The Security Owner confirms that the contract or accepted terms include the requirements in 4.4 and, where applicable, 4.5; gaps are negotiated or accepted under 4.13. Executive Management signs Tier 1 contracts; business owners may accept standard terms for Tier 3.
- **5.4** **Onboarding.** Engineering provisions the integration through single sign-on{{#unless idp_none}} in {{idp}}{{/unless}} where supported, issues scoped credentials from the secrets manager, records them in the vendor record and confirms logging of vendor access to {{company}} systems; the business owner confirms that only approved data is shared.
- **5.5** **Annual review.** The Security Owner reviews every Tier 1 and Tier 2 vendor within twelve months of its last review, obtaining the updated assurance report, checking incident history and sub-processor changes, re-confirming tier and data with the business owner, recording outcomes and actions, and summarising for Executive Management the vendors whose risk has increased.
- **5.6** **Continuity and exit planning.** For each Tier 1 technical dependency{{#if has_vendors}}, including {{cloud}} and those of {{vendors}} that qualify,{{/if}} Engineering documents the fallback or migration approach, data export method and estimated switching time, and reviews it at the annual review and the disaster recovery test.
- **5.7** **Vendor incidents.** On a vendor-reported or discovered incident, the Security Owner opens an incident under the Incident Response Policy, determines the affected {{company}} data and services, obtains the vendor's findings and remediation, rotates shared credentials, decides with Executive Management on customer notification and records the incident for the next review.
- **5.8** **Offboarding.** When a contract ends or a service is replaced, Engineering removes single sign-on assignments, integrations, OAuth grants and credentials within one business day, the business owner retrieves needed data, the Security Owner files the deletion confirmation and the inventory entry is closed with the date.
- **5.9** **Inventory upkeep.** Each quarter the Security Owner reconciles the inventory against vendor payments, the single sign-on application list and OAuth grants found by Engineering, adds vendors found outside the process and has the responsible person complete intake or stop use.

## 6. Exceptions

Exceptions require written approval from the Security Owner, or from Executive Management for a Tier 1 vendor, a compensating control or accepted risk in the risk register, and an expiry date no more than 12 months away, and are reviewed at each {{review_cadence}} policy review. No exception permits sharing customer data with a vendor that has not signed confidentiality and incident notification terms.

## 7. Enforcement

Adopting a vendor or connecting a service to {{company}} data or accounts without approval, sharing data beyond a vendor's approved tier, issuing unscoped or shared credentials, or failing to remove vendor access at the end of an engagement is a violation of this policy and may result in disciplinary action up to and including termination of employment or contract. Vendors that breach contractual security obligations face the remedies in their contract, including suspension and termination.

## 8. Review Cadence

The Security Owner reviews this policy on a {{review_cadence}} basis and after any vendor incident affecting {{company}} data, changes to applicable privacy or sector regulation, and the addition of a Tier 1 vendor of a kind not previously used. Each review is approved by {{approver}} and recorded in Section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
