const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
  });
};

let navTicking = false;
const updateActiveNav = () => {
  navTicking = false;
  const probeY = window.innerHeight * 0.38;

  let activeSection = sections[0];
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= probeY && rect.bottom > probeY) {
      activeSection = section;
      break;
    }
    if (rect.top <= probeY) {
      activeSection = section;
    }
  }

  if (activeSection) {
    setActiveNav(activeSection.id);
  }
};

const requestNavUpdate = () => {
  if (navTicking) return;
  navTicking = true;
  window.requestAnimationFrame(updateActiveNav);
};

window.addEventListener("scroll", requestNavUpdate, { passive: true });
window.addEventListener("resize", requestNavUpdate);
updateActiveNav();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const fallbackImages = Array.from(document.querySelectorAll("img[data-fallback-srcs]"));

const probeImageSource = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }

    const test = new Image();
    test.onload = () => resolve(true);
    test.onerror = () => resolve(false);
    test.src = src;
  });

const resolveBestImageSource = async (img) => {
  const candidates = [img.getAttribute("src"), ...(img.dataset.fallbackSrcs || "").split("|")]
    .map((item) => item.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    // Try sources in order and stop at the first one that actually loads.
    // This avoids relying on a late error listener and works on both local file:// and GitHub Pages.
    // eslint-disable-next-line no-await-in-loop
    if (await probeImageSource(candidate)) {
      if (img.getAttribute("src") !== candidate) {
        img.src = candidate;
      }
      return;
    }
  }
};

fallbackImages.forEach((img) => {
  resolveBestImageSource(img);
});

const skillDrawButton = document.querySelector("#draw-skill");
const skillResultCard = document.querySelector("#skill-result-card");
const skillTitleFront = document.querySelector("#skill-title-front");
const skillTitleBack = document.querySelector("#skill-title-back");
const skillCopy = document.querySelector("#skill-copy");
const skillTags = document.querySelector("#skill-tags");
const skillPageCurrent = document.querySelector("#skill-page-current");
const skillPageTotal = document.querySelector("#skill-page-total");

const skillCards = [
  {
    title: "数据分析",
    keywords: ["SQL", "Excel", "指标分析", "业务诊断"],
    copy:
      "能够熟练使用 SQL、Excel 进行数据提取与分析，围绕 CTR、CVR、CPC、COPC 等核心指标拆解业务漏斗，定位问题根因，并输出数据驱动的运营优化方案。具备指标监控、异常排查及效果评估能力。",
  },
  {
    title: "用户调研",
    keywords: ["问卷", "访谈", "用户画像", "需求洞察"],
    copy:
      "具备完整的用户调研能力，能够独立设计问卷、开展用户访谈，结合定量与定性分析挖掘用户需求，输出用户画像、核心痛点及需求分析，为产品设计提供依据。",
  },
  {
    title: "需求全流程管理",
    keywords: ["需求分析", "优先级", "需求池", "版本迭代"],
    copy:
      "熟悉需求从收集、分析、评估、优先级管理到产品上线及效果跟踪的完整流程，能够搭建需求管理机制，推动跨部门协作，参与需求评审、方案设计、版本验收及上线推广，支撑产品持续迭代。",
  },
  {
    title: "AI产品应用能力",
    keywords: ["Prompt", "Agent", "知识库", "Codex"],
    copy:
      "熟练使用 ChatGPT、Claude、Codex 等 AI 工具完成需求分析、方案设计及产品验证；参与 AI 答疑机器人建设，通过知识库优化、Prompt 迭代及召回策略优化提升模型效果，并利用 Codex 完成 Demo 开发，实现 AI 赋能产品设计与运营。",
  },
  {
    title: "产品运营与增长",
    keywords: ["产品渗透", "增长运营", "商业化", "运营策略"],
    copy:
      "具备产品推广及增长运营经验，能够围绕产品渗透目标制定运营策略，跟踪开启率、覆盖率、消费等核心指标，联动业务团队推动产品渗透，并结合案例包装、宣传物料及活动策划提升产品认知与使用率。",
  },
  {
    title: "产品迭代与项目协同",
    keywords: ["产品方案", "跨团队协作", "版本管理"],
    copy:
      "能够结合业务场景拆解产品流程，参与产品需求评审、方案设计、测试验收及上线交付，协调产品、研发及业务团队推进项目落地，推动产品持续优化。",
  },
  {
    title: "产品宣导与知识运营",
    keywords: ["培训", "文档", "知识库", "运营赋能"],
    copy:
      "能够搭建产品知识体系，沉淀操作手册、FAQ 等标准化文档，通过培训、飞书卡片及案例集等形式开展产品宣导，提升产品认知、使用效率及用户自助解决问题能力。",
  },
  {
    title: "项目管理",
    keywords: ["项目推进", "跨部门协作", "结果交付"],
    copy:
      "具备项目推进经验，能够制定项目计划、协调多方资源，跟踪项目进度，推动需求落地及产品交付，保证项目按计划实施。",
  },
];

