const elItemTemplate = document.querySelector('.js-item-template').content;
const elList = document.querySelector('.js-list');
const elNavAll = document.querySelector('.js-nav-all');  
const elNavBookmark = document.querySelector('.js-nav-bookmark');
const elNavOrder = document.querySelector('.js-nav-order');
const elNavAdmin = document.querySelector('.js-nav-admin');
const elBookmarkBadge = document.querySelector('.js-bookmark-badge');
const elAdminAddProducts = document.querySelector('.js-admin-add-products');
const elProductAddEditForm = document.querySelector('.js-product-add-edit-form');
const elProductAddBtn = document.querySelector('.js-product-add-btn');
const elProductEditBtn = document.querySelector('.js-product-edit-btn');


const token = localStorage.getItem('token');
const bookmarked = localStorage.getItem('bookmarked') ? JSON.parse(localStorage.getItem('bookmarked')) : [];
bookmarked.length == 0 ? elBookmarkBadge.style.display = 'none':elBookmarkBadge.textContent = bookmarked.length; 

let data = [];
let currentPage = 'all';

if(!token) window.location = '/index.html'

function render(arr, node) {
    node.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    arr.forEach(({product_img, product_name, product_desc, product_price, id, order_id}) => {
        const clone = elItemTemplate.cloneNode(true);

        clone.querySelector('.js-item').dataset.id = id;
        clone.querySelector('.js-item').dataset.order_id = order_id;
        clone.querySelector('.js-product-img').src = `http://localhost:5000/${product_img}`;
        clone.querySelector('.js-product-name').textContent = product_name;
        clone.querySelector('.js-product-description').textContent = `${product_desc.slice(0, 20)}...`;
        clone.querySelector('.js-product-price').textContent = `$${product_price}`;
        clone.querySelector('.js-bookmark-galochka').style.display = bookmarked.some(item => item == id) ? 'block' : 'none'
        clone.querySelector('.order-admin').style.display = 'none';
        
        if(currentPage == 'order') {
            clone.querySelector('.order-admin').style.display = 'flex';
            clone.querySelector('.order').style.display = 'block';
            clone.querySelectorAll('.admin').forEach(item => item.style.display = 'none')
        }
        if(currentPage == 'admin') {
            clone.querySelector('.order-admin').style.display = 'flex';
            clone.querySelector('.order').style.display = 'none';
            clone.querySelectorAll('.admin').forEach(item => item.style.display = 'flex')
        }
        
        fragment.append(clone);
    });

    node.append(fragment);
}

 ;(async () => {
    const req = await fetch('http://localhost:5000/product',{
        method: "GET",  
        headers: {
            authorization: token
        }
    });
    const res = await req.json();
    data = res
    render(res, elList);
})();

const showByCase = {
    ['filterBookmark']: function(){
        const filteredBookmarkList = data.filter(item => bookmarked.some(itemSome => itemSome == item.id))
        currentPage = 'filterBookmark';
        elAdminAddProducts.style.display = 'none'
        render(filteredBookmarkList, elList);
    },
    ['all']: function(){
        currentPage = 'all';
        elAdminAddProducts.style.display = 'none'
        render(data, elList);
    },
    ['order']: function(){
        currentPage = 'order';
        elAdminAddProducts.style.display = 'none'
        async function getOrder(){
            const req = await fetch('http://localhost:5000/order',{
                method:'GET',
                headers:{
                    authorization: token
                }
            });
            const res = await req.json();
            const editedData = res.map(item => {return {...data.find(itemData => itemData.id == item.product_id), order_id: item.order_id}})
            render(editedData, elList);
        }
        getOrder();
    },
    ['admin']: function(){
        elAdminAddProducts.style.display = 'flex'
        currentPage = 'admin';
        render(data, elList);
    },
}


async function deleteOrder(order_id) {
    const req = await fetch(`http://localhost:5000/order/${order_id}`,{
        method:'DELETE',
        headers:{
            authorization: token
        }
    });
    const res = await req.json();
    showByCase['order']()
}

async function deleteProduct(id) {
    const req = await fetch(`http://localhost:5000/product/${id}`,{
        method:'DELETE',
        headers:{
            authorization: token
        }
    });
    const res = await req.json();
    showByCase['admin']()
}

