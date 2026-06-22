export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { name, license } = req.query;

  if (!name && !license) {
    return res.status(400).json({ error: "name or license required" });
  }

  try {
    const term = license || name;
    const url = license
      ? `https://www.myfloridalicense.com/cc_apiservice/services/LicenseSearch?LicenseNumber=${encodeURIComponent(term)}&format=json`
      : `https://www.myfloridalicense.com/cc_apiservice/services/LicenseSearch?LastName=${encodeURIComponent(term)}&LicenseType=CBC,CGC,CRC,CCC&format=json`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return res.status(200).json({ results: [] });
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data.slice(0, 5).map(r => ({
      name: r.LicenseName || "",
      license: r.LicenseNumber || "",
      type: r.LicenseType || "",
      status: r.LicenseStatus || "",
      phone: r.Phone || r.BusinessPhone || "",
      email: r.Email || "",
      address: [r.MailAddress, r.City, r.State, r.Zip].filter(Boolean).join(", "),
      county: r.County || "",
    })) : [];

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(200).json({ results: [], error: error.message });
  }
}
