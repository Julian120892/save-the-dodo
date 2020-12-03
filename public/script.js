console.log($);

let submitButton = $("#submitBTN");
let firstName = $("#firstName");
let lastName = $("#lastName");
let warningMessage = $("#warning");
//let signature = document.getElementById("signature");

submitButton.on("click", function () {
    let firstNameInput = firstName.val();
    let lastNameInput = lastName.val();
    //let signatureInput = signature.val();

    if (firstNameInput == "") {
        console.log("nothing in the FirstNameInput");
        warningMessage.addClass("visible");
    } else if (lastNameInput == "") {
        console.log("nothing in the lastNameInput");
        warningMessage.addClass("visible");
        // } else if (signatureInput = ""){
        //   warningMessage.addClass("visible");
    } else {
        console.log("submit-button clicked");
        console.log(firstNameInput);
        console.log(lastNameInput);
    }
});
