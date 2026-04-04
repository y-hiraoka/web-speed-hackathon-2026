import fs from "node:fs";
import path from "node:path";

import { Router } from "express";

import { Post, User } from "@web-speed-hackathon-2026/server/src/models";
import { CLIENT_DIST_PATH } from "@web-speed-hackathon-2026/server/src/paths";

export const ssrRouter = Router();

// Cache the built index.html template in memory
let htmlTemplate: string | null = null;

function getHtmlTemplate(): string {
  if (htmlTemplate == null) {
    const htmlPath = path.join(CLIENT_DIST_PATH, "index.html");
    htmlTemplate = fs.readFileSync(htmlPath, "utf-8");
  }
  return htmlTemplate;
}

interface InitialData {
  me: object | null;
  posts?: object[];
}

// Escape HTML special characters
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Generate a FontAwesome SVG icon reference
function faIcon(iconType: string): string {
  return `<svg class="font-awesome inline-block fill-current leading-none"><use href="/sprites/font-awesome/solid.svg#${iconType}"></use></svg>`;
}

// Generate the navigation sidebar HTML (unauthenticated state - no DM, no post, no mypage, no crok)
function generateNavHtml(): string {
  const items = [
    { href: "/", icon: faIcon("home"), text: "ホーム" },
    { href: "/search", icon: faIcon("search"), text: "検索" },
    { href: "/terms", icon: faIcon("balance-scale"), text: "利用規約" },
  ];

  const listItems = items
    .map(
      (item) =>
        `<li><a class="hover:bg-cax-brand-soft flex h-12 w-12 flex-col items-center justify-center rounded-full sm:h-auto sm:w-24 sm:rounded-sm sm:px-2 lg:h-auto lg:w-auto lg:flex-row lg:justify-start lg:rounded-full lg:px-4 lg:py-2" href="${item.href}"><span class="relative text-xl lg:pr-2 lg:text-3xl">${item.icon}</span><span class="hidden sm:inline sm:text-sm lg:text-xl lg:font-bold">${item.text}</span></a></li>`,
    )
    .join("");

  return `<nav class="border-cax-border bg-cax-surface fixed right-0 bottom-0 left-0 z-10 h-12 border-t lg:relative lg:h-full lg:w-48 lg:border-t-0 lg:border-r"><div class="relative grid grid-flow-col items-center justify-evenly lg:fixed lg:flex lg:h-full lg:w-48 lg:flex-col lg:justify-between lg:p-2"><ul class="grid grid-flow-col items-center justify-evenly lg:grid-flow-row lg:auto-rows-min lg:justify-start lg:gap-2">${listItems}</ul></div></nav>`;
}

// Wrap content in the app shell layout
function wrapInAppShell(content: string): string {
  const nav = generateNavHtml();
  return `<div class="relative z-0 flex justify-center font-sans"><div class="bg-cax-surface text-cax-text flex min-h-screen max-w-full"><aside class="relative z-10">${nav}</aside><main class="relative z-0 w-screen max-w-screen-sm min-w-0 shrink pb-12 lg:pb-0">${content}</main></div></div>`;
}

