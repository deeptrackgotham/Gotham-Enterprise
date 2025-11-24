// Helper functions for API calls

export async function syncUserToDb(userData: {
  email: string;
  fullName: string;
  imageUrl?: string;
}) {
  try {
    const response = await fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to sync user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
}

export async function fetchScans() {
  try {
    const response = await fetch("/api/scans", { method: "GET", credentials: "include" });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to fetch scans");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scans:", error);
    throw error;
  }
}

export async function createScan(scanData: {
  fileName: string;
  fileType: "image" | "video" | "audio";
  status: "AUTHENTIC" | "SUSPICIOUS" | "DEEPFAKE";
  confidenceScore: number;
  modelsUsed: string[];
  imageUrl?: string;
  description?: string;
  features?: string[];
}) {
  try {
    const scanId = `scan-${Date.now()}`;
    const response = await fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        scanId,
        ...scanData,
      }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to create scan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating scan:", error);
    throw error;
  }
}

export async function fetchResult(scanId: string) {
  try {
    const response = await fetch(`/api/results/${scanId}`, { method: "GET", credentials: "include" });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to fetch result");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching result:", error);
    throw error;
  }
}

export async function deleteResult(scanId: string) {
  try {
    const response = await fetch(`/api/results/${scanId}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to delete result");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting result:", error);
    throw error;
  }
}

export async function createPaystackTransaction(amount: number, credits: number) {
  try {
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount, credits }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to initialize payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error initializing paystack transaction:", error);
    throw error;
  }
}

export async function verifyPaystackTransaction(reference: string) {
  try {
    const response = await fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(errBody?.error || "Failed to verify payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying paystack transaction:", error);
    throw error;
  }
}
