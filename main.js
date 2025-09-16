// Wrap whole script in try/catch so any error is visible on page
(function () {
  try {
    const form = document.getElementById('ageForm');
    const dayInput = document.getElementById('day');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const errorEl = document.getElementById('error');
    const statusEl = document.getElementById('status');
    const resultBlock = document.getElementById('resultBlock');
    const yEl = document.getElementById('years');
    const mEl = document.getElementById('months');
    const dEl = document.getElementById('days');

    function setStatus(msg) {
      statusEl.textContent = 'Status: ' + msg;
      console.log('[AgeCalculator] ' + msg);
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
      resultBlock.classList.add('hidden');
      setStatus('error → ' + msg);
    }

    function hideError() {
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
    }

    function resetInputStyles() {
      [dayInput, monthInput, yearInput].forEach(i => i.classList.remove('invalid'));
    }

    // Validation helper: ensures numeric, in-range, and real date (no auto-correction)
    function validateAndBuildDate(day, month, year) {
      if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
        showError('Please enter numeric values for day, month and year.');
        return null;
      }

      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        showError('Year must be between 1900 and ' + currentYear + '.');
        yearInput.classList.add('invalid');
        return null;
      }

      if (month < 1 || month > 12) {
        showError('Month must be between 1 and 12.');
        monthInput.classList.add('invalid');
        return null;
      }

      // Build date and check the components match (avoid JS auto-normalization)
      const candidate = new Date(year, month - 1, day, 12, 0, 0, 0); // midday reduces timezone edge-cases
      if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
        showError('Invalid day for the selected month/year. For example, February 30 is invalid.');
        dayInput.classList.add('invalid');
        return null;
      }

      // Prevent future date
      const today = new Date();
      // compare only date part
      const candMidnight = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (candMidnight > todayMidnight) {
        showError('Date of birth cannot be in the future.');
        [dayInput, monthInput, yearInput].forEach(i => i.classList.add('invalid'));
        return null;
      }

      hideError();
      return candidate;
    }

    function computeAge(birthDate) {
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        // days in previous month relative to today
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      return { years, months, days };
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      try {
        resetInputStyles();
        setStatus('submit pressed');

        const day = Number(dayInput.value);
        const month = Number(monthInput.value);
        const year = Number(yearInput.value);

        // quick empty check
        if (!dayInput.value || !monthInput.value || !yearInput.value) {
          showError('Please fill all fields (day, month, year).');
          return;
        }

        setStatus(`parsed inputs -> day:${day} month:${month} year:${year}`);

        const birthDate = validateAndBuildDate(day, month, year);
        if (!birthDate) {
          // validate shows error
          return;
        }

        setStatus('valid date -> calculating age');
        const age = computeAge(birthDate);

        // display
        yEl.textContent = age.years;
        mEl.textContent = age.months;
        dEl.textContent = age.days;
        resultBlock.classList.remove('hidden');
        setStatus('calculation successful');
      } catch (innerErr) {
        console.error('Submission handler error:', innerErr);
        showError('Unexpected error. See console for details.');
      }
    });

    // Remove error when user types and hide result only if inputs incomplete
    [dayInput, monthInput, yearInput].forEach(input => {
      input.addEventListener('input', function () {
        this.classList.remove('invalid');
        hideError();
        if (!dayInput.value || !monthInput.value || !yearInput.value) {
          resultBlock.classList.add('hidden');
        }
      });
    });

    // initial status
    setStatus('script loaded—ready');
  } catch (err) {
    // show any startup error on page
    document.body.insertAdjacentHTML('afterbegin', '<pre style="color:#fff;background:#b71c1c;padding:8px;margin:8px;border-radius:6px;">Startup error: ' + (err && err.message ? err.message : String(err)) + '</pre>');
    console.error('Startup error', err);
  }
})();

