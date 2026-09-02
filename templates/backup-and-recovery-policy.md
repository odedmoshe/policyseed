---
id: P15
slug: backup-and-recovery-policy
title: Backup and Recovery Policy
short: Requires every data set that supports the product and the business to be backed up on a defined schedule, protected, monitored and proven restorable through regular tests.
owner_role: Engineering Lead
order: 15
tsc:
- A1.2
- A1.3
- CC7.5
---

## 1. Purpose

This policy ensures that {{company}} can recover data that supports {{product}} and its business operations after accidental deletion, corruption, infrastructure failure, ransomware or a compromised account. It defines what is backed up, how often, where copies are kept, how they are protected, and how restorability is proven against the objectives in the Business Continuity and Disaster Recovery Policy. A backup that has never been restored is an assumption; this policy turns it into evidence.

## 2. Scope

This policy applies to all data that {{company}} creates, stores or processes in delivering {{product}} and running the business, wherever it resides: production databases and object storage in {{cloud}}, source code and configuration in {{scm}}, secrets and key material, corporate SaaS data, and data on personnel endpoints. Frequencies below are minimums; Tier 1 systems must also meet the recovery point objective set in the Business Continuity and Disaster Recovery Policy.

| Data set | Method | Minimum frequency | Retention | Copy location |
| --- | --- | --- | --- | --- |
| Production databases | {{#if has_backup_tool}}{{backup_tool}} scheduled backups{{/if}}{{#unless has_backup_tool}}Managed database snapshots{{/unless}} plus point-in-time recovery where the engine supports it | {{backup_cadence}} | 35 days of point-in-time or daily copies; monthly copies for 12 months | Separate {{cloud}} account or region from production |
| Object and file storage holding customer content | Storage versioning and replication | Continuous | 90 days of prior versions; deleted objects recoverable for 30 days | Separate region or account |
| Source code, infrastructure code, CI configuration | {{scm}} hosted repositories with a scheduled export | On every commit; export weekly | Indefinite in {{scm}}; 12 weekly exports | Export stored in {{cloud}} storage outside {{scm}} |
| Secrets and encryption keys | Secrets manager versioning; key service with deletion protection | On every change | Previous versions 90 days; keys never deleted while data encrypted under them exists | {{cloud}} key service; keys are never exported |
| Corporate SaaS data (identity{{#unless idp_none}} in {{idp}}{{/unless}}, email, documents, ticketing) | Provider-native retention plus quarterly export of critical records | Quarterly export | Four most recent exports | {{cloud}} storage with restricted access |
| Personnel endpoints | Not backed up centrally; work must be kept in company cloud services{{#if has_mdm}}, and {{mdm}} enforces disk encryption so a lost device is a hardware loss, not a data loss{{/if}} | Not applicable | Not applicable | Not applicable |

## 3. Roles and Responsibilities

- **Executive Management** approves this policy and the retention periods, funds backup storage and tooling, and reviews restore-test results and unresolved backup failures at least quarterly.
- **Security Owner ({{security_owner}})** owns this policy, approves who may access backup storage and restore data, reviews backup access quarterly, confirms that backups are encrypted and separated from production, and ensures that restores during an incident preserve evidence.
- **Engineering** configures and operates backups for every system in the inventory, monitors backup jobs and responds to failures, performs and documents restore tests, executes restores when requested, and updates the Section 2 table when systems change.
- **People Operations** tells personnel during onboarding that endpoints are not backed up and that work must be saved to company services, and coordinates with Engineering to preserve or transfer a leaver's data before their accounts are removed.
- **All Personnel** store work product in approved company systems rather than on local disks or personal accounts, and report suspected data loss or corruption to {{incident_contact}} immediately.

## 4. Policy Statements

- **4.1** Every system in the system inventory has a named owner and a documented backup approach: either the method, frequency, retention and copy location in Section 2, or a written statement that the system holds no data worth recovering. New production data stores may not go live until their backup is configured and a first restore has been verified.
- **4.2** Production databases are backed up at least {{backup_cadence}}{{#if has_backup_tool}} using {{backup_tool}}{{/if}}, and point-in-time recovery is enabled wherever the database engine supports it, so that data loss after a fault is measured in minutes rather than a full backup interval.
- **4.3** At least one copy of every backup is stored in a different {{cloud}} account or region from the system it protects, under separate credentials, so that one compromised credential, misconfiguration or region failure cannot destroy both production data and its backups.
- **4.4** Backups of Tier 1 data are protected against deletion for their retention period through immutability, object lock, deletion protection or equivalent controls, and deleting backups outside the retention schedule requires approval from the Security Owner and is logged.
- **4.5** All backups are encrypted at rest using AES-256 or stronger, with keys managed in the {{cloud}} key management service and separated from the keys protecting production data where the platform allows. Backups transferred between accounts or regions are encrypted in transit.
- **4.6** Access to backup storage and restore operations is limited to Engineering personnel with a documented need, granted through role-based access{{#unless idp_none}} tied to {{idp}}{{/unless}}, protected by multi-factor authentication, logged, and reviewed quarterly by the Security Owner.
- **4.7** Every backup job is monitored. Failures and missed jobs raise an alert{{#if has_logging_tool}} in {{logging_tool}}{{/if}} to the Engineering on-call rotation within one hour, and any Tier 1 backup that fails twice consecutively is treated as a SEV2 incident under the Incident Response Policy.
- **4.8** Restores are tested at least quarterly for a sample of Tier 1 databases and storage, and at least annually for a full Tier 1 environment as part of the disaster recovery test. Each test records what was restored, the backup age, the elapsed time, the verification performed and any defects, and is retained as evidence.
- **4.9** Retention follows Section 2 and the Data Retention and Disposal Policy, and expired copies are deleted by lifecycle rules. When a customer's data is deleted on request it is removed from active systems immediately and expires from backups within the period stated to the customer, which does not exceed 90 days.
- **4.10** Backups may contain customer data{{#if has_sensitive_data}}, including {{data_types}} data,{{/if}} and are handled at the highest classification of the data they contain. Restoring production data into a non-production environment requires the Security Owner's approval and either masking or the same access controls as production.
- **4.11** Data held by vendors on behalf of {{company}}{{#if has_vendors}}, including data in {{vendors}},{{/if}} is covered by the vendor's own backup commitments, which are confirmed during vendor due diligence; where a vendor holds the only copy of business-critical data, Engineering exports that data at least quarterly.
- **4.12** Changes to backup schedules, retention, storage locations or tooling are made through the Change Management Policy, and any change that reduces protection requires the Security Owner's approval.

## 5. Procedures

- **5.1** **Onboarding a data store.** Before a new production data store goes live, the system owner adds it to the inventory with its tier, and Engineering configures the backup per Section 2 in infrastructure code in {{scm}}, enables job monitoring, performs a first restore into an isolated environment and records the result. The Security Owner confirms the location and encryption before customer data is stored.
- **5.2** **Daily monitoring.** The Engineering on-call reviews backup job status every business day{{#if has_logging_tool}} through the backup dashboard in {{logging_tool}}{{/if}}, investigates any failed, missed or unexpectedly small backup the same day, records the cause and fix in the ticketing system, and escalates repeated Tier 1 failures as an incident.
- **5.3** **Quarterly restore test.** Each quarter Engineering restores a backup of at least one Tier 1 database and one storage bucket, no more than one day old, into an isolated environment, verifies row counts, checksums or sample records against production, measures elapsed time against the RTO, deletes the copy and files the test record for the Security Owner's review.
- **5.4** **Annual full restore.** As part of the disaster recovery test under the Business Continuity and Disaster Recovery Policy, Engineering restores the full Tier 1 data set from backups into a rebuilt environment, runs the application test suite against it, and records the achieved recovery time and data age.
- **5.5** **Restore requests.** A restore request is raised as a ticket stating the data, point in time and reason. Engineering confirms scope with the requester, restores into an isolated location, validates the data and only then applies it to production with the requester's confirmation. Restores during a security incident follow the Incident Response Policy and preserve the compromised state as evidence first.
- **5.6** **Retention and disposal.** Lifecycle rules in the backup tooling delete expired copies automatically. Each quarter Engineering confirms that lifecycle rules match Section 2, that no copies older than their retention period remain, and that customer deletion requests received in the quarter have expired from backups within the committed period.
- **5.7** **Access review.** Each quarter the Security Owner reviews the people and roles with access to backup storage, restore operations and backup encryption keys, removes access that is no longer needed, and records the review.
- **5.8** **Vendor-held data.** During vendor onboarding and annual review the Security Owner records each critical vendor's backup and recovery commitments; where a vendor holds the only copy of business-critical data, Engineering schedules a quarterly export to {{cloud}} storage monitored under 5.2.
- **5.9** **Policy and inventory upkeep.** Whenever a system is added, retired or re-tiered, Engineering updates Section 2 and the system inventory within ten business days, and the Security Owner reviews the change.

## 6. Exceptions

Exceptions, including a data store that cannot be backed up at the stated frequency or a restore test that must be deferred, require written approval from the Security Owner, a compensating control or accepted risk in the risk register, and an expiry date no more than 12 months away, and are reviewed at each {{review_cadence}} policy review. No exception permits storing the only copy of customer data on a personnel endpoint or personal account.

## 7. Enforcement

Deploying a production data store without configured backups, disabling or deleting backups without approval, granting backup access outside the approved process, or falsifying restore-test evidence is a violation of this policy and may result in disciplinary action up to and including termination of employment or contract.

## 8. Review Cadence

Engineering and the Security Owner review this policy on a {{review_cadence}} basis and after any failed restore test, any incident involving data loss, any change to backup tooling{{#if has_backup_tool}} or to {{backup_tool}} configuration{{/if}}, and any change to customer commitments on data retention or deletion. Each review is approved by {{approver}} and recorded in Section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
