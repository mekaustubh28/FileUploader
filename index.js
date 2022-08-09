const Web3 = require('Web3');
const {abi, networks}  = require("./build/contracts/Test.json");

var contract = "";
var userName = "";
var account = 0x0;
async function upload(event) {
    userName = prompt("Enter your Name or Press Enter to Remain Anonymous");
    if(userName==""){
        userName = "Anonymous";
    }
    console.log(contract);
    event.preventDefault();
    file = event.target[0].files[0];
    const node = await Ipfs.create()
    let result = await node.add(file);
    console.log("File Uploaded Successful");
    const link = 'https://ipfs.infura.io/ipfs/'+result.path; 
    // console.log(file.name);
    // console.log(userName);

    contract.methods.addFile(link, file.name, account, userName).send(
        {from:account},
        (error, result)=>{
            console.log(error, result);
            window.location.reload();
        }
    );
}

async function initWeb3(){
    if(window.ethereum){
        await window.ethereum.enable();
        const web3 = new Web3(window.ethereum);
        var accounts = await web3.eth.getAccounts();
        var networkId = await web3.eth.net.getId();
        console.log("id = ",networkId, accounts);
        
        account = accounts[0];
        contract = new web3.eth.Contract(abi, networks[networkId].address);
        document.getElementById('userHash').innerText = account.substring(0,6)+"...."+account.substring(account.length-6,account.length);
        const form = document.getElementById('form_uploader');
        form.addEventListener('submit', upload);
        
        const count = parseInt(await contract.methods.getCount().call());
        var tableHTML = "";
        for(var x=count;x>=1;x--){
            const DataFromBlock = await contract.methods.getData(parseInt(x-1)).call();
            var owner = DataFromBlock.fileOwner;
            owner = owner.substring(0,6)+"...."+owner.substring(owner.length-6,owner.length);
            tableHTML += "<tr><th scope='row'>"+x+"</th><td>"+DataFromBlock.fileName+"</td><td>"+DataFromBlock.ownerName+"</td><td>"+owner+"</td><td><a href="+DataFromBlock.fileURL+" target='_blank'>View</td></tr>"
        }
        document.getElementById('tablecontent').innerHTML = tableHTML;
    }else{
        alert("No Ethereum Window Detected!!");
    }
}
initWeb3();