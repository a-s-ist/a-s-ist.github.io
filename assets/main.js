(() => {
  const toc = document.querySelector("[data-toc]");
  if (!toc) return;

  const toggle = toc.querySelector(".toc-toggle");
  const links = toc.querySelectorAll(".toc-links a");
  if (!toggle) return;

  const setOpen = (open) => {
    toc.dataset.open = open ? "true" : "false";
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toc.dataset.open === "true";
    setOpen(!isOpen);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
})();
