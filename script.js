document.addEventListener('DOMContentLoaded', () => {
	const header = document.querySelector('header');
	const nav = document.querySelector('header nav');

	if (!nav || !header) return; // सुरक्षित-चेक

	// Create a mobile menu toggle button if it doesn't exist
	let toggle = document.querySelector('.menu-toggle');
	if (!toggle) {
		toggle = document.createElement('button');
		toggle.className = 'menu-toggle';
		toggle.setAttribute('aria-label', 'Toggle menu');
		// use Font Awesome icon if available
		toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
		// minimal inline styles so it's visible without extra CSS
		toggle.style.cssText = 'background:none;border:none;color:#b74b4b;font-size:2.4rem;cursor:pointer;margin-right:1rem;';
		// insert toggle before the nav so it sits near the header
		header.insertBefore(toggle, nav);
	}

	// show/hide toggle based on window width (match CSS breakpoint ~995px)
	function updateToggleVisibility() {
		if (window.innerWidth <= 995) toggle.style.display = 'block';
		else toggle.style.display = 'none';
	}
	updateToggleVisibility();
	window.addEventListener('resize', updateToggleVisibility);

	// Toggle nav open/close
	toggle.addEventListener('click', (e) => {
		e.stopPropagation();
		nav.classList.toggle('active');
		toggle.classList.toggle('open');
		document.body.classList.toggle('no-scroll');
	});

	// Close nav when clicking outside
	document.addEventListener('click', (e) => {
		if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
			nav.classList.remove('active');
			toggle.classList.remove('open');
			document.body.classList.remove('no-scroll');
		}
	});

	// Smooth scroll for internal anchors and close mobile nav on link click
	const navLinks = nav.querySelectorAll('a[href]');
	navLinks.forEach((link) => {
		link.addEventListener('click', (e) => {
			const href = link.getAttribute('href');
			// only smooth-scroll for same-page anchors like #about
			if (href && href.startsWith('#') && href.length > 1) {
				e.preventDefault();
				const target = document.querySelector(href);
				if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}

			// close mobile nav after click
			if (nav.classList.contains('active')) {
				nav.classList.remove('active');
				toggle.classList.remove('open');
				document.body.classList.remove('no-scroll');
			}
		});
	});

	// Highlight active nav link based on visible sections (if sections have ids)
	const sections = document.querySelectorAll('section[id]');
	if ('IntersectionObserver' in window && sections.length) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id;
					const activeLink = nav.querySelector(`a[href="#${id}"]`);
					if (entry.isIntersecting) {
						navLinks.forEach((a) => a.classList.remove('active'));
						if (activeLink) activeLink.classList.add('active');
					}
				});
			},
			{ threshold: 0.45 }
		);
		sections.forEach((s) => observer.observe(s));
	}

	// Contact form frontend validation (only attach if the expected fields exist)
	const contactForm = document.getElementById('contact-form') || document.querySelector('form[data-contact]') || (window.location.pathname.includes('contact') ? document.querySelector('form') : null);
	if (contactForm) {
		const nameEl = contactForm.querySelector('input[name="name"], input#name');
		const emailEl = contactForm.querySelector('input[name="email"], input#email');
		const msgEl = contactForm.querySelector('textarea[name="message"], textarea#message');

		function clearErrors() {
			contactForm.querySelectorAll('.error-msg').forEach((el) => el.remove());
		}

		function showError(el, message) {
			clearErrors();
			const err = document.createElement('div');
			err.className = 'error-msg';
			err.style.cssText = 'color:#ff6b6b;margin-top:.4rem;font-size:1.3rem;';
			err.textContent = message;
			el.insertAdjacentElement('afterend', err);
		}

		function isEmailValid(email) {
			// simple regex for basic validation
			return /^\S+@\S+\.\S+$/.test(email);
		}

		contactForm.addEventListener('submit', (e) => {
			clearErrors();
			let valid = true;

			if (nameEl) {
				if (!nameEl.value.trim()) {
					showError(nameEl, 'कृपया अपना नाम दें');
					valid = false;
				}
			}

			if (emailEl) {
				if (!emailEl.value.trim()) {
					showError(emailEl, 'कृपया ईमेल लिखें');
					valid = false;
				} else if (!isEmailValid(emailEl.value.trim())) {
					showError(emailEl, 'कृपया वैध ईमेल एड्रेस दें');
					valid = false;
				}
			}

			if (msgEl) {
				if (!msgEl.value.trim() || msgEl.value.trim().length < 10) {
					showError(msgEl, 'संदेश कम से कम 10 अक्षरों का होना चाहिए');
					valid = false;
				}
			}

			if (!valid) {
				e.preventDefault();
				// focus first invalid field
				const firstError = contactForm.querySelector('.error-msg');
				if (firstError) firstError.previousElementSibling.focus();
				return;
			}

			
			const submitBtn = contactForm.querySelector('button[type="submit"]');
			if (submitBtn) {
				submitBtn.disabled = true;
				const prevText = submitBtn.textContent;
				submitBtn.textContent = 'Sending...';
				setTimeout(() => {
					submitBtn.disabled = false;
					submitBtn.textContent = prevText;
				}, 2000);
			}
		});
	}
});

(function addNoScrollStyle() {
	if (document.getElementById('no-scroll-style')) return;
	const style = document.createElement('style');
	style.id = 'no-scroll-style';
	style.textContent = `
		body.no-scroll{ overflow: hidden; }
		.menu-toggle{ background: transparent; }
		.error-msg{ display:block; }
	`;
	document.head.appendChild(style);
})();
