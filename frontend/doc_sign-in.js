let userid = null;

document.getElementById("submit-but").addEventListener("click", () => {
    const val = document.getElementById("id-holder").value;
    const pattern = /^\d{3}-\d{4}-\d{5}$/;

    if (pattern.test(val)) {
        console.log("Valid ID");
        userid = val;
        document.querySelector(".error_box").innerHTML = "";    // if the user inputs the correct value the next time then no error mssage shud be displayed
    }
    else {
        document.querySelector(".error_box").innerHTML =
            `<span>Please enter a valid ID</span>`;
    }
});
