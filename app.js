let provider, signer, contract;

const address = "0xfc5846Ef75a5Be7620e988E6C5FD4336187F6817";

const abi = [
 "function createOrUpdateIdentity(string)",
 "function getIdentity(address) view returns (string)",
 "function issueCredential(address,string,bytes)",
 "function getCredentials(address) view returns (tuple(string data,address issuer,bytes signature)[])"
];

// UI helper
function setMsg(id, text, ok=true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = text;
  el.style.color = ok ? "green" : "red";
}

// CONNECT WALLET
async function connectWallet() {
  try {
    await ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const user = await signer.getAddress();
    contract = new ethers.Contract(address, abi, signer);

    setMsg("account", "Connected: " + user);
    alert("Wallet Connected ✅");

  } catch(e) {
    setMsg("account", "Connection failed ❌", false);
  }
}

// SAVE IDENTITY
async function saveID() {
  try {
    const did = document.getElementById("did").value;
    if (!did) return alert("Enter DID");

    const tx = await contract.createOrUpdateIdentity(did);
    await tx.wait();

    setMsg("output", "Identity Saved ✅");
    alert("Identity stored on blockchain");

  } catch(e) {
    setMsg("output", "Save failed ❌", false);
  }
}

// GET IDENTITY
async function getID() {
  try {
    const user = await signer.getAddress();
    const id = await contract.getIdentity(user);

    setMsg("output", id);
    alert("Fetched Identity: " + id);

  } catch(e) {
    alert("Connect wallet first ❌");
  }
}

// LOGIN
async function login() {
  try {
    const user = await signer.getAddress();
    const stored = await contract.getIdentity(user);
    const input = document.getElementById("loginDid").value;

    if (stored === input) {
      setMsg("loginStatus", "Login Success ✅");
      alert("Login Successful");
    } else {
      setMsg("loginStatus", "Invalid DID ❌", false);
      alert("Login Failed");
    }

  } catch(e) {
    alert("Connect wallet first ❌");
  }
}

// QR GENERATION
async function genQR() {
  try {
    const user = await signer.getAddress();
    const id = await contract.getIdentity(user);

    QRCode.toCanvas(document.getElementById("qr"), id);
    alert("QR Generated");

  } catch(e) {
    alert("Connect wallet first ❌");
  }
}

// ISSUE CREDENTIAL (FIXED UI + RELIABLE)
async function issue() {
  try {
    if (!contract) return alert("Connect wallet first");

    const user = await signer.getAddress();
    const data = document.getElementById("credData").value;

    if (!data) return alert("Enter credential");

    const sig = await signer.signMessage(data);

    const tx = await contract.issueCredential(user, data, sig);
    await tx.wait();

    // 🔥 SHOW FULL DETAILS
    setMsg(
      "issueStatus",
      `Issued ✅\nCredential: ${data}\nIssuer: ${user}`
    );

    alert("Credential Issued Successfully");

  } catch (e) {
    console.error(e);
    setMsg("issueStatus", "Issue failed ❌", false);
  }
}
// VERIFY CREDENTIAL (FIXED → latest credential)
async function verify() {
  try {
    if (!contract) return alert("Connect wallet first!");

    const user = await signer.getAddress();
    const list = await contract.getCredentials(user);

    if (list.length === 0) {
      document.getElementById("verifyResult").innerText =
        "❌ No credentials found";
      return;
    }

    const c = list[0];

    console.log("Credential:", c);

    const recovered = ethers.utils.verifyMessage(c.data, c.signature);

    console.log("Recovered:", recovered);
    console.log("Issuer:", c.issuer);

    if (recovered.toLowerCase() === c.issuer.toLowerCase()) {
      document.getElementById("verifyResult").innerText =
        "✅ Verified\nData: " + c.data;
    } else {
      document.getElementById("verifyResult").innerText =
        "❌ Invalid Signature";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("verifyResult").innerText =
      "❌ Verification error";
  }
}

// REAL IPFS UPLOAD (PINATA FIXED)
async function upload() {
  try {
    if (!contract) return alert("Connect wallet first");

    const file = document.getElementById("file").files[0];
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: "425854fa5e374e4d36a3",
        pinata_secret_api_key: "a929018e7e0456e85beaeac82935cacb650fec7de3147afbe5e8eb1ed7f3f050"
      },
      body: formData
    });

    const result = await res.json();

    if (!result.IpfsHash) {
      console.error(result);
      alert("IPFS failed ❌ (check console)");
      return;
    }

    const cid = result.IpfsHash;

    const user = await signer.getAddress();
    const sig = await signer.signMessage(cid);

    const tx = await contract.issueCredential(user, cid, sig);
    await tx.wait();

    alert("Uploaded to IPFS ✅\nCID: " + cid);

    // show in UI
    const ul = document.getElementById("list");
    if (ul) {
      const li = document.createElement("li");
      li.innerHTML = `<a href="https://gateway.pinata.cloud/ipfs/${cid}" target="_blank">${cid}</a>`;
      ul.appendChild(li);
    }

  } catch (e) {
    console.error(e);
    alert("Upload failed ❌");
  }
}

// SHOW CREDENTIALS
async function showCreds() {
  try {
    const user = await signer.getAddress();
    const list = await contract.getCredentials(user);

    const ul = document.getElementById("list");
    if (!ul) return;

    ul.innerHTML = "";

    list.forEach(c => {
      const li = document.createElement("li");

      const url = "https://gateway.pinata.cloud/ipfs/" + c.data;

      li.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
      ul.appendChild(li);
    });

    alert("Credentials loaded");

  } catch(e) {
    alert("Connect wallet first ❌");
  }
}