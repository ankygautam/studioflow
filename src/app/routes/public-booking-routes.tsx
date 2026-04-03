import { Navigate, Route } from 'react-router-dom'
import { PUBLIC_BOOKING_DEMO_ROUTE } from '../../lib/demo-routes'
import { PublicBookingManagePage } from '../../pages/public-booking-manage-page'
import { PublicBookingPortalPage } from '../../pages/public-booking-portal-page'
import { PublicBookingPage } from '../../pages/public-booking-page'

export function renderPublicBookingRoutes() {
  return (
    <>
      <Route
        path="/book"
        element={<Navigate replace to={PUBLIC_BOOKING_DEMO_ROUTE} />}
      />
      <Route
        path="/book/:studioSlug"
        element={<PublicBookingPage />}
      />
      <Route
        path="/book/:studioSlug/:locationSlug"
        element={<PublicBookingPage />}
      />
      <Route
        path="/book/:studioSlug/manage"
        element={<PublicBookingManagePage />}
      />
      <Route
        path="/book/:studioSlug/portal"
        element={<PublicBookingPortalPage />}
      />
      <Route
        path="/book/:studioSlug/:locationSlug/manage"
        element={<PublicBookingManagePage />}
      />
      <Route
        path="/book/:studioSlug/:locationSlug/portal"
        element={<PublicBookingPortalPage />}
      />
    </>
  )
}
