import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";

import LiveQueue from "./pages/LiveQueue";
import OfficerDashboard from "./pages/OfficerDashboard";
import { QueueProvider } from "./context/QueueContext";
import AdminDashboard from "./pages/AdminDashboard";
import TokenPage from "./pages/TokenPage";

function App() {
  return (
    <QueueProvider>
      <BrowserRouter>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link to="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
              Q
            </div>

            <div>
              <p className="font-bold">
                QueueLess India
              </p>

              <p className="text-xs text-slate-500">
                Public Service Platform
              </p>
            </div>

          </Link>

          <div className="flex items-center gap-5">

            <Link
              to="/services"
              className="text-sm font-semibold text-slate-600 hover:text-blue-700"
            >
              Find Service
            </Link>

            <button className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">
              Login
            </button>

          </div>

        </div>

      </header>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/services/:id"
          element={<ServiceDetails />}
        />
        

<Route
  path="/live-queue"
  element={<LiveQueue />}
/>
<Route
  path="/officer"
  element={<OfficerDashboard />}
/>
<Route
  path="/admin"
  element={<AdminDashboard />}
/>
<Route
  path="/token/:id"
  element={<TokenPage />}
/>

      </Routes>

    </BrowserRouter>
      </QueueProvider>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <ShieldCheck />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-blue-700">
            AI-Powered Public Services
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Skip the Queue.
            <span className="block text-blue-700">
              Serve Smarter.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Know what documents you need, where to go,
            whether the service is available and how long
            you may wait.
          </p>

          <Link
            to="/services"
            className="mt-8 inline-flex items-center rounded-xl bg-blue-700 px-7 py-3.5 font-semibold text-white hover:bg-blue-800"
          >
            Find a Government Service
          </Link>

        </div>

      </section>

    </div>
  );
}

export default App;