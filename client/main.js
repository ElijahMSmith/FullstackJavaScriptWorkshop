const cells = document.getElementsByClassName("cell");
const codeInput = document.getElementById("codeInput");
const nameInput = document.getElementById("nameInput");
const startForm = document.getElementById("startForm");

for (const cell of cells) {
	cell.addEventListener("click", function (event) {
		console.log(event);
	});
}

startForm.addEventListener("submit", (e) => {
	e.preventDefault();
	console.log(nameInput.value);
	console.log(codeInput.value);
});
