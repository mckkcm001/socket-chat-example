const socket = io()

const id = localStorage.id
console.log('id: ', id)

socket.emit('tokenReq', {id: id})
socket.on('tokenRes', data => {
    console.log(data)
})