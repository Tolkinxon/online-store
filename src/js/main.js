const elItemTemplate = document.querySelector('.js-item-template').content;
const elList = document.querySelector('.js-list');

const token = localStorage.getItem('token');
const bookmarked = localStorage.getItem('bookmarked') ? JSON.parse(localStorage.getItem('bookmarked')) : [];
let data = [];

if(!token) window.location = '/index.html'

function render(arr, node) {
    node.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    arr.forEach(({product_img, product_name, product_desc, product_price, id}) => {
        const clone = elItemTemplate.cloneNode(true);

        clone.querySelector('.js-item').dataset.id = id;
        clone.querySelector('.js-product-img').src = `http://localhost:5000/${product_img}`;
        clone.querySelector('.js-product-name').textContent = product_name;
        clone.querySelector('.js-product-description').textContent = `${product_desc.slice(0, 20)}...`;
        clone.querySelector('.js-product-price').textContent = `$${product_price}`;
        clone.querySelector('.js-bookmark-galochka').style.display = bookmarked.some(item => item == id) ? 'block' : 'none'

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



elList.addEventListener('click', (evt)=>{
    function findItem (evt) {
        if(!evt.matches('.js-item')) return findItem(evt.parentElement)
        else { 
           return evt.dataset.id
        }
    }

    const id = findItem(evt.target);
    const bookmarkBtn = evt.target.matches('.js-bookmark-btn');
    const buyBtn = evt.target.matches('.js-buy-btn');

    if(!(bookmarked.includes(id)) && bookmarkBtn) {bookmarked.push(id); render(data, elList); return}
    if((bookmarked.includes(id)) && bookmarkBtn)  {bookmarked.splice(bookmarked.findIndex(item => item == id), 1); render(data, elList); return}
})