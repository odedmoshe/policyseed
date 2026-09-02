---
id: P10
slug: secure-software-development-policy
title: Secure Software Development Policy
short: Embeds security into how the product is designed, built, tested, dependency-managed and released so that vulnerabilities are prevented or found before they reach customers.
owner_role: Engineering Lead
order: 10
tsc:
- CC6.8
- CC8.1
---

## 1. Purpose

Security defects are cheapest to prevent and most expensive to fix after a customer finds them. This policy defines how {{company}} builds security into every stage of developing {{product}}: requirements, design, coding, review, testing, dependency management, release and maintenance. It sets the minimum practices every engineer follows and the automated controls in {{scm}} and {{cicd}} that enforce them, supporting the SOC 2 criteria for change management, vulnerability detection and logical access.

## 2. Scope

This policy applies to all software developed by or for {{company}}, including {{product}} ({{app_type}}), internal tools, infrastructure-as-code, {{cicd}} configuration, scripts that touch production data, and code produced by contractors or generated with AI assistance. It binds everyone who writes, reviews, tests or deploys code and covers the tools they use, including {{scm}}, {{cicd}}, package registries and the environments on {{cloud}}. The Change Management Policy governs how a change reaches production; the Vulnerability and Patch Management Policy governs remediation timelines for findings.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds security tooling, training and an annual penetration test, and accepts residual risk for exceptions.
- **Security Owner ({{security_owner}})** maintains the secure coding standards, approves threat models for security-relevant features, sets blocking thresholds for automated checks, reviews suppressed findings, coordinates penetration testing and reports software security metrics.
- **Engineering** applies the standards, performs threat modeling and security-focused review, maintains the security checks in {{cicd}}, manages dependencies, remediates findings on time and keeps environments separated.
- **People Operations** schedules secure development training at onboarding and annually, records completion, and confirms contractors accept this policy before receiving access to {{scm}}.
- **All Personnel** who touch code follow this policy, never place secrets or production data in code, tickets or AI tools, and report suspected vulnerabilities in {{product}} to {{incident_contact}}.

## 4. Policy Statements

