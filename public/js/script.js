const sendbtn = document.querySelector('.send-btn');
const formcontrol = document.querySelector('#input');
const column=document.querySelector('.column');
let replies=document.querySelectorAll('.replies');
let middle_nav=document.querySelector('.middle-nav');

let chat_list=document.querySelectorAll('.chats');
let clickedElement = null;


function chat_list_update(){
    
    chat_list=document.querySelectorAll('.chats')
    

for(let node of chat_list){
    node.addEventListener('click',async()=>{
        if (clickedElement && clickedElement !== node) {
            clickedElement.classList.remove('border', 'border-3', 'border-black');
          }
        node.classList.toggle('border')
        node.classList.toggle('border-3')
        node.classList.toggle('border-black')
        clickedElement=node;

        let chats=null;
        await fetch(`https://chatgpt-atbn.onrender.com/chats?q=${node.id}`)
        .then(res=>res.json())
        .then(data=>{
            chats=data.innerArray;
            console.log(data.innerArray);
            column.id=node.id;
            // console.log(column);
            
        }).catch((err)=>{console.log(err)
            message=err.message
        })

        let s=``;
        for(let chat of chats){
            const add=`<div class="p-3 column-child">
                <div class="fw-semibold"><span class="fw-bold">Promt: </span>${chat.prompt}</div>
                <div class="replies"><span class="fw-bold">Reply: </span>${chat.reply}</div>
                
            </div>`;
            s+=add;
        }
        
        column.innerHTML=s;

    })
}
}
chat_list_update();

let del=document.querySelectorAll('#delete');

function del_update(){
    del=document.querySelectorAll('#delete');
    for(let btn of del){
    btn.addEventListener("click", async()=>{
        const parent =btn.parentElement;
        parent.style.display='none';
        await fetch(`https://chatgpt-atbn.onrender.com/remove?q=${btn.parentNode.id}`)
        .then(()=>{
            location.reload();
        })
        // console.log(parent);
    })
}
}
del_update();

async function getapi(){
    let api=null;
    await fetch('https://chatgpt-atbn.onrender.com/getapi').then(res=>res.json())
    .then((data)=>{
        // console.log(data);
        api=data.api
    });
    // console.log(api);
    return api;
}

let API_URL="https://api.openai.com/v1/chat/completions";
// let API_URL="https://chatgpt-api.shn.hk/v1/";
let API_KEY=null;
// let API_KEY=`${getapi()}`;


sendbtn.addEventListener('click',async()=>{
    console.log(formcontrol);
    // const res=await fetch(`https://chatgpt-atbn.onrender.com/prompt?p=${formcontrol.value}`);
    // const body=await res.json();
    let s=`${column.innerHTML}`;
    const add=`<div class="p-3 column-child">
                <div class="fw-semibold"><span class="fw-bold">Promt: </span>${formcontrol.value}</div>
                <div class="replies"><span class="fw-bold">Reply: </span>...</div>
            </div>`;
    s+=add;
    column.innerHTML=s;
    replies=document.querySelectorAll('.replies');
    const just=replies[replies.length-1];
    sendbtn.setAttribute('disabled','true');
    setTimeout(async()=>{
        API_KEY=await getapi();
        const requestOptions ={
            
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
                Authorization:`Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [
                  {
                    "role": "user",
                    "content": formcontrol.value,
                  }
                ]
            })
        }
        let message="your reply from chatgpt";
        await fetch(API_URL,requestOptions)
        .then(res=>res.json())
        .then(async (data)=>{
            if(data.error.message){
                message=data.error.message+`here - <a target=_blank href="https://platform.openai.com/account">https://platform.openai.com/account</a> OR there may be some issue with your API key make sure it is still active and update it`;
                // console.log(message)
                // console.log(formcontrol.value);
                // console.log(column.id);
                
                await fetch(`https://chatgpt-atbn.onrender.com/add?prompt=${formcontrol.value}&reply=${message}&id=${column.id}`)
                .then(res=>res.json())
                .then((data)=>{
                    if(!column.id){
                        column.id=data.id;
                        let s = middle_nav.innerHTML;
                        let add= `<div class="  mx-2 mt-2 chats p-1 rounded chat-list" id="${column.id}">
                        <span class="material-symbols-outlined me-2">
                          mode_comment
                        </span>
                        <p class="text-truncate">${formcontrol.value} (${column.id})</p>
                        <span class="material-symbols-outlined" id="delete">
                          delete
                        </span>
                      </div>`;
                      s=add+s;
                      middle_nav.innerHTML=s;
                      chat_list_update();
                    }
                    console.log(data);
                })
                .catch((err)=>{console.log(err)})
                // console.log(message);
                // console.log(column.id)
                return;
            }else{
                message=data.choices[0].message.content;
               
                
                await fetch(`https://chatgpt-atbn.onrender.com/add?prompt=${formcontrol.value}&reply=${message}&id=${column.id}`)
                .then(res=>res.json())
                .then((data)=>{
                    if(!column.id){
                        column.id=data.id;
                        let s = middle_nav.innerHTML;
                        let add= `<div class="  mx-2 mt-2 chats p-1 rounded chat-list" id="${column.id}">
                        <span class="material-symbols-outlined me-2">
                          mode_comment
                        </span>
                        <p class="text-truncate">${formcontrol.value} (${column.id})</p>
                        <span class="material-symbols-outlined" id="delete">
                          delete
                        </span>
                      </div>`;
                      s=add+s;
                      middle_nav.innerHTML=s;
                      chat_list_update();
                    }
                    console.log(data);
                })
                .catch((err)=>{console.log(err)})
                // await fetch
            }
            
            console.log(data);
            
        }).catch((err)=>{console.log(err)
            message=err.message
        })
        just.innerHTML=`<span class="fw-bold">Reply: </span>${message}`;
        del_update();
        sendbtn.removeAttribute('disabled');
        // console.log(just.innerHTML)
    },100);
    // console.log(just);
    // console.log(s);
})


const new_chat=document.querySelector('.new_chat');

new_chat.addEventListener('click',()=>{
    column.innerHTML='';
    column.id='';
    if (clickedElement) {
        clickedElement.classList.remove('border', 'border-3', 'border-black');
      }
})





// console.log(chat_list);