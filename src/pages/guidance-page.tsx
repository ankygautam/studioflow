import { InfoPageShell } from '../components/layout/info-page-shell'

export function GuidancePage() {
  return (
    <InfoPageShell
      sections={[
        {
          title: 'Introduction',
          body: (
            <p>
              StudioFlow is a studio operations platform created for appointment-based businesses. It is built to show how
              scheduling, client records, payments, forms, notifications, and customer booking can work together in one
              full-stack product.
            </p>
          ),
        },
        {
          title: 'How to navigate the project',
          body: (
            <>
              <p>Start with the dashboard to understand the overall workspace.</p>
              <p>Then move to the calendar and appointments section to see the scheduling flow.</p>
              <p>After that, review clients, services, and payments.</p>
              <p>Then explore consent forms, notifications, analytics, and audit logs.</p>
              <p>Finally, review the public booking flow and the customer self-service flow.</p>
            </>
          ),
        },
        {
          title: 'Main sections',
          body: (
            <>
              <p>
                <span className="font-semibold text-slate-950">Dashboard</span>
                <br />
                This gives a quick overview of appointments, revenue, reminders, and activity.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Calendar and Appointments</span>
                <br />
                This is where the main scheduling flow is handled.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Clients</span>
                <br />
                This area stores customer records and history.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Services</span>
                <br />
                This section defines the services that can be booked.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Payments</span>
                <br />
                This handles deposits, payment records, and status tracking.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Consent Forms</span>
                <br />
                This tracks template-based form workflows and submission states.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Notifications</span>
                <br />
                This shows important in-app activity and reminder information.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Analytics</span>
                <br />
                This gives a summary of business activity and operational insights.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Audit Logs</span>
                <br />
                This tracks important actions and activity history.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Public Booking</span>
                <br />
                This shows the customer-facing booking experience.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Customer Self-Service</span>
                <br />
                This shows how a customer can manage, reschedule, or cancel a booking.
              </p>
            </>
          ),
        },
        {
          title: 'Roles in the system',
          body: (
            <>
              <p>
                <span className="font-semibold text-slate-950">Studio owner</span>
                <br />
                Has full access across studio operations, clients, bookings, payments, and configuration.
              </p>
              <p>
                <span className="font-semibold text-slate-950">Customer</span>
                <br />
                Uses the public booking and self-service flow instead of the internal dashboard.
              </p>
            </>
          ),
        },
        {
          title: 'Project purpose',
          body: (
            <p>
              This project was created to demonstrate a full-stack SaaS workflow with both internal and external product
              journeys. It is meant to show product structure, technical depth, and clear business use cases in one
              connected system.
            </p>
          ),
        },
      ]}
      title="StudioFlow Guidance"
    />
  )
}
