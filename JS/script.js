const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 100){

        header.classList.add("activo");

    }else{

        header.classList.remove("activo");

    }

});