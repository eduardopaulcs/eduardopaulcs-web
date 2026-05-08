import { useEffect } from "react";
import getEnvVariable from "../../utils/getEnvVariable";

const UMAMI_SCRIPT_ID = "umami-analytics-script";

/**
 * Umami Analytics tracker component.
 * Injects the Umami tracking script into the document head if the env vars are configured.
 * Auto-tracks page views and client-side navigation via History API.
 */
const UmamiAnalytics = () => {
  const hostUrl = getEnvVariable("UMAMI_HOST_URL", null);
  const websiteId = getEnvVariable("UMAMI_WEBSITE_ID", null);

  useEffect(() => {
    if (!hostUrl || !websiteId) return;

    if (document.getElementById(UMAMI_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = UMAMI_SCRIPT_ID;
    script.defer = true;
    script.src = `${hostUrl}/script.js`;
    script.setAttribute("data-website-id", websiteId);

    document.head.appendChild(script);
  }, [hostUrl, websiteId]);

  return null;
};

export default UmamiAnalytics;
