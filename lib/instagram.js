// Instagram Graph API helper — single-image publish.
// Flow: create a media container with the public image_url + caption,
// then publish the container. Both calls use the long-lived access token.

const GRAPH = "https://graph.instagram.com";
// API version — Instagram Graph API. Bump if Meta deprecates.
const VERSION = "v21.0";

function requireEnv() {
  const token = process.env.IG_ACCESS_TOKEN;
  const userId = process.env.IG_USER_ID;
  if (!token || !userId) {
    throw new Error(
      "Instagram is not configured. Set IG_ACCESS_TOKEN and IG_USER_ID."
    );
  }
  return { token, userId };
}

// Step 1: create a media container. Returns the container (creation) ID.
async function createContainer({ imageUrl, caption, token, userId }) {
  const url = `${GRAPH}/${VERSION}/${userId}/media`;
  const body = new URLSearchParams({
    image_url: imageUrl,
    access_token: token,
  });
  if (caption) body.set("caption", caption);

  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `Container creation failed: ${data?.error?.message || res.status}`
    );
  }
  return data.id;
}

// Containers can take a moment to be ready. Poll status before publishing.
async function waitForContainer({ containerId, token }, attempts = 10) {
  const url = `${GRAPH}/${VERSION}/${containerId}?fields=status_code&access_token=${encodeURIComponent(
    token
  )}`;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status_code === "FINISHED") return true;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Container not publishable: ${data.status_code}`);
    }
    // IN_PROGRESS — wait and retry
    await new Promise((r) => setTimeout(r, 2000));
  }
  // Proceed anyway; publish will surface a clear error if not ready.
  return false;
}

// Step 2: publish the container. Returns the published media ID.
async function publishContainer({ containerId, token, userId }) {
  const url = `${GRAPH}/${VERSION}/${userId}/media_publish`;
  const body = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });
  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `Publish failed: ${data?.error?.message || res.status}`
    );
  }
  return data.id;
}

// Publish a single image post. Returns { mediaId }.
export async function publishSingleImage({ imageUrl, caption }) {
  const { token, userId } = requireEnv();
  const containerId = await createContainer({ imageUrl, caption, token, userId });
  await waitForContainer({ containerId, token });
  const mediaId = await publishContainer({ containerId, token, userId });
  return { mediaId };
}
