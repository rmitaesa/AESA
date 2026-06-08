# AESA Rate Limits

These limits should be enforced by the API gateway, reverse proxy, serverless
function, or backend service that receives the request. The current website is a
static Vite app, so IP-based limits cannot be enforced securely in browser code.

| Area | Limit | Key | Block response |
| --- | ---: | --- | --- |
| Public API | 60 requests/min | IP address | `429 Too Many Requests` |
| Contact form | 5 submissions/min | IP address | `429 Too Many Requests` |
| Login | 5 failed attempts/15 min | IP address and account | `429 Too Many Requests` |
| Upload endpoint | 10 uploads/min | Logged-in admin user | `429 Too Many Requests` |
| Admin API | 30 requests/min | Admin user | `429 Too Many Requests` |
| Expensive endpoints | 5-10 requests/min | User or IP address | `429 Too Many Requests` |
| Large request body | Block above configured size | Request body size | `413 Payload Too Large` or `429 Too Many Requests` if handled by rate-limit middleware |

## Implementation Notes

- Return a plain `429 Too Many Requests` for rate-limit blocks.
- Include `Retry-After` when the platform supports it.
- Apply stricter limits before expensive work starts, especially email sending,
  authentication checks, file processing, and third-party API calls.
- Use separate buckets for login failures so a single account cannot be brute
  forced from rotating IPs, and a single IP cannot attack many accounts.
- Treat upload limits as server-side controls. Client-side checks can improve the
  editor experience, but they are not security controls.
- Enforce request body size at the edge or server entry point before parsing the
  full body.

## Suggested Body Size Defaults

| Request type | Suggested maximum |
| --- | ---: |
| JSON API body | 1 MB |
| Contact form body | 64 KB |
| Image upload | 10 MB |
| Admin content update | 1 MB |

