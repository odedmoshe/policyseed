---
id: P01
slug: information-security-policy
title: Information Security Policy
short: Establishes the information security program, its objectives, its governance and who is accountable for it.
owner_role: Security Owner
order: 1
tsc:
- CC1.1
- CC1.2
- CC1.3
- CC1.5
- CC2.2
- CC3.1
- CC4.1
- CC4.2
- CC5.1
- CC5.3
---

## 1. Purpose

{{company}} builds and operates {{product}}, and its customers trust it with their data. This policy establishes the information security program that protects that trust: what the program must achieve, who is accountable for it, and the rules that every other policy in this set builds on, so that security decisions at {{company}} are deliberate, written down and open to review.

## 2. Scope

This policy applies to all personnel of {{company}}, including employees, contractors, interns and temporary staff, and to every system, service and dataset used to build, deliver or support {{product}}, including:

- Production and non-production infrastructure on {{cloud}}.
- Source code and deployment tooling in {{scm}} and {{cicd}}.
{{#if idp_none}}
- User accounts in each business application, administered individually until a central identity provider is adopted.
{{/if}}
{{#unless idp_none}}
- Identity, authentication and access managed through {{idp}}.
{{/unless}}
- Laptops, phones and any other equipment used to reach company systems{{#if has_mdm}}, enrolled in {{mdm}}{{/if}}.
- Third-party services that store or process company or customer data{{#if has_vendors}}, currently including {{vendors}}{{/if}}.

The cloud platforms in scope are:

{{#each cloud_list}}
- {{this}}
{{/each}}

The Trust Services Criteria selected for the SOC 2 examination are {{tsc_scope}}. {{#if scope_availability}}Because Availability is in scope, the program also covers the resilience and recovery of {{product}}. {{/if}}{{#if scope_confidentiality}}Because Confidentiality is in scope, it also covers the identification and protection of information {{company}} has committed to keep confidential. {{/if}}{{#if has_sensitive_data}}{{company}} processes {{data_types}} data for its customers, and the controls in this set are calibrated to that.{{/if}}{{#unless has_sensitive_data}}{{company}} does not currently process regulated personal, health or payment data; if that changes, the Security Owner updates this policy set before the data is accepted.{{/unless}}

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy and the annual security objectives, funds the program, receives a written security status report at least quarterly, and decides on risks that exceed the agreed tolerance.
- **Security Owner** ({{security_owner}}) owns the program and this policy set, maintains the risk register and control matrix, approves exceptions, coordinates incident response, collects control evidence, and is the primary contact for the CPA firm.
- **Engineering** designs, builds and operates {{product}} and its infrastructure on {{cloud}} in line with these policies. Engineering leads own the technical policies assigned to them in the policy register.
- **People Operations** owns the personnel controls: background screening where lawful, onboarding and offboarding checklists, policy acknowledgement and training records.
- **All Personnel** read and acknowledge the policies that apply to them, complete required training, follow the procedures in this set, and report suspected incidents or violations to {{incident_contact}} without delay.

## 4. Policy Statements

- **4.1** {{company}} maintains a written information security program consisting of this policy and the supporting policies in the policy register. Together they define the minimum security requirements for the company; where a supporting policy is more specific, it takes precedence.
- **4.2** The program exists to protect the confidentiality, integrity and availability of customer data and company systems; to meet the commitments {{company}} makes in contracts, its terms of service and its privacy notice; to satisfy the {{tsc_scope}} criteria selected for the SOC 2 examination; and to keep risk within the tolerance set by Executive Management.
- **4.3** Executive Management appoints a Security Owner with the authority to set security requirements, halt changes or releases that create unacceptable risk, and escalate directly to Executive Management. The appointment is documented in the role description of {{security_owner}}.
- **4.4** Controls are selected and prioritised according to the risks they reduce, as recorded in the risk assessment maintained under the Risk Assessment and Management Policy, not solely because a framework lists them.
- **4.5** Every policy in this set has a named owner role, an approver, a version number and an effective date, and is reviewed on the {{review_cadence_lc}} cycle and after any significant change to the business, the technology stack or the threat landscape.
- **4.6** All personnel acknowledge this policy and the Acceptable Use Policy in writing at hire, at each {{review_cadence_lc}} review and after each material revision. Acknowledgements are retained as evidence.
- **4.7** Security awareness training is completed within thirty days of the start date and annually thereafter. Engineers also complete secure development training under the Secure Software Development Policy.
- **4.8** Access follows least privilege and is granted by role under the Access Control Policy. {{#if mfa}}Multi-factor authentication is mandatory for every account that can reach production, source code or customer data.{{/if}}{{#unless mfa}}Multi-factor authentication is required for administrative accounts today and is being extended to all accounts under a plan owned by the Security Owner with a committed completion date.{{/unless}}
- **4.9** Security is designed into {{product}} rather than added afterwards: production changes follow the Change Management Policy, code is reviewed before merge in {{scm}}, and deployments run through {{cicd}} rather than from personal machines.
- **4.10** Security incidents and suspected weaknesses are reported to {{incident_contact}} as soon as they are noticed. Reporting in good faith never results in disciplinary action, even when the reporter caused the problem.
- **4.11** Third parties that store or process company or customer data are assessed before onboarding and reviewed periodically under the Vendor and Third-Party Risk Management Policy.
- **4.12** {{company}} states its security commitments externally through its terms of service, privacy notice, security page and customer contracts, and internally through this policy set, onboarding and training. Changes to external commitments are approved by Executive Management before publication.
- **4.13** Deviations from any policy require a documented exception under section 6; undocumented deviations are policy violations. Compliance is verified through internal control reviews, the evidence collection in section 5, and the independent SOC 2 examination performed by a licensed CPA firm.

## 5. Procedures

- **5.1** Annual objectives. In the first quarter of each fiscal year the Security Owner proposes security objectives, a control roadmap and a budget to Executive Management. Approved objectives are recorded in the security program plan and progress is reported quarterly.
- **5.2** Policy lifecycle. The Security Owner maintains the policy register listing each policy, its owner, version, approval date and next review date. Revisions are approved by {{approver}}, versioned and communicated to affected personnel within ten business days.
- **5.3** Acknowledgement and training. People Operations collects acknowledgement from every new hire before access is granted and from all personnel at each {{review_cadence_lc}} review, assigns awareness training within thirty days of hire and annually thereafter, and reports outstanding items to the Security Owner monthly. Records are retained for seven years under the Data Retention and Disposal Policy.
- **5.4** Management reporting. The Security Owner delivers a written status report to Executive Management at least quarterly covering open risks, incidents, vulnerability and patch status, access review results, vendor reviews and progress against objectives. Decisions are minuted.
- **5.5** Control evidence. The Security Owner maintains a control matrix mapping each criterion in scope ({{tsc_scope}}) to the policy statements and evidence artifacts that satisfy it. Evidence is collected on the cadence in the matrix and stored where the CPA firm can be given read access.
- **5.6** Exceptions. Requests are submitted in writing to the Security Owner stating the statement affected, the justification, compensating controls, the risk owner and an expiry date no more than twelve months out. Approved exceptions are logged in the exception register and reviewed at each {{review_cadence_lc}} review.
- **5.7** Incident escalation. Anyone who suspects an incident reports it to {{incident_contact}}. The Security Owner triages within one business day under the Incident Response Policy and informs Executive Management of any incident affecting customer data or the availability of {{product}}.
- **5.8** Independent examination. The Security Owner coordinates scoping, evidence requests, walkthroughs and remediation with the CPA firm. Findings are tracked to closure in the risk register with an owner and due date.

## 6. Exceptions

Exceptions to this or any supporting policy are granted only in writing by the Security Owner, and additionally by {{approver}} where customer data is affected. Each exception records the requirement waived, the business reason, compensating controls, the risk owner and an expiry date. Exceptions expire automatically and are re-justified rather than renewed by default; the register is available to the CPA firm on request.

## 7. Enforcement

Violations are handled by People Operations with the Security Owner and may result in retraining, loss of access, disciplinary action up to and including termination of employment or contract, and, where the law requires, referral to authorities. Enforcement is proportionate: honest mistakes reported promptly are treated differently from deliberate or repeated violations.

## 8. Review Cadence

The Security Owner reviews this policy at the {{review_cadence_lc}} policy review, after any significant security incident, after material changes to the business, infrastructure or regulatory obligations of {{company}}, and after each SOC 2 examination. Each review is recorded in section 9 even where nothing changes; revisions are approved by {{approver}} before they take effect.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
