import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/widgets/Layout';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage } from '@/pages/users';
import { SlotsPage } from '@/pages/slots';
import { BookingsPage } from '@/pages/bookings';
import { TutorsPage } from '@/pages/tutors';
import { SubjectsPage } from '@/pages/subjects';
import { LoginPage } from '@/pages/login';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/users"     element={<UsersPage />}     />
          <Route path="/slots"     element={<SlotsPage />}     />
          <Route path="/bookings"  element={<BookingsPage />}  />
          <Route path="/tutors"    element={<TutorsPage />}    />
          <Route path="/subjects"  element={<SubjectsPage />}  />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
