//console.log($);

const submitButton = $("#submitBTN");
const firstName = $("#firstName");
const lastName = $("#lastName");
const warningMessage = $("#warning");
const canvas = $("#signCanvas");
let canvasSignature = "";

//sign petition
const ctx = canvas[0].getContext("2d");
canvas.on("mousedown", function () {
    //console.log("mouse is down");
    canvas.on("mousemove", function (event) {
        event.stopPropagation();
        let offsetY = event.offsetY;
        let offsetX = event.offsetX;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, 1, 0, 2 * Math.PI);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    });
});

canvas.on("mouseup", function () {
    //console.log("mouse is up!");
    canvas.off("mousemove");
    canvasSignature = document.getElementById("signCanvas").toDataURL(); //translate to jquery later
});

//check submit data on Button click
submitButton.on("click", function () {
    console.log("button was clicked");

    //add dataURL to hidden Input
    document.getElementById("hiddenSig").value = canvasSignature;

    let firstNameInput = firstName.val();
    let lastNameInput = lastName.val();

    if (firstNameInput == "") {
        console.log("nothing in the FirstNameInput");
        warningMessage.addClass("visible");
        return;
    } else if (lastNameInput == "") {
        console.log("nothing in the lastNameInput");
        warningMessage.addClass("visible");
        return;
    } else if (canvasSignature == "") {
        console.log("nothing in the SignatureInput");
        warningMessage.addClass("visible");
        return;
    } else {
        console.log("submit-button clicked");
        //console.log(firstNameInput);
        //console.log(lastNameInput);
        //console.log(canvasSignature);
    }
});
