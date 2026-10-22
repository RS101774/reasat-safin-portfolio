const SUPABASE_URL = "https://lscaiyjwxioxzmxrfejy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eqFA5mI497rEULsXL0dq_A_2q1pnF60";

const $ = id => document.getElementById(id);

const page = (location.pathname.split("/").pop() || "index.html")
  .replace(".html", "");

const ownerMode =
  new URLSearchParams(location.search).get("owner") === "1";

document.querySelectorAll("[data-page]").forEach(a => {
  if (
    a.dataset.page === page ||
    (page === "index" && a.dataset.page === "home")
  ) {
    a.classList.add("active");
  }
});

if ($("yearView")) {
  $("yearView").textContent = new Date().getFullYear();
}

/* Skills page: load brand icons (Font Awesome) */
if ($("skillsView") && !document.getElementById("faCss")) {
  const fa = document.createElement("link");
  fa.id = "faCss";
  fa.rel = "stylesheet";
  fa.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
  document.head.appendChild(fa);
}

let sb = null;
let currentProfile = null;
let isOwner = false;

/* Pick a real logo for each skill by its name */
function skillIcon(name) {
  const n = (name || "").toLowerCase();
  const i = (cls, color) => ({
    html: '<i class="' + cls + '" style="font-size:20px"></i>',
    color: color
  });

  if (n.includes("supabase")) {
    return {
      html:
        '<img alt="" src="https://cdn.simpleicons.org/supabase/3ECF8E" style="width:20px;height:20px;display:block">',
      color: "#3ecf8e"
    };
  }
  if (n.includes("github")) return i("fa-brands fa-github", "#f5f4f1");
  if (/\bgit\b/.test(n)) return i("fa-brands fa-git-alt", "#f05032");
  if (n.includes("html")) return i("fa-brands fa-html5", "#e34f26");
  if (n.includes("css")) return i("fa-brands fa-css3-alt", "#1572b6");
  if (n.includes("javascript") || /\bjs\b/.test(n)) {
    return i("fa-brands fa-js", "#f7df1e");
  }
  if (n.includes("react")) return i("fa-brands fa-react", "#61dafb");
  if (n.includes("python")) return i("fa-brands fa-python", "#4b8bbe");
  if (n.includes("node")) return i("fa-brands fa-node-js", "#68a063");
  if (n.includes("figma") || n.includes("ui") || n.includes("design")) {
    return i("fa-brands fa-figma", "#f24e1e");
  }
  if (n.includes("sql") || n.includes("database")) {
    return i("fa-solid fa-database", "#8ab4f8");
  }
  return i("fa-solid fa-code", "#d8e0ee");
}

/* Show/hide the About page photo placeholder + upload button */
function updateAboutPhoto() {
  const img = $("aboutImageView");
  if (!img) return;

  const hasPhoto = img.style.display === "block";
  const ph = $("aboutPlaceholder");
  const btn = $("aboutPhotoBtn");

  if (ph) ph.style.display = hasPhoto ? "none" : (isOwner ? "flex" : "none");

  if (btn) {
    btn.style.display = isOwner ? "inline-flex" : "none";
    if (!btn.disabled) {
      btn.textContent = hasPhoto ? "Change photo" : "Add your photo";
    }
  }
}

/* Show owner controls only for an authenticated session,
   or show the login button when the owner URL is used. */
function updateOwnerControls(session) {
  isOwner = !!session;

  if ($("loginBtn")) {
    $("loginBtn").style.display =
      session || ownerMode ? "inline-flex" : "none";
  }

  if ($("editBtn")) {
    $("editBtn").style.display =
      session ? "inline-flex" : "none";
  }

  updateAboutPhoto();
}

