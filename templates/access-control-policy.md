---
id: P03
slug: access-control-policy
title: Access Control Policy
short: Defines how access to systems and data is requested, approved, provisioned, reviewed and removed.
owner_role: Security Owner
order: 3
tsc:
- CC6.1
- CC6.2
- CC6.3
- CC6.6
- CC6.7
---

## 1. Purpose

Access control is how {{company}} ensures that only the right people and systems can reach {{product}} infrastructure, source code and customer data, and only to the extent their work requires. This policy defines how access is granted, reviewed and removed. It is the policy most SOC 2 evidence requests point back to, so it is deliberately concrete about who approves what and where the record lives.

## 2. Scope

This policy applies to all personnel of {{company}} and to every contractor, vendor or automated identity with access to company systems, including:

- {{#unless idp_none}}{{idp}}, the system of record for workforce identity, and every application federated to it.{{/unless}}{{#if idp_none}}The user directories of each business application, which together form the system of record for workforce identity until a central identity provider is adopted.{{/if}}
- The {{cloud}} accounts, projects and subscriptions that host {{product}}, including consoles, APIs and command-line access.
- {{scm}} organisations and repositories, and the {{cicd}} pipelines that deploy from them.
- Production databases, object storage, queues, secrets managers and any other store of customer data.
- Business applications holding Confidential or Restricted data{{#if has_vendors}}, including {{vendors}}{{/if}}.
- Service accounts, API keys, deploy keys and other non-human identities.

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy, ensures access decisions are not overridden for convenience, and approves third-party access that reaches customer data.
- **Security Owner** ({{security_owner}}) owns this policy, maintains the role-to-access matrix, runs the periodic access reviews, approves privileged and production access, and holds the evidence of every grant, review and removal.
- **Engineering** implements access technically: groups and roles in {{#unless idp_none}}{{idp}} and {{/unless}}the {{cloud}} identity services, {{scm}} teams and branch protections, database roles, and the tooling that makes production access auditable. Engineering leads approve production access for their teams.
- **People Operations** triggers provisioning at hire, notifies the Security Owner and Engineering of role changes and departures on the day they are known, and keeps the personnel records that reviews are reconciled against.
- **All Personnel** request only the access their role requires, use it only for its intended purpose, keep their credentials private, and report access they no longer need.

## 4. Policy Statements

- **4.1** Access is granted on least privilege and need-to-know. Each person receives the minimum access their current role requires, as defined in the role-to-access matrix; nothing is granted because it is convenient or because a peer has it.
- **4.2** Every person has a unique, individually attributable account. Shared accounts are prohibited except for documented break-glass credentials, which are stored in {{#if has_password_manager}}{{password_manager}}{{/if}}{{#unless has_password_manager}}the approved secrets vault{{/unless}}, restricted to the Security Owner and named Engineering leads, and rotated after every use.
- **4.3** {{#unless idp_none}}{{idp}} is the single source of workforce identity. Business applications are integrated with it for single sign-on and, where supported, automated provisioning and deprovisioning; applications that cannot federate are recorded in the exception register with a compensating review.{{/unless}}{{#if idp_none}}Until a central identity provider is adopted, the Security Owner maintains a master list of every application account for every person, and adoption of a central identity provider is a tracked security objective with a committed date.{{/if}}
- **4.4** {{#if mfa}}Multi-factor authentication is enforced for every workforce account, with phishing-resistant methods for administrative roles, under the Authentication and Password Policy.{{/if}}{{#unless mfa}}Multi-factor authentication is enforced today for all administrative, production and source code access and is being extended to every workforce account on a schedule owned by the Security Owner, under the Authentication and Password Policy.{{/unless}}
- **4.5** Access requests are made in the ticketing system, name the system and role required, and are approved by the requester's manager and the system owner before provisioning. The ticket is the evidence of the grant and is retained for the examination period plus one year.
- **4.6** Production access to {{cloud}} is granted only to engineers whose role requires it, through federated identity and short-lived credentials rather than long-lived access keys. Administrators use a separate privileged role that is assumed for a bounded session and logged{{#if has_logging_tool}} to {{logging_tool}}{{/if}}; read-only roles are used wherever write access is not needed.
- **4.7** Direct access to customer data in production databases and storage is limited to named engineers with a documented need, performed through audited tooling wherever possible, and logged. {{#if has_sensitive_data}}Because {{company}} processes {{data_types}} data, every direct query against customer data is tied to a ticket or incident reference.{{/if}}{{#unless has_sensitive_data}}Bulk exports of customer data require Security Owner approval.{{/unless}}
- **4.8** Access to {{scm}} is granted through organisation membership{{#unless idp_none}} enforced by single sign-on with {{idp}}{{/unless}}, repository permissions are assigned by team, and protected branches require a review from someone other than the author before code is merged and deployed by {{cicd}}. Where team size allows, the author of a change is never the sole approver of its deployment; where it does not, the Security Owner documents the compensating review.
- **4.9** Non-human identities such as service accounts, API keys, deploy keys and integration tokens have a named human owner, a documented purpose, the narrowest permissions that fulfil it, and an entry in the service account inventory. They are never used interactively and are rotated at least annually and immediately when a person who knew the secret leaves.
- **4.10** Access is reviewed at least quarterly for production, source code, identity administration and any system holding Restricted data, and at each {{review_cadence}} review for all other systems. Reviewers attest to each account and privileged role, and removals are completed within five business days.
- **4.11** When a person leaves {{company}}, their identity provider account is disabled and their sessions revoked before the end of the last working day, and all other access is removed within one business day. When a person changes role, access the new role does not require is removed within five business days.
- **4.12** Third-party and vendor access is sponsored by a named employee, covered by a signed agreement with confidentiality terms, limited to the specific systems and duration needed, provisioned through individual accounts, and removed at the end of the engagement. {{#if remote_or_hybrid}}Because {{company}} operates a {{work_model}} work model, no access decision is based on network location: internal systems are reached through authenticated, encrypted connections that verify the user and device.{{/if}}{{#unless remote_or_hybrid}}Office network connectivity does not by itself grant access to any production or Restricted system.{{/unless}}

## 5. Procedures

- **5.1** Onboarding and additional access. People Operations opens an onboarding ticket at least three business days before the start date, stating the role. The Security Owner maps the role to the matrix and Engineering provisions the standard bundle in {{#unless idp_none}}{{idp}}, {{/unless}}{{scm}} and the relevant {{cloud}} groups, activated no earlier than the first working day. Requests beyond the bundle are raised as tickets, approved by the manager and the system owner (the Engineering lead for production, the Security Owner for identity and security tooling), and closed with a note of the exact permission granted.
- **5.2** Production access grants. An engineer requesting a production role in {{cloud}} states the reason and expected duration. The Engineering lead approves, the Security Owner is notified, and the role is assigned through identity federation with a session limit of no more than twelve hours. Temporary grants carry an expiry and are removed on that date.
- **5.3** Quarterly access review. Within the first two weeks of each quarter the Security Owner exports user and role lists from {{#unless idp_none}}{{idp}}, {{/unless}}the {{cloud}} identity services, {{scm}}{{#if has_vendors}}, {{vendors}}{{/if}} and production databases, reconciles them against the personnel list from People Operations, and sends each system owner their list for attestation. Owners respond within ten business days, removals are completed within five business days of the response, and the signed-off review is retained as evidence.
- **5.4** Offboarding and role changes. When People Operations confirms a departure, Engineering disables the {{#unless idp_none}}{{idp}} account{{/unless}}{{#if idp_none}}accounts on the master list{{/if}}, revokes sessions and tokens, removes {{scm}} and {{cloud}} membership, and rotates any shared or break-glass credentials the leaver could have known. The checklist is completed on the last working day and verified by the Security Owner within one business day. For internal moves, the Security Owner compares current access to the new role's matrix entry and Engineering removes anything not required within five business days.
- **5.5** Service account inventory. Engineering maintains an inventory of every non-human identity with its owner, purpose, permissions, secret location and rotation date. It is reviewed in the quarterly access review, orphaned identities are removed, and any key older than twelve months is rotated.
- **5.6** Break-glass use. Emergency credentials are used only when normal access paths are unavailable during an incident. Use is announced in the incident channel, the reason is recorded in the incident ticket, the credential is rotated within one business day, and the Security Owner reviews every use.
- **5.7** Third-party access. The sponsoring employee raises a ticket with the vendor contact, systems, permissions, justification and end date. The Security Owner confirms a signed agreement exists under the Vendor and Third-Party Risk Management Policy, Engineering provisions individual accounts with an expiry, and the sponsor confirms removal on the end date.
- **5.8** Monitoring of access changes. Engineering configures alerts for privileged role assignments, new administrative users, identity provider policy changes and disabled multi-factor authentication{{#if has_logging_tool}} in {{logging_tool}}{{/if}}. The Security Owner reviews these alerts weekly and investigates any change without an approved ticket.

## 6. Exceptions

Exceptions, for example an application that cannot federate with {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}the identity provider{{/if}} or a team too small to fully separate authoring and deployment, are approved in writing by the Security Owner, recorded in the exception register with the compensating control and an expiry date no later than twelve months out, and reviewed at each {{review_cadence}} review. Exceptions affecting access to customer data additionally require approval from {{approver}}. No exception permits shared interactive accounts or unreviewed privileged access.

## 7. Enforcement

Access granted outside this policy is removed as soon as it is discovered and the circumstances are investigated by the Security Owner. Personnel who share credentials, use another person's access, retain access they know they should not have, or grant access without approval are subject to the disciplinary process in the Acceptable Use Policy, up to and including termination. Vendors who violate access terms have their access removed and their engagement reviewed.

## 8. Review Cadence

The Security Owner reviews this policy and the role-to-access matrix at the {{review_cadence}} policy review, after any incident involving unauthorised access, and whenever a new system holding Restricted data is introduced or the identity architecture of {{company}} changes. Revisions are approved by {{approver}} and recorded in section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
