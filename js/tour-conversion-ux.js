(function () {
  var whatsappNumber = "27670127776";
  var reviewUrl = "https://g.page/r/CRyeNopih97yEAE/review";
  var cards = document.querySelectorAll(".tourmaster-tour-grid");

  if (!cards.length) {
    return;
  }

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function getTourName(card) {
    var title = card.querySelector(".tourmaster-tour-title a, .tourmaster-tour-title");
    return normalizeText(title ? title.textContent : "") || "this tour";
  }

  function getDataPoints(card, attrName) {
    var raw = normalizeText(card.getAttribute(attrName));
    var points;
    var cleaned = [];
    var i;

    if (!raw) {
      return cleaned;
    }

    if (raw.indexOf("|") !== -1) {
      points = raw.split("|");
    } else if (raw.indexOf("•") !== -1) {
      points = raw.split("•");
    } else {
      points = [raw];
    }

    points = points
      .map(function (item) {
        return normalizeText(item);
      })
      .filter(Boolean);

    for (i = 0; i < points.length; i += 1) {
      if (cleaned.indexOf(points[i]) === -1) {
        cleaned.push(points[i]);
      }
    }

    return cleaned;
  }

  function removeBookingInfoRibbons(card) {
    var ribbons = card.querySelectorAll(
      ".tourmaster-thumbnail-ribbon, .tourmaster-thumbnail-ribbon-corner, .tourmaster-thumbnail-ribbon-cornor"
    );
    var i;

    for (i = 0; i < ribbons.length; i += 1) {
      ribbons[i].remove();
    }
  }

  function getBookUrl(card) {
    var buttonLink = card.querySelector(".tourmaster-book-now-button a[href]");
    var titleBookingLink = card.querySelector(
      '.tourmaster-tour-title a[href*="secure.activitybridge.com"]'
    );
    var href = "";

    if (buttonLink) {
      href = normalizeText(buttonLink.getAttribute("href"));
      if (href && href !== "#" && href.indexOf("javascript:") !== 0) {
        return href;
      }
    }

    if (titleBookingLink) {
      href = normalizeText(titleBookingLink.getAttribute("href"));
      if (href && href !== "#" && href.indexOf("javascript:") !== 0) {
        return href;
      }
    }

    return "";
  }

  function createDetailBlock(titleText, items, modifierClass, iconClass) {
    var block = document.createElement("div");
    var title = document.createElement("span");
    var list = document.createElement("ul");
    var i;

    block.className = "sl-tour-detail-block " + modifierClass;
    title.className = "sl-tour-detail-title";
    title.innerHTML = '<i class="' + iconClass + '"></i>' + titleText;

    for (i = 0; i < items.length; i += 1) {
      var li = document.createElement("li");
      li.textContent = items[i];
      list.appendChild(li);
    }

    block.appendChild(title);
    block.appendChild(list);

    return block;
  }

  function addTripadvisorAndDetails(content, includes, excludes) {
    var infoWrap = content.querySelector(".tourmaster-tour-info-wrap");
    var highlightsBlock;
    var detailsWrap;
    var note;

    if (!infoWrap) {
      return;
    }

    if (!infoWrap.querySelector(".sl-tour-tripadvisor")) {
      note = document.createElement("div");
      note.className = "tourmaster-tour-info tourmaster-tour-info-duration-text sl-tour-tripadvisor";
      note.innerHTML = '<i class="fa fa-star"></i>Trusted by TripAdvisor travelers';
      infoWrap.insertBefore(note, infoWrap.firstElementChild || null);
    }

    if (!includes.length && !excludes.length) {
      return;
    }

    if (infoWrap.querySelector(".sl-tour-include-exclude")) {
      return;
    }

    detailsWrap = document.createElement("div");
    detailsWrap.className = "sl-tour-include-exclude";

    if (includes.length) {
      detailsWrap.appendChild(
        createDetailBlock("Included", includes, "sl-tour-detail-include", "fa fa-check-circle")
      );
    }

    if (excludes.length) {
      detailsWrap.appendChild(
        createDetailBlock("Excluded", excludes, "sl-tour-detail-exclude", "fa fa-times-circle")
      );
    }

    highlightsBlock = infoWrap.querySelector(".tourmaster-tour-info-departure-location");
    if (highlightsBlock) {
      highlightsBlock.insertAdjacentElement("afterend", detailsWrap);
    } else {
      infoWrap.appendChild(detailsWrap);
    }
  }

  function makeListItem(iconClass, text) {
    var li = document.createElement("li");
    var icon = document.createElement("i");
    var label = document.createElement("span");

    icon.className = iconClass;
    label.textContent = text;

    li.appendChild(icon);
    li.appendChild(label);

    return li;
  }

  function buildWhatsappUrl(tourName) {
    var message =
      "Hello SL Tours, I would like to reserve " +
      tourName +
      ". Please share the next available date, what is included, and pickup details.";

    return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  function normalizeBookButtonText(card) {
    var bookButtons = card.querySelectorAll(".tourmaster-book-now-button a");
    var i;

    for (i = 0; i < bookButtons.length; i += 1) {
      var buttonText = normalizeText(bookButtons[i].textContent).toLowerCase();
      if (buttonText === "click here") {
        bookButtons[i].textContent = "Book Online";
      }
    }
  }

  Array.prototype.forEach.call(cards, function (card) {
    var content;
    var existingPanel;
    var panel;
    var title;
    var list;
    var actions;
    var reserveLink;
    var reviewLink;
    var target;
    var tourName;
    var includes;
    var excludes;
    var compact;
    var bookUrl;
    var bookLink;
    var bookButtonWrap;
    var legacyAnchor;
    var legacyButton;
    var requestButton;

    content = card.querySelector(".tourmaster-tour-content-wrap");
    if (!content) {
      return;
    }

    existingPanel = card.querySelector(".sl-confidence-panel");
    bookButtonWrap = content.querySelector(".tourmaster-book-now-button");
    legacyAnchor = bookButtonWrap ? bookButtonWrap.querySelector("a[href]") : null;
    legacyButton = bookButtonWrap ? bookButtonWrap.querySelector("button") : null;

    normalizeBookButtonText(card);
    removeBookingInfoRibbons(card);

    tourName = getTourName(card);
    includes = getDataPoints(card, "data-includes");
    excludes = getDataPoints(card, "data-excludes");
    compact = Boolean(card.closest("#div_29f0_18"));
    bookUrl = getBookUrl(card);

    addTripadvisorAndDetails(content, includes, excludes);

    if (existingPanel) {
      if (bookButtonWrap && (bookUrl || legacyButton || legacyAnchor)) {
        bookButtonWrap.remove();
      }
      return;
    }

    panel = document.createElement("div");
    panel.className = "sl-confidence-panel" + (compact ? " sl-confidence-panel-compact" : "");

    title = document.createElement("p");
    title.className = "sl-confidence-title";
    title.innerHTML = '<i class="fa fa-shield"></i>Book With Confidence';

    list = document.createElement("ul");
    list.className = "sl-confidence-list";
    list.appendChild(
      makeListItem("fa fa-star", "Trusted by TripAdvisor and Google travelers")
    );
    list.appendChild(
      makeListItem(
        "fa fa-check-circle",
        "Professional guides, safe vehicles, and reliable support from pickup to drop-off"
      )
    );
    list.appendChild(
      makeListItem(
        "fa fa-calendar",
        "Next departures this week with live WhatsApp confirmation"
      )
    );

    actions = document.createElement("div");
    actions.className = "sl-confidence-actions";

    if (bookUrl) {
      bookLink = document.createElement("a");
      bookLink.className = "sl-confidence-book";
      bookLink.href = bookUrl;
      bookLink.target = "_blank";
      bookLink.rel = "noopener noreferrer";
      bookLink.textContent = "Book Now";
      actions.appendChild(bookLink);
    } else if (legacyButton) {
      requestButton = document.createElement("button");
      requestButton.type = "button";
      requestButton.className = "sl-confidence-book";
      requestButton.textContent = normalizeText(legacyButton.textContent) || "Request Rates";
      if (legacyButton.getAttribute("onclick")) {
        requestButton.setAttribute("onclick", legacyButton.getAttribute("onclick"));
      }
      actions.appendChild(requestButton);
    } else if (legacyAnchor) {
      bookLink = document.createElement("a");
      bookLink.className = "sl-confidence-book";
      bookLink.href = normalizeText(legacyAnchor.getAttribute("href")) || "#";
      if (legacyAnchor.getAttribute("target")) {
        bookLink.target = legacyAnchor.getAttribute("target");
      }
      if (legacyAnchor.getAttribute("rel")) {
        bookLink.rel = legacyAnchor.getAttribute("rel");
      }
      if (legacyAnchor.getAttribute("onclick")) {
        bookLink.setAttribute("onclick", legacyAnchor.getAttribute("onclick"));
      }
      bookLink.textContent = normalizeText(legacyAnchor.textContent) || "Book Now";
      actions.appendChild(bookLink);
    }

    reserveLink = document.createElement("a");
    reserveLink.className = "sl-confidence-whatsapp";
    reserveLink.href = buildWhatsappUrl(tourName);
    reserveLink.target = "_blank";
    reserveLink.rel = "noopener noreferrer";
    reserveLink.textContent = "Reserve on WhatsApp";

    reviewLink = document.createElement("a");
    reviewLink.className = "sl-confidence-review";
    reviewLink.href = reviewUrl;
    reviewLink.target = "_blank";
    reviewLink.rel = "noopener noreferrer";
    reviewLink.textContent = "Read Reviews";

    actions.appendChild(reserveLink);
    actions.appendChild(reviewLink);

    panel.appendChild(title);
    panel.appendChild(list);
    panel.appendChild(actions);

    target = bookButtonWrap;
    if (target) {
      target.insertAdjacentElement("afterend", panel);
    } else {
      content.appendChild(panel);
    }

    if (bookButtonWrap && (bookUrl || legacyButton || legacyAnchor)) {
      bookButtonWrap.remove();
    }
  });
})();
