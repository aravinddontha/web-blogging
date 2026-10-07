/* ---------- 1. DATA ---------- */
const STORAGE_KEY = "plain-notes-posts";

// A few starter posts so the page isn't empty the first time.
const starterPosts = [
  {
    id: "p3", title: "Three things I learned building this site", author: "You", date: "2026-10-03",
    body: "HTML is the structure. It says what is on the page: headings, paragraphs, buttons.\n\nCSS is the style. It decides colors, spacing and fonts.\n\nJavaScript is the behavior. It reacts when someone clicks, types, or saves something."
  },
  {
    id: "p2", title: "A slow Sunday", author: "You", date: "2026-10-02",
    body: "Made coffee, opened a blank file, and wrote a few lines of code with no plan.\n\nSmall projects are the best way to learn. You finish them, and finishing feels good."
  },
  {
    id: "p1", title: "Welcome to my blog", author: "You", date: "2026-10-01",
    body: "This is my first post. Use the Write a post button to add your own, or open any post to read or delete it.\n\nChange the blog name and these starter posts in the code to make the site yours."
  }
];

// Load saved posts. try/catch keeps the page working even if saving is blocked.
function loadPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) { /* ignore and use the starter posts */ }
  return starterPosts;
}
function savePosts() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch (error) { /* ignore */ }
}

let posts = loadPosts();
let view = { name: "home" };     // which page we are on: home, posts, post, about, or write
let notice = "";                 // small message such as "Published."
let confirmingDelete = false;    // true after the first click on Delete post

const app = document.getElementById("app");

/* ---------- 2. SMALL HELPERS ---------- */
// Stops text typed by a visitor from being treated as HTML.
function escapeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
// A blank line in the text starts a new paragraph.
function toParagraphs(text) {
  return text.split(/\n\s*\n/).map(function (part) {
    return "<p>" + escapeHTML(part.trim()).replace(/\n/g, "<br>") + "</p>";
  }).join("");
}

/* ---------- 3. PAGES ---------- */
// Builds the HTML for a list of posts (used on Home and Posts).
function postItems(list) {
  return list.map(function (post) {
    const plain = post.body.replace(/\s+/g, " ");
    const excerpt = plain.length > 150 ? plain.slice(0, 150).trim() + "…" : plain;
    return '<article class="post-item">' +
      '<h2><button class="title-link" data-action="open" data-id="' + post.id + '">' + escapeHTML(post.title) + "</button></h2>" +
      '<p class="meta">By ' + escapeHTML(post.author) + " on " + formatDate(post.date) + "</p>" +
      '<p class="excerpt">' + escapeHTML(excerpt) + "</p></article>";
  }).join("");
}

const emptyMessage = '<p class="empty">No posts yet. Select Write a post to publish your first one.</p>';

// HOME: a welcome message and the 3 newest posts.
function homeScreen() {
  const latest = posts.slice(0, 3);
  let html = '<section class="hero">' +
    "<h1>Notes on making small things</h1>" +
    "<p>Short posts about what I am learning, building and thinking about.</p>" +
    '<div class="actions">' +
      '<button class="btn" data-action="posts">Read all posts</button>' +
      '<button class="btn ghost" data-action="about">About this blog</button>' +
    "</div></section>" +
    '<h2 class="section-title">Latest posts</h2>';
  html += latest.length ? postItems(latest) : emptyMessage;
  if (posts.length > 3) {
    html += '<div class="actions"><button class="btn ghost" data-action="posts">See all ' + posts.length + " posts</button></div>";
  }
  return html;
}

// POSTS: every post, newest first.
function postsScreen() {
  const count = posts.length + (posts.length === 1 ? " post" : " posts");
  return '<section class="intro"><h1>All posts</h1><p>' + count + ", newest first.</p></section>" +
    (posts.length ? postItems(posts) : emptyMessage);
}

