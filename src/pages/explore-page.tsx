import { InfoPageShell } from '../components/layout/info-page-shell'

export function ExplorePage() {
  return (
    <InfoPageShell
      sections={[
        {
          title: 'What is StudioFlow',
          body: (
            <>
              <p>
                StudioFlow is a full-stack studio management platform built for appointment-based businesses such as tattoo
                studios, barber shops, salons, piercing studios, wellness clinics, nail studios, and solo professionals.
              </p>
              <p>
                The project is designed to show how one platform can manage daily studio operations in a clean and modern
                way. It combines internal team workflows with customer-facing booking experiences.
              </p>
            </>
          ),
        },
        {
          title: 'What this project includes',
          body: (
            <ul className="space-y-2 pl-5 marker:text-slate-400 list-disc">
              <li>a premium internal dashboard</li>
              <li>role-based login and access</li>
              <li>booking and calendar workflows</li>
              <li>client and staff management</li>
              <li>services and appointment handling</li>
              <li>payments and deposit tracking</li>
              <li>consent forms</li>
              <li>analytics</li>
              <li>notifications and reminders</li>
              <li>customer booking flow</li>
              <li>customer self-service rescheduling and cancellation</li>
              <li>multi-location support</li>
              <li>onboarding flow</li>
              <li>audit logs and activity history</li>
            </ul>
          ),
        },
        {
          title: 'Why this project was built',
          body: (
            <p>
              This project was built to demonstrate a complete product thinking approach, not just isolated screens or
              CRUD pages. It shows how a real service business platform can work across operations, scheduling, customer
              experience, and administrative control.
            </p>
          ),
        },
        {
          title: 'Technical direction',
          body: (
            <p>
              StudioFlow is built as a full-stack SaaS-style application using a modern frontend, backend APIs,
              authentication, role-based authorization, and structured business workflows.
            </p>
          ),
        },
      ]}
      title="Explore StudioFlow"
    />
  )
}
