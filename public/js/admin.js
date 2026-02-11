const deleteProd = (e)=>{
    let parent = e.target.closest(".card__actions")
    let deleteElement = e.target.closest("article")
    if(!parent)return
    let prodId = parent.querySelector('input[name="prodId"]').value
    let csrTok = parent.querySelector('input[name="_csrf"]').value
    fetch(`/admin/product/${prodId}`,{                                   //csrf checks body thats only in post
        method: 'DELETE',                                                // now in delete no body, we use headers,it also checks query params
        headers: {
            'csrf-token':csrTok
        }
    }).then(result =>{
        return result.json()
    })
    .then(data =>{
        console.log(data)
        deleteElement.parentNode.removeChild(deleteElement);
    })
    .catch(err=>{
        console.log(err)
    })

}


let el = document.querySelectorAll(".delete-btn").forEach(el =>{
    el.addEventListener('click',deleteProd)
})