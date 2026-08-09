const http = require("http");

async function testAdminViewerLogin() {
  console.log("Testing POST /api/auth/viewer-login with Admin Password...");

  // Send admin password to viewer-login API
  const reqData = JSON.stringify({ password: "NewPass123!" });
  
  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/viewer-login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(reqData),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Set-Cookie headers:", res.headers["set-cookie"]);
      console.log("Response Body:", data);
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e.message);
  });

  req.write(reqData);
  req.end();
}

// Only run if called directly
if (require.main === module) {
  testAdminViewerLogin();
}
