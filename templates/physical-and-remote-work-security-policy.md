---
id: P21
slug: physical-and-remote-work-security-policy
title: Physical and Remote Work Security Policy
short: Covers the physical protection of people, equipment and information in offices, home offices, shared spaces and while travelling, including reliance on cloud providers for data centre security.
owner_role: IT/Operations Lead
order: 21
tsc:
- CC6.4
- CC6.5
- A1.2
---

## 1. Purpose

Most of {{company}}'s information lives in cloud services, but it is read and written on laptops and screens in offices, homes, coworking spaces, trains and cafés. This policy sets the physical and environmental safeguards for company equipment and information wherever work happens, defines how {{company}} relies on its hosting providers for data centre security, and sets the obligations for working away from a company office.

## 2. Scope

This policy applies to all {{company}} personnel and to every location where {{company}} equipment or information is used: company offices, home offices, coworking and client spaces, and any location visited while travelling. It covers premises, devices, paper, home and office networks, public places, disposal, and {{company}}'s reliance on {{cloud}} for the physical security of the data centres that host {{product}}. {{company}} operates as a {{work_model}} organisation. Device configuration is covered by the Endpoint and Workstation Security Policy.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds office and home-office equipment and decides on physical security measures; {{approver}} is the approver of record.
- **Security Owner ({{security_owner}})** approves office access arrangements, reviews provider data centre assurance, handles reports of physical security incidents and approves exceptions.
- **Engineering** confirms that production runs only in the provider facilities in Section 4.1 and that no production data is held on premises or on removable media.
- **People Operations** manages office keys and badges, records remote-work arrangements and includes physical security obligations in onboarding and offboarding. The IT/Operations Lead owns this policy.
- **All Personnel** protect the equipment and information entrusted to them wherever they work, follow this policy, and report loss, theft or suspicious physical access to {{incident_contact}}.

## 4. Policy Statements

