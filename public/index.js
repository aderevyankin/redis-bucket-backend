const input = document.querySelector('#notedata');
const ul = document.querySelector('ul');
document.querySelector('button').addEventListener('click', async () => {
    const { value } = input
    // window.location = '/add?value=' + encodeURIComponent(value)
    let response = await fetch('/add?value=' + encodeURIComponent(value))
    if (response.status < 300) {
        response = await fetch('/find');
        const notes = await response.json();
        ul.innerHTML = '';
        notes.sort((a, b) => a.tumblrId - b.tumblrId).forEach(note => {
            const li = document.createElement('li');
            li.textContent = `${note.caption} (${note.tumblrId})`
            ul.appendChild(li)
        });
    }
    else alert('Error')
})
