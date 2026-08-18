import {
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  ArrowRight,
  Ticket,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { services } from "../data/services";

function Token() {
  const { id } = useParams();

  const service = services.find((item) => item.id === id);

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Service not found</h1>

        <Link
          to="/services"
          className="mt-6 inline-block text-blue-700"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  const tokenNumber = "A-047";
  const peopleAhead = 8;
  const estimatedWait = 18;

  const tokenData = {
    tokenNumber,
    serviceId: service.id,
    serviceName: service.name,
    office: service.office,
    counter: null,
    peopleAhead,
    estimatedWait,
  };

  localStorage.setItem("queueLessToken", JSON.stringify(tokenData));

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* SUCCESS */}

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-green-600">
            Token Generated Successfully
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your place in the queue is reserved
          </h1>

        </div>

        {/* TOKEN CARD */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          <div className="bg-blue-700 px-8 py-6 text-center text-white">

            <div className="flex items-center justify-center gap-2">
              <Ticket className="h-5 w-5" />

              <span className="text-sm font-semibold">
                YOUR DIGITAL TOKEN
              </span>
            </div>

            <p className="mt-3 text-6xl font-black tracking-tight">
              {tokenNumber}
            </p>

            <p className="mt-2 text-blue-100">
              Birth Certificate Queue
            </p>

          </div>

          <div className="p-8">

            <div className="grid gap-4 md:grid-cols-2">

              <InfoCard
                icon={<Users />}
                label="People Ahead"
                value={peopleAhead}
              />

              <InfoCard
                icon={<Clock3 />}
                label="Estimated Wait"
                value={`${estimatedWait} min`}
              />

              <InfoCard
                icon={<MapPin />}
                label="Office"
                value={service.office}
              />

              <InfoCard
                icon={<Ticket />}
                label="Counter"
                value={
                  tokenData.counter
                    ? `Counter ${tokenData.counter}`
                    : "Assigned when called"
                }
              />

            </div>

            {/* STATUS */}

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

              <div className="flex items-start gap-3">

                <div className="mt-0.5">
                  <span className="block h-3 w-3 rounded-full bg-green-500" />
                </div>

                <div>

                  <p className="font-bold text-green-900">
                    Your token is active
                  </p>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    Please stay near the office. We will notify you
                    when your turn is approaching.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTION */}

            <Link
              to="/live-queue"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-semibold text-white transition hover:bg-blue-800"
            >
              Track Live Queue
              <ArrowRight className="h-5 w-5" />
            </Link>

          </div>

        </div>

        {/* TIP */}

        <p className="mt-6 text-center text-sm text-slate-500">
          💡 Keep your token number <strong>{tokenNumber}</strong> handy
          when you reach the office.
        </p>

      </div>

    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Token;
