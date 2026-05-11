// This file contains the JavaScript code for the static site.
// You can add functions to manipulate the DOM, handle events, or perform other client-side operations.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://loqujxhskaiqlwurcrdl.supabase.co";
const supabaseKey = "sb_publishable_PvUfGDzNIwSwF21GeRVhPw_FxAxy2fC";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized:", supabase);

// Attach login listener
const form = document.querySelector(".login");
if (form) {
  form.addEventListener("submit", handleLogin);
}

// Login form submit handler
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email")?.value.trim() || "";
  const password = document.getElementById("password")?.value || "";

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Invalid email or password.");
    return;
  }

  window.location.href = "homecare_crm.html";
}


// CRM page functions
const isCRMPage = document.body?.classList.contains("crm-page");

var STAGES = [
  "Prospect",
  "Contacted",
  "Meeting Done",
  "Terms Sent",
  "Active Vacancy",
  "CVs Submitted",
  "Interview",
  "Offer",
  "Placement",
  "After-sales Follow-up",
];
var ACTIVE_STAGES = [
  "Active Vacancy",
  "CVs Submitted",
  "Interview",
  "Offer",
  "Placement",
  "After-sales Follow-up",
];
var ATYPES = ["Call", "WhatsApp", "Email", "Meeting", "Follow-up"];
var SS = [
  "Submitted",
  "Interview Scheduled",
  "Interviewed",
  "Offered",
  "Accepted",
  "Rejected",
];
var ROLES = [
  "HR Executive",
  "HR Manager",
  "HR Director",
  "Nursing Director",
  "Operations Manager",
  "Finance Contact",
  "Other",
];
var ACCT = ["Hospital", "Nursing Home", "Clinic", "Agency", "Healthcare Group"];
var POS = ["HCA", "NA", "EN", "SN", "Others"];
var PG = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  contacts: "Contacts",
  opportunities: "Opportunities",
  pipeline: "Pipeline",
  activities: "Activities",
  submissions: "Submissions",
  reports: "Reports",
};

function uid() {
  return undefined; // Placeholder for unique ID generation logic
}

// Get today's date in YYYY-MM-DD format
function tod() {
  return new Date().toISOString().slice(0, 10);
}

// Check if opportunity is active
function isActive(o) {
  return ACTIVE_STAGES.indexOf(o.stage) >= 0;
}

// Calculate total headcount required
function reqTotal(o) {
  return (
    (o.hca || 0) + (o.na || 0) + (o.en || 0) + (o.sn || 0) + (o.others || 0)
  );
}

// Calculate total headcount filled
function filTotal(o) {
  return (
    (o.hca_f || 0) +
    (o.na_f || 0) +
    (o.en_f || 0) +
    (o.sn_f || 0) +
    (o.others_f || 0)
  );
}

async function getCrmData() {
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("*");
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*");
  const { data: opportunities, error: opportunitiesError } = await supabase
    .from("opportunities")
    .select("*");
  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("*");
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("*");

  if (
    accountsError ||
    contactsError ||
    opportunitiesError ||
    activitiesError ||
    submissionsError
  ) {
    console.error(
      "Error fetching CRM data:",
      accountsError ||
        contactsError ||
        opportunitiesError ||
        activitiesError ||
        submissionsError,
    );
    return;
  }

  D = {
    accounts: accounts,
    contacts: contacts,
    opportunities: opportunities,
    activities: activities,
    submissions: submissions,
  };
  return D;
}

let D = {
  accounts: [],
  contacts: [],
  opportunities: [],
  activities: [],
  submissions: [],
};

async function loadCrmData() {
  if (isCRMPage) {
    const result = await getCrmData();
    if (result) {
      D = result;
      renderAll();
    }
  }
}

// Call it on load
document.addEventListener("DOMContentLoaded", async function () {
  if (isCRMPage) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "index.html";
      return;
    }
    await loadCrmData();
  }
});

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}


// Save CRM data to Supabase, handling both new and existing records
async function saveToSupabase() {
  try {
    const { accounts, contacts, opportunities, activities, submissions } = D;

    //console.log("Accounts payload:", accounts);

    const newAccounts = accounts.filter((a) => !a.account_id);
    const existingAccounts = accounts.filter((a) => a.account_id);

    const newContacts = contacts.filter((c) => !c.id);
    const existingContacts = contacts.filter((c) => c.id);

    const newOpportunities = opportunities.filter((o) => !o.id);
    const existingOpportunities = opportunities.filter((o) => o.id);

    const newActivities = activities.filter((a) => !a.id);
    const existingActivities = activities.filter((a) => a.id);

    const newSubmissions = submissions.filter((s) => !s.id);
    const existingSubmissions = submissions.filter((s) => s.id);

    const ops = [];
    //   console.log("contacts:", {
    // newCount: newContacts.length,
    // existingCount: existingContacts.length
    // });
    if (newAccounts.length) {
      ops.push(
        supabase
          .from("accounts")
          .insert(newAccounts)
          .then(({ error }) => {
            if (error) throw new Error(`accounts insert: ${error.message}`);
          }),
      );
    }
    if (existingAccounts.length) {
      ops.push(
        supabase
          .from("accounts")
          .upsert(existingAccounts)
          .then(({ error }) => {
            if (error) throw new Error(`accounts upsert: ${error.message}`);
          }),
      );
    }

    if (newContacts.length) {
      ops.push(
        supabase
          .from("contacts")
          .insert(newContacts)
          .then(({ error }) => {
            if (error) throw new Error(`contacts insert: ${error.message}`);
          }),
      );
    }
    if (existingContacts.length) {
      ops.push(
        supabase
          .from("contacts")
          .upsert(existingContacts)
          .then(({ error }) => {
            if (error) throw new Error(`contacts upsert: ${error.message}`);
          }),
      );
    }

    if (newOpportunities.length) {
      ops.push(
        supabase
          .from("opportunities")
          .insert(newOpportunities)
          .then(({ error }) => {
            if (error)
              throw new Error(`opportunities insert: ${error.message}`);
          }),
      );
    }
    if (existingOpportunities.length) {
      ops.push(
        supabase
          .from("opportunities")
          .upsert(existingOpportunities)
          .then(({ error }) => {
            if (error)
              throw new Error(`opportunities upsert: ${error.message}`);
          }),
      );
    }

    if (newActivities.length) {
      ops.push(
        supabase
          .from("activities")
          .insert(newActivities)
          .then(({ error }) => {
            if (error) throw new Error(`activities insert: ${error.message}`);
          }),
      );
    }
    if (existingActivities.length) {
      ops.push(
        supabase
          .from("activities")
          .upsert(existingActivities)
          .then(({ error }) => {
            if (error) throw new Error(`activities upsert: ${error.message}`);
          }),
      );
    }

    if (newSubmissions.length) {
      ops.push(
        supabase
          .from("submissions")
          .insert(newSubmissions)
          .then(({ error }) => {
            if (error) throw new Error(`submissions insert: ${error.message}`);
          }),
      );
    }
    if (existingSubmissions.length) {
      ops.push(
        supabase
          .from("submissions")
          .upsert(existingSubmissions)
          .then(({ error }) => {
            if (error) throw new Error(`submissions upsert: ${error.message}`);
          }),
      );
    }

    await Promise.all(ops);
    console.log("Data saved successfully");
  } catch (err) {
    console.error("Unexpected error:", err);
    throw err;
  }
}

