import {
  Hospital,
  Building2,
  FileText,
  Bot,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

function Home({ session }) {
  const normalizedRole = session?.role?.trim().toUpperCase();

  const sections = [
    {
      title: "HOSPITALS",
      description:
        "Find nearby hospitals, doctors and appointments",
      to: "/hospitals",
      icon: <Hospital className="h-6 w-6" />,
    },
    {
      title: "GOVERNMENT OFFICES",
      description:
        "Find government offices, officers and appointments",
      to: "/government-offices",
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: "DOCUMENTS & CERTIFICATES",
      description:
        "Find required documents, application process and processing time",
      to: "/documents",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "AI ASSISTANT",
      description:
        "Ask questions about hospitals, offices and documents",
      to: "/ai-assistant",
      icon: <Bot className="h-6 w-6" />,
    },
  ];

  // ==========================================
  // HOSPITAL LOGIN
  // ==========================================

  if (normalizedRole === "HOSPITAL") {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-6 py-12">

          <div className="rounded-3xl bg-blue-700 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider">
              Hospital Staff Portal
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Hospital Operations
            </h1>

            <p className="mt-2 text-blue-100">
              Manage patients, doctors, attendance and queues.
            </p>
          </div>

          <div className="mt-8">
            <Link
              to="/hospital-dashboard"
              className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">
                Hospital Dashboard
              </h2>

              <p className="mt-2 text-slate-600">
                Manage online and offline tokens, counters,
                doctors and queue operations.
              </p>
            </Link>
          </div>

        </section>
      </div>
    );
  }

  // ==========================================
  // GOVERNMENT OFFICE LOGIN
  // ==========================================

  if (normalizedRole === "GOVERNMENT OFFICE") {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-6 py-12">

          <div className="rounded-3xl bg-blue-700 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider">
              Government Office Portal
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Office Operations
            </h1>

            <p className="mt-2 text-blue-100">
              Manage citizens, officers, attendance and queues.
            </p>
          </div>

          <div className="mt-8">
            <Link
              to="/office-dashboard"
              className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">
                Government Office Dashboard
              </h2>

              <p className="mt-2 text-slate-600">
                Manage online and offline tokens, officers,
                counters and queue operations.
              </p>
            </Link>
          </div>

        </section>
      </div>
    );
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  if (normalizedRole === "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-6 py-12">

          <div className="rounded-3xl bg-slate-900 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider">
              Administrator Portal
            </p>

            <h1 className="mt-2 text-3xl font-black">
              QueueLess India Administration
            </h1>

            <p className="mt-2 text-slate-300">
              Manage hospitals, government offices, users,
              services and system operations.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <Link
              to="/admin"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">
                Admin Dashboard
              </h2>

              <p className="mt-2 text-slate-600">
                Monitor the complete QueueLess India system.
              </p>
            </Link>

            <Link
              to="/hospital-dashboard"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">
                Hospital Operations
              </h2>

              <p className="mt-2 text-slate-600">
                Manage hospital queue operations.
              </p>
            </Link>

            <Link
              to="/office-dashboard"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">
                Government Office Operations
              </h2>

              <p className="mt-2 text-slate-600">
                Manage government office queues.
              </p>
            </Link>

          </div>

        </section>
      </div>
    );
  }

  // ==========================================
  // NORMAL USER / PUBLIC HOME
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <ShieldCheck />
          </div>

          <h1 className="mt-5 text-center text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            QueueLess India
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-slate-600">
            Smart queue, availability and citizen service platform.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">

            {sections.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                      {section.icon}
                    </div>

                    <h2 className="mt-5 text-xl font-black text-slate-900">
                      {section.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>

                  </div>

                  <ArrowRight className="mt-2 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />

                </div>
              </Link>
            ))}

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;