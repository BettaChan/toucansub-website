const feedbackForm = document.querySelector('.feedback-form');

if (feedbackForm) {
  const message = feedbackForm.elements.message;
  const button = feedbackForm.querySelector('button[type="submit"]');
  const status = feedbackForm.querySelector('.feedback-status');

  function showStatus(state) {
    status.dataset.state = state;
    status.textContent = feedbackForm.dataset[state];
  }

  message.addEventListener('input', () => message.setCustomValidity(''));
  feedbackForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    if (!message.value.trim()) {
      message.setCustomValidity(feedbackForm.dataset.empty);
      message.reportValidity();
      return;
    }

    const data = new FormData(feedbackForm);
    data.set('message', message.value.trim());
    if (!data.get('email')) data.delete('email');
    button.disabled = true;
    showStatus('sending');
    try {
      const response = await fetch(feedbackForm.action, {
        method: 'POST',
        body: data,
        headers: {Accept: 'application/json'},
      });
      const result = await response.json();
      if (!response.ok || result?.ok !== true) {
        showStatus('error');
        return;
      }
      feedbackForm.reset();
      showStatus('success');
    } catch {
      showStatus('error');
    } finally {
      button.disabled = false;
    }
  });
}