async function postOrder(id){
    const req = await fetch('http://localhost:5000/order',{
        method:'POST',
        headers:{
            "Content-Type": "application/json",
            authorization: token
        },
        body: JSON.stringify({product_id: id})
    });
    const res = await req.json();
}

async function editProduct (evt){
    evt.preventDefault()
    const formData = new FormData(elProductAddEditForm);

    const req = await fetch(`http://localhost:5000/product/${evt.target.dataset.id}`,{
        method:'PUT',
        headers:{
            authorization: token
        },
        body: formData
    });
    const res = await req.json();
    
    console.log(res);
}

async function postProduct (evt){
    evt.preventDefault()
    const formData = new FormData(elProductAddEditForm);


    const req = await fetch('http://localhost:5000/product',{
        method:'POST',
        headers:{
            authorization: token
        },
        body: formData
    });
    const res = await req.json();
    data.push(res);
    render(data, elList)
}



elList.addEventListener('click', (evt)=>{
    function findId (evt) {
        if(!evt.matches('.js-item')) return findId(evt.parentElement)
        else { 
           return evt.dataset.id
        }
    }

    function findOrderId (evt) {
        if(!evt.matches('.js-item')) return findOrderId(evt.parentElement)
        else { 
           return evt.dataset.order_id
        }
    }

    let orderId = 0;
    if(currentPage == 'order') {
        orderId = findOrderId(evt.target)
    }

    const id = findId(evt.target);
    const bookmarkBtn = evt.target.matches('.js-bookmark-btn');
    const buyBtn = evt.target.matches('.js-buy-btn');
    const orderDeleteBtn = evt.target.matches('.js-order-delete-btn');
    const adminDeleteBtn = evt.target.matches('.js-admin-delete-btn');
    const adminEditBtn = evt.target.matches('.js-admin-edit-btn');

    if(!(bookmarked.includes(id)) && bookmarkBtn){
        bookmarked.push(id); 
        localStorage.setItem('bookmarked', JSON.stringify(bookmarked)); 
        bookmarked.length == 0 ? 
        elBookmarkBadge.style.display = 'none':
        elBookmarkBadge.style.display = 'block';
        elBookmarkBadge.textContent = bookmarked.length;  
        showByCase[currentPage](); 
        return
    }
    if((bookmarked.includes(id)) && bookmarkBtn){
        bookmarked.splice(bookmarked.findIndex(item => item == id), 1); 
        localStorage.setItem('bookmarked', JSON.stringify(bookmarked)); 
        bookmarked.length == 0 ? 
        elBookmarkBadge.style.display = 'none':
        elBookmarkBadge.style.display = 'block'; 
        elBookmarkBadge.textContent = bookmarked.length; 
        showByCase[currentPage]();  
        return
    }
    if(buyBtn){
        postOrder(id)
    }
    if(orderDeleteBtn && currentPage == 'order'){
        deleteOrder(orderId)
    }
    if(adminDeleteBtn && currentPage == 'admin'){
        deleteProduct(id)
    }
    if(adminEditBtn && currentPage == 'admin'){
        document.querySelector('.modal').classList.toggle('hidden')
        elProductAddBtn.style.display = 'none'
        elProductEditBtn.style.display = 'block'
        elProductEditBtn.dataset.id = id;

        const product = data.find(item => item.id == id)

        elProductAddEditForm[1].value = product.product_name
        elProductAddEditForm[2].value = product.product_desc
        elProductAddEditForm[3].value = product.product_price
    }
})



elNavAll.addEventListener('click', showByCase['all'])
elNavBookmark.addEventListener('click', showByCase['filterBookmark'])
elNavOrder.addEventListener('click', showByCase['order'])
elNavAdmin.addEventListener('click', showByCase['admin'])
elAdminAddProducts.addEventListener('click', ()=>{
    document.querySelector('.modal').classList.toggle('hidden')
    elProductEditBtn.style.display = 'none'
    elProductAddBtn.style.display = 'block'
})
document.querySelector('.modal').addEventListener('click', (evt)=>{
    if(evt.target.matches('.modal-close')){
        document.querySelector('.modal').classList.toggle('hidden')
    }
})


elProductAddBtn.addEventListener('click', postProduct)
elProductEditBtn.addEventListener('click', editProduct)