// Generate timeline HTML from post data
function generateTimelineHtml(posts: any[]): string {
  if (!posts || posts.length === 0) {
    return "<section></section>";
  }

  const items = posts
    .map((post) => {
      const user = post.user || {};
      const name = escapeHtml(user.name || "");
      const username = escapeHtml(user.username || "");
      const text = escapeHtml(post.text || "");
      const profileImageId = user.profileImage?.id || "";
      const profileImageAlt = escapeHtml(user.profileImage?.alt || "");
      const createdAt = new Date(post.createdAt);
      const dateStr = new Intl.DateTimeFormat("ja", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(createdAt);
      const isoDate = createdAt.toISOString();

      return `<article class="hover:bg-cax-surface-subtle px-1 sm:px-4"><div class="border-cax-border flex border-b px-2 pt-2 pb-4 sm:px-4"><div class="shrink-0 grow-0 pr-2 sm:pr-4"><a class="border-cax-border bg-cax-surface-subtle block h-12 w-12 overflow-hidden rounded-full border hover:opacity-75 sm:h-16 sm:w-16" href="/users/${username}"><img alt="${profileImageAlt}" decoding="async" height="64" loading="lazy" src="/images/profiles/${profileImageId}.webp" width="64"></a></div><div class="min-w-0 shrink grow"><p class="overflow-hidden text-sm text-ellipsis whitespace-nowrap"><a class="text-cax-text pr-1 font-bold hover:underline" href="/users/${username}">${name}</a><a class="text-cax-text-muted pr-1 hover:underline" href="/users/${username}">@${username}</a><span class="text-cax-text-muted pr-1">-</span><a class="text-cax-text-muted pr-1 hover:underline" href="/posts/${post.id}"><time datetime="${isoDate}">${dateStr}</time></a></p><div class="text-cax-text leading-relaxed">${text}</div></div></div></article>`;
    })
    .join("");

  return `<section>${items}</section>`;
}

// Generate post detail HTML from a single post
function generatePostHtml(post: any): string {
  const user = post.user || {};
  const name = escapeHtml(user.name || "");
  const username = escapeHtml(user.username || "");
  const text = escapeHtml(post.text || "");
  const profileImageId = user.profileImage?.id || "";
  const profileImageAlt = escapeHtml(user.profileImage?.alt || "");
  const createdAt = new Date(post.createdAt);
  const dateStr = new Intl.DateTimeFormat("ja", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(createdAt);
  const isoDate = createdAt.toISOString();

  return `<article class="px-1 sm:px-4"><div class="border-cax-border border-b px-2 pt-2 pb-4 sm:px-4"><div class="flex items-center gap-2 mb-2"><a class="border-cax-border bg-cax-surface-subtle block h-12 w-12 overflow-hidden rounded-full border hover:opacity-75 sm:h-16 sm:w-16" href="/users/${username}"><img alt="${profileImageAlt}" decoding="async" height="64" loading="lazy" src="/images/profiles/${profileImageId}.webp" width="64"></a><div><a class="text-cax-text font-bold hover:underline" href="/users/${username}">${name}</a><br><a class="text-cax-text-muted hover:underline" href="/users/${username}">@${username}</a></div></div><div class="text-cax-text leading-relaxed text-lg mb-2">${text}</div><div class="text-cax-text-muted"><time datetime="${isoDate}">${dateStr}</time></div></div></article>`;
}

// Generate terms page HTML (static content)
function generateTermsHtml(): string {
  return `<article class="px-2 pb-16 leading-relaxed md:px-4 md:pt-2"><h1 class="mt-4 mb-2 font-[Rei_no_Are_Mincho] text-3xl leading-[normal] font-bold">利用規約</h1><p>この利用規約（以下、「本規約」といいます。）は、株式会社&nbsp;架空の会社（以下、「当社」といいます。）がこのウェブサイト上で提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。</p><h2 class="mt-4 mb-2 font-[Rei_no_Are_Mincho] text-2xl leading-[normal] font-bold">第1条（適用）</h2><ol class="list-decimal pl-8"><li>本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li><li>当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li><li>本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。</li></ol><h2 class="mt-4 mb-2 font-[Rei_no_Are_Mincho] text-2xl leading-[normal] font-bold">第2条（利用登録）</h2><ol class="list-decimal pl-8"><li>本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこの承認を登録希望者に通知することによって、利用登録が完了するものとします。</li><li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。<ol class="list-decimal pl-8"><li>利用登録の申請に際して虚偽の事項を届け出た場合</li><li>本規約に違反したことがある者からの申請である場合</li><li>その他、当社が利用登録を相当でないと判断した場合</li></ol></li></ol><h2 class="mt-4 mb-2 font-[Rei_no_Are_Mincho] text-2xl leading-[normal] font-bold">第3条（ユーザーIDおよびパスワードの管理）</h2><ol class="list-decimal pl-8"><li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li><li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。当社は、ユーザーIDとパスワードの組み合わせが登録情報と一致してサインインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。</li><li>ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は、当社に故意又は重大な過失がある場合を除き、当社は一切の責任を負わないものとします。</li></ol></article>`;
}

// Catch-all handler for SPA routes — serves index.html with injected initial data
ssrRouter.get("/{*splat}", async (req, res, next) => {
  // Skip API routes and static assets
  const url = req.path;
  if (
    url.startsWith("/api/") ||
    url.startsWith("/fonts/") ||
    url.startsWith("/sprites/") ||
    url.startsWith("/upload/") ||
    url.startsWith("/assets/") ||
    url.includes(".")
  ) {
    return next();
  }

  try {
    const template = getHtmlTemplate();

    // Fetch the active user from session
    const initialData: InitialData = { me: null };
    if (req.session.userId != null) {
      const user = await User.findByPk(req.session.userId);
      if (user != null) {
        initialData.me = user.toJSON();
      }
    }

    // For the homepage, prefetch posts
    if (url === "/") {
      const posts = await Post.findAll({ limit: 10, offset: 0, order: [["createdAt", "DESC"]] });
      initialData.posts = posts.map((p) => p.toJSON());
    }

    // Generate page-specific content HTML
    let pageContent = "";
    const postMatch = url.match(/^\/posts\/([^/]+)$/);

    if (url === "/") {
      // Homepage: render timeline posts
      pageContent = generateTimelineHtml(initialData.posts || []);
    } else if (url === "/terms") {
      // Terms page: render static terms content
      pageContent = generateTermsHtml();
    } else if (postMatch) {
      // Post detail page: fetch and render the post
      const postId = postMatch[1];
      const post = await Post.findByPk(postId);
      if (post != null) {
        pageContent = generatePostHtml(post.toJSON());
      }
    }
    // For /search, /dm, /crok, /users, etc. - just render the shell with no page content

    // Wrap page content in the app shell (navigation + main area)
    const appHtml = wrapInAppShell(pageContent);

    // Inject initial data script before </head>
    const dataScript = `<script>window.__INITIAL_DATA__=${JSON.stringify(initialData).replace(/</g, "\\u003c")}</script>`;
    let html = template.replace("</head>", `${dataScript}\n</head>`);

    // Inject the SSR HTML into <div id="app">
    html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

    res.status(200).type("text/html").send(html);
  } catch (err) {
    next(err);
  }
});
