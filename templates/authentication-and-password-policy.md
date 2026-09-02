---
id: P04
slug: authentication-and-password-policy
title: Authentication and Password Policy
short: Sets the requirements for passwords, multi-factor authentication, sessions and secrets used by people and systems.
owner_role: Security Owner
order: 4
tsc:
- CC6.1
- CC6.6
---

## 1. Purpose

Stolen and guessed credentials remain the most common way into companies like {{company}}. This policy sets the rules for how people and systems prove who they are before they are given access: passwords, multi-factor authentication, single sign-on, sessions, recovery, and the credentials services use to talk to each other. It follows current guidance from standards bodies: long passphrases rather than complexity rules, breached-password checks rather than forced rotation, and multi-factor authentication that resists phishing.

## 2. Scope

This policy applies to all personnel of {{company}} and to every account, human or non-human, that authenticates to a company system, including:

- Workforce authentication{{#unless idp_none}} through {{idp}} and the applications federated to it{{/unless}}{{#if idp_none}} to each business application while a central identity provider is being adopted{{/if}}.
- Authentication to the consoles and APIs of {{cloud}}, {{scm}}, {{cicd}}, production databases and secrets managers.
- Local accounts on company laptops and phones{{#if has_mdm}} managed by {{mdm}}{{/if}}.
- Service accounts, API keys, tokens, certificates and SSH keys used by {{product}} and its supporting systems.
- The authentication features of {{product}} itself, which customers rely on to protect their own accounts.

## 3. Roles and Responsibilities

- **Executive Management** ({{approver}}) approves this policy and ensures that multi-factor authentication and password manager licences are funded for everyone, including contractors.
- **Security Owner** ({{security_owner}}) owns this policy, configures and monitors authentication settings in {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}each business application{{/if}}, tracks multi-factor coverage, approves account recovery, and responds to credential compromise.
- **Engineering** enforces these requirements in the identity services of {{cloud}}, {{scm}} and internal tools, manages non-human credentials, and builds the customer-facing authentication of {{product}} to this standard.
- **People Operations** ensures multi-factor enrolment and password manager setup are completed during onboarding before other access is granted, and keeps recovery contact details current.
- **All Personnel** choose strong, unique credentials, enrol in multi-factor authentication, use the password manager, protect their second factor, and report suspected compromise immediately.

## 4. Policy Statements

- **4.1** Every person authenticates with a unique identity attributable to them. Generic, shared or role-named interactive logins are prohibited except for break-glass credentials governed by the Access Control Policy.
- **4.2** {{#if mfa}}Multi-factor authentication is mandatory for every workforce account at {{company}}, without exception for seniority. Administrative accounts in {{#unless idp_none}}{{idp}}, {{/unless}}the identity services of {{cloud}} and {{scm}} use phishing-resistant methods such as FIDO2 security keys or passkeys; authenticator applications are acceptable elsewhere.{{/if}}{{#unless mfa}}Multi-factor authentication is mandatory for every administrative account, for all access to {{cloud}}, {{scm}} and customer data, and for every remote access path, using phishing-resistant methods such as FIDO2 security keys or passkeys for administrators. The Security Owner owns a dated plan to extend it to every workforce account and reports progress to Executive Management quarterly.{{/unless}} SMS and voice codes are permitted only where no other method is offered and are recorded as an exception.
- **4.3** {{#unless idp_none}}Applications that support single sign-on are integrated with {{idp}}, and personnel sign in through it rather than with application-local passwords, which are disabled where the application allows.{{/unless}}{{#if idp_none}}Until a central identity provider is adopted, each application account has its own unique password and multi-factor authentication where offered, and the Security Owner keeps a list of which applications support it.{{/if}}
- **4.4** Passwords chosen by people are at least 14 characters, with no maximum below 64 and no mandatory character-class rules. They are checked against known-breached password lists at creation and periodically and rejected if they appear. Passwords are not rotated on a fixed schedule; they are changed immediately when compromise is suspected, when they appear in a breach, or when a person who knew a shared secret leaves.
- **4.5** {{#if has_password_manager}}All work credentials are generated and stored in {{password_manager}}, provisioned for every person at onboarding.{{/if}}{{#unless has_password_manager}}All work credentials are generated and stored in the password manager approved by the Security Owner, provisioned for every person at onboarding.{{/unless}} Passwords are not stored in browsers, spreadsheets, notes, chat or email, and the password manager's master password is a strong, unique passphrase protected by multi-factor authentication.
- **4.6** Work passwords are never reused across systems or as personal passwords. Personnel never share passwords, one-time codes or security keys with anyone, including colleagues, support staff or people claiming to be from {{company}} leadership.
- **4.7** Sessions are bounded: workforce sessions in {{#unless idp_none}}{{idp}}{{/unless}}{{#if idp_none}}business applications{{/if}} expire after no more than 24 hours, privileged sessions in {{cloud}} after no more than 12 hours, and devices lock after 10 minutes of inactivity. Re-authentication is required for sensitive actions such as changing multi-factor settings or viewing secrets.
- **4.8** Non-human credentials such as API keys, service account keys, tokens and SSH keys have at least 128 bits of entropy, live only in the secrets manager or the platform's native secret store, are injected at runtime rather than committed to configuration, carry the narrowest permissions required, and are rotated at least annually and on suspected exposure. Short-lived federated credentials replace static ones wherever the platform supports it, and default or vendor-supplied credentials are changed before any system is connected to a network.
- **4.9** Authentication endpoints, including those of {{product}}, enforce rate limiting and lockout or progressive delay after repeated failures, log every failed attempt, and alert{{#if has_logging_tool}} through {{logging_tool}}{{/if}} on patterns that indicate credential stuffing or brute force.
- **4.10** Account recovery and multi-factor resets are performed only after identity has been verified through a channel other than the one being recovered, such as a video call with a known colleague or a code sent to a verified personal contact held by People Operations. Requests arriving by email or chat alone are never actioned.
- **4.11** {{product}} protects customer accounts to at least the same standard: customer passwords are stored with a slow adaptive hash such as Argon2id or bcrypt and a per-user salt, are never logged or transmitted in plain text, are checked against breached-password lists, and customers are offered multi-factor authentication{{#if is_api}}. API credentials issued to customers are random, revocable, shown once at creation and stored hashed{{/if}}{{#if is_mobile}}. Mobile clients keep tokens only in the platform's secure storage, never in plain files or logs{{/if}}.
- **4.12** Credentials travel only over encrypted channels, never appear in URLs, log lines, error messages or crash reports, and are masked in any interface that displays them.

## 5. Procedures

- **5.1** Onboarding enrolment. On the first working day, before any other access is granted, the new hire enrols in {{#if has_password_manager}}{{password_manager}}{{/if}}{{#unless has_password_manager}}the approved password manager{{/unless}} and registers at least two multi-factor methods{{#unless idp_none}} in {{idp}}{{/unless}}, one of which is a security key or passkey for anyone with an administrative or production role. People Operations records completion and the Security Owner verifies it before approving the standard access bundle.
- **5.2** Monthly coverage check. The Security Owner exports multi-factor enrolment status for every account from {{#unless idp_none}}{{idp}}, {{/unless}}the identity services of {{cloud}} and {{scm}}, opens a ticket for any account without a compliant method, and suspends accounts still non-compliant after five business days. The export is retained as evidence.
- **5.3** Breached credential response. When {{#unless idp_none}}{{idp}}, {{/unless}}the password manager or a threat intelligence source reports a work credential in a breach, the Security Owner forces a reset within one business day, revokes sessions, checks authentication logs for use since the breach date, and records the event.
- **5.4** Account recovery and lost factors. A person who has lost a password or second factor contacts {{incident_contact}}. The Security Owner verifies identity by video call or through the personal contact details held by People Operations, removes the lost factor, revokes sessions, issues a bypass valid for no more than one hour, confirms a new factor is enrolled before it expires, and reviews recent sign-in activity for anything suspicious. Every recovery is logged with the verification method.
- **5.5** Non-human credential rotation. Engineering maintains the service account inventory from the Access Control Policy with a rotation date for each credential. Rotation happens at least annually, when a person with knowledge of the credential leaves, and on suspected exposure, and is performed through the secrets manager so that no person needs to view the new value.
- **5.6** Secret exposure. If a credential is committed to {{scm}}, pasted into chat or otherwise exposed, the finder reports to {{incident_contact}} immediately. Engineering revokes and rotates it within four hours and reviews logs for use of the exposed value; the Security Owner records an incident. Secret scanning alerts in {{scm}} are triaged within one business day.
- **5.7** New application onboarding. Before an application is approved under the Acceptable Use Policy, the Security Owner confirms whether it supports single sign-on and multi-factor authentication{{#unless idp_none}}, integrates it with {{idp}} where possible{{/unless}}, and records any application that cannot meet this policy in the exception register with its compensating control.
- **5.8** Customer authentication review. At least annually, and before any change to login, password reset or session handling in {{product}}, Engineering reviews the implementation against 4.9, 4.11 and 4.12, records the review, and includes authentication flows in the security testing described in the Secure Software Development Policy.

## 6. Exceptions

Exceptions, for example a legacy application that cannot enforce multi-factor authentication or a device that cannot support a security key, are approved in writing by the Security Owner, recorded in the exception register with compensating controls and an expiry date no later than twelve months out, and reviewed at each {{review_cadence_lc}} review. No exception permits sharing credentials, disabling multi-factor authentication on an administrative account, or storing secrets in source code.

## 7. Enforcement

Accounts that do not meet this policy are suspended until they do. Personnel who share credentials, disable their own multi-factor authentication, store secrets outside approved systems, or approve authentication prompts they did not initiate are subject to the disciplinary process in the Acceptable Use Policy, up to and including termination. Engineering leads are accountable for non-human credentials in their systems found to be over-privileged, unrotated or exposed.

## 8. Review Cadence

The Security Owner reviews this policy at the {{review_cadence_lc}} policy review, after any incident involving compromised credentials, and whenever {{#unless idp_none}}{{idp}} or {{/unless}}the identity services of {{cloud}} introduce authentication capabilities that would strengthen these controls. Revisions are approved by {{approver}} and recorded in section 9.

## 9. Revision History

| Version | Date | Description | Approved by |
|---|---|---|---|
| {{policy_version}} | {{effective_date}} | Initial release | {{approver}} |
