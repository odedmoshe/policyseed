---
id: P05
slug: asset-management-policy
title: Asset Management Policy
short: Requires an accurate inventory of devices, cloud resources, software and data, with a named owner and a managed lifecycle for each.
owner_role: IT/Operations Lead
order: 5
tsc:
- CC2.1
- CC6.5
- C1.2
---

## 1. Purpose

{{company}} cannot protect what it does not know it has. This policy requires that every laptop, phone, cloud resource, software subscription and significant dataset used to build and run {{product}} is recorded, has a named owner, and is managed from acquisition to disposal. An accurate inventory is what makes access reviews, vulnerability management, offboarding and incident response possible, and it is one of the first things an examiner asks to see.

## 2. Scope

This policy applies to all personnel of {{company}} and to the following asset classes:

- Hardware: company-owned laptops, desktops, phones, tablets, security keys, external drives and office network equipment.
- Cloud resources: every account, project, subscription, virtual machine, container service, function, database, storage bucket, queue, DNS zone and network component in {{cloud}}.
- Software and services: operating systems, installed applications, browser extensions, the libraries {{product}} depends on, and SaaS subscriptions{{#if has_vendors}} including {{vendors}}{{/if}}.
- Data assets: the datasets, backups and logs described in the Data Classification and Handling Policy, and the systems that hold them.
- Personally owned devices approved for work use under the Acceptable Use Policy.

The cloud platforms in scope for the inventory are:

{{#each cloud_list}}
- {{this}}
{{/each}}

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy and funds the equipment, tooling and subscriptions needed to maintain a managed fleet.
- **Security Owner** ({{security_owner}}) owns this policy jointly with the IT/Operations Lead, uses the inventory as the basis for access reviews and vulnerability management, and verifies that reconciliations happen on schedule.
- **Engineering** owns the cloud resource inventory for {{cloud}}, enforces tagging and ownership conventions, decommissions unused resources, and maintains the software bill of materials for {{product}}.
- **People Operations** triggers device assignment at hire and device return at departure, and confirms returns are complete before contract close-out.
- **All Personnel** use only assets recorded in the inventory, take reasonable care of company equipment, report loss, theft or damage immediately to {{incident_contact}}, and return everything when their engagement ends.

## 4. Policy Statements

- **4.1** {{company}} maintains an asset register covering hardware, cloud resources, software and services, and data assets. Every entry records the asset identifier, type, owner, assigned user where applicable, location or hosting platform, classification of the data it holds, and status. {{#if has_mdm}}{{mdm}} is the authoritative source for endpoint records and the register is reconciled against it.{{/if}}{{#unless has_mdm}}Endpoint records are maintained by the IT/Operations Lead and reconciled against purchase records and the user list.{{/unless}}
- **4.2** Every asset has a named owner accountable for its security, lifecycle and retirement. Ownership passes explicitly when a person changes role or leaves, and assets are not moved, lent, reassigned or removed from an office without the register being updated. Company equipment is never sold, gifted or discarded by individuals.
- **4.3** Company devices are procured through the IT/Operations Lead, configured to the baseline in the Endpoint and Workstation Security Policy before handover{{#if has_mdm}}, enrolled in {{mdm}} so that encryption, screen lock, update and inventory policies apply automatically{{/if}}, and recorded in the register with the assigned user on the day they are issued.
- **4.4** Production, source code and customer data are accessed only from devices in the register that meet the security baseline. {{#if has_mdm}}Devices not enrolled in {{mdm}} are denied access to those systems.{{/if}}{{#unless has_mdm}}Until a device management platform is adopted, the IT/Operations Lead verifies the baseline at issue and at each quarterly reconciliation, and adopting one is a tracked security objective.{{/unless}}
- **4.5** Every resource in {{cloud}} is created through infrastructure-as-code or a documented change and carries tags for owner, environment, service and data classification. Untagged resources are treated as unowned and removed under 5.4. Cloud accounts, projects and subscriptions are themselves recorded in the register with their purpose and administrative owner.
- **4.6** Engineering maintains a software bill of materials for {{product}} listing the languages, frameworks, libraries and container base images in use and their versions, generated automatically from {{scm}} and {{cicd}} wherever possible, so that vulnerability notices can be matched to what is actually deployed. Open-source components are used within their licence terms, and the IT/Operations Lead keeps licence and subscription records.
- **4.7** SaaS subscriptions and services are approved under the Acceptable Use Policy before purchase, recorded in the register with their owner, the data classification they hold and their renewal date, and provisioned through {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}the approved account process{{/if}} where supported. Services paid for on personal cards or expensed without approval are not permitted.
- **4.8** Storage media, including laptop drives, phones, external drives and decommissioned cloud volumes and snapshots, are sanitised before reuse or disposal by cryptographic erase, full secure wipe or physical destruction under the Data Retention and Disposal Policy. The method and date are recorded, and third-party disposal is accompanied by a certificate of destruction.
- **4.9** Removable media is not used for company or customer data except with written approval from the Security Owner; approved media is encrypted, recorded in the register and wiped after use.
- **4.10** Loss, theft or unexplained absence of any asset is reported to {{incident_contact}} immediately and handled under the Incident Response Policy, including remote wipe{{#if has_mdm}} through {{mdm}}{{/if}} and credential rotation for endpoints.
- **4.11** {{#if scope_availability}}Because Availability is within the scope of the SOC 2 examination, Engineering monitors the capacity and utilisation of production resources in {{cloud}}, alerts on thresholds that would affect the availability of {{product}}, and reviews capacity forecasts at least quarterly.{{/if}}{{#unless scope_availability}}Engineering monitors the utilisation of production resources in {{cloud}} and removes or resizes resources no longer needed, so that the inventory reflects what is actually running.{{/unless}}

## 5. Procedures

- **5.1** Device issue. The IT/Operations Lead procures the device, records its serial number and model, applies the baseline configuration{{#if has_mdm}} through {{mdm}} enrolment{{/if}}, assigns it to the user in the register, and obtains the user's signed acknowledgement of receipt. Devices are shipped only to addresses confirmed by People Operations.
- **5.2** Register updates. Any change to an asset's owner, user, location or status is recorded within two business days. The IT/Operations Lead edits the register for hardware and services; Engineering edits it for cloud resources and the software bill of materials.
- **5.3** Quarterly reconciliation. Within the first month of each quarter the IT/Operations Lead reconciles the hardware register against {{#if has_mdm}}the device list in {{mdm}}{{/if}}{{#unless has_mdm}}purchase and shipping records{{/unless}} and the active user list from {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}People Operations{{/if}}, and Engineering reconciles the cloud register against a fresh resource export from {{cloud}}. Discrepancies are investigated and recorded, and the signed-off reconciliation is retained as evidence.
- **5.4** Unowned cloud resources. Engineering runs a monthly report of resources in {{cloud}} lacking the required tags, attempts to identify the owner from deployment history in {{scm}} and {{cicd}}, and after ten business days snapshots any still-unowned resource that holds data, removes it, and records the removal in a ticket.
- **5.5** SaaS review. Each quarter the IT/Operations Lead compares the services register against {{#unless idp_none}}the application catalogue in {{idp}} and {{/unless}}expense and card records, adds any service in use without an entry, refers it to the Security Owner for approval or termination, and flags renewals due next quarter so that unused subscriptions are cancelled rather than auto-renewed.
- **5.6** Software bill of materials. {{cicd}} generates the dependency manifest for {{product}} on each production build. Engineering stores the latest manifest with the release record, and the Vulnerability and Patch Management Policy uses it to match advisories to deployed components.
- **5.7** Return and disposal. People Operations includes device return in the offboarding checklist and provides a prepaid shipping label for remote staff. The IT/Operations Lead confirms receipt, records the date, {{#if has_mdm}}wipes the device through {{mdm}}{{/if}}{{#unless has_mdm}}performs a full secure wipe{{/unless}}, and marks it available or retired. Unreturned devices are escalated to the Security Owner after five business days and treated as lost. End-of-life devices are wiped as in 4.8 and recycled through a vendor that provides a certificate of destruction; cloud volumes, snapshots and buckets are deleted through a reviewed change.
- **5.8** Lost or stolen assets. The user reports to {{incident_contact}} immediately. The Security Owner initiates a remote lock and wipe{{#if has_mdm}} through {{mdm}}{{/if}}, revokes the user's sessions, rotates any credentials that were on the device, marks the asset lost in the register, and records the event under the Incident Response Policy. Police reports are filed where theft is suspected.

## 6. Exceptions

Exceptions, such as a temporary personally owned device while a company device is in transit, or a research environment that cannot be tagged conventionally, are approved in writing by the Security Owner, recorded in the exception register with compensating controls and an expiry date no later than twelve months out, and reviewed at each {{review_cadence_lc}} review. No exception permits access to customer data from a device not recorded in the register.

## 7. Enforcement

Assets discovered outside the register are brought under management or removed, and the circumstances are investigated. Personnel who use unrecorded devices for company data, dispose of equipment or media without sanitisation, or fail to return assets at departure are subject to the disciplinary process in the Acceptable Use Policy and may be held responsible for unreturned equipment. Engineering leads are accountable for untagged or unowned cloud resources in their areas.

## 8. Review Cadence

The IT/Operations Lead and the Security Owner review this policy at the {{review_cadence_lc}} policy review, after any incident involving a lost, stolen or unknown asset, and whenever {{company}} adopts a new cloud platform, device type or management tool. Revisions are approved by {{approver}} and recorded in section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
