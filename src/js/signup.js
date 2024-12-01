const form = document.querySelector('.js-form');

const token = localStorage.getItem('token');
if(token) window.location = '/src/html/main.html';

const reginster = async (data) => {
        const req = await fetch('http://localhost:5000/user/register',{
        method: 'POST',
        body: data
    });
    const res = await req.json();
    if(res.token){
        localStorage.setItem('token', res.token);
        window.location = '/src/html/main.html'
    } else { alert('Something went wrong please input correct information!'); }
}

form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const formData = new FormData(form);
    reginster(formData)
})
