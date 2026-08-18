import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

const samplePrompts = [
  "How do I get a token for a hospital?",
  "What documents do I need for a birth certificate?",
  "Which service is best for driving licence?",
  "Can I check queue waiting time?",
];

function AiAssistant() {
  const [question, setQuestion] = useState(samplePrompts[0]);
  const [answer, setAnswer] = useState("");
  const [services, setServices] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesResponse, hospitalsResponse, officesResponse] =
          await Promise.all([
            fetch(`${API_URL}/services`),
            fetch(`${API_URL}/hospitals`),
            fetch(`${API_URL}/government-offices`),
          ]);

        const servicesData = servicesResponse.ok
          ? await servicesResponse.json()
          : { services: [] };
        const hospitalsData = hospitalsResponse.ok
          ? await hospitalsResponse.json()
          : { hospitals: [] };
        const officesData = officesResponse.ok
          ? await officesResponse.json()
          : { offices: [] };

        setServices(servicesData.services || []);
        setHospitals(hospitalsData.hospitals || []);
        setOffices(officesData.offices || []);
      } catch (error) {
        console.error("AI assistant data load failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalServices = services.length;
    const totalHospitals = hospitals.length;
    const totalOffices = offices.length;
    const pendingQueue = hospitals.reduce(
      (sum, hospital) => sum + (hospital.waitingCount || 0),
      0
    ) + offices.reduce(
      (sum, office) => sum + (office.waitingCount || 0),
      0
    );

    return {
      totalServices,
      totalHospitals,
      totalOffices,
      pendingQueue,
    };
  }, [services, hospitals, offices]);

  useEffect(() => {
    setAnswer(getAssistantReply(question, summary, services));
  }, [question, summary, services]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setAnswer(getAssistantReply(question, summary, services));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          AI Assistant
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          QueueLess AI Assistant
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Ask about services, queues, hospitals, offices, or documents
              </label>
              <textarea
                rows={4}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="For example: How do I get a queue token for a hospital?"
              />
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuestion(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Ask assistant
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Assistant reply
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {loading ? "Loading live service data..." : answer}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Service overview
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Services available</span>
                  <strong>{summary.totalServices}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hospitals</span>
                  <strong>{summary.totalHospitals}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Government offices</span>
                  <strong>{summary.totalOffices}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>People in queue</span>
                  <strong>{summary.pendingQueue}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Quick help
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Visit the Find Service page for document and office search.</li>
                <li>• Use hospitals and government offices pages for faster queue guidance.</li>
                <li>• For appointment issues, check service details before booking.</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <Link to="/" className="inline-block font-semibold text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function getAssistantReply(question, summary, services) {
  const text = (question || "").toLowerCase();

  if (!text.trim()) {
    return "Please ask a question about hospitals, offices, queues, or documents.";
  }

  if (text.includes("token") || text.includes("queue") || text.includes("waiting")) {
    return `QueueLess India helps citizens book and track tokens. There are currently ${summary.pendingQueue} people waiting across hospitals and offices. You can start by visiting the hospital or government office pages, select a service, and use the token flow to get a live queue number.`;
  }

  if (text.includes("hospital") || text.includes("doctor")) {
    return `The platform currently lists ${summary.totalHospitals} hospitals and ${services.length} service records. For hospital care, choose a hospital, pick a doctor, and create a token to track queue progress.`;
  }

  if (text.includes("document") || text.includes("certificate") || text.includes("birth") || text.includes("driving")) {
    const documentServices = services.filter((service) =>
      /certificate|document|licence|license|birth|income|aadhaar|property/i.test(
        service.name || ""
      )
    );

    if (documentServices.length > 0) {
      return `You can find document-related services such as ${documentServices
        .slice(0, 3)
        .map((service) => service.name)
        .join(", ")}. Open the Documents section to view required papers, application steps, and service timelines.`;
    }

    return "Visit the Documents section to explore certificate and document services, required documents, and the application process.";
  }

  if (text.includes("office") || text.includes("government")) {
    return `Government services are available through the office directory. Select the relevant office and officer, then create a token to know your waiting time and sequence.`;
  }

  if (text.includes("service") || text.includes("help")) {
    return `QueueLess India offers ${summary.totalServices} service listings including hospitals, offices, and document services. Use the services page to find the right option based on your need and then continue to the token flow.`;
  }

  return "QueueLess India can help with hospital queues, office tokens, document services, and general service guidance. Try asking about a hospital, government office, queue waiting time, or required document.";
}

export default AiAssistant;
