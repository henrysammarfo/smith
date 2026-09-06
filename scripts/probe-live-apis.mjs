import { toJSON } from "seroval";

const BASE = process.argv[2] || "https://smith-tawny-omega.vercel.app";

/** Minimal seroval-tree walker for TSS RPC responses */
function walk(node) {
  if (node == null || typeof node !== "object") return node;
  const t = node.t;
  if (t === 1) return node.s; // string
  if (t === 2) {
    // special primitives by slot
    if (node.s === 0) return null;
    if (node.s === 1) return undefined;
    if (node.s === 2) return true;
    if (node.s === 3) return false;
    return node.s;
  }
  if (t === 3) return Number(node.s); // number as string sometimes
  if (typeof t === "number" && node.s != null && node.p == null && node.a == null && t !== 25)
    return node.s;
  if (t === 9) return (node.a || []).map(walk); // array
  if (t === 10 || t === 11) {
    const obj = {};
    const ks = node.p?.k || [];
    const vs = node.p?.v || [];
    for (let i = 0; i < ks.length; i++) obj[ks[i]] = walk(vs[i]);
    return obj;
  }
  if (t === 25) {
    const msg = walk(node.s?.message) || node.c || "Error";
    const err = new Error(String(msg));
    err.seroval = true;
    throw err;
  }
  // number node alternate
  if (t === 0 || t === 4) return node.s;
  return node;
}

function decode(raw) {
  const tree = JSON.parse(raw);
  const top = walk(tree);
  if (top && typeof top === "object") {
    if (top.error) {
      const err = top.error;
      throw new Error(err?.message || String(err));
    }
    if ("result" in top) return top.result;
  }
  return top;
}

const FN = {
  register: "671dddc147a27de3f11e3f5fc61d89510df54d2d3926dbc7890844762d2c90e6",
  login: "3ecd90acedce2dcfb7b691a0b27b662f0ca38c87e681299e6ff3d10a9e8473df",
  logout: "8285637bec22435dbd5e593b20535792dec31961415ac0bc6d2b36409305eba4",
  me: "0675b67d512a409e2ea2f76cfdfafeda8af51a49d3e601cd9760bd640f6e8af1",
  createWorkspace: "22f23451d9a508cec7c5159ab9ea14c929d5cf183f58c4cc5cc9c726e8d3fb12",
  listWorkspaces: "805cc9626f17b444396be95a308250989091752e4d8bdb93337102b5313efc46",
  getWorkspace: "ee7f043e740b133b5201e20f757858817b46ac1d1c1edfb6efafc3753021fff9",
  listGenerations: "dcc139d79714ae6780432d715273de704ebcc67540231a4b375d28532a38fbfa",
  getGeneration: "1cf65e9c0651e2eda6b0b310fe9c747857af12334bed8ea69a554be19a81484a",
  listRuns: "58931cf77e141f636b673fc2100410d098e009ac71a7b4474e708eccd4ac9c0a",
  listLearning: "596f3c07fa261d377f26e976143860b787dff4fb4767783ca2bfe0bc1a0b4156",
  forgeOnce: "1fe7d145af8f6f731aed6c8819ddc9bba7e557adf57395a19e83b2a21561a05e",
  getDashboard: "2f2a82d0655e5ff4a4881fb7317c6b725d6de5e6bc19ae610324e59391a7fc69",
  healLlm: "dced7ad5ad65dc46334040f4bcbd81ffd1295722e8d2070f8d06300f2883da13",
};

// Load exact IDs from extracted bundle file if present
import { readFileSync, existsSync } from "fs";
const idFile = "/tmp/smith-fn-ids.json";
if (!existsSync(idFile)) throw new Error("missing "+idFile);
const IDS = JSON.parse(readFileSync(idFile, "utf8"));

const cookies = new Map();
const results = [];

function storeCookies(res) {
  const list =
    typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const single = res.headers.get("set-cookie");
  for (const c of list.length ? list : single ? [single] : []) {
    const [nv] = c.split(";");
    const i = nv.indexOf("=");
    if (i > 0) cookies.set(nv.slice(0, i).trim(), nv.slice(i + 1).trim());
  }
}

