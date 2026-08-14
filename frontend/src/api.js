const API_URL = "http://localhost:5000/api";

export async function getServices() {
  const response = await fetch(`${API_URL}/services`);

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  return response.json();
}

export async function getQueueStatus() {
  const response = await fetch(`${API_URL}/queue/status`);

  if (!response.ok) {
    throw new Error("Failed to fetch queue status");
  }

  return response.json();
}

export async function createToken(citizenName, serviceId) {
  const response = await fetch(`${API_URL}/queue/token`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      citizenName,
      serviceId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create token");
  }

  return response.json();
}

export async function callNextToken() {
  const response = await fetch(`${API_URL}/queue/next`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to call next token");
  }

  return response.json();
}

export async function completeCurrentService() {
  const response = await fetch(`${API_URL}/queue/complete`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to complete service");
  }

  return response.json();
}