- **4.1** {{company}} does not operate its own data centres or server rooms. All production systems for {{product}} run in facilities operated by {{cloud}}, and {{company}} relies on those providers' physical and environmental controls (access control, surveillance, power, cooling and fire suppression) as described in their independent assurance reports. No production system or production data may be hosted on equipment located in an office or home.
- **4.2** Where {{company}} maintains an office, entry is restricted to authorised personnel through keys, badges or a managed access system, with access issued at onboarding and revoked on the last working day. Doors are locked outside staffed hours, and any alarm or access system is tested at least annually.
- **4.3** Visitors sign in, are issued a visible visitor identifier where practical, are escorted by their host at all times, and never have unattended access to work areas, whiteboards or equipment. Deliveries and contractors are received at a designated point.
- **4.4** Personnel follow a clear desk and clear screen practice: screens are locked whenever a device is left unattended, documents containing company or customer information are not left on desks, whiteboards are wiped after confidential meetings, and printed confidential material is collected immediately and shredded when no longer needed.
- **4.5** Company devices are never left unattended in public places, in vehicles or in unsecured shared spaces. When a device must be left in accommodation or an office overnight, it is powered off, so that disk encryption is fully engaged, and stored out of sight or in a locked drawer.
- **4.6** {{#if remote_or_hybrid}}Personnel working from home maintain a workspace where screens cannot be observed by household members or visitors during work involving company or customer information, and use headphones for calls where others could overhear. Company devices are used only by the person they are assigned to.{{/if}}{{#unless remote_or_hybrid}}Personnel who occasionally work outside the office follow the same rules as apply within it, ensure that screens cannot be observed by others and that confidential calls are not overheard, and never let anyone else use their company device.{{/unless}}
- **4.7** {{#if remote_or_hybrid}}Home networks used for work are protected with WPA2 or WPA3 encryption and a strong, non-default Wi-Fi password; the router's administrative password is changed from the factory default and its firmware is kept up to date. Work devices are not connected to open networks or networks using WEP.{{/if}}{{#unless remote_or_hybrid}}The office network uses WPA2 or WPA3 on all wireless segments, guest Wi-Fi is separated from the corporate network, and network equipment is kept in a locked cabinet or room with administrative credentials changed from factory defaults.{{/unless}}
- **4.8** On public or untrusted networks (hotels, airports, cafés, coworking spaces) personnel do not access production systems, administrative consoles or customer data unless the connection goes through the company VPN or an identity-aware proxy that encrypts all traffic and verifies the device. A personal hotspot is preferred over open public Wi-Fi.
- **4.9** Confidential conversations, screen sharing and code reviews are not conducted where they can be overheard or seen by people outside {{company}}. Privacy screens are used in shared spaces, and video call backgrounds are checked so that whiteboards and screens are not visible.
- **4.10** Before travel to countries with an elevated risk of device search, seizure or surveillance, personnel consult the Security Owner, who may issue a travel device with minimal data and require credentials to be rotated on return. A device taken out of the traveller's control by border officials or anyone else is reported to {{incident_contact}} and treated as compromised.
- **4.11** Paper records, removable media and hardware containing company or customer information are disposed of securely: paper through cross-cut shredding or an accredited destruction service, and storage media and devices through the wipe and destruction process in the Endpoint and Workstation Security Policy. Confidential material is never placed in general waste or recycling.
- **4.12** Physical security events, including lost or stolen equipment, tailgating, unescorted visitors, break-ins and loss of paper records, are reported to {{incident_contact}} within one hour of discovery, as the Incident Response Policy requires, and handled under that policy.
- **4.13** Company equipment shipped to or from personnel is sent by a tracked courier with signature on delivery{{#if has_mdm}}, remains enrolled in {{mdm}} so that it can be located, locked or wiped in transit{{/if}}, and is confirmed as received on the relevant checklist within two business days of expected delivery.

## 5. Procedures

- **5.1** Provider assurance review. Each year the Security Owner obtains the current independent assurance report for each hosting provider ({{cloud}}), confirms that it covers the regions {{product}} uses, reviews any exceptions relating to physical and environmental controls and records the conclusion. Owner: Security Owner. Cadence: annually, and when a new provider or region is adopted.
- **5.2** Office access provisioning and revocation. People Operations issues keys, badges or access credentials at onboarding, records the holder in the physical access register, and collects or deactivates them on the last working day. Lost keys or badges are reported immediately and deactivated, or the lock is changed. Owner: People Operations. Timing: issued at start; revoked within 24 hours of departure.
- **5.3** Physical access review. Each quarter People Operations reconciles the physical access register with the HR roster and the access system's log, removes any access without a current holder, and records the review. Owner: People Operations. Cadence: quarterly.
- **5.4** Visitor handling. The host registers each visitor in the visitor log with name, organisation, host and time in and out, meets them at reception, escorts them throughout the visit and signs them out. Visitor logs are retained for 12 months. Owner: the hosting employee; register maintained by People Operations. Cadence: every visit.
- **5.5** {{#if remote_or_hybrid}}Remote work setup. At onboarding, and whenever a person's primary work location changes, People Operations issues the home-office checklist covering workspace privacy, Wi-Fi security, router configuration and equipment storage. The person confirms completion in writing for the personnel record. Owner: People Operations. Cadence: at onboarding and on change of location; re-confirmed annually.{{/if}}{{#unless remote_or_hybrid}}Out-of-office work. Personnel who need to work outside the office for more than an occasional day confirm the out-of-office checklist covering workspace privacy, Wi-Fi security and equipment storage with their manager, and the confirmation is kept in the personnel record. Owner: People Operations. Cadence: on request; re-confirmed annually.{{/unless}}
- **5.6** Working in public places and travel. Before travel involving access to company systems, personnel confirm that the company VPN or proxy works on their device, that a privacy screen is available and that no unnecessary local data is present. For elevated-risk destinations the Security Owner is consulted at least five business days before departure and records the measures applied. Owner: the traveller, with the Security Owner. Timing: before each trip.
- **5.7** Physical security incident. On a report to {{incident_contact}}, the responder records the event, secures any affected area or equipment, determines whether information may have been exposed, {{#if has_mdm}}locks or wipes any affected device through {{mdm}}, {{/if}}and escalates under the Incident Response Policy. Equipment losses are updated in the device inventory. Owner: Security Owner. Timing: initial response within four hours.
- **5.8** Secure disposal. Confidential paper is placed in locked shredding bins or shredded directly. Devices and media follow the wipe and destruction procedure in the Endpoint and Workstation Security Policy, and destruction certificates from third-party providers are filed with the device inventory. Owner: IT/Operations Lead. Cadence: continuous; disposal records reviewed annually.
- **5.9** Equipment shipping. When equipment is sent to a new starter or returned by a leaver, the IT/Operations Lead books a tracked, signature-required courier, records the tracking number in the inventory and confirms receipt. A shipment not confirmed within two business days of expected delivery is investigated and, if not located, treated as lost under Section 5.7. Owner: IT/Operations Lead. Timing: every shipment.

## 6. Exceptions

Exceptions must be requested in writing to the Security Owner with the business reason and the compensating controls, and approved by {{approver}}. Approved exceptions are recorded in the exception register with an expiry date no more than 12 months away and are reviewed at each policy review. No exception may permit production systems or data to be hosted outside the provider facilities described in Section 4.1.

## 7. Enforcement

Failure to comply with this policy is subject to disciplinary action under the Human Resources Security Policy, up to and including termination of employment or contract. Contractual remedies apply to contractors and vendors.

## 8. Review Cadence

The IT/Operations Lead and the Security Owner review this policy on a {{review_cadence_lc}} basis and whenever {{company}} opens or closes an office or changes its working model or hosting provider. Each review is recorded in Section 9, and changes are communicated to all personnel within 30 days.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