async function call(name, id, { method = "GET", data } = {}) {
  const url = new URL(`/_serverFn/${id}`, BASE);
  const headers = {
    accept: "application/json",
    "x-tsr-serverFn": "true",
    origin: BASE,
    referer: `${BASE}/`,
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0",
  };
  const cookie = [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  if (cookie) headers.cookie = cookie;
  let body;
  if (method === "GET") {
    if (data !== undefined) {
      url.search = new URLSearchParams({
        payload: JSON.stringify(toJSON({ data })),
      }).toString();
    }
  } else {
    headers["content-type"] = "application/json";
    body = JSON.stringify(toJSON(data !== undefined ? { data } : {}));
  }
  const t0 = Date.now();
  const res = await fetch(url, { method, headers, body, redirect: "manual" });
  storeCookies(res);
  const raw = await res.text();
  const ms = Date.now() - t0;
  if (!res.ok) {
    results.push({ name, ok: false, status: res.status, ms, error: raw.slice(0, 240) });
    console.log(`FAIL ${name} HTTP ${res.status}`);
    return null;
  }
  try {
    const value = decode(raw);
    results.push({
      name,
      ok: true,
      status: res.status,
      ms,
      preview: JSON.stringify(value)?.slice(0, 280),
    });
    console.log(`PASS ${name} (${ms}ms)`, JSON.stringify(value)?.slice(0, 160));
    return value;
  } catch (e) {
    results.push({
      name,
      ok: false,
      status: res.status,
      ms,
      error: e instanceof Error ? e.message : String(e),
      raw: raw.slice(0, 200),
    });
    console.log(`FAIL ${name}`, e instanceof Error ? e.message : e, raw.slice(0, 120));
    return null;
  }
}

async function page(path) {
  const t0 = Date.now();
  const res = await fetch(new URL(path, BASE), {
    headers: { "user-agent": "Mozilla/5.0", accept: "text/html" },
    redirect: "follow",
  });
  const ok = res.status > 0 && res.status < 500;
  results.push({
    name: `page:${path}`,
    ok,
    status: res.status,
    ms: Date.now() - t0,
    preview: res.url,
  });
  console.log(`${ok ? "PASS" : "FAIL"} page:${path} ${res.status}`);
}

// Prefer IDs file
const F = IDS;

console.log("BASE", BASE);
console.log("FN.register", F.register);

for (const p of [
  "/",
  "/register",
  "/login",
  "/start",
  "/dashboard",
  "/dashboard/forge",
  "/dashboard/agents",
  "/dashboard/runs",
]) {
  await page(p);
}

await call("me(anon)", F.me, { method: "GET" });
const email = `live-${Date.now()}@smith-probe.test`;
const password = "LiveProbe123!";
const user = await call("register", F.register, {
  method: "POST",
  data: { name: "Live Probe", email, password },
});

await call("me(auth)", F.me, { method: "GET" });
const heal = await call("healLlm", F.healLlm, { method: "POST" });

const ws = await call("createWorkspace", F.createWorkspace, {
  method: "POST",
  data: {
    goal: "Extract invoice line items from messy OCR",
    packId: "invoices",
    tools: ["parse_invoice", "normalize_money"],
    name: "live-probe-invoices",
  },
});

await call("listWorkspaces", F.listWorkspaces, { method: "GET" });
await call("getDashboard", F.getDashboard, { method: "GET" });

const wid = ws?.id;
if (wid) {
  await call("getWorkspace", F.getWorkspace, { method: "GET", data: { id: wid } });
  await call("listGenerations", F.listGenerations, {
    method: "GET",
    data: { workspaceId: wid },
  });
  await call("listRuns", F.listRuns, { method: "GET", data: { workspaceId: wid } });
  await call("listLearning", F.listLearning, {
    method: "GET",
    data: { workspaceId: wid },
  });

  console.log("\n— Gen1 —");
  const g1 = await call("forgeOnce(gen1)", F.forgeOnce, {
    method: "POST",
    data: { workspaceId: wid },
  });
  console.log("\n— Gen2 —");
  const g2 = await call("forgeOnce(gen2)", F.forgeOnce, {
    method: "POST",
    data: { workspaceId: wid },
  });

  await call("listLearning(post)", F.listLearning, {
    method: "GET",
    data: { workspaceId: wid },
  });
  await call("listGenerations(post)", F.listGenerations, {
    method: "GET",
    data: { workspaceId: wid },
  });
  await call("listRuns(post)", F.listRuns, {
    method: "GET",
    data: { workspaceId: wid },
  });
  await call("getDashboard(post)", F.getDashboard, { method: "GET" });

  const genId = g1?.generation?.id || g1?.report?.generationId;
  if (genId) {
    await call("getGeneration", F.getGeneration, { method: "GET", data: { id: genId } });
  }

  console.log("\nLEARNING_PROOF", {
    gen1: g1?.report?.after?.accuracy,
    gen2: g2?.report?.after?.accuracy,
    heal: heal?.selectedBaseUrl || heal?.model,
    workspaceId: wid,
  });
} else {
  console.log("NO WORKSPACE — cannot forge");
}

await call("logout", F.logout, { method: "POST" });
await call("me(afterLogout)", F.me, { method: "GET" });
await call("login", F.login, { method: "POST", data: { email, password } });
await call("me(relogin)", F.me, { method: "GET" });

console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log(
    `${r.ok ? "PASS" : "FAIL"} ${r.name.padEnd(24)} ${String(r.status).padStart(3)} ${String(r.ms).padStart(5)}ms  ${r.ok ? r.preview : r.error}`,
  );
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
