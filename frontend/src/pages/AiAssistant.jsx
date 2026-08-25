import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, HelpCircle, Zap } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

const samplePrompts = [
  "How do I get a token for a hospital?",
  "What documents do I need for a birth certificate?",
  "Show me government services available",
  "How do I check my queue waiting time?",
  "Can I book multiple tokens?",
  "How long do services take?",
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
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
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
    return "Please ask a question about hospitals, offices, queues, documents, or services.\n\nExamples:\n• How do I get a hospital token?\n• What documents are needed for a certificate?\n• Show me available services";
  }

  // Hospital & Doctors
  if (text.includes("hospital") || text.includes("doctor") || text.includes("disease")) {
    return `🏥 HOSPITAL SERVICES\n\nWe have ${summary.totalHospitals} hospitals with expert doctors available.\n\n📋 HOW TO BOOK A TOKEN:\n1. Go to "Hospitals" page\n2. Search or select your preferred hospital\n3. Choose your health problem/disease\n4. Select an available doctor\n5. Check waiting time and get a token\n6. Track your position in the live queue\n\n⏱️ Current queue: ${summary.pendingQueue} people waiting\n\n👉 Next Step: Visit the Hospitals page to get started`;
  }

  // Tokens & Queue
  if (text.includes("token") || text.includes("queue") || text.includes("waiting")) {
    return `📌 QUEUE & TOKEN SYSTEM\n\nEvery service uses a token-based queue system for fair ordering.\n\n🎯 BENEFITS:\n• No long lines - track your position online\n• Real-time queue updates every 30 seconds\n• Know exactly when it's your turn\n• Counter number displayed when called\n\n📊 CURRENT STATUS:\n• Total people waiting: ${summary.pendingQueue}\n• Hospitals: ${summary.totalHospitals}\n• Government offices: ${summary.totalOffices}\n\n💡 TIP: Arrive 5 minutes before your turn to be ready when called\n\n👉 Start at: Hospitals or Government Offices page`;
  }

  // Documents & Certificates
  if (text.includes("document") || text.includes("certificate") || text.includes("birth") || text.includes("income") || text.includes("aadhaar")) {
    const documentServices = services.filter((service) =>
      /certificate|document|licence|license|birth|income|aadhaar|property|caste|community|residence|nativity/i.test(
        service.name || ""
      )
    );

    let response = `📄 DOCUMENT & CERTIFICATE SERVICES\n\n`;
    
    if (documentServices.length > 0) {
      response += `Available documents:\n`;
      documentServices.slice(0, 5).forEach((service) => {
        response += `• ${service.name} - ${service.department}\n`;
      });
      response += `\n${documentServices.length} total services available\n`;
    }

    response += `\n📋 COMMON REQUIREMENTS:\n• Government ID (Aadhaar)\n• Address proof\n• Department-specific documents\n\n⏱️ Processing times: 5-20 working days\n\n👉 Explore: Visit "Documents & Certificates" page for full list and application steps`;
    
    return response;
  }

  // Government Offices
  if (text.includes("office") || text.includes("government") || text.includes("officer")) {
    return `🏛️ GOVERNMENT OFFICE SERVICES\n\nCurrently ${summary.totalOffices} government offices with various services.\n\n🔧 SERVICES AVAILABLE:\n• Revenue certificates\n• Permits and licenses\n• Administrative approvals\n• Document issuance\n\n📍 HOW TO USE:\n1. Go to "Government Offices" page\n2. Find your nearest office by location\n3. Select the service you need\n4. Choose the responsible officer\n5. Get a token and monitor queue\n\n⏱️ Average processing: 7-15 working days\n\n👉 Next Step: Visit Government Offices page`;
  }

  // How to use platform
  if (text.includes("how") || text.includes("help") || text.includes("use") || text.includes("guide")) {
    return `📚 HOW TO USE QUEUELESS INDIA\n\n🏥 FOR HOSPITAL VISITS:\n1. Browse hospitals near your location\n2. Pick a doctor for your health issue\n3. Get a token showing queue position\n4. Wait at home and arrive when called\n5. Get treated without long waits\n\n🏛️ FOR GOVERNMENT SERVICES:\n1. Find relevant office\n2. Select the service needed\n3. Get a token with waiting time\n4. Track live queue status\n5. Submit documents when called\n\n📄 FOR DOCUMENTS:\n1. Browse available certificates\n2. Check required documents\n3. Follow application steps\n4. Get tokens at the office\n5. Collect certificate after processing\n\n✅ FEATURES:\n• Real-time queue tracking\n• No physical waiting required\n• Transparent wait times\n• Live notifications`;
  }

  // General services
  if (text.includes("service")) {
    return `🎯 QUEUELESS SERVICES\n\n${summary.totalServices} services across 3 categories:\n\n🏥 HEALTHCARE:\n• Hospital consultations\n• Doctor appointments\n• Emergency services\n\n🏛️ GOVERNMENT:\n• Revenue services\n• Administrative approvals\n• Document issuance\n\n📄 DOCUMENTS:\n• Certificates\n• Permits\n• Identity documents\n\n💡 TIP: Use "Find Service" to search by service type or name\n\n👉 Explore: Services page`;
  }

  // Multiple tokens
  if (text.includes("multiple") || text.includes("second") || text.includes("book again")) {
    return `🎫 MULTIPLE TOKENS\n\nYes, you can book multiple tokens for different services!\n\n✅ YOU CAN:\n• Book separate tokens for different hospitals\n• Get tokens for multiple doctors\n• Submit documents at different offices\n• Manage multiple queues simultaneously\n\n⚠️ LIMITATIONS:\n• One token per service/doctor at a time\n• Different hospitals = different token sequences\n• Follow queue discipline\n\n💡 TIP: Plan your visits by checking waiting times first\n\n👉 Manage tokens: Check "My Tokens" in the app`;
  }

  // Processing times
  if (text.includes("time") || text.includes("duration") || text.includes("how long")) {
    return `⏱️ WAITING & PROCESSING TIMES\n\n🏥 HOSPITAL SERVICES:\n• Average per patient: 10-20 minutes\n• Peak hours: 10 AM - 2 PM\n• Best time to visit: 6-9 AM or 4-6 PM\n\n🏛️ GOVERNMENT SERVICES:\n• Average per person: 15-30 minutes\n• Processing: 5-20 working days\n• Best day: Weekday mornings\n\n📄 DOCUMENTS:\n• Counter service: 10-15 minutes\n• Full processing: 7-30 working days\n\n💡 TIPS:\n• Check queue status before visiting\n• Arrive 10 minutes early\n• Keep all documents ready\n• Ask staff for help if needed\n\n👉 Real-time wait times: Check on hospital/office pages`;
  }

  return `🤖 QUEUELESS AI ASSISTANT\n\nI can help with:\n• Hospital services & doctor bookings\n• Government office services\n• Documents & certificates\n• Queue management\n• General guidance\n\n❓ TRY ASKING:\n• "How do I book a hospital token?"\n• "What documents do I need?"\n• "How long is the wait?"\n• "Show me available services"\n• "How does the queue system work?"\n\n💡 NEED MORE HELP?\n• Browse "Hospitals" or "Government Offices" pages\n• Check "Documents" section for forms\n• Use search on Services page\n• Contact staff at your location`;
}

export default AiAssistant;