// ABOUT: edit the text below to tell readers about you.
function aboutScreen() {
  return '<section class="article"><h1>About</h1><div class="body">' +
    "<p>Plain Notes is a small blog about learning to build things for the web. I write about what worked, what broke, and what I would do differently next time.</p>" +
    "<p>I am learning HTML, CSS and JavaScript one project at a time. This site is one of those projects.</p>" +
    "<p>What you will find here:</p>" +
    "<ul><li>Short posts you can read in a couple of minutes</li><li>Plain explanations, with no jargon</li><li>Honest notes about mistakes</li></ul>" +
    '</div><div class="actions"><button class="btn" data-action="posts">Read the posts</button></div></section>';
}

// A SINGLE POST
function postScreen() {
  const post = posts.find(function (p) { return p.id === view.id; });
  if (!post) { view = { name: "posts" }; return postsScreen(); }
  return '<article class="article">' +
    (notice ? '<p class="notice" role="status">' + notice + "</p>" : "") +
    "<h1>" + escapeHTML(post.title) + "</h1>" +
    '<p class="meta">By ' + escapeHTML(post.author) + " on " + formatDate(post.date) + "</p>" +
    '<div class="body">' + toParagraphs(post.body) + "</div>" +
    '<div class="actions">' +
      '<button class="btn ghost" data-action="posts">Back to all posts</button>' +
      '<button class="btn danger" data-action="delete" data-id="' + post.id + '">' +
        (confirmingDelete ? "Confirm delete" : "Delete post") + "</button>" +
    "</div></article>";
}

// WRITE: the form for a new post.
function writeScreen() {
  return '<section class="editor"><h1>Write a post</h1>' +
    '<form id="post-form">' +
      '<label for="title">Title</label><input id="title" required maxlength="100">' +
      '<label for="author">Your name</label><input id="author" required maxlength="40">' +
      '<label for="body">Post</label><textarea id="body" required></textarea>' +
      '<div class="actions">' +
        '<button type="submit" class="btn">Publish</button>' +
        '<button type="button" class="btn ghost" data-action="posts">Cancel</button>' +
      "</div></form></section>";
}

// Draws whichever page we are on, and highlights it in the menu.
function render() {
  if (view.name === "post") app.innerHTML = postScreen();
  else if (view.name === "write") app.innerHTML = writeScreen();
  else if (view.name === "posts") app.innerHTML = postsScreen();
  else if (view.name === "about") app.innerHTML = aboutScreen();
  else app.innerHTML = homeScreen();

  const current = view.name === "post" ? "posts" : view.name;   // an open post counts as "Posts"
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}

/* ---------- 4. CLICKS AND FORM ---------- */
// Moves to another page and clears any small messages.
function go(name, extra) {
  view = Object.assign({ name: name }, extra);
  notice = "";
  confirmingDelete = false;
}

// One listener watches every button that has a data-action attribute.
document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "home" || action === "posts" || action === "about" || action === "write") {
    go(action);
  } else if (action === "open") {
    go("post", { id: button.dataset.id });
  } else if (action === "delete") {
    if (!confirmingDelete) {
      confirmingDelete = true;                            // first click asks to confirm
    } else {                                              // second click deletes
      posts = posts.filter(function (p) { return p.id !== button.dataset.id; });
      savePosts();
      go("posts");
    }
  }
  render();
});

// Runs when the Write form is submitted.
document.addEventListener("submit", function (event) {
  if (event.target.id !== "post-form") return;
  event.preventDefault();                                // stop the page from reloading

  const newPost = {
    id: String(Date.now()),
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    date: new Date().toLocaleDateString("en-CA"),        // gives YYYY-MM-DD
    body: document.getElementById("body").value.trim()
  };
  if (!newPost.title || !newPost.author || !newPost.body) return;

  posts.unshift(newPost);                                // newest post goes first
  savePosts();
  view = { name: "post", id: newPost.id };
  notice = "Published.";
  render();
});

render();