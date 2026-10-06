// ---------- Element references ----------
const card         = document.getElementById("card");
const pointerLight = document.getElementById("pointerLight");
const otp          = document.getElementById("otp");
const boxes        = [...document.querySelectorAll(".otp-box")];
const ringProgress = document.getElementById("ringProgress");
const percentEl    = document.getElementById("percent");
const particlesEl  = document.getElementById("particles");
const resendBtn    = document.getElementById("resendBtn");

const CIRCUMFERENCE   = 2 * Math.PI * 44;   // matches r="44" in the SVG
const VERIFY_DURATION = 2200;               // ms for 0 -> 100
const PARTICLE_COUNT  = 26;
const PARTICLE_COLORS = ["#7c6fd6", "#22c58b", "#f6c453", "#ff8fa3", "#6ec8ff", "#b9a8ff"];

let busy = false; // blocks input while verifying / success


// ---------- 1. Pointer light follows the cursor ----------
window.addEventListener("pointermove", (e) => {
    pointerLight.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});


// ---------- 2. OTP input behaviour ----------
function setState(state) {
    card.dataset.state = state;
}

function getCode() {
    return boxes.map((b) => b.value).join("");
}

boxes.forEach((box, i) => {

    // typing a digit
    box.addEventListener("input", () => {
        box.value = box.value.replace(/\D/g, "").slice(-1);   // digits only

        box.classList.toggle("filled", box.value !== "");

        if (box.value) {
            box.classList.remove("pop");
            void box.offsetWidth;                // restart the animation
            box.classList.add("pop");

            if (i < boxes.length - 1) boxes[i + 1].focus();
        }

        if (getCode().length === boxes.length) startVerifying();
    });

    // backspace + arrow keys
    box.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !box.value && i > 0) {
            boxes[i - 1].value = "";
            boxes[i - 1].classList.remove("filled");
            boxes[i - 1].focus();
        }
        if (e.key === "ArrowLeft"  && i > 0)                 boxes[i - 1].focus();
        if (e.key === "ArrowRight" && i < boxes.length - 1)  boxes[i + 1].focus();
    });

    // paste a full code into any box
    box.addEventListener("paste", (e) => {
        e.preventDefault();
        const digits = (e.clipboardData.getData("text") || "")
            .replace(/\D/g, "")
            .slice(0, boxes.length);
        if (!digits) return;

        digits.split("").forEach((d, idx) => {
            boxes[idx].value = d;
            boxes[idx].classList.add("filled");
        });
        boxes[Math.min(digits.length, boxes.length - 1)].focus();

        if (digits.length === boxes.length) startVerifying();
    });
});


// ---------- 3. Verifying (0 -> 100 counter + ring) ----------
function startVerifying() {
    if (busy) return;
    busy = true;
    boxes.forEach((b) => b.blur());

    setState("verifying");
    ringProgress.style.strokeDashoffset = CIRCUMFERENCE;
    percentEl.textContent = "0";

    const start = performance.now();

    function tick(now) {
        const t     = Math.min((now - start) / VERIFY_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 2.2);              // ease-out

        const value = Math.round(eased * 100);
        percentEl.textContent = value;
        ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - eased);

        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(showSuccess, 350);
        }
    }

    // small delay so the "Verifying..." view is visible before counting
    setTimeout(() => requestAnimationFrame(tick), 300);
}


// ---------- 4. Success + particle burst ----------
function showSuccess() {
    setState("success");
    setTimeout(burstParticles, 450);
}

function burstParticles() {
    particlesEl.innerHTML = "";

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement("span");
        p.className = "particle";

        const angle    = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
        const distance = 70 + Math.random() * 70;

        p.style.setProperty("--x",   `${Math.cos(angle) * distance}px`);
        p.style.setProperty("--y",   `${Math.sin(angle) * distance}px`);
        p.style.setProperty("--s",   `${4 + Math.random() * 7}px`);
        p.style.setProperty("--c",   PARTICLE_COLORS[i % PARTICLE_COLORS.length]);
        p.style.setProperty("--r",   Math.random() > 0.5 ? "50%" : "2px");
        p.style.setProperty("--rot", `${Math.random() * 360}deg`);
        p.style.setProperty("--d",   `${Math.random() * 0.15}s`);

        particlesEl.appendChild(p);
    }
}


// ---------- 5. Resend / reset ----------
function resetForm() {
    boxes.forEach((b) => {
        b.value = "";
        b.classList.remove("filled", "pop");
    });
    otp.classList.remove("shake");
    void otp.offsetWidth;
    otp.classList.add("shake");
    boxes[0].focus();
}

resendBtn.addEventListener("click", () => {
    if (busy) return;
    resetForm();
});

// Optional: click success card to run the demo again
card.addEventListener("dblclick", () => {
    if (card.dataset.state !== "success") return;
    busy = false;
    particlesEl.innerHTML = "";
    setState("input");
    boxes.forEach((b) => { b.value = ""; b.classList.remove("filled"); });
    boxes[0].focus();
});

// focus the first box on load
window.addEventListener("load", () => boxes[0].focus());