- **4.1** {{company}} follows a defined secure development lifecycle: security requirements during planning, threat modeling during design, secure coding standards and peer review during implementation, automated and manual security testing before release, and monitoring and vulnerability management afterwards.
- **4.2** Features that add or change authentication, authorization, session handling, payment flows, file upload, third-party integrations, cryptography, or the processing of{{#if has_sensitive_data}} {{data_types}} or other{{/if}} sensitive data require written security requirements and a threat model approved by the Security Owner before implementation begins.
- **4.3** Engineers follow {{company}}'s secure coding standards, which adopt OWASP ASVS Level 2 as the baseline and address the OWASP Top 10: parameterized queries, output encoding, server-side allow-list input validation, centralized authentication and authorization checks, secure session management, safe file handling, protection against server-side request forgery, and vetted cryptographic libraries only.
- **4.4** All code is peer reviewed through a pull request in {{scm}} under the Change Management Policy, and reviewers apply a security checklist covering authorization, input handling, secrets, logging of sensitive data, error handling and dependency changes.
- **4.5** Every pull request and the default branch are scanned in {{cicd}} with static application security testing, software composition analysis, secret detection, container image scanning and infrastructure-as-code scanning. Critical and High findings block the merge until fixed or formally suppressed under 5.3.
- **4.6** Dependencies come only from official registries, are pinned with lockfiles, are kept current through automated update pull requests, and are not used when end-of-life, unmaintained or incompatibly licensed. Dependencies with known Critical or High vulnerabilities are updated within the Vulnerability and Patch Management Policy timelines.
- **4.7** Development, staging and production on {{cloud}} are logically separated with distinct credentials and network boundaries. Production secrets are never used in lower environments, and production customer data is not used for development or testing unless anonymized or masked by a method approved by the Security Owner.
- **4.8** Secrets follow the Encryption and Key Management Policy: never hard-coded or committed to {{scm}}, always injected from the secrets manager at runtime, and protected by secret scanning and push protection.
- **4.9** Every interface {{product}} exposes authenticates the caller, enforces object-level and function-level authorization on the server, validates input against a schema, applies rate limiting, returns generic errors to clients and never places secrets or sensitive data in URLs.{{#if is_api}} Because {{product}} exposes an API, keys and tokens are minimally scoped, revocable and rotated, endpoints are versioned and deprecated with notice, and published API documentation matches implemented behavior.{{/if}}
- **4.10** Clients are untrusted and all security decisions are made on the server. Web clients set Content Security Policy, X-Content-Type-Options, frame protection and secure, HttpOnly, SameSite cookie attributes.{{#if is_mobile}} The {{product}} mobile application follows OWASP MASVS, stores tokens only in the platform keychain or keystore, ships no embedded secrets, is signed with keys held under the Encryption and Key Management Policy, and is released through store accounts protected by multi-factor authentication.{{/if}}
- **4.11** Payment functionality uses only a PCI DSS-validated processor with hosted fields, redirect or tokenization so that primary account numbers never enter {{product}}.{{#if has_payment}} Because {{company}} handles Payment data, code touching payment tokens or the processor API receives security review on every change, the integration is verified against the processor's current guidance annually, and no logging, caching or analytics component captures payment data.{{/if}}
- **4.12** {{product}} receives an independent penetration test at least annually and after major architectural changes; findings are remediated under the Vulnerability and Patch Management Policy and Critical and High findings are retested before closure. Code generated by AI assistants or copied from external sources is reviewed to the same standard as human-written code, and secrets, customer data and unreleased proprietary code are never submitted to unapproved AI tools or external services.
- **4.13** Every engineer completes secure development training within 30 days of starting and annually thereafter, covering the OWASP Top 10, {{company}}'s standards and secret handling; People Operations keeps the records. {{product}} emits the security events required by the Logging and Monitoring Policy without recording passwords, tokens or unnecessary sensitive data.

## 5. Procedures

- **5.1** Threat modeling. For each feature meeting 4.2, the responsible engineer documents data flows, trust boundaries and assets, identifies threats with a structured method such as STRIDE, records mitigations and accepted risks, and obtains Security Owner approval. Mitigations become backlog items linked to the design record.
- **5.2** Security review. The pull request template in {{scm}} carries the security checklist and the reviewer records that each item was considered; security-relevant changes route to the Security Owner or designated reviewer through code ownership rules and cannot merge without that approval.
- **5.3** Automated gates. Engineering maintains the scanners in {{cicd}} with results visible in the pull request. A finding may be suppressed only with written justification and Security Owner approval; suppressions expire after 90 days and are reviewed monthly.
- **5.4** Dependency management. Automated update pull requests are reviewed weekly. Security updates merge within the Vulnerability and Patch Management Policy timelines: Critical within 7 days, High within 30 days, Medium within 90 days. Each quarter Engineering reviews the dependency inventory for unmaintained or end-of-life components and plans replacements.
- **5.5** Pre-release checklist. Before a release containing security-relevant changes, the releasing engineer confirms all security checks passed, threat model mitigations are implemented, migrations were tested in staging, feature flags and rollback are ready, and any touched secret has been rotated, recording the checklist in the release ticket.
- **5.6** Penetration testing. The Security Owner engages an independent tester annually, scopes {{product}} and its infrastructure on {{cloud}}, provides test accounts, enters findings into the vulnerability register, tracks remediation, obtains retests for Critical and High findings and retains the report and retest letter as audit evidence.
- **5.7** Disclosure intake. Reports received at {{incident_contact}} or the published security contact are acknowledged within three business days, reproduced, rated and tracked under the Vulnerability and Patch Management Policy, and the reporter is told when the issue is resolved.
- **5.8** Training and hardened defaults. People Operations enrolls new engineers in secure development training during onboarding and schedules the annual refresher; the Security Owner updates the content when standards change. Engineering maintains project templates that enable security headers, secure cookies, strict Content Security Policy, structured logging with sensitive-field redaction and dependency pinning by default.
- **5.9** Metrics. Each quarter the Security Owner reviews open findings by severity, mean time to remediate, suppression count, training completion and penetration test status, and reports to Executive Management with corrective actions.

## 6. Exceptions

Deviations such as a legacy component that cannot pass a scanner, a dependency that must remain on an unsupported version, or a feature that must ship before its threat model is complete require a written exception request describing the risk, the compensating controls and the remediation date. The Security Owner approves or rejects it; exceptions affecting authentication, payment or customer data also require Executive Management approval. Approved exceptions are recorded in the exception register, last no more than 12 months and are reviewed at each policy review.

## 7. Enforcement

Merging code without review, disabling security checks, committing secrets, using production data in lower environments, or submitting proprietary code or customer data to unapproved tools violates this policy and is handled under the Human Resources Security Policy, which may result in disciplinary action up to and including termination of employment; contractors and vendors are subject to contract termination. Suspected violations are reported to {{incident_contact}}.

## 8. Review Cadence

The Security Owner reviews this policy on the {{review_cadence_lc}} review cycle and after any significant change to {{company}}'s technology stack, development tooling or threat landscape, and after any security incident attributable to a software defect. Changes are approved by {{approver}} and recorded in the revision history.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
