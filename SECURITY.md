# Security Policy

## Supported versions

This is a static, content-focused website with no user accounts, no database and no server-side secrets. Security
fixes are made on the latest version on the `main` branch.

| Version | Supported |
| --- | --- |
| `main` (latest) | ✅ |
| anything older | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**
(private vulnerability reporting). If that option is not available, open a normal issue that says only "I would like
to report a security issue privately" with **no details**, and the maintainer will arrange a private channel.

Please include:

- what you found and where (a URL, file or dependency),
- the steps to reproduce it,
- what you think the impact is.

## What to expect

- We aim to acknowledge a report within **7 days**.
- We will keep you informed while we investigate and fix it, and we will credit you in the changelog if you wish.
- Please give us reasonable time to fix the problem before disclosing it publicly.

## Scope

In scope: the site's code, its build and deployment configuration, and anything that could harm a visitor
(for example cross-site scripting, unsafe third-party content, or a dependency with a known exploit that is
reachable here).

Out of scope: denial-of-service by sheer traffic, findings that need a compromised device, social engineering,
and vulnerabilities in third-party services we only link to.

## Good to know

The site collects no personal data. The only thing it stores is your language and calm-mode preference, in your
browser's local storage. There are no cookies, ads or analytics.
