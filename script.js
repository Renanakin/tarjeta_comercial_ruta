(function initQR() {
    const qrElement = document.getElementById("qr-canvas");
    if (!qrElement || typeof QRCode === "undefined") {
        return;
    }

    new QRCode(qrElement, {
        text: CONTACT.cardUrl,
        width: 68,
        height: 68,
        colorDark: "#143B1D",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.M
    });
})();

(function initCardFlip() {
    const card = document.getElementById("flipCard");
    const openCatalogButton = document.getElementById("seeCatalog");
    const backToFrontButton = document.getElementById("backToFront");
    const frontFace = document.querySelector(".vcard--front");
    const backFace = document.querySelector(".vcard--back");
    if (!card) {
        return;
    }
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchCandidate = false;
    let touchMoved = false;
    let suppressClickUntil = 0;

    function shouldIgnore(target) {
        return Boolean(target.closest("a, button, input, textarea, select, #qr-canvas"));
    }

    function syncFacesToTop() {
        card.querySelectorAll(".vcard").forEach(function (face) {
            face.scrollTop = 0;
        });
    }

    function setFlipState(isFlipped) {
        card.classList.toggle("is-flipped", isFlipped);
        card.setAttribute("data-flipped", String(isFlipped));
        if (frontFace && backFace) {
            frontFace.hidden = isFlipped;
            frontFace.setAttribute("aria-hidden", String(isFlipped));
            backFace.hidden = !isFlipped;
            backFace.setAttribute("aria-hidden", String(!isFlipped));
        }
        syncFacesToTop();
    }

    function toggleFlip() {
        setFlipState(!card.classList.contains("is-flipped"));
    }

    card.addEventListener("click", function (event) {
        if (Date.now() < suppressClickUntil) {
            return;
        }
        if (shouldIgnore(event.target)) {
            return;
        }
        toggleFlip();
    });

    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleFlip();
        }
    });

    card.addEventListener("touchstart", function (event) {
        if (shouldIgnore(event.target) || event.touches.length !== 1) {
            touchCandidate = false;
            return;
        }
        touchCandidate = true;
        touchMoved = false;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchStartTime = Date.now();
    }, { passive: true });

    card.addEventListener("touchmove", function (event) {
        if (!touchCandidate || event.touches.length !== 1) {
            return;
        }

        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);

        if (deltaX > 12 || deltaY > 12) {
            touchMoved = true;
        }
    }, { passive: true });

    card.addEventListener("touchend", function (event) {
        if (!touchCandidate || !event.changedTouches.length) {
            touchCandidate = false;
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        const duration = Date.now() - touchStartTime;
        const isTap = !touchMoved && deltaX < 12 && deltaY < 12 && duration < 260;

        touchCandidate = false;

        if (isTap) {
            suppressClickUntil = Date.now() + 450;
            toggleFlip();
        }
    }, { passive: true });

    if (openCatalogButton) {
        openCatalogButton.addEventListener("click", function (event) {
            event.stopPropagation();
            setFlipState(true);
        });
    }

    if (backToFrontButton) {
        backToFrontButton.addEventListener("click", function (event) {
            event.stopPropagation();
            setFlipState(false);
        });
    }

    setFlipState(card.classList.contains("is-flipped"));
})();

(function initProductImageFallback() {
    const productImages = document.querySelectorAll(".product__img");
    productImages.forEach(function (image) {
        image.addEventListener("error", function () {
            const fallback = image.getAttribute("data-fallback") || "IMG";
            const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23e2c88e'/><stop offset='1' stop-color='%232f6d3c'/></linearGradient></defs><rect width='64' height='64' rx='10' fill='url(%23g)'/><text x='32' y='38' text-anchor='middle' font-size='18' font-family='Arial, sans-serif' font-weight='700' fill='%23143B1D'>" + fallback + "</text></svg>";
            image.classList.add("is-missing");
            image.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
            image.setAttribute("alt", "Imagen pendiente");
        });
    });
})();

