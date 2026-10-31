import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fingerprintPromise = null;

function getFingerprint() {
  if (!fingerprintPromise) {
    fingerprintPromise = FingerprintJS.load()
      .then((agent) => agent.get())
      .then((result) => result.visitorId)
      .catch((error) => {
        fingerprintPromise = null;
        throw error;
      });
  }
  return fingerprintPromise;
}

export function installFingerprintFetch() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const fingerprint = await getFingerprint();
    const headers = new Headers(
      init?.headers || (input instanceof Request ? input.headers : undefined),
    );
    headers.set("fingerprintjs", fingerprint);
    return originalFetch(input, { ...init, headers });
  };
}
