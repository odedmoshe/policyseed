---
id: P08
slug: encryption-and-key-management-policy
title: Encryption and Key Management Policy
short: Sets minimum encryption standards for data in transit and at rest and defines how cryptographic keys, secrets and certificates are generated, stored, rotated and retired.
owner_role: Engineering Lead
order: 8
tsc:
- CC6.1
- CC6.7
---

## 1. Purpose

Encryption keeps data confidential when other controls fail: a lost laptop, a misconfigured bucket or a stolen backup. This policy sets the minimum encryption standards {{company}} applies to data in transit and at rest and defines how the keys, secrets and certificates that make encryption effective are generated, stored, rotated and retired. Weak key management undoes strong encryption, so both are governed together in support of the SOC 2 criteria for logical access, transmission protection and confidentiality.

## 2. Scope

This policy applies to every system that stores, processes or transmits {{company}} or customer data, including all environments for {{product}}, corporate SaaS tools, endpoints, backups{{#if has_backup_tool}} in {{backup_tool}}{{/if}} and vendor integrations{{#if has_vendors}} with {{vendors}}{{/if}}. The cloud platforms in scope are:

{{#each cloud_list}}- {{this}}
{{/each}}

It covers all cryptographic material: keys in cloud key management services, application secrets, signing keys, SSH keys, TLS certificates and credentials stored in {{cicd}}.{{#if has_sensitive_data}} It applies with particular force to the {{data_types}} data that {{company}} handles.{{/if}} It binds everyone who designs, builds, operates or administers {{product}} or its infrastructure.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, funds key management and certificate automation, and accepts residual risk documented in exceptions.
- **Security Owner ({{security_owner}})** approves the permitted algorithm list, reviews cryptographic design decisions, approves exceptions and directs the response to suspected key or secret compromise.
- **Engineering** implements encryption in {{product}}, administers key and secrets management on {{cloud}}, maintains the key and certificate inventory, performs rotations and responds to secret-scanning alerts.
- **People Operations** ensures offboarding triggers credential revocation and secret rotation and that training covers secret handling.
- **All Personnel** never store secrets in code, documents, chat or tickets; keep credentials in the approved password manager{{#if has_password_manager}} ({{password_manager}}){{/if}}; and report suspected exposure of any key or secret to {{incident_contact}} immediately.

## 4. Policy Statements

- **4.1** Data transmitted over public networks, between {{product}} and its users, and between services across a network trust boundary is encrypted with TLS 1.2 or higher, TLS 1.3 preferred. Public endpoints enforce HTTPS, send HTTP Strict Transport Security headers with at least a one-year max-age, and use plaintext HTTP only to redirect; other plaintext protocols are prohibited.
- **4.2** All production data at rest on {{cloud}}, including databases, object storage, volumes, snapshots, backups and log storage, is encrypted with AES-256 or a provider-equivalent algorithm, enabled before any data is written. Stores holding customer data use keys held in the provider's key management service, never keys embedded in application code.
- **4.3** Approved algorithms are AES-128 or AES-256 in GCM or another authenticated mode, ChaCha20-Poly1305, RSA of at least 2048 bits, ECDSA and ECDH on P-256 or P-384, Ed25519, X25519 and SHA-256 or stronger. MD5, SHA-1 for signatures, DES, 3DES, RC4, RSA below 2048 bits, SSL, TLS 1.0 and TLS 1.1 are prohibited. {{company}} does not implement custom cryptographic algorithms or protocols.
- **4.4** Encryption keys are generated inside the cloud provider's key management service or an equivalent hardware-backed service and never leave it in plaintext. Application data uses envelope encryption with data keys wrapped by a root key in the key management service. Key material is never exported or committed to {{scm}}.
- **4.5** Application secrets, service credentials and API tokens live only in the designated secrets manager and are injected at runtime. They are never committed to {{scm}}, printed in {{cicd}} logs, baked into images or shared by chat or email. Secret scanning and push protection are enabled on all repositories in {{scm}}, and {{cicd}} masks secret values in logs.
- **4.6** Rotation follows a defined schedule: key management root keys at least annually with automatic rotation where supported; broadly privileged service credentials and API tokens every 90 days; other application secrets at least every 12 months; and any key or secret immediately when compromise is suspected or when a person with direct access leaves or changes role.
- **4.7** Access to key and secrets management follows least privilege under the Access Control Policy. Key administration is restricted to named Engineering roles and separated from key use by workloads; administrative access requires multi-factor authentication{{#unless idp_none}} enforced through {{idp}}{{/unless}}, and key administration actions are logged and alerted under the Logging and Monitoring Policy.
- **4.8** User passwords stored by {{product}} are hashed with Argon2id, bcrypt or scrypt using a per-user salt and a work factor reviewed annually, and are never recoverable.{{#if is_api}} Customer API keys are shown once at creation, stored only as a salted hash, scoped to minimum permissions and revocable at any time.{{/if}}
- **4.9** All laptops and mobile devices used for company work have full-disk encryption enabled{{#if has_mdm}}, enforced and reported through {{mdm}}{{/if}}. Approved removable media is encrypted with AES-256.{{#if is_mobile}} The {{product}} mobile application stores tokens only in the platform keychain or keystore, contains no embedded secrets and validates server certificates against the platform trust store.{{/if}}
- **4.10** Payment information, where processed, is handled through a PCI DSS-validated processor using hosted fields, redirect or tokenization so that primary account numbers never enter {{product}}.{{#if has_payment}} Because {{company}} handles Payment data, any displayed account number is masked to at most the first six and last four digits, sensitive authentication data is never stored after authorization, and these controls are reviewed against current PCI DSS requirements each year.{{/if}}
- **4.11** Data classified Confidential or Restricted under the Data Classification and Handling Policy is encrypted at rest and in transit without exception, including when exported, emailed, shared with vendors or backed up.{{#if has_phi}} Protected health information is encrypted consistent with HIPAA Security Rule guidance so that lost media or an intercepted transmission does not constitute a breach of unsecured PHI.{{/if}}
- **4.12** TLS certificates are tracked in the certificate inventory, issued by a publicly trusted authority, renewed automatically with lifetimes of no more than 398 days, and have private keys generated on the terminating host or in the key management service.
- **4.13** Exposure of a key, secret or certificate private key is a security incident under the Incident Response Policy: the material is revoked and rotated first, the exposure is then investigated, and data protected only by the exposed material is re-encrypted. Any new use of cryptography in {{product}} is reviewed by the Security Owner before release.

## 5. Procedures

- **5.1** Inventory. Engineering maintains an inventory of every key management key, secrets manager entry, SSH key, signing key and TLS certificate with owner, purpose, location, rotation schedule and last rotation. It is reviewed quarterly against live configuration on {{cloud}} and in {{cicd}}; anything unrecorded is documented or removed.
- **5.2** Provisioning. New keys are created through infrastructure-as-code in the native key management service of the platform that uses them, with a key policy naming the administering role and the consuming workload, automatic rotation where supported and deletion protection enabled.
- **5.3** Rotation. Engineering keeps a rotation calendar derived from the inventory. Automatic rotation is preferred; manual rotation follows a written runbook that issues the new version, updates consumers, verifies function and retires the old version within 7 days. Each rotation is recorded in the inventory.
- **5.4** CI/CD secrets. Secrets in {{cicd}} are stored in its encrypted store, scoped to the narrowest repository and environment, and never exposed to workflows triggered from untrusted forks or pull requests. Engineering reviews the list quarterly, removes unused entries and confirms log masking is active.
- **5.5** Exposure response. When secret scanning, code review or any person reports a secret in source, logs or chat, the on-call engineer revokes and rotates it within four hours, as the Authentication and Password Policy requires, purges it from history where feasible, checks logs for use of the exposed value and records the event under the Incident Response Policy.
- **5.6** TLS review. Each quarter Engineering scans every public {{product}} endpoint with an external TLS analysis tool, confirms a grade-A-equivalent result, disables any weak cipher suites or protocol versions and records the results. Certificate expiry alerts fire at 30 and 7 days.
- **5.7** Endpoint verification.{{#if has_mdm}} Engineering reviews the monthly full-disk encryption compliance report from {{mdm}}; non-compliant devices are remediated within 7 days or blocked from company systems.{{/if}}{{#unless has_mdm}} Each quarter every person attests that full-disk encryption is enabled on their devices; People Operations tracks completion and escalates non-compliance to the Security Owner within 7 days.{{/unless}}
- **5.8** Offboarding rotation. When a person with direct access to any shared secret, key or certificate leaves or changes role, People Operations notifies Engineering on the last working day and Engineering rotates every secret the person could reach within one business day, removes their SSH keys and access tokens and records completion.
- **5.9** Backup and vendor verification. Engineering confirms that backups{{#if has_backup_tool}} in {{backup_tool}}{{/if}} use a key separate from the primary data key and that restore tests decrypt successfully. Vendor reviews confirm each vendor encrypts {{company}} data in transit and at rest to this standard{{#if has_vendors}}, with evidence recorded for {{vendors}}{{/if}}.
- **5.10** Cryptographic review. At the {{review_cadence_lc}} policy review the Security Owner compares the approved algorithm list with current NIST and industry guidance, flags anything approaching deprecation and records a migration plan due at least 12 months before the deprecation takes effect.

## 6. Exceptions

Deviations such as a legacy integration that cannot support TLS 1.2 require a written exception request describing the system, the risk, the compensating controls and the remediation date. The Security Owner approves or rejects it; exceptions affecting customer data also require Executive Management approval. Approved exceptions are recorded in the exception register, last no more than 12 months and are reviewed at each policy review.

## 7. Enforcement

Committing secrets to {{scm}}, disabling encryption on a device or data store, or sharing keys outside approved channels violates this policy and is handled under the Human Resources Security Policy, up to and including termination of employment; contractors and vendors are subject to contract termination. Any exposure of cryptographic material is reported immediately to {{incident_contact}} and managed under the Incident Response Policy.

## 8. Review Cadence

The Security Owner reviews this policy on the {{review_cadence_lc}} review cycle and after any significant change to {{product}}'s architecture, cloud platforms, cryptographic libraries or applicable standards, and after any incident involving keys or secrets. Changes are approved by {{approver}} and recorded in the revision history.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
