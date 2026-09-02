---
id: P20
slug: network-and-infrastructure-security-policy
title: Network and Infrastructure Security Policy
short: Defines how the cloud networks, compute and supporting infrastructure behind the product are segmented, hardened, administered and monitored.
owner_role: Engineering Lead
order: 20
tsc:
- CC6.1
- CC6.6
- CC6.7
- CC7.1
- CC7.2
---

## 1. Purpose

{{product}} runs on infrastructure that {{company}} configures but does not physically own. This policy sets how that infrastructure is designed, segmented, hardened, changed and watched, so that only intended traffic reaches production, administrative access is tightly controlled, and weaknesses are found and fixed before they are exploited. It relies on the Access Control, Change Management, Logging and Monitoring, and Vulnerability and Patch Management policies for the identities, changes, telemetry and remediation it refers to.

## 2. Scope

This policy applies to every network, subnet, load balancer, firewall rule, DNS zone, compute instance, container platform, managed database, storage bucket, queue and edge service that hosts or supports {{product}}, in production, staging and development. {{company}} currently hosts on {{cloud}}. It also covers any office network or corporate VPN that {{company}} operates, and the infrastructure-as-code held in {{scm}} and deployed through {{cicd}}. Endpoints are covered by the Endpoint and Workstation Security Policy, and provider data centre security by the Physical and Remote Work Security Policy.

## 3. Roles and Responsibilities

- **Executive Management** approves the infrastructure budget and this policy, and formally accepts residual risk where a control cannot be met; {{approver}} is the approver of record.
- **Security Owner ({{security_owner}})** approves the network architecture and hardening baselines, reviews the firewall and access reviews, owns external testing and handles escalated anomalies.
- **Engineering** owns this policy through the Engineering Lead, designs and operates the infrastructure, writes and reviews infrastructure-as-code, applies hardening baselines, responds to alerts and performs the reviews in Section 5.
- **People Operations** ensures that infrastructure administrators are onboarded and offboarded under the Human Resources Security Policy and that administrator role changes reach Engineering the same day.
- **All Personnel** with infrastructure access use it only through the approved paths in this policy, never bypass network controls, and report suspected misconfigurations or unauthorised access to {{incident_contact}}.

## 4. Policy Statements

