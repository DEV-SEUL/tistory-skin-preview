const frame = document.getElementById("previewFrame");
const buttons = document.querySelectorAll("[data-mode]");

let currentMode = "home";

const dummy = {
  blog_link: "#",
  page_title: "ヒカリナツ",
  notice_rep_desc: "공지사항 영역입니다. 티스토리 공지 치환자 미리보기입니다.",
  article_rep_date: "2026.06.10",
  article_rep_category: "diary",
  article_rep_link: "#",
  article_rep_title: "비밀글 미리보기 제목",
  article_rep_desc: "이 글은 비밀번호로 보호되어 있습니다.",
  article_rep_rp_cnt: "12",
  article_rep_comment_cnt: "3",
  recent_rep_link: "#",
  recent_rep_title: "최근 게시글 제목",
  sidebar_content: "Category / Archive / Link",
  search_name: "search",
  search_text: "",
  search_onclick_submit: "return false;",
  article_date: "2026.06.10",
  article_category: "diary",
  article_title: "글 상세 미리보기 제목",
  article_content: `
    <p>이곳은 글 본문 영역입니다.</p>
    <p>티스토리 본문 치환자가 실제 게시글처럼 보이는지 확인하기 위한 더미 텍스트입니다.</p>
  `,
  tag_link: "#",
  tag_name: "TRPG",
  article_prev_link: "#",
  article_prev_title: "이전 글 제목",
  article_next_link: "#",
  article_next_title: "다음 글 제목",
  rp_count: "3",
  rp_name: "guest",
  rp_date: "2026.06.10",
  rp_content: "댓글 미리보기입니다.",
  rp_name_input: "name",
  rp_password_input: "password",
  rp_content_input: "comment",
  rp_onclick_submit: "#",
  article_protected_title: "비밀글 미리보기",
  article_password_name: "password",
  article_password_onclick_submit: "return false;"
};

function replaceTokens(html) {
  return html.replace(/\[##_([a-zA-Z0-9_]+)_##\]/g, (_, key) => {
    return dummy[key] ?? "";
  });
}

function stripBlocks(html, mode) {
  if (mode === "home") {
    html = html.replace(/<s_article>[\s\S]*?<\/s_article>/g, "");
    html = html.replace(/<s_article_protected>[\s\S]*?<\/s_article_protected>/g, "");
  }

  if (mode === "article") {
    html = html.replace(/<s_article_rep>[\s\S]*?<\/s_article_rep>/g, "");
    html = html.replace(/<s_article_protected>[\s\S]*?<\/s_article_protected>/g, "");
    html = html.replace(/<s_notice>[\s\S]*?<\/s_notice>/g, "");
  }

  if (mode === "protected") {
    html = html.replace(/<s_article_rep>[\s\S]*?<\/s_article_rep>/g, "");
    html = html.replace(/<s_article>[\s\S]*?<\/s_article>/g, "");
    html = html.replace(/<s_notice>[\s\S]*?<\/s_notice>/g, "");
  }

  return html
    .replace(/<\/?s_[a-zA-Z0-9_]+>/g, "")
    .replace(/<\/?s_[a-zA-Z0-9_]+ [^>]*>/g, "");
}

async function loadPreview(mode = "home") {
  currentMode = mode;

  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });

  const [skinHtml, styleCss, scriptJs] = await Promise.all([
    fetch("./skins/serin/skin.html").then((res) => res.text()),
    fetch("./skins/serin/style.css").then((res) => res.text()),
    fetch("./skins/serin/script.js").then((res) => res.text())
  ]);

  let html = skinHtml;

  html = stripBlocks(html, mode);
  html = replaceTokens(html);

  html = html.replace(
    /<link rel="stylesheet" href="\.\/style\.css" \/>/,
    `<style>${styleCss}</style>`
  );

  html = html.replace(
    /<script src="\.\/script\.js"><\/script>/,
    `<script>${scriptJs}<\/script>`
  );

  html = html.replaceAll("./assets/", "./skins/serin/assets/");

  frame.srcdoc = html;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    loadPreview(button.dataset.mode);
  });
});

loadPreview(currentMode);
