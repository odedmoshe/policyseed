---
id: P19
slug: endpoint-and-workstation-security-policy
title: Endpoint and Workstation Security Policy
short: Establishes the baseline configuration, protection and lifecycle requirements for every laptop, desktop and mobile device used to access company systems.
owner_role: IT/Operations Lead
order: 19
tsc:
- CC6.6
- CC6.7
- CC6.8
---

## 1. Purpose

Laptops and phones are where credentials, source code and customer data are actually handled, and they leave the building every day. This policy defines the minimum security configuration for every device used to access {{company}} systems, how that configuration is enforced and verified, and what happens when a device is lost, replaced or retired. It exists so that a single lost laptop or compromised workstation does not become a breach of {{product}} or of its customers' data.

## 2. Scope

This policy applies to every laptop, desktop, tablet and smartphone (together, "endpoints") used by {{company}} personnel to access company email, {{scm}}, {{cloud}}, {{cicd}}{{#if has_vendors}}, {{vendors}}{{/if}} or any system holding {{product}} or customer data, whether the device is company-owned or personally owned and approved for work use. It covers procurement, configuration, ongoing protection, verification, loss, reassignment and disposal. Servers, containers and cloud workloads are covered by the Network and Infrastructure Security Policy.

## 3. Roles and Responsibilities

- **Executive Management** funds company-managed devices and endpoint tooling and approves this policy; {{approver}} is the approver of record.
- **Security Owner ({{security_owner}})** defines the endpoint baseline, approves exceptions, reviews compliance evidence and leads the response to lost or compromised devices.
- **Engineering** {{#if has_mdm}}administers {{mdm}}, maintains the configuration profiles that enforce the baseline, {{/if}}{{#unless has_mdm}}maintains the build and attestation checklists, {{/unless}}and verifies that developer tooling on endpoints (SSH keys, cloud command-line tools, container runtimes) follows this policy.
- **People Operations** ties device issue and return to onboarding and offboarding, keeps the device assignment record current and confirms return on the offboarding checklist. The IT/Operations Lead, who owns this policy, maintains the device inventory.
- **All Personnel** use only approved devices for work, keep them configured as this policy requires, do not disable protections, and report loss, theft or suspected compromise to {{incident_contact}} immediately.

## 4. Policy Statements

- **4.1** Access to production systems, source code and customer data is permitted only from company-owned endpoints or from personally owned endpoints that have been explicitly approved by the Security Owner and meet every requirement of this section. A personally owned device may not be used for production access unless it is {{#if has_mdm}}enrolled in {{mdm}}{{/if}}{{#unless has_mdm}}covered by a signed attestation{{/unless}} to the same standard as a company device.
- **4.2** Every endpoint is recorded in the device inventory with its serial number, assigned user, operating system and issue date. {{#if has_mdm}}{{mdm}} is the authoritative inventory for enrolled devices, and the IT/Operations Lead reconciles it with the HR roster quarterly.{{/if}}{{#unless has_mdm}}The inventory is maintained by the IT/Operations Lead and reconciled with the HR roster quarterly.{{/unless}}
- **4.3** {{#if has_mdm}}Every company endpoint is enrolled in {{mdm}} before it is issued, and enrolment may not be removed by the user. {{mdm}} enforces the configuration in Sections 4.4 to 4.8 and reports compliance to the Security Owner.{{/if}}{{#unless has_mdm}}Because {{company}} does not currently operate a mobile device management platform, every endpoint is configured against the written baseline checklist before issue, and each user attests quarterly that the configuration in Sections 4.4 to 4.8 remains in place, attaching system screenshots or reports as evidence.{{/unless}}
- **4.4** Full-disk encryption (FileVault on macOS, BitLocker on Windows, LUKS on Linux and platform encryption on mobile devices) is enabled on every endpoint, with recovery keys escrowed {{#if has_mdm}}in {{mdm}}{{/if}}{{#unless has_mdm}}in an encrypted key store controlled by the Security Owner{{/unless}} rather than held only by the user.
- **4.5** Endpoints lock automatically after no more than 10 minutes of inactivity and require a password, passphrase or biometric to unlock. Login passwords meet the Authentication and Password Policy, and mobile devices require a passcode of at least six digits or a biometric.
- **4.6** Operating system and browser updates install automatically. Security updates rated critical or high are applied within 7 days of release and all other security updates within 30 days. Endpoints running an operating system version that no longer receives security updates may not access company systems.
- **4.7** Every laptop and desktop runs the built-in or company-approved endpoint protection with real-time malware scanning enabled and the host firewall turned on. Alerts from endpoint protection are reviewed by the Security Owner{{#if has_logging_tool}} and forwarded to {{logging_tool}} where the tooling supports it{{/if}}. Browsers keep their built-in protection against known malicious and phishing sites turned on{{#if has_mdm}}, and where {{mdm}} supports it a DNS or web filtering profile blocks known malicious domains on every company endpoint{{/if}}.
- **4.8** Personnel work from a standard user account. Local administrator rights are granted only where a role requires them, are recorded in the device inventory and are reviewed quarterly. Software is installed only from official vendor sources or app stores, and browser extensions with access to page content require Security Owner approval.
- **4.9** {{#if has_password_manager}}All work credentials are stored in {{password_manager}}. Browser-native password saving is disabled{{#if has_mdm}} through {{mdm}}{{/if}}, and credentials may not be written down, stored in plain-text files or kept in chat history.{{/if}}{{#unless has_password_manager}}Work credentials may not be written down, stored in plain-text files or kept in chat history, and browser-native password saving is disabled on every endpoint. Personnel use a unique password for every system as required by the Authentication and Password Policy.{{/unless}}
- **4.10** Customer data and production datasets are not stored on endpoints. Where a task requires a local copy, it is limited to the minimum data needed, kept only for the duration of the task and deleted when the task is complete. Production database dumps, backups and exports are never downloaded to a laptop.
- **4.11** Removable media (USB drives, external disks, SD cards) may not be used to store or move company or customer data; file transfer uses approved cloud storage. {{#if has_mdm}}Where {{mdm}} supports it, writing to removable media is blocked by policy.{{/if}}{{#unless has_mdm}}Personnel confirm compliance with this requirement in the quarterly attestation.{{/unless}}
- **4.12** The loss, theft or suspected compromise of any endpoint is reported to {{incident_contact}} within one hour of discovery, as the Incident Response Policy requires. {{#if has_mdm}}Lost devices are locked and wiped remotely through {{mdm}}, {{/if}}{{#unless has_mdm}}The user's sessions and credentials are revoked immediately, {{/unless}}and the Incident Response Policy applies.
- **4.13** Endpoints are wiped to the manufacturer's secure-erase standard before reassignment, return to a lessor or disposal. Devices that cannot be wiped are physically destroyed through an accredited destruction provider, and a record of the wipe or destruction is retained in the device inventory.
{{#if is_mobile}}- **4.14** Physical devices used to build or test the {{product}} mobile application are treated as endpoints: they are inventoried, encrypted, kept up to date and never contain production customer data. Test accounts and synthetic data are used for all mobile testing.
{{/if}}

## 5. Procedures

- **5.1** Procurement and issue. The IT/Operations Lead orders company endpoints from approved suppliers, records the serial number and assigned user in the device inventory, {{#if has_mdm}}enrols the device in {{mdm}} using automated enrolment so that the baseline profiles apply on first boot, {{/if}}{{#unless has_mdm}}configures the device against the baseline checklist and files the completed checklist, {{/unless}}and hands the device over as part of onboarding. Owner: IT/Operations Lead. Timing: before the user's start date, or within one business day of a replacement request.
- **5.2** Baseline maintenance. The Security Owner maintains the written endpoint baseline (encryption, screen lock, update settings, endpoint protection, firewall, account type, blocked software) and reviews it {{review_cadence_adverb}}. {{#if has_mdm}}Engineering keeps the {{mdm}} configuration profiles in step with the baseline and tests changes on a pilot group before company-wide rollout.{{/if}}{{#unless has_mdm}}The IT/Operations Lead updates the setup and attestation checklists within five business days of any baseline change.{{/unless}} Owner: Security Owner. Cadence: {{review_cadence}}.
- **5.3** Compliance verification. {{#if has_mdm}}Each month the Security Owner reviews the {{mdm}} compliance report, and any device out of compliance for more than seven days is blocked from company applications until remediated.{{/if}}{{#unless has_mdm}}Each quarter every user completes the endpoint attestation form and attaches evidence of encryption status, operating system version and screen lock settings. The IT/Operations Lead reviews the responses within ten business days and follows up on any gap; access is suspended for anyone who has not attested within 30 days of the request.{{/unless}} Results are retained as evidence. Owner: Security Owner. Cadence: {{#if has_mdm}}monthly{{/if}}{{#unless has_mdm}}quarterly{{/unless}}.
- **5.4** Patch management. Automatic updates are enabled at issue. {{#if has_mdm}}{{mdm}} enforces update deadlines, and the Security Owner reviews outstanding updates weekly.{{/if}}{{#unless has_mdm}}The Security Owner reviews vendor security bulletins weekly and notifies personnel of any update that must be applied within seven days.{{/unless}} Devices that miss a critical update deadline are removed from production access until updated. Owner: Security Owner. Cadence: weekly review.
- **5.5** Lost, stolen or compromised device. On report to {{incident_contact}}, the responder{{#if has_mdm}} locks and wipes the device in {{mdm}}, then{{/if}} revokes active sessions in {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}each system the user can access{{/if}}, rotates the user's credentials{{#if has_password_manager}} and any {{password_manager}} vault items they could have read{{/if}}, and opens an incident record. The device is marked lost in the inventory and a replacement is issued under Section 5.1. Owner: Security Owner. Timing: containment within four hours of the report.
- **5.6** Administrator rights and software exceptions. Requests for administrator rights or non-standard software are submitted to the Security Owner with a business justification. Approved requests are recorded in the device inventory with an expiry date, and the Security Owner reviews all open grants quarterly. Owner: Security Owner. Cadence: quarterly.
- **5.7** Return and reassignment. On offboarding or replacement, the user returns the device to the IT/Operations Lead, who confirms receipt on the offboarding checklist, {{#if has_mdm}}triggers a wipe through {{mdm}}{{/if}}{{#unless has_mdm}}performs a secure erase and reinstall{{/unless}}, and updates the inventory. Devices are not reassigned until the wipe is recorded. Owner: IT/Operations Lead. Timing: within five business days of return.
- **5.8** Disposal. Devices at end of life are wiped as in Section 5.7 and then recycled or sold through a provider that issues a certificate of data destruction for any device that cannot be verified as wiped. Certificates are filed with the inventory. Owner: IT/Operations Lead. Cadence: as devices reach end of life, with an inventory sweep each year.
- **5.9** Inventory reconciliation. Each quarter the IT/Operations Lead reconciles the device inventory against the HR roster and {{#if has_mdm}}the {{mdm}} device list{{/if}}{{#unless has_mdm}}the attestation responses{{/unless}}, investigates devices with no active owner, and records the outcome. Owner: IT/Operations Lead. Cadence: quarterly.
- **5.10** Repairs. Hardware repairs are booked through the IT/Operations Lead and carried out only by the manufacturer or its authorised service providers. Before a device is handed over it is wiped as in Section 5.7, or where that is not possible its disk encryption is confirmed active and the user's credentials are rotated on return; the repair is recorded in the device inventory. Owner: IT/Operations Lead. Timing: every repair.

## 6. Exceptions

Exceptions (for example, a research workstation that cannot run endpoint protection, or a contractor device that cannot be {{#if has_mdm}}enrolled in {{mdm}}{{/if}}{{#unless has_mdm}}configured to the baseline{{/unless}}) must be requested in writing to the Security Owner with the business reason and the compensating controls, and approved by {{approver}}. Approved exceptions are recorded in the exception register with an expiry date no more than 12 months away and are reviewed at each policy review. Disk encryption and screen lock may not be waived for any device that accesses customer data.

## 7. Enforcement

Devices that do not meet this policy may be blocked from company systems without notice. Personnel who disable protections, use unapproved devices for production access or fail to report a lost device are subject to disciplinary action under the Human Resources Security Policy, up to and including termination of employment or contract. Contractual remedies apply to contractors.

## 8. Review Cadence

The IT/Operations Lead and the Security Owner review this policy on a {{review_cadence_lc}} basis and whenever the device management tooling, operating system mix or working model changes materially. Each review is recorded in Section 9, and changes are communicated to all personnel within 30 days.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
