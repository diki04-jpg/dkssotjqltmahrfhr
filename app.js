const grid = document.querySelector("#serviceGrid");
const search = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const resetButton = document.querySelector("#resetButton");
let services = [];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function render() {
  const keyword = search.value.trim().toLocaleLowerCase("ko");
  const category = categorySelect.value;
  const visible = services.filter((item) => {
    const nameMatch = String(item["서비스명"] || "").toLocaleLowerCase("ko").includes(keyword);
    return nameMatch && (!category || item["안내분야"] === category);
  });
  resultCount.innerHTML = `<strong>${visible.length}</strong>건 <span> / 전체 ${services.length}건</span>`;
  grid.innerHTML = visible.map((item) => {
    const online = item["온라인안내"] === "가능";
    return `<article class="service-card">
      <div class="card-top"><span class="category">${escapeHtml(item["안내분야"])}</span><span class="service-id">${escapeHtml(item["서비스ID"])}</span></div>
      <h3>${escapeHtml(item["서비스명"])}</h3>
      <div class="card-meta"><span>소관기관</span><span class="agency" title="${escapeHtml(item["소관기관"])}">${escapeHtml(item["소관기관"])}</span></div>
      <div class="meta-bottom"><span class="online ${online ? "" : "offline"}">온라인 안내 ${online ? "가능" : "불가"}</span><a class="phone" href="tel:${escapeHtml(item["콜센터"])}"><span class="phone-label">콜센터</span>${escapeHtml(item["콜센터"])}</a></div>
    </article>`;
  }).join("");
  emptyState.hidden = visible.length > 0;
  grid.hidden = visible.length === 0;
}

fetch("services.json").then((response) => {
  if (!response.ok) throw new Error("목록을 불러오지 못했습니다.");
  return response.json();
}).then((data) => {
  services = data;
  const categories = [...new Set(services.map((item) => item["안내분야"]))].sort((a, b) => a.localeCompare(b, "ko"));
  categorySelect.insertAdjacentHTML("beforeend", categories.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join(""));
  render();
}).catch(() => {
  resultCount.textContent = "목록을 불러오지 못했습니다.";
  emptyState.hidden = false;
  emptyState.querySelector("strong").textContent = "서비스 목록을 불러오지 못했습니다.";
  emptyState.querySelector("p").textContent = "잠시 후 다시 열어 주세요.";
});

search.addEventListener("input", render);
categorySelect.addEventListener("change", render);
resetButton.addEventListener("click", () => { search.value = ""; categorySelect.value = ""; render(); search.focus(); });
document.addEventListener("keydown", (event) => { if (event.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); } });