- **4.1** Production, staging and development environments are isolated in separate accounts, projects or subscriptions with no shared network paths, credentials or data. Production data is not copied into non-production environments except as anonymised or synthetic datasets approved by the Security Owner.
- **4.2** Every environment follows a segmented network design, applied on each hosting platform {{company}} uses as follows:
{{#each cloud_list}}  - {{this}}: workloads run in private subnets or equivalent private segments with no direct inbound route from the internet; databases, caches and internal services accept connections only from application segments; security groups and firewall rules default to deny and permit only documented ports and sources; and a web application firewall or equivalent edge protection fronts every public HTTP endpoint.
{{/each}}
- **4.3** Data stores are never exposed to the public internet. Storage buckets default to private, public access is blocked at the account level, and any intentional public bucket or endpoint is documented and approved by the Security Owner.
- **4.4** All traffic to and between {{product}} services is encrypted in transit with TLS 1.2 or higher, using certificates from a trusted authority with automated renewal. Plaintext protocols such as HTTP, FTP, Telnet and unencrypted database connections are not permitted across any network boundary.
- **4.5** Administrative access is granted only to named individuals through {{#unless idp_none}}single sign-on from {{idp}} {{/unless}}{{#if idp_none}}individual named accounts {{/if}}with multi-factor authentication, following least privilege under the Access Control Policy. Root or owner credentials are locked away, protected by hardware multi-factor authentication and used only for logged and reviewed break-glass scenarios.
- **4.6** Interactive access to servers and containers goes through the provider's session management service, an identity-aware proxy or a session-recording bastion. Inbound SSH and RDP from the internet are prohibited, and long-lived static access keys are replaced with short-lived credentials wherever the platform supports them.
- **4.7** Infrastructure is defined as code in {{scm}}, changed only through peer-reviewed pull requests and deployed through {{cicd}} under the Change Management Policy. Manual console changes to production are limited to emergencies, are logged and are reconciled into code within five business days.
- **4.8** Every compute image, container base image and managed service is configured against a documented hardening baseline informed by the provider's published best practices and CIS benchmarks: unnecessary services disabled, default credentials removed, instance metadata access restricted and logging enabled.
- **4.9** Secrets (API keys, database passwords, signing keys, tokens) live in the platform's secret manager and are injected at runtime. They are never committed to {{scm}}, baked into images or written to logs, and are rotated on a defined schedule and immediately after any suspected exposure.
- **4.10** Network flow logs, load balancer logs, DNS query logs and cloud audit logs are enabled in every environment and retained{{#if has_logging_tool}} in {{logging_tool}}{{/if}} under the Logging and Monitoring Policy. Alerts fire on security group changes, new public exposures, root or owner account use and unusual outbound traffic.
- **4.11** Public-facing services are protected against denial-of-service and abusive traffic by the provider's DDoS protection and edge rate limiting{{#if is_api}}, with per-client rate limits on the {{product}} API{{/if}}. {{#if scope_availability}}Production workloads span at least two availability zones or equivalent failure domains so that losing one zone does not take {{product}} offline.{{/if}}{{#unless scope_availability}}Capacity and redundancy decisions are recorded in the architecture record.{{/unless}}
- **4.12** {{#if remote_or_hybrid}}{{company}} operates as a {{work_model}} organisation and treats no office or home network as trusted. Access to company systems depends on the identity and device of the person connecting, not on the network, and any corporate VPN or private connectivity is limited to specific administrative destinations.{{/if}}{{#unless remote_or_hybrid}}Office networks are segmented so that guest Wi-Fi, corporate devices, printers and on-premises equipment sit on separate VLANs, and the office network is treated as untrusted for reaching production systems.{{/unless}}
- **4.13** The external attack surface of {{product}} is scanned for open ports, exposed services and known vulnerabilities at least monthly, and an independent penetration test of production is performed at least annually and after major architectural changes. Findings are remediated under the Vulnerability and Patch Management Policy.
- **4.14** A current network and architecture diagram showing environments, segments, ingress points, data stores and trust boundaries is maintained by Engineering and reviewed {{review_cadence}} and after any material change.

## 5. Procedures

- **5.1** Network change. Any change to a firewall rule, security group, route, load balancer, DNS record or network policy is proposed as a pull request in {{scm}}, reviewed by a second engineer for least privilege and unintended exposure, and applied through {{cicd}}. Emergency console changes are announced in the incident channel and reconciled into code within five business days. Owner: Engineering. Timing: every change.
- **5.2** Quarterly rule and exposure review. Each quarter Engineering exports every rule permitting inbound traffic from the internet, plus all public IP addresses, buckets and endpoints, and reviews them with the Security Owner. Rules without documented justification are removed within ten business days; the export, notes and removal tickets are retained as evidence. Owner: Engineering Lead. Cadence: quarterly.
- **5.3** Administrator access review. Each quarter the Security Owner reviews the identities holding administrative roles on {{cloud}}, confirms that each belongs to current personnel with a business need and has multi-factor authentication enforced, removes unjustified access and reviews any break-glass use. Owner: Security Owner. Cadence: quarterly.
- **5.4** Hardening baseline. Engineering maintains the hardening baseline, updates it when provider guidance or CIS benchmarks change, and validates new images against it in {{cicd}} before promotion to production. Drift found by configuration scanning is corrected within 30 days, or 7 days for internet-facing components. Owner: Engineering Lead. Cadence: reviewed {{review_cadence}}; validated on every build.
- **5.5** Certificate and secret management. TLS certificates renew automatically, and expiry alerts fire 21 days before any certificate that cannot auto-renew expires. Each secret has a recorded owner and a rotation schedule of at most 12 months for static credentials, and the secrets inventory is reviewed quarterly with the access review. Owner: Engineering. Cadence: continuous; quarterly inventory review.
- **5.6** External scanning and penetration testing. Engineering scans all public endpoints at least monthly and triages results within five business days. The Security Owner engages an independent penetration testing firm annually, provides the current architecture diagram, tracks findings to closure in the vulnerability register and retains the report and remediation evidence. Owner: Security Owner. Cadence: monthly scan; annual test.
- **5.7** Monitoring and response. Alerts from Section 4.10 route{{#if has_logging_tool}} from {{logging_tool}}{{/if}} to the on-call engineer, who acknowledges within 30 minutes in business hours and two hours otherwise, and either closes the alert with a note or opens an incident under the Incident Response Policy. Alert rules are tuned quarterly. Owner: Engineering. Cadence: continuous; tuning quarterly.
- **5.8** Architecture review. The Engineering Lead updates the diagram whenever a new environment, service or ingress point is introduced and walks the Security Owner through it {{review_cadence}}, confirming that the segmentation model in Section 4.2 remains accurate and recording accepted deviations as exceptions. Owner: Engineering Lead. Cadence: {{review_cadence}} and on material change.

## 6. Exceptions

Exceptions (for example, a legacy integration that requires a static access key, or a public endpoint that cannot sit behind the web application firewall) must be requested in writing to the Security Owner with the business reason and the compensating controls, and approved by {{approver}}. Approved exceptions are recorded in the exception register with an expiry date no more than 12 months away and are reviewed at each quarterly rule review. No exception may permit a data store to be reachable directly from the internet.

## 7. Enforcement

Infrastructure that presents an active exposure may be isolated or shut down by Engineering without notice. Personnel who bypass network controls, share administrative credentials or make undocumented production changes are subject to disciplinary action under the Human Resources Security Policy, up to and including termination of employment or contract.

## 8. Review Cadence

The Engineering Lead and the Security Owner review this policy on a {{review_cadence}} basis and whenever a hosting platform is added or removed, a new environment is created or the architecture changes materially. Each review is recorded in Section 9, and changes are communicated to everyone with infrastructure access within 30 days.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
