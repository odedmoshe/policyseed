---
id: P09
slug: change-management-policy
title: Change Management Policy
short: Requires that every change to production code, infrastructure and security-relevant configuration is proposed, reviewed, tested, approved and deployed through a controlled and traceable process.
owner_role: Engineering Lead
order: 9
tsc:
- CC8.1
- CC6.8
- CC7.1
- CC3.4
---

## 1. Purpose

Most outages and many security weaknesses are introduced by changes: a rushed hotfix, an untested migration, a firewall rule opened in a console and forgotten. This policy defines how {{company}} proposes, reviews, tests, approves, deploys and records changes to {{product}} and its supporting infrastructure, so that every production change traces to a reviewed request, an independent approval, passing tests and a deployment record. It is deliberately lightweight, because a process bypassed under pressure provides no assurance, and it supports the SOC 2 criteria for authorizing, testing and implementing changes and for preventing unauthorized software in production.

## 2. Scope

This policy applies to all changes to production systems: application code for {{product}}, infrastructure-as-code and cloud configuration on {{cloud}}, database schemas and migrations, container and base images, {{cicd}} configuration, security-relevant settings in third-party services{{#unless idp_none}} including {{idp}}{{/unless}}, {{scm}} organization and repository settings, DNS, certificates, and monitoring and alerting rules. It binds all employees and contractors who author, review, approve or deploy changes and any vendor granted write access to an in-scope system. Work confined to a local development environment is out of scope until it is proposed for production.

## 3. Roles and Responsibilities

- **Executive Management** approves this policy, ensures engineering capacity allows for review and testing, and receives the monthly change report including emergency changes and bypasses.
- **Security Owner ({{security_owner}})** defines which changes are security-relevant and reviews them, verifies {{scm}} branch protection, samples changes monthly and approves exceptions.
- **Engineering** authors changes with adequate description and tests, performs peer review, maintains {{cicd}} and its required checks, deploys through the pipeline, monitors after deployment and executes rollbacks.
- **People Operations** ensures every engineer receives this policy and change process training at onboarding and records acknowledgement.
- **All Personnel** request changes to systems they do not administer through the ticketing process, never ask an engineer to bypass review, and report suspected unauthorized changes to {{incident_contact}}.

## 4. Policy Statements

- **4.1** All production code and infrastructure-as-code lives in {{scm}}, and production reflects only what has been merged to the protected default or release branch. Editing code or configuration directly on servers, in containers or in cloud consoles is prohibited except under the emergency procedure in 5.6, and any such change is reconciled into {{scm}} afterwards.
- **4.2** Every change is made through a pull or merge request in {{scm}}. Branch protection on default and release branches requires at least one approving review from someone other than the author, requires all status checks from {{cicd}} to pass, dismisses stale approvals on new commits, blocks force pushes and branch deletion, and applies to administrators without bypass.
- **4.3** Changes are classified as standard (low-risk, repeatable and pre-approved through the standard change catalogue), normal (the full process in Section 5) or emergency (an active incident or imminent risk, handled under 5.6 with retrospective review).
- **4.4** Every change is tested before deployment: every pull request runs the automated test suite, linting, dependency and static analysis scanning and build verification in {{cicd}}, new functionality includes automated tests, and failing checks block the merge.
- **4.5** Changes affecting authentication, authorization, data access, cryptography, cloud IAM, network exposure or logging are security-relevant and additionally require approval from the Security Owner or a designated security reviewer, routed automatically through code ownership rules in {{scm}}.
- **4.6** Production deployments are performed only by {{cicd}} using dedicated service identities scoped to the target environment. Personal credentials never deploy to production, and the deployment record captures who triggered it, the commit deployed and the outcome.
- **4.7** Infrastructure on {{cloud}} is defined as code in {{scm}} and changed through the same review and pipeline as application code, with the plan or diff attached to the pull request so reviewers see exactly which resources will be created, modified or destroyed.
- **4.8** Database schema and data migrations are backward compatible with the running application version wherever possible, are tested in staging against representative data, and are preceded by a verified backup or snapshot when destructive or irreversible.
- **4.9** The author of a change never approves it, and self-approval is disabled in {{scm}}. Where team size leaves no qualified independent reviewer, the Security Owner or a technically competent member of Executive Management reviews; the requirement is never waived.
- **4.10** Every change has a documented rollback path: revert the merge, redeploy the previous artifact or disable a feature flag. For high-risk changes the rollback is tested in staging first, and the deploying engineer watches error rates and key metrics for at least 30 minutes after deployment{{#if has_logging_tool}} in {{logging_tool}}{{/if}} and rolls back if the service degrades.
- **4.11** Development, staging and production are logically separated with distinct credentials, and changes are promoted through staging before production. Production customer data is not copied to lower environments except in anonymized or masked form approved by the Security Owner.
- **4.12** Changes with potential customer impact are communicated internally before deployment{{#if scope_availability}} and, where downtime or changed behavior is expected, are scheduled in an announced maintenance window and communicated to customers at least 48 hours in advance through the status page or release notes, consistent with {{company}}'s availability commitments{{/if}}. Release notes are published for customer-visible changes.
- **4.13** Security-relevant configuration changes in systems not managed as code, such as {{scm}} organization settings{{#unless idp_none}}, {{idp}} policies{{/unless}}, vendor administration consoles and DNS, are requested by ticket, approved by the Security Owner and recorded with the before and after state.
- **4.14** The pull request, its review, the check results from {{cicd}} and the deployment record together form the change record and are retained for at least 12 months as audit evidence. Vendors and contractors follow the same process and hold no standing write access to production.

## 5. Procedures

- **5.1** Proposal. The author opens a pull request in {{scm}} using the template, which requires a description, linked issue, risk classification, test evidence, rollback plan, expected customer impact and whether the change is security-relevant. Incomplete templates are returned to the author.
- **5.2** Review. A reviewer who did not author the change reads the full diff, confirms tests cover it, checks for secrets and unsafe patterns, and requests changes or approves. Security-relevant changes route to the Security Owner or designated security reviewer through code ownership rules and cannot merge without that approval.
- **5.3** Automated checks. Every pull request must pass unit and integration tests, linting, dependency vulnerability scanning, static application security testing, secret scanning, infrastructure-as-code validation and a successful build in {{cicd}}. Suppressing a failing check requires written justification in the pull request and Security Owner approval.
- **5.4** Merge, deployment and verification. After approval and passing checks the change is merged to the protected branch; {{cicd}} deploys to staging, runs smoke tests and then deploys to production, automatically or on approval of a named engineer per repository configuration, tagging each deployment with the commit identifier. The deploying engineer confirms health checks, watches error rates, latency and key metrics for at least 30 minutes, records completion, and rolls back immediately if rollback criteria are met, opening an incident if customers were affected.
- **5.5** Infrastructure changes. The author attaches the plan output; the reviewer confirms the resources to be changed match the description and that no unintended destruction is planned. The pipeline applies the change; monthly drift detection finds console changes, which are reconciled into code or reverted.
- **5.6** Emergency changes. The Engineering lead or Security Owner declares an emergency when an active incident or imminent risk cannot wait for the normal process. A second engineer is notified before the change, approval given verbally or in chat is recorded in the incident ticket, and the change is labeled as an emergency in {{scm}}. Within two business days it receives a full retrospective review and any follow-up fixes, and it appears in the monthly change report.
- **5.7** Standard change catalogue. Engineering maintains the list of pre-approved standard changes, such as automated dependency updates, content updates and scaling within approved limits, each with its conditions and automated checks. The Security Owner reviews the catalogue semi-annually and removes entries whose risk has changed.
- **5.8** Monthly change review. The Security Owner samples at least ten percent of production changes and no fewer than five, verifies independent approval, passing checks and a deployment record for each, confirms {{scm}} branch protection settings remain as required, investigates any bypass or emergency change, and summarizes the results to Executive Management.
- **5.9** Deployment access review. Identities used by {{cicd}} to deploy to production are inventoried and reviewed quarterly under the Access Control Policy, confirming each is scoped to one environment, has no interactive login and has been rotated per the Encryption and Key Management Policy.

## 6. Exceptions

Deviations such as a repository that cannot yet enforce branch protection or a vendor-managed system that permits changes only through its console require a written exception request describing the system, the risk, the compensating controls and the remediation date. The Security Owner approves or rejects it; exceptions affecting production customer data also require Executive Management approval. Approved exceptions are recorded in the exception register, last no more than 12 months and are reviewed at each policy review.

## 7. Enforcement

Bypassing review, disabling branch protection, deploying with personal credentials or making undocumented production changes violates this policy and is handled under the Human Resources Security Policy, which may result in disciplinary action up to and including termination of employment; contractors and vendors are subject to contract termination. Suspected unauthorized changes are reported to {{incident_contact}} and investigated under the Incident Response Policy.

## 8. Review Cadence

The Security Owner reviews this policy on the {{review_cadence}} review cycle and after any significant change to {{company}}'s source control, pipeline tooling or cloud platforms, and after any incident caused by a change. Changes are approved by {{approver}} and recorded in the revision history.

## 9. Revision History

| Version | Date | Description | Approved by |
| --- | --- | --- | --- |
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
