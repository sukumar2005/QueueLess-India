import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { locationData } from "../data/locations";

function LocationSelector({ onLocationSelected }) {
  const states = Object.keys(locationData);
  const [state, setState] = useState(states[0]);
  const [district, setDistrict] = useState(
    Object.keys(locationData[states[0]])[0]
  );
  const [village, setVillage] = useState(
    locationData[states[0]][district][0]
  );
  const [status, setStatus] = useState("");
  const [detecting, setDetecting] = useState(false);

  const districts = useMemo(
    () => Object.keys(locationData[state] || {}),
    [state]
  );

  const villages = useMemo(
    () => locationData[state]?.[district] || [],
    [state, district]
  );

  const handleStateChange = (nextState) => {
    const nextDistrict = Object.keys(locationData[nextState])[0];
    setState(nextState);
    setDistrict(nextDistrict);
    setVillage(locationData[nextState][nextDistrict][0]);
    setStatus("");
  };

  const handleDistrictChange = (nextDistrict) => {
    setDistrict(nextDistrict);
    setVillage(locationData[state][nextDistrict][0]);
    setStatus("");
  };

  const useCurrentLocation = () => {
    setStatus("");

    if (!navigator.geolocation) {
      setStatus("Location is not supported by this browser.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const selectedLocation = {
          method: "gps",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setStatus("Location detected successfully.");
        setDetecting(false);
        onLocationSelected(selectedLocation);
      },
      (error) => {
        const messages = {
          1: "Location permission denied.",
          2: "Location unavailable.",
          3: "Location request timed out.",
        };

        setStatus(
          messages[error.code] || "Unable to detect location."
        );
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const continueManual = () => {
    onLocationSelected({
      method: "manual",
      state,
      district,
      village,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
          <MapPin className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Find Services Near You
          </h2>
          <p className="text-sm text-slate-500">
            Use your current location or select manually.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={detecting}
        className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {detecting ? "Detecting..." : "Use My Location"}
      </button>

      {status && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
          {status}
        </p>
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase text-slate-400">
          OR
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="State">
          <select
            value={state}
            onChange={(event) =>
              handleStateChange(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {states.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="District">
          <select
            value={district}
            onChange={(event) =>
              handleDistrictChange(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Village / Mandal">
          <select
            value={village}
            onChange={(event) => {
              setVillage(event.target.value);
              setStatus("");
            }}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {villages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button
        type="button"
        onClick={continueManual}
        className="mt-5 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
      >
        Continue
      </button>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

export default LocationSelector;