async function delToSupabase(type, id) {
  try {
    const tableMap = {
      accounts: "accounts",
      contacts: "contacts",
      opportunities: "opportunities",
      activities: "activities",
      submissions: "submissions",
    };

    const table = tableMap[type];
    if (!table) {
      throw new Error(`Unknown delete type: ${type}`);
    }
    if (type === "accounts") {
      const { error: deleteRelatedError } = await supabase
        .from("accounts")
        .delete()
        .eq("account_id", id);
      if (deleteRelatedError)
        throw new Error(
          `Error deleting related accounts: ${deleteRelatedError.message}`,
        );
    } else {
      const { error } = await supabase.from(table).delete().eq("id", id);
    }

    console.log(`Deleted from Supabase: ${table} ${id}`);
  } catch (err) {
    console.error(`Error deleting ${type} ${id}:`, err);
    throw err;
  }
}

//Save data before leaving the page to supabase
async function save() {
  try {
    await saveToSupabase();
    await loadCrmData(); // Refresh local data after saving
    renderAll(); // Re-render the UI with updated data
  } catch (e) {}
}

// Get account name by ID
function an(id) {
  var a = D.accounts.find(function (x) {
    return x.account_id === id;
  });
  return a ? a.name : "—";
}

function badge(txt, cls) {
  return '<span class="badge ' + cls + '">' + txt + "</span>";
}

function stb(s) {
  var m = {
    Prospect: "bgy",
    Contacted: "bb",
    "Meeting Done": "bp",
    "Terms Sent": "ba",
    "Active Vacancy": "bg",
    "CVs Submitted": "bg",
    Interview: "bc",
    Offer: "ba",
    Placement: "bgr",
    "After-sales Follow-up": "bb",
  };
  return badge(s, m[s] || "bgy");
}

function tpb(t) {
  return badge(
    t,
    {
      Call: "bb",
      WhatsApp: "bg",
      Email: "bp",
      Meeting: "bg",
      "Follow-up": "ba",
    }[t] || "bgy",
  );
}

function subb(s) {
  return badge(
    s,
    {
      Submitted: "bb",
      "Interview Scheduled": "ba",
      Interviewed: "bp",
      Offered: "bg",
      Accepted: "bgr",
      Rejected: "bc",
    }[s] || "bgy",
  );
}

function atb(t) {
  return badge(
    t,
    {
      Hospital: "bb",
      "Nursing Home": "bg",
      Clinic: "bgr",
      Agency: "bp",
      "Healthcare Group": "bc",
    }[t] || "bgy",
  );
}

function dc(t) {
  return (
    {
      Call: "#185FA5",
      WhatsApp: "#1d9e75",
      Email: "#534AB7",
      Meeting: "#0F6E56",
      "Follow-up": "#BA7517",
    }[t] || "#888"
  );
}

var cur360 = null;
function go(p) {
  document.querySelectorAll(".pg").forEach(function (x) {
    x.classList.remove("on");
  });
  document.querySelectorAll(".nav").forEach(function (x) {
    x.classList.remove("on");
  });
  var pg = document.getElementById("pg-" + p);
  if (pg) pg.classList.add("on");
  document.querySelectorAll(".nav").forEach(function (x) {
    if (x.textContent.trim() === PG[p]) x.classList.add("on");
  });
  document.getElementById("ttl").textContent = PG[p] || p;
  if (p === "accounts") backToList();
  if (isCRMPage) renderAll();
}

window.go = go;
window.godashboard = () => go("dashboard");
window.goaccounts = () => go("accounts");
window.gocontacts = () => go("contacts");
window.goopportunities = () => go("opportunities");
window.gopipeline = () => go("pipeline");
window.goactivities = () => go("activities");
window.gosubmissions = () => go("submissions");
window.goreports = () => go("reports");

function backToList() {
  cur360 = null;
  document.getElementById("acclist").style.display = "block";
  document.getElementById("acc360").style.display = "none";
}

function show360(id) {
  cur360 = id;
  document.getElementById("acclist").style.display = "none";
  document.getElementById("acc360").style.display = "block";
  render360(id);
}

function renderAll() {
  if (!isCRMPage) return;
  renderDash();
  renderAccGrid();
  renderContacts();
  renderOpps();
  renderPipeline();
  renderActs();
  renderSubs();
  renderReports();
  if (cur360) render360(cur360);
}