function safeUrl(s) {
  try {
    const u = new URL((s || "").trim());
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

function setText(id, v) {
  if ($(id)) $(id).textContent = v || "";
}

function setImage(id, url) {
  const el = $(id);
  if (!el) return;

  const u = safeUrl(url);

  if (u) {
    el.src = u;
    el.style.display = "block";
  } else {
    el.removeAttribute("src");
    el.style.display = "none";
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function render(p) {
  if (!p) return;

  setText("nameView", p.display_name || "Reasat Safin");

  setText(
    "introView",
    p.intro ||
      "I'm a student, creative thinker and a passionate learner. I love building digital experiences, exploring new technologies and improving my skills every day."
  );

  setText(
    "aboutView",
    p.about ||
      "I'm a student from Dhaka who likes turning ideas into working websites.\n\nI build with HTML, CSS and SQL, store data with Supabase, and keep my code on GitHub. I'm always learning and trying to get a little better every day."
  );

  const portrait = $("portraitView");

  if (portrait) {
    const u = safeUrl(p.image);

    portrait.innerHTML = u
      ? '<img class="portrait" alt="Reasat Safin portrait" src="' +
        escapeHtml(u) + '">'
      : '<div class="placeholder">Add your portrait URL in Owner Login → Edit Profile.</div>';
  }

  setText(
    "edu1View",
    p.edu1 || "Add school name, years and achievements in Edit Profile."
  );

  setText(
    "edu2View",
    p.edu2 || "Add college name, years and academic details in Edit Profile."
  );

  setText(
    "edu3View",
    p.edu3 || "Add your future learning goals."
  );

  setImage("schoolImageView", p.school_image);
  setImage("collegeImageView", p.college_image);
  setImage("aboutImageView", p.about_image || p.image);
  updateAboutPhoto();

  const urls = (p.gallery || "")
    .split(/\r?\n/)
    .map(safeUrl)
    .filter(Boolean);

  const gallery = $("galleryView");

  if (gallery) {
    gallery.innerHTML = urls.length
      ? urls.map((u, i) =>
          '<button type="button" aria-label="Expand gallery photo ' +
          (i + 1) + '">' +
          '<img loading="lazy" src="' + escapeHtml(u) +
          '" alt="Gallery photo ' + (i + 1) + '">' +
          "</button>"
        ).join("")
      : '<p class="muted-note">Gallery photos coming soon. Add image URLs in Edit Profile.</p>';
  }

  const skills = $("skillsView");

  if (skills) {
    const rows = (
      p.skills ||
      "HTML & CSS | 90\nJavaScript | 75\nReact | 70\nPython | 60\nUI/UX Design | 65\nGit & GitHub | 80"
    )
      .split(/\r?\n/)
      .map(line => {
        const parts = line.split("|");

        return {
          name: (parts[0] || "").trim(),
          n: Math.max(
            0,
            Math.min(100, parseInt(parts[1], 10) || 0)
          )
        };
      })
      .filter(x => x.name);

    skills.innerHTML = rows.map(s => {
      const ic = skillIcon(s.name);

      return (
        '<article class="skill">' +
          '<div class="skilltop">' +
            '<div class="skillicon" style="color:' + ic.color + '">' +
              ic.html +
            "</div>" +
            "<h3>" + escapeHtml(s.name) + "</h3>" +
          "</div>" +
          '<div class="bar"><span style="width:' +
            s.n + '%"></span></div>' +
          '<div class="percent"><span>Progress</span><span>' +
            s.n + "%</span></div>" +
        "</article>"
      );
    }).join("");
  }

  const email = p.email || "reasatsafin@gmail.com";
  const ev = $("emailView");

  if (ev) {
    ev.href = "mailto:" + email;

    const label = ev.querySelector(".label");

    if (label) {
      label.textContent = email;
    } else {
      ev.textContent = "✉ " + email;
    }
  }

  /* Social links: only override the default link in the HTML
     when a valid HTTPS URL is saved in Edit Profile. */
  [
    ["facebookView", p.facebook],
    ["instagramView", p.instagram],
    ["telegramView", p.telegram]
  ].forEach(([id, url]) => {
    const el = $(id);
    if (!el) return;

    const u = safeUrl(url);
    if (u) el.href = u;
  });
}

function fillForm(p) {
  const vals = {
    fName: p.display_name || "Reasat Safin",
    fIntro: p.intro || "",
    fAbout: p.about || "",
    fEdu1: p.edu1 || "",
    fEdu2: p.edu2 || "",
    fEdu3: p.edu3 || "",
    fImage: p.image || "",
    fGallery: p.gallery || "",
    fSchoolImage: p.school_image || "",
    fCollegeImage: p.college_image || "",
    fSkills: p.skills || "",
    fEmail: p.email || "reasatsafin@gmail.com",
    fFacebook: p.facebook || "",
    fInstagram: p.instagram || "",
    fTelegram: p.telegram || ""
  };

  Object.entries(vals).forEach(([id, value]) => {
    if ($(id)) $(id).value = value;
  });
}

async function loadPublic() {
  if (!sb) return;

  const { data, error } = await sb
    .from("portfolio_profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!error && data) {
    currentProfile = data;
    render(data);
  } else if (error) {
    console.warn("Portfolio profile load:", error.message);
  }
}

async function openEditor() {
  if (!sb) return;

  const {
    data: { user },
    error: authError
  } = await sb.auth.getUser();

  if (authError || !user) {
    updateOwnerControls(null);
    return;
  }

  const { data, error } = await sb
    .from("portfolio_profile")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    setText("saveError", error.message);
    return;
  }

  currentProfile = data || null;
  fillForm(data || {});
  setText("saveError", "");

  if ($("editDialog")) $("editDialog").showModal();
}

/* Owner login button */
if ($("loginBtn")) {
  $("loginBtn").onclick = () => {
    if (sb) {
      $("loginDialog").showModal();
    } else {
      alert("Supabase is loading. Please wait a moment and try again.");
    }
  };
}

if ($("cancelLogin")) {
  $("cancelLogin").onclick = () => $("loginDialog").close();
}

if ($("cancelEdit")) {
  $("cancelEdit").onclick = () => $("editDialog").close();
}

if ($("editBtn")) {
  $("editBtn").onclick = openEditor;
}

/* Sign in */
if ($("loginSubmit")) {
  $("loginSubmit").onclick = async () => {
    setText("loginError", "");

    const { error } = await sb.auth.signInWithPassword({
      email: $("loginEmail").value.trim(),
      password: $("loginPassword").value
    });

    if (error) {
      setText("loginError", error.message);
      return;
    }

    $("loginDialog").close();

    const {
      data: { session }
    } = await sb.auth.getSession();

    updateOwnerControls(session);

    await openEditor();
  };
}

/* Save profile */
if ($("saveBtn")) {
  $("saveBtn").onclick = async () => {
    setText("saveError", "");
    $("saveBtn").disabled = true;
    $("saveBtn").textContent = "Saving…";

    try {
      const {
        data: { user },
        error: userError
      } = await sb.auth.getUser();

      if (userError || !user) {
        setText("saveError", "Login expired. Please login again.");
        return;
      }

      const p = {
        owner_id: user.id,
        display_name: $("fName").value.trim() || "Reasat Safin",
        intro: $("fIntro").value,
        about: $("fAbout").value,
        edu1: $("fEdu1").value,
        edu2: $("fEdu2").value,
        edu3: $("fEdu3").value,
        image: $("fImage").value.trim(),
        gallery: $("fGallery").value,
        school_image: $("fSchoolImage").value.trim(),
        college_image: $("fCollegeImage").value.trim(),
        skills: $("fSkills").value,
        email: $("fEmail").value.trim(),
        facebook: $("fFacebook").value.trim(),
        instagram: $("fInstagram").value.trim(),
        telegram: $("fTelegram").value.trim()
      };

      /* Keep the uploaded About photo when saving the form */
      if (currentProfile && currentProfile.about_image) {
        p.about_image = currentProfile.about_image;
      }

      for (const k of [
        "image",
        "school_image",
        "college_image",
        "facebook",
        "instagram",
        "telegram"
      ]) {
        if (p[k] && !safeUrl(p[k])) {
          setText(
            "saveError",
            k.replace("_", " ") + " must be a valid HTTPS URL."
          );
          return;
        }
      }

      if (
        p.gallery
          .split(/\r?\n/)
          .some(x => x.trim() && !safeUrl(x.trim()))
      ) {
        setText(
          "saveError",
          "Each gallery photo must be a valid HTTPS URL, one per line."
        );
        return;
      }

      const result = currentProfile
        ? await sb
            .from("portfolio_profile")
            .update(p)
            .eq("owner_id", user.id)
        : await sb
            .from("portfolio_profile")
            .insert(p);

      if (result.error) {
        setText("saveError", result.error.message);
        return;
      }

      currentProfile = p;
      render(p);
      $("editDialog").close();

    } catch (e) {
      setText(
        "saveError",
        e.message || "Could not save. Check Supabase settings."
      );
    } finally {
      $("saveBtn").disabled = false;
      $("saveBtn").textContent = "Save changes";
    }
  };
}

/* About page: upload your own photo (owner only) */
if ($("aboutPhotoBtn") && $("aboutPhotoInput")) {
  $("aboutPhotoBtn").onclick = () => $("aboutPhotoInput").click();

  $("aboutPhotoInput").onchange = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setText("aboutPhotoError", "");

    if (!file.type.startsWith("image/")) {
      setText("aboutPhotoError", "Please choose an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setText("aboutPhotoError", "Image is too large. Max 5 MB.");
      e.target.value = "";
      return;
    }

    const btn = $("aboutPhotoBtn");
    btn.disabled = true;
    btn.textContent = "Uploading…";

    try {
      const {
        data: { user },
        error: userError
      } = await sb.auth.getUser();

      if (userError || !user) {
        throw new Error("Login expired. Please login again.");
      }

      const ext =
        (file.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const path = user.id + "/about-" + Date.now() + "." + ext;

      const up = await sb.storage
        .from("portfolio")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (up.error) throw up.error;

      const url = sb.storage
        .from("portfolio")
        .getPublicUrl(path).data.publicUrl;

      const result = currentProfile
        ? await sb
            .from("portfolio_profile")
            .update({ about_image: url })
            .eq("owner_id", user.id)
        : await sb
            .from("portfolio_profile")
            .insert({ owner_id: user.id, about_image: url });

      if (result.error) throw result.error;

      currentProfile = Object.assign({}, currentProfile || {}, {
        owner_id: user.id,
        about_image: url
      });

      render(currentProfile);
    } catch (err) {
      setText(
        "aboutPhotoError",
        err.message || "Upload failed. Check Supabase storage settings."
      );
    } finally {
      btn.disabled = false;
      e.target.value = "";
      updateAboutPhoto();
    }
  };
}

/* Logout */
if ($("logoutBtn")) {
  $("logoutBtn").onclick = async () => {
    if (sb) await sb.auth.signOut();

    currentProfile = null;

    if ($("editDialog")?.open) {
      $("editDialog").close();
    }

    updateOwnerControls(null);
  };
}

/* Gallery lightbox */
const lb = $("lightbox");

if (lb) {
  lb.onclick = () => lb.classList.remove("open");

  document.addEventListener("click", e => {
    const button = e.target.closest("#galleryView button");

    if (!button) return;

    const img = button.querySelector("img");

    if (img) {
      lb.querySelector("img").src = img.src;
      lb.classList.add("open");
    }
  });
}

/* Initialize Supabase and check login session */
updateOwnerControls(null);

if (window.supabase && window.supabase.createClient) {
  sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  (async () => {
    const {
      data: { session }
    } = await sb.auth.getSession();

    updateOwnerControls(session);

    await loadPublic();

    sb.auth.onAuthStateChange((_event, session) => {
      updateOwnerControls(session);

      if (!session && $("editDialog")?.open) {
        $("editDialog").close();
      }
    });
  })();
}
