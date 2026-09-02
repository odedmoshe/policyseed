---
id: P14
slug: business-continuity-and-disaster-recovery-policy
title: Business Continuity and Disaster Recovery Policy
short: Sets recovery objectives by system tier, defines how a disaster is declared and recovered from, and requires the plan to be tested and maintained.
owner_role: Engineering Lead
order: 14
tsc:
- CC7.5
- CC9.1
- A1.1
- A1.2
- A1.3
---

## 1. Purpose

This policy ensures that {{company}} can keep delivering {{product}}, or restore it within defined targets, when a disruption occurs. It sets recovery objectives by system tier, assigns authority to declare a disaster, defines how recovery is executed and communicated, and requires the plan to be exercised so that targets are evidenced rather than assumed. {{#if scope_availability}}Because the Availability criteria are within the scope of {{company}}'s SOC 2 examination, the objectives in this policy are commitments that must be supported by test results and monitoring evidence.{{/if}}{{#unless scope_availability}}Although the Availability criteria are not currently within the scope of {{company}}'s SOC 2 examination, {{company}} maintains and tests this plan to meet customer commitments and to limit the impact of security incidents on service delivery.{{/unless}}

## 2. Scope

This policy applies to all systems, data, personnel, facilities and vendors that {{company}} relies on to deliver {{product}} and operate the business, including production infrastructure in {{cloud}}, code and pipelines in {{scm}} and {{cicd}}, identity services{{#unless idp_none}} in {{idp}}{{/unless}}, corporate SaaS and the people who operate them. It covers disruptions of any cause: infrastructure outages, security incidents, data corruption, loss of a key vendor, and loss of a workplace.

Systems are classified into three tiers. The tier sets the recovery time objective (RTO, the maximum time to restore service) and the recovery point objective (RPO, the maximum data loss measured in time). Engineering maintains the authoritative tier list in the system inventory.

| Tier | Description | Typical systems | RTO | RPO |
| --- | --- | --- | --- | --- |
| Tier 1 - Critical | Loss stops customers using {{product}} or exposes customer data | Production application and API, primary database, authentication and sessions, DNS and edge, secrets management, core accounts in {{cloud}} | 4 hours | 1 hour |
| Tier 2 - Important | Needed to operate, support and change {{product}} within one business day | Repositories in {{scm}}, {{cicd}} pipelines, {{#if has_logging_tool}}{{logging_tool}} monitoring, {{/if}}alerting and on-call tooling, customer support tooling, {{#unless idp_none}}{{idp}} administration, {{/unless}}billing | 24 hours | 24 hours |
| Tier 3 - Deferrable | Can be unavailable for several days without customer impact | Internal wikis, analytics and reporting, development and staging environments | 5 business days | 7 days |

## 3. Roles and Responsibilities

- **Executive Management** approves this policy and the recovery objectives, may declare a disaster and approve emergency spend, alternative sites or vendors, decides on customer and public communication, and reviews the results of every test.
- **Security Owner ({{security_owner}})** owns the business impact analysis, ensures security controls remain in force during recovery, coordinates with the Incident Response Policy when the disruption is security-related, and keeps the plan, contact roster and vendor dependencies current.
- **Engineering** owns the recovery procedures for every Tier 1 and Tier 2 system, maintains the infrastructure code and backups that make recovery possible, staffs the recovery team, executes and documents tests, and reports achieved recovery times against the objectives.
- **People Operations** maintains the personnel contact roster, accounts for the safety and availability of personnel during a disruption, arranges cover for unavailable staff, and communicates working arrangements.
- **All Personnel** know how to reach the alternative communication channel, keep their contact details current, and follow instructions from the recovery lead during a disruption.

## 4. Policy Statements

- **4.1** {{company}} performs a business impact analysis at least annually, identifying each system that supports {{product}} and the business, the impact of its loss over time, its dependencies and its tier. Tier assignments and RTO and RPO targets are approved by Executive Management.
- **4.2** Every Tier 1 and Tier 2 system has a written recovery procedure that a competent engineer who did not build the system can follow, stored in {{scm}} alongside the infrastructure code and in an offline copy for use when {{scm}} is unavailable.
- **4.3** Tier 1 systems are designed to survive the loss of a single availability zone or data centre without exceeding the RTO, using the redundancy features of {{cloud}}, and infrastructure is defined as code so that environments can be rebuilt in an alternative region or account.
- **4.4** Data required to meet each tier's RPO is backed up under the Backup and Recovery Policy, with copies in a separate account or region so that one administrative error or compromise cannot destroy both primary and backup.
- **4.5** A disaster may be declared by Executive Management, the Security Owner or the Engineering on-call lead when a Tier 1 system has been unavailable or degraded for one hour, the RTO is at risk, or the primary environment cannot be trusted. The declaration records the time, reason and recovery lead.
- **4.6** During a declared disaster the recovery lead may provision infrastructure, engage vendor support, restore from backups and incur emergency spend within limits set by Executive Management without standard change approval; every action is logged and reviewed afterwards.
- **4.7** Security controls, including access control, encryption and logging, remain in force during recovery. Emergency access granted to recover a system is time-limited, logged and revoked when recovery is complete.
- **4.8** {{company}} maintains an alternative communication channel that does not depend on its primary systems, and a contact roster covering personnel, Executive Management, support at {{cloud}}, {{#if has_vendors}}{{vendors}}, {{/if}}outside counsel and insurers; personnel learn how to reach the channel during onboarding.
- **4.9** {{#if remote_or_hybrid}}Because {{company}} operates a {{work_model}} work model, loss of any single workplace does not interrupt operations; personnel work from an alternative location with their managed device. {{/if}}{{#unless remote_or_hybrid}}If the {{company}} workplace becomes unavailable, personnel work remotely using their managed device, and all production access must work without the office network. {{/unless}}No production capability may depend on physical access to an office.
- **4.10** Tier 1 recovery is tested at least annually by restoring a production-equivalent environment from infrastructure code and backups, and the whole plan is exercised at least annually through a tabletop with Executive Management; achieved recovery times are recorded against the objectives.
- **4.11** Critical vendors{{#if has_vendors}}, including {{vendors}} where they support Tier 1 or Tier 2 systems,{{/if}} are assessed for continuity risk under the Vendor and Third-Party Risk Management Policy, and every Tier 1 dependency has a documented exit or fallback plan.
- **4.12** Customers are kept informed during any disruption affecting {{product}} through the status page or the channel committed in their contract, with updates at least hourly during a Tier 1 disruption.
- **4.13** After every declared disaster and every test, Engineering completes a review within ten business days recording the timeline, achieved RTO and RPO, deviations from the plan and corrective actions with owners and due dates; unresolved gaps affecting Tier 1 objectives are entered in the risk register.
- **4.14** Personnel with a role in recovery are trained on their responsibilities at least annually, and no Tier 1 recovery procedure depends on a single named individual.

## 5. Procedures

- **5.1** **Business impact analysis.** Each year, and whenever a new customer-facing system is added, the Security Owner and Engineering review the system inventory, confirm each system's tier, document dependencies on the services of {{cloud}}{{#if has_vendors}} and on {{vendors}}{{/if}}, and estimate the impact of an outage at 1, 4 and 24 hours and 5 days, and Executive Management approves the resulting tier list.
- **5.2** **Plan maintenance.** Engineering reviews each Tier 1 and Tier 2 recovery procedure at least annually and after any material architecture change, confirming that the infrastructure code in {{scm}} still builds the environment and that restore steps match the backup tooling{{#if has_backup_tool}}, currently {{backup_tool}}{{/if}}. The Security Owner refreshes the contact roster quarterly.
- **5.3** **Declaration and mobilisation.** When the criteria in 4.5 are met, the declaring person records the declaration, names the recovery lead, opens the alternative channel and notifies Executive Management. The recovery lead assembles the team, assigns a scribe and confirms the affected systems, tiers and start time; security-related disruptions run on one timeline shared with the Incident Commander.
- **5.4** **Recovery execution.** The recovery team follows the written procedure for each affected system in tier order: identity and secrets first, then data from the most recent backup meeting the RPO, then application infrastructure from {{scm}} through {{cicd}} (or a manual pipeline if {{cicd}} is unavailable), then edge and DNS. The scribe records each step, its timing and any deviation.
- **5.5** **Verification.** Before a recovered system is returned to customers, the team verifies data integrity against expected record counts or checksums, runs the automated and smoke tests, confirms that logging{{#if has_logging_tool}} to {{logging_tool}}{{/if}} and alerting work, and confirms with the Security Owner that access controls and encryption are in force.
- **5.6** **Communication.** The recovery lead posts an initial customer notice within 30 minutes of declaration and updates at least hourly for Tier 1 disruptions, using wording approved by Executive Management. People Operations confirms personnel safety and communicates working arrangements. Customers with contractual notification terms are notified within those terms.
- **5.7** **Return to normal.** When objectives are met and verification is complete, the recovery lead declares the end of the disruption, confirms that temporary infrastructure, emergency credentials and firewall exceptions are removed, ensures backups are running against the recovered environment, and schedules the review required by 4.13.
- **5.8** **Annual technical test.** Engineering restores a Tier 1 environment from infrastructure code and backups into an isolated account or region, measures elapsed time and the age of restored data, and records whether RTO and RPO were achieved, with the runbook used, timestamps, verification evidence and defects found.
- **5.9** **Annual tabletop.** The Security Owner runs a scenario exercise with Executive Management, Engineering and People Operations, using scenarios such as loss of a hosting region at {{cloud}}, ransomware affecting the primary database, or loss of a critical vendor{{#if has_vendors}} such as one of {{vendors}}{{/if}}, and records decisions, gaps and actions.
- **5.10** **Personnel continuity.** People Operations maintains at least one trained alternate for each role named in a recovery procedure, and reassigns responsibilities within five business days when a person in a recovery role leaves or is on extended absence.

## 6. Exceptions

Exceptions, including a system that cannot meet its tier's objectives, require written approval from Executive Management on the Security Owner's recommendation, a compensating measure or accepted risk in the risk register, and an expiry date no more than 12 months away, and are reviewed at each {{review_cadence_lc}} policy review. Customer commitments exceeding the Section 2 objectives require Engineering confirmation before signature.

## 7. Enforcement

Failing to maintain recovery procedures, backups or infrastructure code for a system in one's care, bypassing security controls during recovery, or failing to take part in required tests is a violation of this policy and may result in disciplinary action up to and including termination of employment or contract. Vendors whose continuity commitments are not met are subject to the remedies in their contract.

## 8. Review Cadence

Engineering and the Security Owner review this policy on a {{review_cadence_lc}} basis and after every declared disaster, any test in which a Tier 1 objective was missed, significant changes to the architecture of {{product}} or to {{company}}'s footprint on {{cloud}}, and changes to customer commitments. Each review is approved by {{approver}} and recorded in Section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