function renderDash() {
  const jobsEl = document.getElementById("dstats-jobs");
  const hcEl = document.getElementById("dstats-hc");
  const eqEl = document.getElementById("hc-equation");
  const dactsEl = document.getElementById("dacts");
  const dodEl = document.getElementById("dod");

  if (!jobsEl || !hcEl || !eqEl || !dactsEl || !dodEl) return;
  var t = tod(),
    od = D.activities.filter(function (a) {
      return a.followup && a.followup <= t && !a.done;
    }),
    openJobs = D.opportunities.filter(function (o) {
      return o.stage !== "Placement" && o.stage !== "After-sales Follow-up";
    }),
    activeVac = D.opportunities.filter(function (o) {
      return o.stage === "Active Vacancy";
    }),
    placedJobs = D.opportunities.filter(function (o) {
      return o.stage === "Placement";
    }),
    confirmedOpps = D.opportunities.filter(function (o) {
      return isActive(o);
    }),
    totalReq = confirmedOpps.reduce(function (s, o) {
      return s + reqTotal(o);
    }, 0),
    totalFil = confirmedOpps.reduce(function (s, o) {
      return s + filTotal(o);
    }, 0),
    totalOut = totalReq - totalFil;

  document.getElementById("dstats-jobs").innerHTML = [
    {
      l: "Open job orders",
      v: openJobs.length,
      sub: "All non-closed stages",
    },
    {
      l: "Active vacancies",
      v: activeVac.length,
      sub: "Confirmed, sourcing now",
    },
    {
      l: "Placed job orders",
      v: placedJobs.length,
      sub: "Reached Placement stage",
    },
    { l: "Overdue follow-ups", v: od.length, sub: "Past follow-up date" },
  ]
    .map(function (s) {
      return (
        '<div class="sc"><div class="sl">' +
        s.l +
        '</div><div class="sv">' +
        s.v +
        '</div><div class="sv-sub">' +
        s.sub +
        "</div></div>"
      );
    })
    .join("");
  document.getElementById("dstats-hc").innerHTML = [
    {
      l: "Total heads requested",
      v: totalReq,
      sub: "Confirmed orders only",
    },
    { l: "Heads filled", v: totalFil, sub: "Confirmed placements" },
    { l: "Heads outstanding", v: totalOut, sub: "Still to be filled" },
  ]
    .map(function (s) {
      return (
        '<div class="sc"><div class="sl">' +
        s.l +
        '</div><div class="sv">' +
        s.v +
        '</div><div class="sv-sub">' +
        s.sub +
        "</div></div>"
      );
    })
    .join("");
  document.getElementById("hc-equation").textContent =
    "Total heads requested (" +
    totalReq +
    ") = Heads filled (" +
    totalFil +
    ") + Heads outstanding (" +
    totalOut +
    ")";
  var ra = []
    .concat(D.activities)
    .sort(function (a, b) {
      return b.date > a.date ? 1 : -1;
    })
    .slice(0, 5);
  document.getElementById("dacts").innerHTML = ra.length
    ? "<table><thead><tr><th>Type</th><th>Account</th><th>Date</th></tr></thead><tbody>" +
      ra
        .map(function (a) {
          return (
            "<tr><td>" +
            tpb(a.type) +
            "</td><td>" +
            an(a.account_id) +
            "</td><td>" +
            a.date +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No activities yet</div>';
  document.getElementById("dod").innerHTML = od.length
    ? "<table><thead><tr><th>Account</th><th>Due</th><th>Type</th></tr></thead><tbody>" +
      od
        .slice(0, 5)
        .map(function (a) {
          return (
            "<tr><td>" +
            an(a.account_id) +
            '</td><td class="od">' +
            a.followup +
            "</td><td>" +
            tpb(a.type) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No overdue follow-ups</div>';
}

function renderAccGrid() {
  var t = tod();
  document.getElementById("accgrid").innerHTML = D.accounts
    .map(function (a) {
      var opps = D.opportunities.filter(function (o) {
          return o.account_id === a.account_id;
        }),
        acts = D.activities.filter(function (x) {
          return x.account_id === a.account_id;
        }),
        ov = acts.filter(function (x) {
          return x.followup && x.followup <= t && !x.done;
        }).length,
        la = [].concat(acts).sort(function (x, y) {
          return y.date > x.date ? 1 : -1;
        })[0],
        nextFU = acts
          .filter(function (x) {
            return x.followup && !x.done && x.significant;
          })
          .sort(function (x, y) {
            return x.followup > y.followup ? 1 : -1;
          })[0],
        openJ = opps.filter(function (o) {
          return o.stage !== "Placement" && o.stage !== "After-sales Follow-up";
        }).length,
        placedJ = opps.filter(function (o) {
          return o.stage === "Placement";
        }).length,
        confirmedO = opps.filter(function (o) {
          return isActive(o);
        }),
        totalReq = confirmedO.reduce(function (s, o) {
          return s + reqTotal(o);
        }, 0),
        totalFil = confirmedO.reduce(function (s, o) {
          return s + filTotal(o);
        }, 0);
      return (
        '<div class="acc-card" onclick="show360(\'' +
        a.account_id +
        '\')"><div class="an">' +
        a.name +
        '</div><div class="ams">' +
        atb(a.type) +
        badge(a.status, a.status === "Active" ? "bgr" : "bgy") +
        (ov
          ? '<span style="font-size:11px;color:#c00;font-weight:700">⚠ ' +
            ov +
            " overdue</span>"
          : "") +
        '</div><div class="mst"><div class="ms"><div class="msv">' +
        openJ +
        '</div><div class="msl">Open jobs</div></div><div class="ms"><div class="msv">' +
        placedJ +
        '</div><div class="msl">Placed jobs</div></div><div class="ms"><div class="msv">' +
        totalFil +
        "/" +
        totalReq +
        '</div><div class="msl">Heads filled</div></div><div class="ms"><div class="msv">' +
        acts.length +
        '</div><div class="msl">Activities</div></div></div>' +
        (nextFU
          ? '<div style="margin-top:8px;font-size:11px;background:#fff8e8;border:1px solid #f0dfa0;border-radius:4px;padding:4px 8px;color:#7a4e0a">📌 Follow-up: ' +
            nextFU.followup +
            " · " +
            nextFU.notes.slice(0, 38) +
            "...</div>"
          : "") +
        '<div style="margin-top:6px;font-size:10px;color:#999">' +
        (la
          ? "Last activity: " + la.date + " · " + la.type
          : "No activities yet") +
        "</div></div>"
      );
    })
    .join("");
}

function render360(id) {
  var acc = D.accounts.find(function (a) {
    return a.account_id === id;
  });
  if (!acc) return;
  var t = tod(),
    cts = D.contacts.filter(function (c) {
      return c.account_id === id;
    }),
    opps = D.opportunities.filter(function (o) {
      return o.account_id === id;
    }),
    acts = []
      .concat(
        D.activities.filter(function (a) {
          return a.account_id === id;
        }),
      )
      .sort(function (a, b) {
        return b.date > a.date ? 1 : -1;
      }),
    subs = D.submissions.filter(function (s) {
      return s.account_id === id;
    }),
    od = acts.filter(function (a) {
      return a.followup && a.followup <= t && !a.done;
    }).length,
    openJ = opps.filter(function (o) {
      return o.stage !== "Placement" && o.stage !== "After-sales Follow-up";
    }).length,
    placedJ = opps.filter(function (o) {
      return o.stage === "Placement";
    }).length,
    confirmedO = opps.filter(function (o) {
      return isActive(o);
    }),
    totalReq = confirmedO.reduce(function (s, o) {
      return s + reqTotal(o);
    }, 0),
    totalFil = confirmedO.reduce(function (s, o) {
      return s + filTotal(o);
    }, 0),
    sigFU = acts
      .filter(function (a) {
        return a.followup && !a.done && a.significant;
      })
      .sort(function (a, b) {
        return a.followup > b.followup ? 1 : -1;
      });
  var feed = acts.length
    ? acts
        .map(function (a) {
          var isOd = a.followup && a.followup <= t && !a.done;
          return (
            '<div class="aitem"><div class="arow"><div class="dot" style="background:' +
            dc(a.type) +
            '"></div><div class="abody"><div class="ahdr">' +
            tpb(a.type) +
            (a.significant
              ? '<span style="font-size:10px;background:#fff8e8;color:#7a4e0a;border-radius:3px;padding:1px 5px;font-weight:700">★</span>'
              : "") +
            '<span class="adate">' +
            a.date +
            "</span>" +
            (a.followup
              ? '<span class="adate ' +
                (isOd ? "od" : "") +
                '">→ ' +
                a.followup +
                "</span>"
              : "") +
            '</div><div class="anote">' +
            (a.notes || "—") +
            "</div></div><button class=\"btn\" onclick=\"openM('activity','" +
            a.id +
            "')\">Edit</button></div></div>"
          );
        })
        .join("")
    : '<div class="empty">No activities yet</div>';
  var fuHtml = sigFU.length
    ? sigFU
        .map(function (a) {
          var isOd = a.followup <= t;
          return (
            '<div style="padding:8px 12px;border-bottom:1px solid #f0f0ec;font-size:12px;display:flex;gap:10px;align-items:center"><span style="white-space:nowrap;font-size:11px;' +
            (isOd ? "color:#c00;font-weight:700" : "color:#888") +
            '">' +
            a.followup +
            '</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
            a.notes +
            "</span></div>"
          );
        })
        .join("")
    : '<div class="empty">No significant follow-ups</div>';
  var ctHtml = cts.length
    ? "<table><thead><tr><th>Name</th><th>Role</th><th>Phone</th></tr></thead><tbody>" +
      cts
        .map(function (c) {
          return (
            "<tr><td><b>" +
            c.name +
            "</b></td><td>" +
            c.role +
            "</td><td>" +
            (c.phone || "—") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No contacts</div>';
  var opHtml = opps.length
    ? '<table><thead><tr><th style="width:36%">Title</th><th style="width:22%">Stage</th><th style="width:20%">Req / Filled</th><th style="width:22%">Progress</th></tr></thead><tbody>' +
      opps
        .map(function (o) {
          var req = reqTotal(o),
            fil = filTotal(o),
            pct = req > 0 ? Math.round((fil / req) * 100) : 0;
          var bc =
            pct >= 100
              ? "prog-fill"
              : pct > 0
                ? "prog-fill prog-fill-part"
                : "prog-fill";
          return (
            "<tr style=\"cursor:pointer\" onclick=\"openM('opportunity','" +
            o.id +
            '\')"><td style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
            o.title +
            "</td><td>" +
            stb(o.stage) +
            '</td><td style="text-align:center">' +
            req +
            " / " +
            fil +
            '</td><td><div style="font-size:10px;color:#888">' +
            pct +
            '%</div><div class="prog-bar"><div class="' +
            bc +
            '" style="width:' +
            pct +
            '%"></div></div></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No job orders</div>';
  var sbHtml = subs.length
    ? '<table><thead><tr><th style="width:24%">Candidate</th><th style="width:10%">Role</th><th style="width:18%">Status</th><th style="width:40%">Notes</th><th style="width:8%"></th></tr></thead><tbody>' +
      subs
        .map(function (s) {
          return (
            "<tr><td><b>" +
            s.candidate_name +
            "</b></td><td>" +
            s.role +
            "</td><td>" +
            subb(s.status) +
            '</td><td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#666">' +
            (s.rejection ? "Rejected: " + s.rejection : s.notes || "—") +
            "</td><td><button class=\"btn\" onclick=\"openM('submission','" +
            s.id +
            "')\">Edit</button></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No submissions</div>';
  document.getElementById("a360c").innerHTML =
    '<div class="a3hdr"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap"><div><div class="a3name">' +
    acc.name +
    '</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;align-items:center">' +
    atb(acc.type) +
    badge(acc.status, acc.status === "Active" ? "bgr" : "bgy") +
    (acc.address
      ? '<span style="font-size:11px;color:#777">' + acc.address + "</span>"
      : "") +
    "</div>" +
    (acc.notes
      ? '<div style="font-size:12px;color:#666;max-width:460px">' +
        acc.notes +
        "</div>"
      : "") +
    '</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" onclick="openM(\'account\',\'' +
    id +
    "')\">Edit</button><button class=\"btn btnp\" onclick=\"openM('activity',null,'" +
    id +
    "')\">+ Log activity</button><button class=\"btn btnp\" onclick=\"openM('opportunity',null,'" +
    id +
    '\')">+ Add job order</button></div></div><div class="a3stats"><div class="a3s"><div class="a3sv">' +
    cts.length +
    '</div><div class="a3sl">Contacts</div></div><div class="a3s"><div class="a3sv">' +
    openJ +
    '</div><div class="a3sl">Open jobs</div></div><div class="a3s"><div class="a3sv">' +
    placedJ +
    '</div><div class="a3sl">Placed jobs</div></div><div class="a3s"><div class="a3sv">' +
    totalReq +
    '</div><div class="a3sl">Heads req</div></div><div class="a3s"><div class="a3sv">' +
    totalFil +
    '</div><div class="a3sl">Heads filled</div></div><div class="a3s"><div class="a3sv ' +
    (od ? "od" : "") +
    '">' +
    od +
    '</div><div class="a3sl">Overdue</div></div></div></div><div class="a3body"><div class="a3sec a3full"><div class="a3sh"><span>Activity feed</span><button class="btn" onclick="openM(\'activity\',null,\'' +
    id +
    "')\">+ Log</button></div>" +
    feed +
    '</div><div class="a3sec"><div class="a3sh">★ Significant follow-ups</div>' +
    fuHtml +
    '</div><div class="a3sec"><div class="a3sh"><span>Contacts</span><button class="btn" onclick="openM(\'contact\',null,\'' +
    id +
    "')\">+ Add</button></div>" +
    ctHtml +
    '</div><div class="a3sec a3full"><div class="a3sh"><span>Job orders — headcount progress</span><button class="btn" onclick="openM(\'opportunity\',null,\'' +
    id +
    "')\">+ Add</button></div>" +
    opHtml +
    '</div><div class="a3sec a3full"><div class="a3sh"><span>Candidate submissions</span><button class="btn" onclick="openM(\'submission\',null,\'' +
    id +
    "')\">+ Add</button></div>" +
    sbHtml +
    "</div></div>";
}

function renderContacts() {
  document.getElementById("ctb").innerHTML = D.contacts.length
    ? D.contacts
        .map(function (c) {
          return (
            "<tr><td><b>" +
            c.name +
            "</b></td><td>" +
            c.role +
            "</td><td>" +
            an(c.account_id) +
            "</td><td>" +
            (c.phone || "—") +
            "</td><td><button class=\"btn\" onclick=\"openM('contact','" +
            c.id +
            "')\">Edit</button> <button class=\"btn btnd\" onclick=\"del('contacts','" +
            c.id +
            "')\">Del</button></td></tr>"
          );
        })
        .join("")
    : '<tr><td colspan="5" class="empty">No contacts</td></tr>';
}

function renderOpps() {
  document.getElementById("otb").innerHTML = D.opportunities.length
    ? D.opportunities
        .map(function (o) {
          var req = reqTotal(o),
            fil = filTotal(o),
            pct = req > 0 ? Math.round((fil / req) * 100) : 0;
          var bc =
            pct >= 100
              ? "prog-fill"
              : pct > 0
                ? "prog-fill prog-fill-part"
                : "prog-fill";
          var lbl = isActive(o)
            ? ""
            : '<span style="font-size:10px;color:#aaa"> (pipeline)</span>';
          return (
            '<tr><td style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
            o.title +
            lbl +
            "</td><td>" +
            an(o.account_id) +
            "</td><td>" +
            stb(o.stage) +
            '</td><td style="text-align:center">' +
            req +
            '</td><td style="text-align:center">' +
            fil +
            '</td><td><div style="font-size:10px;color:#888">' +
            pct +
            '%</div><div class="prog-bar"><div class="' +
            bc +
            '" style="width:' +
            pct +
            '%"></div></div></td><td><button class="btn" onclick="openM(\'opportunity\',\'' +
            o.id +
            "')\">Edit</button> <button class=\"btn btnd\" onclick=\"del('opportunities','" +
            o.id +
            "')\">Del</button></td></tr>"
          );
        })
        .join("")
    : '<tr><td colspan="7" class="empty">No opportunities</td></tr>';
}

function renderActs() {
  var t = tod();
  document.getElementById("atb").innerHTML = D.activities.length
    ? []
        .concat(D.activities)
        .sort(function (a, b) {
          return b.date > a.date ? 1 : -1;
        })
        .map(function (a) {
          var isOd = a.followup && a.followup <= t && !a.done;
          return (
            "<tr><td>" +
            tpb(a.type) +
            (a.significant
              ? '<span style="color:#7a4e0a;margin-left:3px">★</span>'
              : "") +
            "</td><td>" +
            an(a.account_id) +
            '</td><td style="color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
            (a.notes || "—") +
            "</td><td>" +
            a.date +
            "</td><td " +
            (isOd ? 'class="od"' : "") +
            ">" +
            (a.followup || "—") +
            "</td><td><button class=\"btn\" onclick=\"openM('activity','" +
            a.id +
            "')\">Edit</button> <button class=\"btn btnd\" onclick=\"del('activities','" +
            a.id +
            "')\">Del</button></td></tr>"
          );
        })
        .join("")
    : '<tr><td colspan="6" class="empty">No activities</td></tr>';
}

function renderSubs() {
  document.getElementById("stb").innerHTML = D.submissions.length
    ? D.submissions
        .map(function (s) {
          return (
            "<tr><td><b>" +
            s.candidate_name +
            "</b></td><td>" +
            an(s.account_id) +
            "</td><td>" +
            s.role +
            "</td><td>" +
            subb(s.status) +
            "</td><td><button class=\"btn\" onclick=\"openM('submission','" +
            s.id +
            "')\">Edit</button> <button class=\"btn btnd\" onclick=\"del('submissions','" +
            s.id +
            "')\">Del</button></td></tr>"
          );
        })
        .join("")
    : '<tr><td colspan="5" class="empty">No submissions</td></tr>';
}

function renderPipeline() {
  document.getElementById("pipeboard").innerHTML = STAGES.map(function (s) {
    var op = D.opportunities.filter(function (o) {
      return o.stage === s;
    });
    return (
      '<div class="pcol"><div class="pct">' +
      s +
      " (" +
      op.length +
      ")</div>" +
      (op.length
        ? op
            .map(function (o) {
              var req = reqTotal(o),
                fil = filTotal(o);
              return (
                "<div class=\"pcard\" onclick=\"openM('opportunity','" +
                o.id +
                '\')"><div class="pctitle">' +
                o.title +
                '</div><div class="pcacc">' +
                an(o.account_id) +
                '</div><div style="font-size:10px;color:#888;margin-top:2px">' +
                fil +
                "/" +
                req +
                " filled</div></div>"
              );
            })
            .join("")
        : '<div style="font-size:10px;color:#bbb">Empty</div>') +
      "</div>"
    );
  }).join("");
}

function renderReports() {
  var confirmedOpps = D.opportunities.filter(function (o) {
      return isActive(o);
    }),
    totalReq = confirmedOpps.reduce(function (s, o) {
      return s + reqTotal(o);
    }, 0),
    totalFil = confirmedOpps.reduce(function (s, o) {
      return s + filTotal(o);
    }, 0),
    totalOut = totalReq - totalFil,
    placedJ = D.opportunities.filter(function (o) {
      return o.stage === "Placement";
    }),
    rev = placedJ.reduce(function (s, o) {
      return s + Number(o.value || 0);
    }, 0),
    t = tod(),
    od = D.activities.filter(function (a) {
      return a.followup && a.followup <= t && !a.done;
    }).length;
  document.getElementById("rstats").innerHTML = [
    { l: "Total heads requested", v: totalReq },
    { l: "Heads filled", v: totalFil },
    { l: "Heads outstanding", v: totalOut },
    { l: "Placed job orders", v: placedJ.length },
    { l: "Placement revenue", v: "$" + rev.toLocaleString() },
    { l: "Overdue follow-ups", v: od },
  ]
    .map(function (s) {
      return (
        '<div class="sc"><div class="sl">' +
        s.l +
        '</div><div class="sv">' +
        s.v +
        "</div></div>"
      );
    })
    .join("");
  var pos = {};
  POS.forEach(function (p) {
    pos[p] = { req: 0, fil: 0 };
  });
  confirmedOpps.forEach(function (o) {
    pos.HCA.req += o.hca || 0;
    pos.HCA.fil += o.hca_f || 0;
    pos.NA.req += o.na || 0;
    pos.NA.fil += o.na_f || 0;
    pos.EN.req += o.en || 0;
    pos.EN.fil += o.en_f || 0;
    pos.SN.req += o.sn || 0;
    pos.SN.fil += o.sn_f || 0;
    pos.Others.req += o.others || 0;
    pos.Others.fil += o.others_f || 0;
  });
  document.getElementById("rpos").innerHTML = POS.map(function (p) {
    var r = pos[p];
    return (
      "<tr><td><b>" +
      p +
      "</b></td><td>" +
      r.req +
      "</td><td>" +
      r.fil +
      '</td><td style="' +
      (r.req - r.fil > 0 ? "color:#c00;font-weight:700" : "color:#888") +
      '">' +
      (r.req - r.fil) +
      "</td></tr>"
    );
  }).join("");
  var fuActs = []
    .concat(
      D.activities.filter(function (a) {
        return a.followup && !a.done;
      }),
    )
    .sort(function (a, b) {
      return a.followup > b.followup ? 1 : -1;
    });
  document.getElementById("rfu").innerHTML = fuActs.length
    ? '<table><thead><tr><th style="width:18%">Due</th><th style="width:28%">Account</th><th style="width:14%">Type</th><th style="width:40%">Notes</th></tr></thead><tbody>' +
      fuActs
        .map(function (a) {
          var isOd = a.followup <= t;
          return (
            '<tr><td class="' +
            (isOd ? "od" : "") +
            '">' +
            a.followup +
            '</td><td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
            an(a.account_id) +
            "</td><td>" +
            tpb(a.type) +
            '</td><td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#666">' +
            (a.notes || "—") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    : '<div class="empty">No outstanding follow-ups</div>';
  var partial = confirmedOpps
    .filter(function (o) {
      var req = reqTotal(o),
        fil = filTotal(o);
      return req > 0 && fil < req;
    })
    .sort(function (a, b) {
      return reqTotal(b) - filTotal(b) - (reqTotal(a) - filTotal(a));
    });
  document.getElementById("rpartial").innerHTML = partial.length
    ? partial
        .map(function (o) {
          var req = reqTotal(o),
            fil = filTotal(o);
          return (
            '<tr><td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700">' +
            o.title +
            "</td><td>" +
            req +
            "</td><td>" +
            fil +
            '</td><td style="color:#c00;font-weight:700">' +
            (req - fil) +
            "</td></tr>"
          );
        })
        .join("")
    : '<tr><td colspan="4" class="empty">All confirmed orders fully filled</td></tr>';
  var sc = {};
  STAGES.forEach(function (s) {
    sc[s] = 0;
  });
  D.opportunities.forEach(function (o) {
    sc[o.stage]++;
  });
  document.getElementById("rstg").innerHTML = STAGES.map(function (s) {
    return "<tr><td>" + stb(s) + "</td><td>" + sc[s] + "</td></tr>";
  }).join("");
}

async function del(type, id) {
  if (!confirm("Delete this record?")) return;

  console.log("Deleting:", type, id);
  D[type] = D[type].filter((r) => r.id !== id && r.account_id !== id);
  console.log("After delete:", D[type]);

  try {
    await delToSupabase(type, id);
  } catch (error) {
    console.error("Error deleting from Supabase:", error);
    alert("Failed to delete record from database. Please try again.");
  }
  if (isCRMPage) renderAll();
}

function aOpts(sel) {
  return D.accounts
    .map(function (a) {
      return (
        '<option value="' +
        a.account_id +
        '"' +
        (a.account_id === sel ? " selected" : "") +
        ">" +
        a.name +
        "</option>"
      );
    })
    .join("");
}

function openM(type, recId, presetAcc) {
  var rec = null;
  if (recId) {
    if (type === "account") {
      rec = D.accounts.find(function (x) {
        return x.account_id === recId;
      });
    } else {
      var src = {
        contact: D.contacts,
        opportunity: D.opportunities,
        activity: D.activities,
        submission: D.submissions,
      }[type];
      if (src) {
        rec = src.find(function (x) {
          return x.id === recId;
        });
      }
    }
  }
  var sa = rec ? rec.account_id : presetAcc || "";
  var b = document.getElementById("mbox");
  if (type === "account") {
    b.innerHTML =
      "<h3>" +
      (rec ? "Edit" : "New") +
      ' account</h3><div class="fg"><label>Name *</label><input id="fn" value="' +
      (rec ? rec.name : "") +
      '"></div><div class="frow"><div class="fg"><label>Type</label><select id="ft">' +
      ACCT.map(function (t) {
        return (
          "<option" +
          (rec && rec.type === t ? " selected" : "") +
          ">" +
          t +
          "</option>"
        );
      }).join("") +
      '</select></div><div class="fg"><label>Status</label><select id="fst"><option' +
      (!rec || rec.status === "Active" ? " selected" : "") +
      ">Active</option><option" +
      (rec && rec.status === "Inactive" ? " selected" : "") +
      '>Inactive</option></select></div></div><div class="fg"><label>Address</label><input id="fa" value="' +
      (rec ? rec.address || "" : "") +
      '"></div><div class="fg"><label>Notes</label><textarea id="fno">' +
      (rec ? rec.notes || "" : "") +
      '</textarea></div><div class="mact"><button class="btn" onclick="closeM()">Cancel</button><button class="btn btnp" onclick="saveAcc(\'' +
      (rec ? rec.account_id : "") +
      "')\">Save</button></div>";
  } else if (type === "contact") {
    b.innerHTML =
      "<h3>" +
      (rec ? "Edit" : "New") +
      ' contact</h3><div class="frow"><div class="fg"><label>Name *</label><input id="fn" value="' +
      (rec ? rec.name : "") +
      '"></div><div class="fg"><label>Role</label><select id="fr">' +
      ROLES.map(function (r) {
        return (
          "<option" +
          (rec && rec.role === r ? " selected" : "") +
          ">" +
          r +
          "</option>"
        );
      }).join("") +
      '</select></div></div><div class="fg"><label>Account</label><select id="fa"><option value="">-- None --</option>' +
      aOpts(sa) +
      '</select></div><div class="frow"><div class="fg"><label>Phone</label><input id="fp" value="' +
      (rec ? rec.phone || "" : "") +
      '"></div><div class="fg"><label>Email</label><input id="fe" value="' +
      (rec ? rec.email || "" : "") +
      '"></div></div><div class="mact"><button class="btn" onclick="closeM()">Cancel</button><button class="btn btnp" onclick="saveCt(\'' +
      (rec ? rec.id : "") +
      "')\">Save</button></div>";
  } else if (type === "opportunity") {
    b.innerHTML =
      "<h3>" +
      (rec ? "Edit" : "New") +
      ' job order</h3><div class="fg"><label>Title *</label><input id="ft" value="' +
      (rec ? rec.title : "") +
      '"></div><div class="fg"><label>Account</label><select id="fa"><option value="">-- None --</option>' +
      aOpts(sa) +
      '</select></div><div class="frow"><div class="fg"><label>Stage</label><select id="fs">' +
      STAGES.map(function (s) {
        return (
          "<option" +
          (rec && rec.stage === s ? " selected" : "") +
          ">" +
          s +
          "</option>"
        );
      }).join("") +
      '</select></div><div class="fg"><label>Value (SGD)</label><input id="fv" type="number" value="' +
      (rec ? rec.value || 0 : 0) +
      '"></div></div><div class="fg"><label>Headcount — Requested vs Filled</label><table class="pos-table"><thead><tr><th style="text-align:left;width:30%">Position</th>' +
      POS.map(function (p) {
        return "<th>" + p + "</th>";
      }).join("") +
      '</tr></thead><tbody><tr><td style="font-weight:700;text-align:left;padding:4px 8px">Requested</td>' +
      POS.map(function (p) {
        var k = p.toLowerCase();
        return (
          '<td><input class="pos-input" type="number" id="req_' +
          k +
          '" min="0" value="' +
          (rec ? rec[k] || 0 : 0) +
          '"></td>'
        );
      }).join("") +
      '</tr><tr><td style="font-weight:700;text-align:left;padding:4px 8px">Filled</td>' +
      POS.map(function (p) {
        var k = p.toLowerCase() + "_f";
        return (
          '<td><input class="pos-input" type="number" id="fil_' +
          k +
          '" min="0" value="' +
          (rec ? rec[k] || 0 : 0) +
          '"></td>'
        );
      }).join("") +
      '</tr></tbody></table><div style="font-size:11px;color:#888;margin-top:4px">Headcount counted from Active Vacancy stage onwards.</div></div><div class="fg"><label>Notes</label><textarea id="fno">' +
      (rec ? rec.notes || "" : "") +
      '</textarea></div><div class="mact"><button class="btn" onclick="closeM()">Cancel</button><button class="btn btnp" onclick="saveOp(\'' +
      (rec ? rec.id : "") +
      "')\">Save</button></div>";
  } else if (type === "activity") {
    b.innerHTML =
      "<h3>" +
      (rec ? "Edit" : "Log") +
      ' activity</h3><div class="frow"><div class="fg"><label>Type</label><select id="ft">' +
      ATYPES.map(function (t) {
        return (
          "<option" +
          (rec && rec.type === t ? " selected" : "") +
          ">" +
          t +
          "</option>"
        );
      }).join("") +
      '</select></div><div class="fg"><label>Date</label><input type="date" id="fd" value="' +
      (rec ? rec.date : tod()) +
      '"></div></div><div class="fg"><label>Account</label><select id="fa"><option value="">-- None --</option>' +
      aOpts(sa) +
      '</select></div><div class="fg"><label>Notes</label><textarea id="fno">' +
      (rec ? rec.notes || "" : "") +
      '</textarea></div><div class="fg"><label>Follow-up date</label><input type="date" id="ffu" value="' +
      (rec ? rec.followup || "" : "") +
      '"></div><div class="fg"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;text-transform:none;font-weight:normal"><input type="checkbox" id="fsig"' +
      (rec && rec.significant ? " checked" : "") +
      ' style="width:auto;margin:0"> <b>Mark as significant</b> — surfaces in account card &amp; reports</label></div><div class="mact"><button class="btn" onclick="closeM()">Cancel</button><button class="btn btnp" onclick="saveAct(\'' +
      (rec ? rec.id : "") +
      "')\">Save</button></div>";
  } else if (type === "submission") {
    b.innerHTML =
      "<h3>" +
      (rec ? "Edit" : "New") +
      ' submission</h3><div class="frow"><div class="fg"><label>Candidate *</label><input id="fn" value="' +
      (rec ? rec.candidate_name : "") +
      '"></div><div class="fg"><label>Role</label><select id="fr">' +
      POS.map(function (p) {
        return (
          "<option" +
          (rec && rec.role === p ? " selected" : "") +
          ">" +
          p +
          "</option>"
        );
      }).join("") +
      '</select></div></div><div class="fg"><label>Account</label><select id="fa"><option value="">-- None --</option>' +
      aOpts(sa) +
      '</select></div><div class="fg"><label>Status</label><select id="fss">' +
      SS.map(function (s) {
        return (
          "<option" +
          (rec && rec.status === s ? " selected" : "") +
          ">" +
          s +
          "</option>"
        );
      }).join("") +
      '</select></div><div class="fg"><label>Rejection reason</label><input id="frej" value="' +
      (rec ? rec.rejection || "" : "") +
      '"></div><div class="fg"><label>Notes</label><textarea id="fno">' +
      (rec ? rec.notes || "" : "") +
      '</textarea></div><div class="mact"><button class="btn" onclick="closeM()">Cancel</button><button class="btn btnp" onclick="saveSub(\'' +
      (rec ? rec.id : "") +
      "')\">Save</button></div>";
  }
  document.getElementById("mbg").classList.add("on");
}

function closeM() {
  document.getElementById("mbg").classList.remove("on");
}

function saveAcc(id) {
  var n = document.getElementById("fn").value.trim();
  var type = document.getElementById("ft").value.trim();
  var status = document.getElementById("fst").value.trim();
  var address = document.getElementById("fa").value.trim();
  var notes = document.getElementById("fno").value.trim();
  if (!n) return alert("Name required");
  if (!type) return alert("Type is required");
  if (!status) return alert("Status is required");
  if (!address) return alert("Address is required");
  //console.log("Saving account:", { id, name: n });

  if (id) {
    var r = {
      account_id: id,
      name: n,
      type: type,
      status: status,
      address: address,
      notes: notes,
    };
    var i = D.accounts.findIndex(function (x) {
      return x.account_id === id;
    });
    if (i >= 0) {
      D.accounts[i] = r;
    } else {
      D.accounts.push(r);
    }
  } else {
    var r = {
      name: n,
      type: type,
      status: status,
      address: address,
      notes: notes,
    };
    D.accounts.push(r);
  }
  //console.log("Saving account:", r);
  save();
  closeM();
  if (isCRMPage) renderAll();
}

function saveCt(id) {
  var n = document.getElementById("fn").value.trim();
  var role = document.getElementById("fr").value.trim();
  var account_id = document.getElementById("fa").value.trim();
  var phone = document.getElementById("fp").value.trim();
  var email = document.getElementById("fe").value.trim();
  if (!n) return alert("Name required");
  if (!role) return alert("Role is required");
  if (!account_id) return alert("Account is required");
  if (!phone) return alert("Phone is required");
  if (!email) return alert("Email is required");

  if (id) {
    var r = {
      id: id,
      name: n,
      role: role ,
      account_id: account_id || null,
      phone: phone,
      email: email,
    };
    var i = D.contacts.findIndex(function (x) {
      return x.id === id;
    });
    D.contacts[i] = r;
  } else {
    var r = {
      name: n,
      role: role,
      account_id: account_id || null,
      phone: phone,
      email: email,
    };
    D.contacts.push(r);
  }
  save();
  closeM();
  if (isCRMPage) renderAll();
}

function saveOp(id) {
  var t = document.getElementById("ft").value.trim();
  var account_id = document.getElementById("fa").value.trim();
  var stage = document.getElementById("fs").value.trim();
  var value = document.getElementById("fv").value.trim();
  if (!t) return alert("Title required");
  if (!stage) return alert("Stage is required");
  if (!value) return alert("Value is required");

  if (id) {
    var r = {
      id: id || uid(),
      title: t,
      account_id: account_id || null,
      stage: stage,
      value: value,
      hca: parseInt(document.getElementById("req_hca").value) || 0,
      na: parseInt(document.getElementById("req_na").value) || 0,
      en: parseInt(document.getElementById("req_en").value) || 0,
      sn: parseInt(document.getElementById("req_sn").value) || 0,
      others: parseInt(document.getElementById("req_others").value) || 0,
      hca_f: parseInt(document.getElementById("fil_hca_f").value) || 0,
      na_f: parseInt(document.getElementById("fil_na_f").value) || 0,
      en_f: parseInt(document.getElementById("fil_en_f").value) || 0,
      sn_f: parseInt(document.getElementById("fil_sn_f").value) || 0,
      others_f: parseInt(document.getElementById("fil_others_f").value) || 0,
      notes: document.getElementById("fno").value,
    };
    var i = D.opportunities.findIndex(function (x) {
      return x.id === id;
    });
    D.opportunities[i] = r;
  } else {
    var r = {
      title: t,
      account_id: account_id || null,
      stage: stage,
      value: value,
      hca: parseInt(document.getElementById("req_hca").value) || 0,
      na: parseInt(document.getElementById("req_na").value) || 0,
      en: parseInt(document.getElementById("req_en").value) || 0,
      sn: parseInt(document.getElementById("req_sn").value) || 0,
      others: parseInt(document.getElementById("req_others").value) || 0,
      hca_f: parseInt(document.getElementById("fil_hca_f").value) || 0,
      na_f: parseInt(document.getElementById("fil_na_f").value) || 0,
      en_f: parseInt(document.getElementById("fil_en_f").value) || 0,
      sn_f: parseInt(document.getElementById("fil_sn_f").value) || 0,
      others_f: parseInt(document.getElementById("fil_others_f").value) || 0,
      notes: document.getElementById("fno").value,
    };
    D.opportunities.push(r);
  }
  save();
  closeM();
  if (isCRMPage) renderAll();
}

function saveAct(id) {
  if (id) {
    var r = {
      id: id || uid(),
      type: document.getElementById("ft").value,
      date: document.getElementById("fd").value,
      account_id: document.getElementById("fa").value || null,
      notes: document.getElementById("fno").value,
      followup: document.getElementById("ffu").value,
      significant: document.getElementById("fsig").checked,
      done: false,
    };
    var i = D.activities.findIndex(function (x) {
      return x.id === id;
    });
    D.activities[i] = r;
  } else {
    var r = {
      type: document.getElementById("ft").value,
      date: document.getElementById("fd").value,
      account_id: document.getElementById("fa").value || null,
      notes: document.getElementById("fno").value,
      followup: document.getElementById("ffu").value,
      significant: document.getElementById("fsig").checked,
      done: false,
    };
    D.activities.push(r);
  }
  save();
  closeM();
  if (isCRMPage) renderAll();
}

function saveSub(id) {
  var n = document.getElementById("fn").value.trim();
  if (!n) return alert("Name required");

  if (id) {
    var r = {
      id: id || uid(),
      candidate_name: n,
      role: document.getElementById("fr").value,
      account_id: document.getElementById("fa").value || null,
      status: document.getElementById("fss").value,
      rejection: document.getElementById("frej").value,
      notes: document.getElementById("fno").value,
    };
    var i = D.submissions.findIndex(function (x) {
      return x.id === id;
    });
    D.submissions[i] = r;
  } else {
    var r = {
      candidate_name: n,
      role: document.getElementById("fr").value,
      account_id: document.getElementById("fa").value || null,
      status: document.getElementById("fss").value,
      rejection: document.getElementById("frej").value,
      notes: document.getElementById("fno").value,
    };
    D.submissions.push(r);
  }
  save();
  closeM();
  if (isCRMPage) renderAll();
}


if (typeof window !== "undefined") {
  Object.assign(window, {
    go,
    backToList,
    show360,
    openM,
    closeM,
    saveAcc,
    saveCt,
    saveOp,
    saveAct,
    saveSub,
    del,
    logout,
  });
}


//Add acutal login authentication and user management using supabase auth.
//Fix the docs
//continue data validation for activities and submissions.