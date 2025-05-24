export function addHeader() {
  // Проверяем, если header уже существует – не добавляем повторно
  if (document.getElementById('header').childElementCount > 0) return;

  const header = document.createElement('header');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '10px 20px';
  header.style.backgroundColor = '#fff';
  header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

  // Здесь ссылки на изображения удалены, чтобы избежать ошибок 404
  header.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="font-size: 20px; font-weight: bold; color: #333;">MyWebsite</span>
      <nav style="margin-left: 30px;">
        <ul style="display: flex; list-style: none; margin: 0; padding: 0;">
          <li><a href="trade.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">Trade</a></li>
          <li><a href="buy.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">Buy</a></li>
          <li><a href="earn.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">Earn</a></li>
          <li><a href="donate.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">Donate Please</a></li>
          <li><a href="game.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">Game</a></li>
          <li><a href="nft.html" style="padding: 0 15px; color: #6B7280; text-decoration: none;">NFT</a></li>
        </ul>
      </nav>
    </div>
    <div style="display: flex; align-items: center;">
      <button id="headerConnectWalletBtn" style="background-color: #00bcd4; border: none; border-radius: 20px; padding: 5px 15px; color: white; cursor: pointer;">
        Connect Wallet
      </button>
    </div>
  `;

  document.getElementById('header').appendChild(header);
}

export function updateHeaderWalletButton(accounts) {
  const button = document.getElementById('headerConnectWalletBtn');
  if (!button) return;

  const address = accounts[0];
  const shortenedAddress = `${address.slice(0, 5)}...${address.slice(-4)}`;
  button.textContent = shortenedAddress;
}

export function setHeaderWalletHandler(handler) {
  const button = document.getElementById('headerConnectWalletBtn');
  if (button) {
    button.onclick = handler;
  }
}

// Добавляем header один раз при загрузке страницы
addHeader();
