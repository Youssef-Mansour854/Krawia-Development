const http = require("http");
const https = require("https");
const { parse } = require("url");

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = parse(url);
    const reqOpts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.path,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOpts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return null;
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookieStr.split(";")[0];
}

async function run() {
  console.log("==================================================");
  console.log("1. TESTING LOGIN WITH SEEDED ADMIN (youssef / Pass123!)");
  console.log("==================================================");
  const loginRes1 = await request(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { username: "youssef", password: "Pass123!" });

  console.log("Status:", loginRes1.status);
  console.log("Response Body:", JSON.stringify(loginRes1.data, null, 2));
  const cookie1 = extractCookie(loginRes1.headers);
  console.log("Admin Session Cookie:", cookie1);

  console.log("\n==================================================");
  console.log("2. TESTING PASSWORD CHANGE (Pass123! -> NewPass123!)");
  console.log("==================================================");
  const changePassRes = await request(`${BASE_URL}/api/admin/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie1,
    },
  }, { currentPassword: "Pass123!", newPassword: "NewPass123!" });

  console.log("Status:", changePassRes.status);
  console.log("Response Body:", JSON.stringify(changePassRes.data, null, 2));

  console.log("\n==================================================");
  console.log("3. RE-LOGIN WITH OLD PASSWORD (EXPECT 401 FAIL)");
  console.log("==================================================");
  const oldLoginRes = await request(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { username: "youssef", password: "Pass123!" });

  console.log("Status:", oldLoginRes.status);
  console.log("Response Body:", JSON.stringify(oldLoginRes.data, null, 2));

  console.log("\n==================================================");
  console.log("4. RE-LOGIN WITH NEW PASSWORD (youssef / NewPass123!)");
  console.log("==================================================");
  const newLoginRes = await request(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { username: "youssef", password: "NewPass123!" });

  console.log("Status:", newLoginRes.status);
  console.log("Response Body:", JSON.stringify(newLoginRes.data, null, 2));
  const cookie2 = extractCookie(newLoginRes.headers);

  console.log("\n==================================================");
  console.log("5. CREATING SECOND ADMIN ACCOUNT (admin2 / Pass456!)");
  console.log("==================================================");
  const createAdminRes = await request(`${BASE_URL}/api/admin/admins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie2,
    },
  }, { username: "admin2", password: "Pass456!" });

  console.log("Status:", createAdminRes.status);
  console.log("Response Body:", JSON.stringify(createAdminRes.data, null, 2));
  const admin2Id = createAdminRes.data?.data?._id;

  console.log("\n==================================================");
  console.log("6. TESTING LOGIN FOR SECOND ADMIN (admin2 / Pass456!)");
  console.log("==================================================");
  const admin2LoginRes = await request(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { username: "admin2", password: "Pass456!" });

  console.log("Status:", admin2LoginRes.status);
  console.log("Response Body:", JSON.stringify(admin2LoginRes.data, null, 2));

  console.log("\n==================================================");
  console.log("7. DELETING SECOND ADMIN (admin2)");
  console.log("==================================================");
  const deleteAdmin2Res = await request(`${BASE_URL}/api/admin/admins/${admin2Id}`, {
    method: "DELETE",
    headers: { Cookie: cookie2 },
  });

  console.log("Status:", deleteAdmin2Res.status);
  console.log("Response Body:", JSON.stringify(deleteAdmin2Res.data, null, 2));

  console.log("\n==================================================");
  console.log("8. ATTEMPTING TO DELETE THE LAST REMAINING ADMIN (EXPECT 400 GUARD)");
  console.log("==================================================");
  // Get ID of remaining admin
  const getAdminsRes = await request(`${BASE_URL}/api/admin/admins`, {
    headers: { Cookie: cookie2 },
  });
  const remainingAdminId = getAdminsRes.data?.admins?.[0]?._id;

  const deleteLastRes = await request(`${BASE_URL}/api/admin/admins/${remainingAdminId}`, {
    method: "DELETE",
    headers: { Cookie: cookie2 },
  });

  console.log("Status:", deleteLastRes.status);
  console.log("Response Body:", JSON.stringify(deleteLastRes.data, null, 2));
}

run().catch(console.error);
