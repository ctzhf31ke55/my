function addFooter() {
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#f0f0f0';
  footer.style.padding = '10px 20px';
  footer.style.textAlign = 'center';
  footer.style.position = 'fixed';
  footer.style.width = '100%';
  footer.style.bottom = '0';
  footer.style.boxShadow = '0 -2px 4px rgba(0, 0, 0, 0.1)';
  footer.innerHTML = `
      <p style="font-size: 14px; color: #333; margin: 0;">&copy; 2024 MyWebsite. All Rights Reserved.</p>
  `;
  document.body.appendChild(footer);
}

addFooter();