let activeSkillIndex = 0;
let skillIsFlipped = false;

const setSkillCard = (index) => {
  activeSkillIndex = index;
  const card = skillCards[activeSkillIndex];
  skillTitleFront.textContent = card.title;
  skillTitleBack.textContent = card.title;
  skillCopy.textContent = card.copy;
  if (skillPageCurrent) {
    skillPageCurrent.textContent = String(activeSkillIndex + 1).padStart(2, "0");
  }
  if (skillPageTotal) {
    skillPageTotal.textContent = String(skillCards.length).padStart(2, "0");
  }
  skillTags.replaceChildren(
    ...card.keywords.map((tag) => {
      const el = document.createElement("span");
      el.className = "tag";
      el.textContent = tag;
      return el;
    })
  );
};

setSkillCard(0);

skillDrawButton.addEventListener("click", () => {
  const nextIndex = Math.floor(Math.random() * skillCards.length);
  skillIsFlipped = false;
  skillResultCard.classList.remove("is-flipping");
  skillResultCard.classList.remove("is-flipped");
  skillResultCard.classList.remove("is-drawing");
  void skillResultCard.offsetWidth;
  setSkillCard(nextIndex);
  skillResultCard.classList.add("is-flipping");
  skillResultCard.classList.add("is-drawing");
  window.setTimeout(() => skillResultCard.classList.remove("is-flipping"), 500);
  window.setTimeout(() => skillResultCard.classList.remove("is-drawing"), 700);
});

skillResultCard.addEventListener("click", () => {
  skillIsFlipped = !skillIsFlipped;
  skillResultCard.classList.toggle("is-flipped", skillIsFlipped);
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const closeLightbox = document.querySelector(".lightbox-close");
const projectShots = Array.from(document.querySelectorAll(".project-shot"));
const contactTabs = Array.from(document.querySelectorAll(".contact-tab[data-contact-tab]"));
const contactBubbleWrap = document.querySelector(".contact-bubble-wrap");
const contactBubble = document.querySelector(".contact-bubble");
const contactBubbleValue = document.querySelector(".contact-bubble-value");

const contactInfo = {
  phone: {
    value: "15963395683",
    href: "tel:15963395683",
  },
  email: {
    value: "zmingxue1121@163.com",
    href: "mailto:zmingxue1121@163.com",
  },
};

const openLightbox = (src, alt) => {
  lightbox.hidden = false;
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  document.body.style.overflow = "hidden";
};

const hideLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
};

projectShots.forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    openLightbox(item.dataset.full || image.src, image.alt);
  });
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) hideLightbox();
});

closeLightbox.addEventListener("click", hideLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    hideLightbox();
  }
});

const activateContactTab = (tabName) => {
  const nextContact = contactInfo[tabName];
  const bubbleWrap = contactBubbleWrap || document.querySelector(".contact-bubble-wrap");

  contactTabs.forEach((tab) => {
    const isActive = tab.dataset.contactTab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  if (!contactBubble || !contactBubbleValue || !nextContact) {
    return;
  }

  if (bubbleWrap) {
    bubbleWrap.removeAttribute("hidden");
    bubbleWrap.style.display = "block";
  }

  contactBubble.classList.remove("is-popping");
  contactBubbleValue.textContent = nextContact.value;
  contactBubbleValue.href = nextContact.href;
  void contactBubble.offsetWidth;
  contactBubble.classList.add("is-popping");
  window.setTimeout(() => contactBubble.classList.remove("is-popping"), 320);
};

contactTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateContactTab(tab.dataset.contactTab);
  });
});
