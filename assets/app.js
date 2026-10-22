const SUPABASE_URL = "https://lscaiyjwxioxzmxrfejy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eqFA5mI497rEULsXL0dq_A_2q1pnF60";

const DEFAULT_EDU_INTRO =
  "A look at my education so far, the places where I learned, grew, and found my direction. Every classroom taught me something new.";

const $ = id => document.getElementById(id);
const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
const ownerMode = new URLSearchParams(location.search).get("owner") === "1";

let sb = null;
let currentProfile = null;
let isOwner = false;

document.querySelectorAll("[data-page]").forEach(a => {
  if (a.dataset.page === page || (page === "index" && a.dataset.page === "home")) {
    a.classList.add("active");
  }
});

if ($("yearView")) $("yearView").textContent = new Date().getFullYear();

if ($("skillsView")) {
  const fa = document.createElement("link");
  fa.rel = "stylesheet";
  fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
  document.head.appendChild(fa);
}

function skillIcon(name) {
  const n = (name || "").toLowerCase();
  const icons = [
    ["supabase", "https://cdn.simpleicons.org/supabase/3ECF8E"],
    ["github", "https://cdn.simpleicons.org/github/ffffff"],
    ["html", "https://cdn.simpleicons.org/html5/E34F26"],
    ["css", "https://cdn.simpleicons.org/css/1572B6"],
    ["javascript", "https://cdn.simpleicons.org/javascript/F7DF1E"],
    ["python", "https://cdn.simpleicons.org/python/3776AB"],
    ["react", "https://cdn.simpleicons.org/react/61DAFB"],
    ["figma", "https://cdn.simpleicons.org/figma/F24E1E"]
  ];
  const match = icons.find(([key]) => n.includes(key));
  return match
    ? '<img alt="" src="' + match[1] + '" style="width:22px;height:22px;object-fit:contain">'
    : '<i class="fa-solid fa-code"></i>';
}

