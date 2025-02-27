import "./style.css";

document.addEventListener('DOMContentLoaded', () => {
  // Get references to buttons
  const getStartedBtn = document.getElementById('getStartedBtn') as HTMLButtonElement;
  const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;

  // Add animations
  const card = document.querySelector('.welcome-card') as HTMLElement;
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';

  // Trigger entrance animation after a short delay
  setTimeout(() => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 100);

  // Button event handlers
  getStartedBtn.addEventListener('click', () => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px)';
    window.close();
  });

  closeBtn.addEventListener('click', () => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
      console.log('Closing welcome screen...');
      // Hide or remove the welcome container
      const container = document.querySelector('.welcome-container') as HTMLElement;
      if (container) container.style.display = 'none';
    }, 500);
  });

  // Optional: Add subtle hover effects to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-1px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });
});