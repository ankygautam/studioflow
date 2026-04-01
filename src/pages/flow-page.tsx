import { InfoPageShell } from '../components/layout/info-page-shell'

export function FlowPage() {
  return (
    <InfoPageShell
      sections={[
        {
          title: 'How to explore this project',
          body: (
            <p>
              The best way to understand StudioFlow is to first sign in as the studio owner. This lets you see the
              internal workspace where daily studio operations are managed.
            </p>
          ),
        },
        {
          title: 'Start by logging in',
          body: (
            <p>
              Use the studio owner account to enter the dashboard. Once inside, explore the main workspace and look
              through the calendar, appointments, and client sections.
            </p>
          ),
        },
        {
          title: 'Create a client',
          body: (
            <p>
              Go to the Clients section and create a new client record. Add simple customer details so the project has a
              client profile to work with.
            </p>
          ),
        },
        {
          title: 'Create an appointment',
          body: (
            <p>
              After creating a client, go to the appointment or calendar area and create a new booking. This helps show
              how a customer request moves into the internal studio scheduling workflow.
            </p>
          ),
        },
        {
          title: 'Review the booking flow',
          body: (
            <p>
              Once the appointment is created, look at how StudioFlow connects the booking with services, scheduling,
              customer details, and status updates.
            </p>
          ),
        },
        {
          title: 'Why this matters',
          body: (
            <>
              <p>This flow shows how the product handles the basic studio journey:</p>
              <ul className="space-y-2 pl-5 marker:text-slate-400 list-disc">
                <li>studio owner signs in</li>
                <li>client is created</li>
                <li>appointment is booked</li>
                <li>operations are managed from one place</li>
              </ul>
              <p>This is one of the strongest ways to understand the purpose of the project.</p>
            </>
          ),
        },
      ]}
      title="Try Customer Flows"
    />
  )
}
