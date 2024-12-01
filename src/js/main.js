const token = localStorage.getItem('token') ? JSON.stringify(localStorage.getItem('token')):"";

if(!token) window.location = '../../index.html'

;(async () => {
    const req = await fetch('http://localhost:5000/user/register',{
        method: 'GET',
        headers: {
            authorization: token
        }
    });
    const res = await req.json();
    console.log(res);
})()