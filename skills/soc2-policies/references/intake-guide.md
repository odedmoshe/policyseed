# Intake interview guide

Ask these in order, a few at a time. Each answer maps to one key in `intake.yaml`. Choice fields accept only the listed values, spelled exactly as shown (case-sensitive). "Required" fields must be filled before `policyseed build` will run.

## 1. Company

| Ask | Key | Type and allowed values |
|---|---|---|
| What is the company's legal or trading name? | `company` | Text, required, up to 120 characters |
| What is the product or service the policies cover? | `product` | Text, required, up to 120 characters |
| How many people work there? | `headcount` | One of: `1-10`, `11-50`, `51-200`, `201+` |
| Do people work remotely, in an office, or both? | `work_model` | One of: `Remote`, `Hybrid`, `Office` |
| What kind of product is it? | `app_type` | One of: `Web SaaS`, `API`, `Mobile`, `Multiple` |

## 2. Infrastructure

| Ask | Key | Type and allowed values |
|---|---|---|
| Where does production run? Pick every provider. | `cloud` | List, at least one of: `AWS`, `GCP`, `Azure`, `Vercel`, `Fly.io`, `Hetzner`, `Cloudflare`, `Other` |
| Where is the source code hosted? | `scm` | One of: `GitHub`, `GitLab`, `Bitbucket`, `Other` |
| Which CI/CD system deploys it? | `cicd` | Text, optional, up to 80 characters |
| Which tool takes backups, and how often? | `backup_tool`, `backup_cadence` | Text, optional, up to 80 characters each (for example `AWS Backup`, `Daily`) |
| Which tool collects logs and alerts? | `logging_tool` | Text, optional, up to 80 characters |

## 3. Identity and devices

| Ask | Key | Type and allowed values |
|---|---|---|
| Which identity provider do people sign in with? | `idp` | One of: `Google Workspace`, `Okta`, `Microsoft Entra`, `JumpCloud`, `None` |
| Is multi-factor authentication enforced for everyone today? | `mfa` | `true` or `false`. Answer `false` if any account can still sign in without it; the policies then require a dated rollout plan instead of claiming MFA is in place. |
| Which device management (MDM) tool, if any? | `mdm` | Text, optional, empty if none |
| Which password manager, if any? | `password_manager` | Text, optional, empty if none |

## 4. Data and vendors

| Ask | Key | Type and allowed values |
|---|---|---|
| Which sensitive data does the product handle? | `data_types` | List, zero or more of: `PII`, `PHI`, `Payment` |
| Which vendors should the policies name (for example Stripe, Datadog, Slack)? | `vendors` | List of text, optional, up to 10 names |

## 5. People and scope

| Ask | Key | Type and allowed values |
|---|---|---|
| Who is accountable for security? Name and title. | `security_owner` | Text, required, as "Name, Title" |
| Who approves the policies? Name and title. | `approver` | Text, required, as "Name, Title" |
| Where should incidents be reported? | `incident_contact` | Text, required, an email address or channel |
| Which Trust Services Criteria are in the audit scope? | `tsc_scope` | List, at least one of: `Security`, `Availability`, `Confidentiality` |
| How often will the policies be reviewed? | `review_cadence` | One of: `Annual`, `Semi-annual`, `Quarterly` |
| What date do these policies take effect? | `effective_date` | Date as `YYYY-MM-DD`; default to today |

If the user doesn't know their audit scope, `Security` alone is the common starting point; say that their auditor confirms the scope. If they don't know the review cadence, `Annual` is the usual choice for a first policy set.