function safeUrl(value) {
  try {
    const u = new URL((value || "").trim());
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

function setText(id, value) {
  if ($(id)) $(id).textContent = value || "";
}

function setImage(id, url) {
  const el = $(id);
  if (!el) return;

  const valid = safeUrl(url);
  if (valid) {
    el.src = valid;
    el.style.display = "block";
  } else {
    el.removeAttribute("src");
    el.style.display = "none";
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function updateAboutPhoto() {
  const img = $("aboutImageView");
  const placeholder = $("aboutPlaceholder");
  const btn = $("aboutPhotoBtn");
  const input = $("aboutPhotoInput");
  const error = $("aboutPhotoError");

  const hasPhoto = !!(
    img &&
    img.style.display !== "none" &&
    img.getAttribute("src")
  );

  if (placeholder) {
    placeholder.style.display = isOwner && !hasPhoto ? "flex" : "none";
  }

  if (btn) {
    btn.style.display = isOwner ? "inline-flex" : "none";
    btn.textContent = hasPhoto ? "Change photo" : "Add your photo";
  }

  if (input) input.style.display = "none";
  if (error && !isOwner) error.textContent = "";
}

function updateOwnerControls(session) {
  isOwner = !!session;

  if ($("loginBtn")) {
    $("loginBtn").style.display =
      isOwner || ownerMode ? "inline-flex" : "none";
  }

  if ($("editBtn")) {
    $("editBtn").style.display = isOwner ? "inline-flex" : "none";
  }

  updateAboutPhoto();
}

function render(p) {
  if (!p) return;

  setText("nameView", p.display_name || "Reasat Safin");

  setText(
    "introView",
    p.intro || "Welcome to my personal portfolio. Explore my journey, the skills I'm developing, and the progress I make along the way."
  );

  setText(
    "aboutView",
    p.about || "I'm a student who believes in continuous learning, consistent hard work, and self-improvement."
  );

  const portrait = $("portraitView");
  if (portrait) {
    const url = safeUrl(p.image);
    portrait.innerHTML = url
      ? '<img class="portrait" alt="Reasat Safin portrait" src="' + escapeHtml(url) + '">'
      : '<div class="placeholder">Add your portrait URL in Edit Profile.</div>';
  }

  // Education page intro (editable from Edit Profile)
  setText("eduIntroView", p.edu_intro || DEFAULT_EDU_INTRO);

  setText("edu1View", p.edu1 || "Add school details in Edit Profile.");
  setText("edu2View", p.edu2 || "Add college details in Edit Profile.");
  setText("edu3View", p.edu3 || "Add your future learning goals.");

  setImage("schoolImageView", p.school_image);
  setImage("collegeImageView", p.college_image);

  // Home portrait and About photo are independent.
  setImage("aboutImageView", p.about_image);
  updateAboutPhoto();

  const urls = (p.gallery || "")
    .split(/\r?\n/)
    .map(safeUrl)
    .filter(Boolean);

  const gallery = $("galleryView");
  if (gallery) {
    gallery.innerHTML = urls.length
      ? urls.map((url, i) =>
          '<button type="button" aria-label="Expand gallery photo ' + (i + 1) + '">' +
          '<img loading="lazy" src="' + escapeHtml(url) + '" alt="Gallery photo ' + (i + 1) + '">' +
          '</button>'
        ).join("")
      : '<p class="muted-note">Gallery photos coming soon. Add image URLs in Edit Profile.</p>';
  }

  const skills = $("skillsView");
  if (skills) {
    const rows = (p.skills || "HTML & CSS | 70\nSQL | 75\nSupabase | 70")
      .split(/\r?\n/)
      .map(line => {
        const parts = line.split("|");
        return {
          name: (parts[0] || "").trim(),
          n: Math.max(0, Math.min(100, parseInt(parts[1], 10) || 0))
        };
      })
      .filter(x => x.name);

    skills.innerHTML = rows.map(s =>
      '<article class="skill">' +
        '<div class="skilltop">' +
          '<div class="skillicon">' + skillIcon(s.name) + '</div>' +
          '<h3>' + escapeHtml(s.name) + '</h3>' +
        '</div>' +
        '<div class="bar"><span style="width:' + s.n + '%"></span></div>' +
        '<div class="percent"><span>Progress</span><span>' + s.n + '%</span></div>' +
      '</article>'
    ).join("");
  }

  const email = p.email || "reasatsafin@gmail.com";
  const ev = $("emailView");
  if (ev) {
    ev.href = "mailto:" + email;
    const label = ev.querySelector(".label");
    if (label) label.textContent = email;
    else ev.textContent = "✉ " + email;
  }

  [
    ["facebookView", p.facebook],
    ["instagramView", p.instagram],
    ["telegramView", p.telegram]
  ].forEach(([id, url]) => {
    const el = $(id);
    const valid = safeUrl(url);
    if (el && valid) el.href = valid;
    else if (el) el.removeAttribute("href");
  });
}

function fillForm(p) {
  const vals = {
    fName: p.display_name || "Reasat Safin",
    fIntro: p.intro || "",
    fAbout: p.about || "",
    fEduIntro: p.edu_intro || DEFAULT_EDU_INTRO,
    fEdu1: p.edu1 || "",
    fEdu2: p.edu2 || "",
    fEdu3: p.edu3 || "",
    fImage: p.image || "",
    fAboutImage: p.about_image || "",
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
    console.warn("Portfolio load error:", error.message);
  }
}

async function openEditor() {
  if (!sb) return;

  const { data: { user }, error: authError } = await sb.auth.getUser();

  if (authError || !user) {
    updateOwnerControls(null);
    setText("loginError", "Please log in to edit your portfolio.");
    if ($("loginDialog")) $("loginDialog").showModal();
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

if ($("loginBtn")) {
  $("loginBtn").onclick = () => {
    if (sb && $("loginDialog")) $("loginDialog").showModal();
    else alert("Please wait for Supabase to load.");
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

if ($("loginSubmit")) {
  $("loginSubmit").onclick = async () => {
    setText("loginError", "");

    if (!sb) {
      setText("loginError", "Supabase is still loading. Try again.");
      return;
    }

    const { error } = await sb.auth.signInWithPassword({
      email: $("loginEmail").value.trim(),
      password: $("loginPassword").value
    });

    if (error) {
      setText("loginError", error.message);
      return;
    }

    $("loginDialog").close();

    const { data: { session } } = await sb.auth.getSession();
    updateOwnerControls(session);
    await openEditor();
  };
}

if ($("saveBtn")) {
  $("saveBtn").onclick = async () => {
    setText("saveError", "");
    $("saveBtn").disabled = true;
    $("saveBtn").textContent = "Saving…";

    try {
      const { data: { user }, error: userError } = await sb.auth.getUser();

      if (userError || !user) {
        setText("saveError", "Login expired. Please log in again.");
        return;
      }

      const p = {
        owner_id: user.id,
        display_name: $("fName")?.value.trim() || "Reasat Safin",
        intro: $("fIntro")?.value || "",
        about: $("fAbout")?.value || "",
        edu1: $("fEdu1")?.value || "",
        edu2: $("fEdu2")?.value || "",
        edu3: $("fEdu3")?.value || "",
        image: $("fImage")?.value.trim() || "",
        gallery: $("fGallery")?.value || "",
        school_image: $("fSchoolImage")?.value.trim() || "",
        college_image: $("fCollegeImage")?.value.trim() || "",
        skills: $("fSkills")?.value || "",
        email: $("fEmail")?.value.trim() || "",
        facebook: $("fFacebook")?.value.trim() || "",
        instagram: $("fInstagram")?.value.trim() || "",
        telegram: $("fTelegram")?.value.trim() || ""
      };

      // Only save these if the field exists on this page,
      // so saving from another page never wipes them.
      if ($("fAboutImage")) p.about_image = $("fAboutImage").value.trim();
      if ($("fEduIntro")) p.edu_intro = $("fEduIntro").value;

      for (const key of [
        "image", "about_image", "school_image", "college_image",
        "facebook", "instagram", "telegram"
      ]) {
        if (p[key] && !safeUrl(p[key])) {
          setText("saveError", key.replace("_", " ") + " must be a valid HTTPS URL.");
          return;
        }
      }

      if (p.gallery.split(/\r?\n/).some(x => x.trim() && !safeUrl(x.trim()))) {
        setText("saveError", "Enter one valid HTTPS URL per gallery line.");
        return;
      }

      const result = currentProfile
        ? await sb.from("portfolio_profile")
            .update(p)
            .eq("owner_id", user.id)
        : await sb.from("portfolio_profile").insert(p);

      if (result.error) {
        setText("saveError", result.error.message);
        return;
      }

      currentProfile = { ...(currentProfile || {}), ...p };
      render(currentProfile);
      if ($("editDialog")) $("editDialog").close();

    } catch (err) {
      setText("saveError", err.message || "Could not save changes.");
    } finally {
      $("saveBtn").disabled = false;
      $("saveBtn").textContent = "Save changes";
    }
  };
}

// Owner-only About photo upload.
if ($("aboutPhotoBtn") && $("aboutPhotoInput")) {
  $("aboutPhotoBtn").onclick = () => {
    if (isOwner && sb) $("aboutPhotoInput").click();
  };

  $("aboutPhotoInput").onchange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isOwner) {
      e.target.value = "";
      return;
    }

    setText("aboutPhotoError", "");

    if (!file.type.startsWith("image/")) {
      setText("aboutPhotoError", "Please select an image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setText("aboutPhotoError", "Maximum image size is 5 MB.");
      e.target.value = "";
      return;
    }

    const btn = $("aboutPhotoBtn");
    btn.disabled = true;
    btn.textContent = "Uploading…";

    try {
      const { data: { user }, error: authError } = await sb.auth.getUser();
      if (authError || !user) throw new Error("Please log in again.");

      const ext = (file.name.split(".").pop() || "jpg")
        .toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

      const path = user.id + "/about-" + Date.now() + "." + ext;

      const upload = await sb.storage.from("portfolio").upload(path, file, {
        upsert: true,
        contentType: file.type
      });

      if (upload.error) throw upload.error;

      const url = sb.storage.from("portfolio").getPublicUrl(path).data.publicUrl;

      const result = currentProfile
        ? await sb.from("portfolio_profile")
            .update({ about_image: url })
            .eq("owner_id", user.id)
        : await sb.from("portfolio_profile")
            .insert({ owner_id: user.id, about_image: url });

      if (result.error) throw result.error;

      currentProfile = {
        ...(currentProfile || {}),
        owner_id: user.id,
        about_image: url
      };

      render(currentProfile);

    } catch (err) {
      setText("aboutPhotoError", err.message || "Upload failed. Check Supabase permissions.");
    } finally {
      btn.disabled = false;
      e.target.value = "";
      updateAboutPhoto();
    }
  };
}

if ($("logoutBtn")) {
  $("logoutBtn").onclick = async () => {
    if (sb) await sb.auth.signOut();
    currentProfile = null;
    if ($("editDialog")?.open) $("editDialog").close();
    updateOwnerControls(null);
  };
}

const lightbox = $("lightbox");
if (lightbox) {
  lightbox.onclick = () => lightbox.classList.remove("open");

  document.addEventListener("click", e => {
    const button = e.target.closest("#galleryView button");
    if (!button) return;

    const img = button.querySelector("img");
    const target = lightbox.querySelector("img");

    if (img && target) {
      target.src = img.src;
      lightbox.classList.add("open");
    }
  });
}

updateOwnerControls(null);

if (window.supabase?.createClient) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  (async () => {
    const { data: { session } } = await sb.auth.getSession();
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
